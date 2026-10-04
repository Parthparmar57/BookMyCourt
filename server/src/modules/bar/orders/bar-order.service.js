import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { getMemberDiscounts } from '../../../utils/pricing.js';
import { emitNewKitchenOrder, emitKitchenStatusUpdate, emitTableStatusUpdate } from '../../../sockets/kitchen.socket.js';
import { genDocNo } from '../../../utils/ids.js';
import { round2 } from '../../../utils/money.js';
import { writeAudit } from '../../../utils/audit.js';
import { findOpenShiftId } from '../shifts/shift.service.js';
import {
  ORDER_CHANNEL,
  ORDER_STATUS,
  PAYMENT_STATUS,
  TRANSACTION_SOURCE,
  TABLE_STATUS,
  TAB_STATUS,
  PAYMENT_MODE,
} from '../../../shared/index.js';

export const createBarOrder = async (data, user) => {
  let memberId = data.memberId;
  if (!memberId && user?.role === 'MEMBER') {
    memberId = user.memberId;
  }

  // An order billed to a member's tab is paid when the tab is settled — it must
  // NOT also take an immediate payment (that would double-count in the ledger).
  let barTabId = data.barTabId;
  if ((!barTabId && data.paymentMode === 'TAB' && memberId) || (data.onTab && memberId && !barTabId)) {
    let openTab = await prisma.barTab.findFirst({
      where: { memberId, status: TAB_STATUS.OPEN },
    });
    if (!openTab) {
      openTab = await prisma.barTab.create({
        data: {
          memberId,
          notes: 'Cafeteria running tab',
          status: TAB_STATUS.OPEN,
        },
      });
    }
    barTabId = openTab.id;
  }

  const onTab = Boolean(barTabId);
  const immediatePaymentMode = onTab ? null : (data.paymentMode === 'TAB' ? null : data.paymentMode || null);

  const { barDiscountPct } = await getMemberDiscounts(prisma, memberId);

  return prisma.$transaction(async (tx) => {
    // A settled/closed tab must never accept new items (Rule 21).
    if (onTab) {
      const tab = await tx.barTab.findUnique({ where: { id: barTabId } });
      if (!tab) throw new ApiError(404, 'Bar tab not found');
      if (tab.status !== TAB_STATUS.OPEN) {
        throw new ApiError(409, 'Cannot add items to a tab that is already settled');
      }
    }
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    const orderItemsData = [];

    for (const item of data.items) {
      if (!item.quantity || item.quantity < 1) {
        throw new ApiError(400, 'Each item quantity must be at least 1');
      }
      const menuItem = await tx.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem) {
        throw new ApiError(404, `Menu item with ID ${item.menuItemId} not found`);
      }
      if (!menuItem.isAvailable) {
        throw new ApiError(400, `'${menuItem.name}' is currently unavailable`);
      }

      const unitPrice = Number(menuItem.price);
      const taxPct = Number(menuItem.taxPct || 0);
      const lineSubtotal = round2(unitPrice * item.quantity);
      // Member discount reduces the taxable base (GST-correct).
      const lineDiscount = round2((lineSubtotal * barDiscountPct) / 100);
      const lineTax = round2(((lineSubtotal - lineDiscount) * taxPct) / 100);

      subtotal = round2(subtotal + lineSubtotal);
      totalDiscount = round2(totalDiscount + lineDiscount);
      totalTax = round2(totalTax + lineTax);

      orderItemsData.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        unitPrice,
        taxPct,
        totalPrice: round2(lineSubtotal - lineDiscount + lineTax),
      });
    }

    const discount = totalDiscount;
    const total = round2(Math.max(0, subtotal - discount + totalTax));
    const shiftId = await findOpenShiftId(tx, user?.employeeId);

    const order = await tx.order.create({
      data: {
        orderNo: genDocNo('BAR'),
        memberId: memberId || null,
        channel: ORDER_CHANNEL.BAR,
        barTableId: data.barTableId || null,
        barTabId: barTabId || null,
        shiftId,
        status: ORDER_STATUS.PLACED,
        subtotal,
        discount,
        tax: totalTax,
        total,
        paymentMode: immediatePaymentMode,
        paymentStatus: immediatePaymentMode ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
        notes: data.notes || null,
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { menuItem: true } },
        barTable: true,
        member: { include: { user: true } },
      },
    });

    if (data.barTableId) {
      const targetTable = await tx.barTable.findUnique({ where: { id: data.barTableId } });
      if (!targetTable) throw new ApiError(404, 'Selected table not found');

      const activeOrdersCount = await tx.order.count({
        where: {
          barTableId: data.barTableId,
          status: { in: ['PLACED', 'PREPARING', 'SERVED'] },
        },
      });

      if (targetTable.status === TABLE_STATUS.OCCUPIED || activeOrdersCount > 0) {
        throw new ApiError(409, `Table ${targetTable.number} is currently occupied. Please select an available table or clear the existing table order.`);
      }

      const updatedTable = await tx.barTable.update({
        where: { id: data.barTableId },
        data: { status: TABLE_STATUS.OCCUPIED },
      });
      emitTableStatusUpdate(updatedTable);
    }

    if (onTab) {
      // Accrue onto the tab; ledger posting happens once, at tab settlement.
      await tx.barTab.update({
        where: { id: barTabId },
        data: { totalAmount: { increment: total } },
      });
    } else if (immediatePaymentMode) {
      // Paid now — post to ledger immediately (Rule BR11).
      await tx.transaction.create({
        data: {
          transactionNo: genDocNo('TXN-BAR'),
          source: TRANSACTION_SOURCE.BAR,
          amount: total,
          tax: totalTax,
          paymentMode: immediatePaymentMode,
          reference: order.orderNo,
          orderId: order.id,
          memberId: memberId || null,
          notes: `Bar order ${order.orderNo}`,
        },
      });
    }

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
  // An order on a tab is settled through the tab, never directly.
  if (order.barTabId) {
    throw new ApiError(409, 'This order is on a member tab — settle the tab instead');
  }
  // Prevent double-posting to the ledger.
  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    throw new ApiError(409, 'This order is already settled');
  }

  const orderTotal = Number(order.total);
  const orderTax = Number(order.tax);
  const hasSplits = Array.isArray(splits) && splits.length > 0;

  // Splits must add up to exactly the order total.
  if (hasSplits) {
    const sum = round2(splits.reduce((s, sp) => s + Number(sp.amount || 0), 0));
    if (sum !== round2(orderTotal)) {
      throw new ApiError(422, `Split amounts (${sum}) must sum to the order total (${round2(orderTotal)})`);
    }
  }

  return prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentMode,
        paymentStatus: PAYMENT_STATUS.PAID,
        status: ORDER_STATUS.COMPLETED,
      },
    });

    if (hasSplits) {
      for (const split of splits) {
        // Apportion tax across splits proportionally so the ledger tax stays correct.
        const taxPortion = orderTotal > 0 ? round2((orderTax * Number(split.amount)) / orderTotal) : 0;
        await tx.transaction.create({
          data: {
            transactionNo: genDocNo('TXN-BAR'),
            source: TRANSACTION_SOURCE.BAR,
            amount: round2(Number(split.amount)),
            tax: taxPortion,
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
          transactionNo: genDocNo('TXN-BAR'),
          source: TRANSACTION_SOURCE.BAR,
          amount: round2(orderTotal),
          tax: round2(orderTax),
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
        const freedTable = await tx.barTable.update({
          where: { id: order.barTableId },
          data: { status: TABLE_STATUS.AVAILABLE },
        });
        emitTableStatusUpdate(freedTable);
      }
    }

    return updatedOrder;
  });
};

