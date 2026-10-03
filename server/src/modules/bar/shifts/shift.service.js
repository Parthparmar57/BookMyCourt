import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { round2 } from '../../../utils/money.js';
import { SHIFT_STATUS, PAYMENT_STATUS } from '../../../shared/index.js';

/**
 * Resolve the employee's currently-open shift id so orders can be attributed to
 * it. Returns null for users who are not clocked in (or not employees).
 * Accepts a Prisma client or an interactive transaction client.
 */
export const findOpenShiftId = async (client, employeeId) => {
  if (!employeeId) return null;
  const shift = await client.shift.findFirst({
    where: { employeeId, status: SHIFT_STATUS.OPEN },
    select: { id: true },
  });
  return shift?.id || null;
};

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

  // Only PAID orders count as sales — pending tab orders must not inflate the total.
  const paidOrders = shift.orders.filter((o) => o.paymentStatus === PAYMENT_STATUS.PAID);
  const totalSales = round2(paidOrders.reduce((sum, o) => sum + Number(o.total), 0));
  const byMode = paidOrders.reduce((acc, o) => {
    const mode = o.paymentMode || 'UNKNOWN';
    acc[mode] = round2((acc[mode] || 0) + Number(o.total));
    return acc;
  }, {});

  return {
    shift,
    summary: {
      totalOrders: shift.orders.length,
      paidOrders: paidOrders.length,
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
