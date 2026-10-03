import { startOfDay } from 'date-fns';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { ATTENDANCE_STATUS } from '../../../shared/index.js';

export const checkIn = async (employeeId, { notes }) => {
  const today = startOfDay(new Date());

  const existing = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: today,
      },
    },
  });

  if (existing && existing.checkIn) {
    throw new ApiError(400, 'Employee is already checked in for today');
  }

  if (existing) {
    return prisma.attendance.update({
      where: { id: existing.id },
      data: { checkIn: new Date(), notes: notes || existing.notes },
    });
  }

  return prisma.attendance.create({
    data: {
      employeeId,
      date: today,
      checkIn: new Date(),
      status: ATTENDANCE_STATUS.PRESENT,
      notes,
    },
  });
};

export const checkOut = async (employeeId, { notes }) => {
  const today = startOfDay(new Date());

  const attendance = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: today,
      },
    },
  });

  if (!attendance || !attendance.checkIn) {
    throw new ApiError(400, 'No check-in record found for today');
  }

  return prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOut: new Date(),
      notes: notes || attendance.notes,
    },
  });
};

export const listAttendance = async ({ employeeId, date }) => {
  return prisma.attendance.findMany({
    where: {
      ...(employeeId && { employeeId }),
      ...(date && { date: startOfDay(new Date(date)) }),
    },
    include: {
      employee: { include: { user: true } },
    },
    orderBy: { date: 'desc' },
  });
};
