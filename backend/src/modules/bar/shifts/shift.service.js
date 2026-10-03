import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { SHIFT_STATUS } from '../../../shared/index.js';

export const openShift = async (employeeId, { openingCash = 0, notes }) => {
  const activeShift = await prisma.shift.findFirst({
    where: { employeeId, status: SHIFT_STATUS.OPEN },
  });

  if (activeShift) {
    throw new ApiError(400, 'Employee already has an open shift');
  }

  return prisma.shift.create({
    data: {
      employeeId,
      openingCash: Number(openingCash),
      notes: notes || null,
      status: SHIFT_STATUS.OPEN,
    },
    include: { employee: { include: { user: true } } },
  });
};

export const closeShift = async (shiftId, { closingCash, notes }) => {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { orders: true },
  });

  if (!shift) throw new ApiError(404, 'Shift not found');
  if (shift.status === SHIFT_STATUS.CLOSED) {
    throw new ApiError(400, 'Shift is already closed');
  }

  // Calculate total cash collected in this shift
  const cashSales = shift.orders
    .filter((o) => o.paymentMode === 'CASH' && o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + Number(o.total), 0);

  const expectedCash = Number(shift.openingCash) + cashSales;
  const actualCash = Number(closingCash);

  return prisma.shift.update({
    where: { id: shiftId },
    data: {
      closingCash: actualCash,
      actualCash,
      expectedCash,
      endTime: new Date(),
      status: SHIFT_STATUS.CLOSED,
      notes: notes || shift.notes,
    },
    include: { employee: { include: { user: true } } },
  });
};

export const getActiveShift = async (employeeId) => {
  return prisma.shift.findFirst({
    where: { employeeId, status: SHIFT_STATUS.OPEN },
    include: { employee: { include: { user: true } } },
  });
};

export const getShiftReport = async (shiftId) => {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: {
      employee: { include: { user: true } },
      orders: {
        include: { items: { include: { menuItem: true } } },
      },
    },
  });

  if (!shift) throw new ApiError(404, 'Shift not found');

  const totalSales = shift.orders.reduce((sum, o) => sum + Number(o.total), 0);
  const byMode = shift.orders.reduce((acc, o) => {
    const mode = o.paymentMode || 'UNPAID';
    acc[mode] = (acc[mode] || 0) + Number(o.total);
    return acc;
  }, {});

  return {
    shift,
    summary: {
      totalOrders: shift.orders.length,
      totalSales,
      paymentBreakdown: byMode,
      openingCash: shift.openingCash,
      closingCash: shift.closingCash,
      cashDifference: shift.actualCash != null && shift.expectedCash != null
        ? Number(shift.actualCash) - Number(shift.expectedCash)
        : null,
    },
  };
};
