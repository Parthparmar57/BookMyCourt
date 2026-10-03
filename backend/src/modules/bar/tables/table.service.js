import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { TABLE_STATUS } from '../../../shared/index.js';

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

  return prisma.barTable.create({ data });
};

export const updateTable = async (id, data) => {
  return prisma.barTable.update({
    where: { id },
    data,
  });
};

export const deleteTable = async (id) => {
  return prisma.barTable.delete({ where: { id } });
};
