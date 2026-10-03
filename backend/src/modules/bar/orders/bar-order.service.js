import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { getMemberDiscounts } from '../../../utils/pricing.js';
import { emitNewKitchenOrder } from '../../../sockets/kitchen.socket.js';
import {
  ORDER_CHANNEL,
  ORDER_STATUS,
  PAYMENT_STATUS,
  TRANSACTION_SOURCE,
  TABLE_STATUS,
  PAYMENT_MODE,
} from '../../../shared/index.js';

export const createBarOrder = async (data, user) => {
  let memberId = data.memberId;
  if (!memberId && user?.role === 'MEMBER') {
    memberId = user.memberId;
  }

  // Get member discount percentage
  const { barDiscountPct } = await getMemberDiscounts(prisma, memberId);

  return prisma.$transaction(async (tx) => {
    let subtotal = 0;
    let totalTax = 0;
    const orderItemsData = [];

    for (const item of data.items) {
      const menuItem = await tx.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem) {
        throw new ApiError(404, `Menu item with ID ${item.menuItemId} not found`);
      }
      if (!menuItem.isAvailable) {
        throw new ApiError(400, `'${menuItem.name}' is currently unavailable`);
      }

      const unitPrice = Number(menuItem.price);
      const taxPct = Number(menuItem.taxPct || 0);
      const lineSubtotal = unitPrice * item.quantity;
      const lineTax = (lineSubtotal * taxPct) / 100;

      subtotal += lineSubtotal;
      totalTax += lineTax;

      orderItemsData.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        unitPrice,
        taxPct,
        totalPrice: lineSubtotal + lineTax,
      });
    }

    // Apply member discount (Rule BR9)
    const discount = (subtotal * barDiscountPct) / 100;
    const total = Math.max(0, subtotal - discount + totalTax);

    const orderNo = `BAR-${Date.now().toString().slice(-6)}`;

    // Create Order
    const order = await tx.order.create({
      data: {
        orderNo,
        memberId: memberId || null,
        channel: ORDER_CHANNEL.BAR,
        barTableId: data.barTableId || null,
        barTabId: data.barTabId || null,
        status: ORDER_STATUS.PLACED,
        subtotal,
        discount,
        tax: totalTax,
        total,
        paymentMode: data.paymentMode || null,
        paymentStatus: data.paymentMode ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
        notes: data.notes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: { include: { menuItem: true } },
        barTable: true,
        member: { include: { user: true } },
      },
    });

    // Update table status to OCCUPIED if table specified
    if (data.barTableId) {
      await tx.barTable.update({
        where: { id: data.barTableId },
        data: { status: TABLE_STATUS.OCCUPIED },
      });
    }

    // If paid immediately, record in ledger
    if (data.paymentMode) {
      await tx.transaction.create({
        data: {
          transactionNo: `TXN-BAR-${Date.now().toString().slice(-6)}`,
          source: TRANSACTION_SOURCE.BAR,
          amount: total,
          tax: totalTax,
          paymentMode: data.paymentMode,
          reference: order.orderNo,
          orderId: order.id,
          memberId: memberId || null,
          notes: `Bar order ${order.orderNo}`,
        },
      });
    }

    // Update tab amount if linked to tab
    if (data.barTabId) {
      await tx.barTab.update({
        where: { id: data.barTabId },
        data: {
          totalAmount: { increment: total },
        },
      });
    }

    // Emit live event to kitchen
    emitNewKitchenOrder(order);

    return order;
  });
};

export const settleBarOrder = async (orderId, { paymentMode = PAYMENT_MODE.UPI, splits }) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, barTable: true },
  });

  if (!order) throw new ApiError(404, 'Order not found');

  return prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentMode,
        paymentStatus: PAYMENT_STATUS.PAID,
        status: ORDER_STATUS.COMPLETED,
      },
    });

    // Handle Split Bill if provided
    if (splits && Array.isArray(splits) && splits.length > 0) {
      for (const split of splits) {
        await tx.transaction.create({
          data: {
            transactionNo: `TXN-BAR-${Date.now().toString().slice(-6)}-${Math.random().toString().slice(2, 5)}`,
            source: TRANSACTION_SOURCE.BAR,
            amount: split.amount,
            tax: 0,
            paymentMode: split.paymentMode,
            reference: order.orderNo,
            orderId: order.id,
            memberId: order.memberId || null,
            notes: `Split payment for ${order.orderNo}`,
          },
        });
      }
    } else {
      await tx.transaction.create({
        data: {
          transactionNo: `TXN-BAR-${Date.now().toString().slice(-6)}`,
          source: TRANSACTION_SOURCE.BAR,
          amount: order.total,
          tax: order.tax,
          paymentMode,
          reference: order.orderNo,
          orderId: order.id,
          memberId: order.memberId || null,
          notes: `Settled bar order ${order.orderNo}`,
        },
      });
    }

    // Free table if no remaining open orders
    if (order.barTableId) {
      const activeOrdersCount = await tx.order.count({
        where: {
          barTableId: order.barTableId,
          status: { in: ['PLACED', 'PREPARING', 'SERVED'] },
          id: { not: orderId },
        },
      });

      if (activeOrdersCount === 0) {
        await tx.barTable.update({
          where: { id: order.barTableId },
          data: { status: TABLE_STATUS.AVAILABLE },
        });
      }
    }

    return updatedOrder;
  });
};

export const listBarOrders = async ({ tableId, status, page = 1, limit = 50 }) => {
  const where = {
    channel: ORDER_CHANNEL.BAR,
    ...(tableId && { barTableId: tableId }),
    ...(status && { status }),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { menuItem: true } },
        barTable: true,
        member: { include: { user: true } },
      },
    }),
  ]);

  return { orders, total, page, totalPages: Math.ceil(total / limit) };
};
