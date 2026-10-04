import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { TABLE_STATUS } from '../../../shared/index.js';
import { emitTableStatusUpdate } from '../../../sockets/kitchen.socket.js';

export const listTables = async () => {
  const tables = await prisma.barTable.findMany({
    orderBy: { number: 'asc' },
    include: {
      orders: {
        where: { status: { in: ['PLACED', 'PREPARING', 'SERVED'] } },
        include: { items: { include: { menuItem: true } } },
      },
    },
  });

  return tables.map((table) => {
    const hasActiveOrders = Boolean(table.orders && table.orders.length > 0);
    const effectiveStatus = table.status === TABLE_STATUS.RESERVED
      ? TABLE_STATUS.RESERVED
      : hasActiveOrders
      ? TABLE_STATUS.OCCUPIED
      : table.status;
    return {
      ...table,
      status: effectiveStatus,
    };
  });
};

export const createTable = async (data) => {
  const existing = await prisma.barTable.findUnique({ where: { number: data.number } });
  if (existing) throw new ApiError(409, 'Table with this number already exists');

  const table = await prisma.barTable.create({ data });
  emitTableStatusUpdate(table);
  return table;
};

export const updateTable = async (id, data) => {
  return prisma.$transaction(async (tx) => {
    // If staff changes table status to AVAILABLE, mark any active orders on this table as COMPLETED so table is freed
    if (data.status === TABLE_STATUS.AVAILABLE || data.status === 'AVAILABLE') {
      await tx.order.updateMany({
        where: {
          barTableId: id,
          status: { in: ['PLACED', 'PREPARING', 'SERVED'] },
        },
        data: {
          status: 'COMPLETED',
        },
      });
    }

    const updated = await tx.barTable.update({
      where: { id },
      data,
    });

    emitTableStatusUpdate(updated);
    return updated;
  });
};

export const deleteTable = async (id) => {
  const deleted = await prisma.barTable.delete({ where: { id } });
  emitTableStatusUpdate({ id, deleted: true });
  return deleted;
};
