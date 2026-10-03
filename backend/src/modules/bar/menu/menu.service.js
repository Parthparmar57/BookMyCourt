import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';

export const listMenuItems = async ({ category, availableOnly = false }) => {
  return prisma.menuItem.findMany({
    where: {
      ...(category && { category }),
      ...(availableOnly && { isAvailable: true }),
    },
    orderBy: { name: 'asc' },
  });
};

export const createMenuItem = async (data) => {
  return prisma.menuItem.create({ data });
};

export const updateMenuItem = async (id, data) => {
  return prisma.menuItem.update({
    where: { id },
    data,
  });
};

export const deleteMenuItem = async (id) => {
  return prisma.menuItem.delete({ where: { id } });
};
