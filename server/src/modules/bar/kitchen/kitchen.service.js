import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { emitKitchenStatusUpdate } from '../../../sockets/kitchen.socket.js';
import { ORDER_STATUS } from '../../../shared/index.js';

export const getKitchenQueue = async () => {
  return prisma.order.findMany({
    where: {
      status: { in: [ORDER_STATUS.PLACED, ORDER_STATUS.PREPARING] },
      channel: 'BAR',
    },
    orderBy: { createdAt: 'asc' },
    include: {
      items: { include: { menuItem: true } },
      barTable: true,
      member: { include: { user: true } },
    },
  });
};

export const updateKitchenOrderStatus = async (orderId, status) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new ApiError(404, 'Order not found');

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: { include: { menuItem: true } },
      barTable: true,
      member: { include: { user: true } },
    },
  });

  emitKitchenStatusUpdate(updated);
  return updated;
};