export const listBarOrders = async ({ tableId, status, page = 1, limit = 50 }, user) => {
  let memberFilter = {};
  if (user?.role === 'MEMBER') {
    memberFilter = { memberId: user.memberId };
  }

  const where = {
    channel: ORDER_CHANNEL.BAR,
    ...(tableId && { barTableId: tableId }),
    ...(status && { status }),
    ...memberFilter,
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

export const updateOrderStatus = async (orderId, { status }) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, 'Order not found');

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: { include: { menuItem: true } },
        barTable: true,
        member: { include: { user: true } },
      },
    });

    if (order.barTableId && (status === ORDER_STATUS.COMPLETED || status === ORDER_STATUS.CANCELLED)) {
      const activeOrdersCount = await tx.order.count({
        where: {
          barTableId: order.barTableId,
          status: { in: ['PLACED', 'PREPARING', 'SERVED'] },
          id: { not: orderId },
        },
      });

      if (activeOrdersCount === 0) {
        const freedTable = await tx.barTable.update({
          where: { id: order.barTableId },
          data: { status: TABLE_STATUS.AVAILABLE },
        });
        emitTableStatusUpdate(freedTable);
      }
    }

    emitKitchenStatusUpdate(updated);
    return updated;
  });
};

export const voidOrder = async (orderId, { reason }, user) => {
  if (user?.role !== 'OWNER') {
    throw new ApiError(403, 'Only Owner / Admin can void or refund orders');
  }
  if (!reason || !reason.trim()) {
    throw new ApiError(400, 'A valid reason is required to void or refund an order');
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new ApiError(404, 'Order not found');

    const wasPaid = order.paymentStatus === PAYMENT_STATUS.PAID || order.paymentStatus === 'PAID';
    const amountToRefund = Number(order.totalAmount || order.total || 0);

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: ORDER_STATUS.CANCELLED,
        paymentStatus: PAYMENT_STATUS.REFUNDED,
        notes: order.notes ? `${order.notes} | VOIDED: ${reason}` : `VOIDED: ${reason}`,
      },
      include: {
        items: { include: { menuItem: true } },
        barTable: true,
        member: { include: { user: true } },
      },
    });

    if (order.barTableId) {
      await tx.barTable.update({
        where: { id: order.barTableId },
        data: { status: TABLE_STATUS.AVAILABLE },
      });
    }

    if (wasPaid && amountToRefund > 0) {
      await tx.transaction.create({
        data: {
          transactionNo: genDocNo('TXN-REF'),
          source: TRANSACTION_SOURCE.BAR,
          amount: -Math.abs(amountToRefund),
          paymentMode: order.paymentMode || PAYMENT_MODE.CASH,
          reference: `VOID-${order.orderNo}`,
          memberId: order.memberId || null,
          notes: `Ledger refund for voided bar order #${order.orderNo}: ${reason}`,
        },
      });
    }

    await writeAudit(tx, {
      actorId: user.id,
      action: 'BAR_ORDER_VOID',
      entity: 'Order',
      entityId: orderId,
      meta: { reason, total: order.totalAmount || order.total },
    });

    return updated;
  });
};

