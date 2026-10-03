import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';

export const listCourts = async (sport) => {
  return prisma.court.findMany({
    where: {
      ...(sport && { sport: { equals: sport, mode: 'insensitive' } }),
    },
    orderBy: { name: 'asc' },
  });
};

export const getCourtById = async (id) => {
  const court = await prisma.court.findUnique({
    where: { id },
  });
  if (!court) throw new ApiError(404, 'Court not found');
  return court;
};

export const createCourt = async (data) => {
  const existing = await prisma.court.findUnique({ where: { name: data.name } });
  if (existing) throw new ApiError(409, 'Court with this name already exists');

  return prisma.court.create({ data });
};

export const updateCourt = async (id, data) => {
  return prisma.court.update({
    where: { id },
    data,
  });
};

export const deleteCourt = async (id) => {
  const count = await prisma.booking.count({
    where: { courtId: id, status: 'CONFIRMED' },
  });
  if (count > 0) {
    throw new ApiError(400, 'Cannot delete court with confirmed future bookings');
  }
  return prisma.court.delete({ where: { id } });
};
