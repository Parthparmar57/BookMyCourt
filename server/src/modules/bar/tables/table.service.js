import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { TABLE_STATUS } from '../../../shared/index.js';
import { emitTableStatusUpdate } from '../../../sockets/kitchen.socket.js';

export const listTables = async () => {
  return prisma.barTable.findMany({
    orderBy: { number: 'asc' },
    include: {
      orders: {
        where: { status: { in: ['PLACED', 'PREPARING', 'SERVED'] } },
        include: { items: { include: { menuItem: true } } },
      },
    },
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
  const updated = await prisma.barTable.update({
    where: { id },
    data,
  });
  emitTableStatusUpdate(updated);
  return updated;
};

export const deleteTable = async (id) => {
  const deleted = await prisma.barTable.delete({ where: { id } });
  emitTableStatusUpdate({ id, deleted: true });
  return deleted;
};
