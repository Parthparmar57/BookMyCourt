import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { getMemberDiscounts } from '../../../utils/pricing.js';
import { broadcastEvent } from '../../../lib/socket.js';
import {
  ORDER_CHANNEL,
  ORDER_STATUS,
  PAYMENT_STATUS,
  TRANSACTION_SOURCE,
  PAYMENT_MODE,
} from '../../../shared/index.js';

export const createShopOrder = async (data, user) => {
  let memberId = data.memberId;
  if (!memberId && user?.role === 'MEMBER') {
    memberId = user.memberId;
  }

  // Get member discount percentage
  const { shopDiscountPct } = await getMemberDiscounts(prisma, memberId);

  return prisma.$transaction(async (tx) => {
    let subtotal = 0;
    let totalTax = 0;
    const orderItemsData = [];

    // Verify stock and prepare items
    for (const item of data.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new ApiError(404, `Product with ID ${item.productId} not found`);
      }

      // Rule BR10: Shared stock, no sale below zero
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      // Decrement stock immediately
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      const unitPrice = Number(product.price);
      const taxPct = Number(product.taxPct || 0);
      const lineSubtotal = unitPrice * item.quantity;
      const lineTax = (lineSubtotal * taxPct) / 100;

      subtotal += lineSubtotal;
      totalTax += lineTax;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        taxPct,
        totalPrice: lineSubtotal + lineTax,
      });
    }

    // Apply member discount (Rule BR9)
    const discount = (subtotal * shopDiscountPct) / 100;
    const total = Math.max(0, subtotal - discount + totalTax);

    const orderNo = `ORD-${Date.now().toString().slice(-6)}`;

    // Create Order
    const order = await tx.order.create({
      data: {
        orderNo,
        memberId: memberId || null,
        channel: data.channel || (user?.role === 'MEMBER' ? ORDER_CHANNEL.ONLINE : ORDER_CHANNEL.COUNTER),
        status: ORDER_STATUS.PLACED,
        fulfilment: data.fulfilment,
        deliveryAddress: data.deliveryAddress || null,
        pinCode: data.pinCode || null,
        subtotal,
        discount,
        tax: totalTax,
        total,
        paymentMode: data.paymentMode || PAYMENT_MODE.UPI,
        paymentStatus: PAYMENT_STATUS.PAID,
        notes: data.notes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: { include: { product: true } },
        member: { include: { user: true } },
      },
    });

    // Post to Transaction Ledger (Rule BR11)
    await tx.transaction.create({
      data: {
        transactionNo: `TXN-SHP-${Date.now().toString().slice(-6)}`,
        source: TRANSACTION_SOURCE.SHOP,
        amount: total,
        tax: totalTax,
        paymentMode: data.paymentMode || PAYMENT_MODE.UPI,
        reference: order.orderNo,
        orderId: order.id,
        memberId: memberId || null,
        notes: `Shop order ${order.orderNo}`,
      },
    });

    broadcastEvent('shop_order_created', order);
    return order;
  });
};

export const updateOrderStatus = async (id, status) => {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true, member: true },
  });

  broadcastEvent('shop_order_status_updated', order);
  return order;
};

export const listShopOrders = async ({ status, channel, memberId, page = 1, limit = 20 }) => {
  const where = {
    ...(status && { status }),
    ...(channel && { channel }),
    ...(memberId && { memberId }),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        member: { include: { user: true } },
      },
    }),
  ]);

  return { orders, total, page, totalPages: Math.ceil(total / limit) };
};

export const getShopOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      member: { include: { user: true } },
      transactions: true,
    },
  });
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
};
