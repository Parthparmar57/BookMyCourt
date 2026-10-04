import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { getMemberDiscounts } from '../../../utils/pricing.js';
import { broadcastEvent } from '../../../lib/socket.js';
import { genDocNo } from '../../../utils/ids.js';
import { round2 } from '../../../utils/money.js';
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
    let totalDiscount = 0;
    let totalTax = 0;
    const orderItemsData = [];

    for (const item of data.items) {
      if (!item.quantity || item.quantity < 1) {
        throw new ApiError(400, 'Each item quantity must be at least 1');
      }

      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new ApiError(404, `Product with ID ${item.productId} not found`);
      }

      // Rule BR10: atomic conditional decrement — only succeeds if enough stock
      // remains. Combined with the product_stock_nonneg CHECK this makes
      // overselling impossible even under concurrent orders.
      const dec = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (dec.count === 0) {
        throw new ApiError(409, `Insufficient stock for '${product.name}'. Available: ${product.stock}`);
      }

      const unitPrice = Number(product.price);
      const taxPct = Number(product.taxPct || 0);
      const lineSubtotal = round2(unitPrice * item.quantity);
      // Member discount applies to the taxable base, so tax is charged on the
      // discounted value (GST-correct) rather than the gross.
      const lineDiscount = round2((lineSubtotal * shopDiscountPct) / 100);
      const lineTax = round2(((lineSubtotal - lineDiscount) * taxPct) / 100);

      subtotal = round2(subtotal + lineSubtotal);
      totalDiscount = round2(totalDiscount + lineDiscount);
      totalTax = round2(totalTax + lineTax);

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        taxPct,
        totalPrice: round2(lineSubtotal - lineDiscount + lineTax),
      });
    }

    // Rule BR9: member discount already applied per line above.
    const discount = totalDiscount;
    const total = round2(Math.max(0, subtotal - discount + totalTax));

    const orderNo = genDocNo('ORD');

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
        transactionNo: genDocNo('TXN-SHP'),
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

const ALLOWED_ORDER_TRANSITIONS = {
  PLACED: ['PACKED', 'READY', 'SHIPPED', 'CANCELLED'],
  PACKED: ['READY', 'SHIPPED', 'COMPLETED', 'CANCELLED'],
  READY: ['COMPLETED', 'DELIVERED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'COMPLETED', 'CANCELLED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const updateOrderStatus = async (id, status) => {
  const existingOrder = await prisma.order.findUnique({ where: { id } });
  if (!existingOrder) throw new ApiError(404, 'Order not found');

  const currentStatus = existingOrder.status;
  const allowedNext = ALLOWED_ORDER_TRANSITIONS[currentStatus] || [];
  if (currentStatus !== status && !allowedNext.includes(status)) {
    throw new ApiError(400, `Cannot transition order status from ${currentStatus} to ${status}`);
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true, member: true },
  });

  broadcastEvent('shop_order_status_updated', order);
  return order;
};

export const listShopOrders = async ({ status, channel, memberId, page = 1, limit = 20 }) => {
  const channelFilter = channel
    ? { channel }
    : { channel: { in: [ORDER_CHANNEL.ONLINE, ORDER_CHANNEL.COUNTER] } };

  const where = {
    ...channelFilter,
    ...(status && { status }),
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
