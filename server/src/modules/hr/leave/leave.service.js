import { differenceInCalendarDays } from 'date-fns';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { writeAudit } from '../../../utils/audit.js';
import { LEAVE_STATUS } from '../../../shared/index.js';
import { emitLeaveRequested, emitLeaveStatusUpdated } from '../../../sockets/leave.socket.js';

// Inclusive day count derived from the date range (never from client input).
const countDays = (startDate, endDate) =>
  differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1;

export const requestLeave = async (employeeId, data) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee) throw new ApiError(404, 'Employee record not found');

  const days = countDays(data.startDate, data.endDate);
  if (employee.leaveBalance < days) {
    throw new ApiError(400, `Requested ${days} days, but remaining leave balance is only ${employee.leaveBalance} days`);
  }

  // Reject leave that overlaps an existing pending/approved request (Rule 31).
  // Two ranges overlap when each starts on or before the other ends.
  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: { in: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED] },
      startDate: { lte: new Date(data.endDate) },
      endDate: { gte: new Date(data.startDate) },
    },
  });
  if (overlap) {
    throw new ApiError(409, 'This leave overlaps an existing leave request');
  }

  const createdLeave = await prisma.leaveRequest.create({
    data: {
      employeeId,
      type: data.type,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      days,
      reason: data.reason,
      status: LEAVE_STATUS.PENDING,
    },
    include: { employee: { include: { user: true } } },
  });

  emitLeaveRequested(createdLeave);
  return createdLeave;
};

export const listLeaveRequests = async ({ employeeId, status }) => {
  return prisma.leaveRequest.findMany({
    where: {
      ...(employeeId && { employeeId }),
      ...(status && { status }),
    },
    include: {
      employee: { include: { user: true } },
      approvedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateLeaveStatus = async (leaveId, status, approverUserId) => {
  const result = await prisma.$transaction(async (tx) => {
    const leave = await tx.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { employee: { include: { user: true } } },
    });
    if (!leave) throw new ApiError(404, 'Leave request not found');

    // Only a PENDING request can be approved/rejected.
    if (leave.status !== LEAVE_STATUS.PENDING) {
      throw new ApiError(409, `Leave request is already ${leave.status.toLowerCase()}`);
    }

    // Re-validate balance at approval time.
    if (status === LEAVE_STATUS.APPROVED && leave.employee.leaveBalance < leave.days) {
      throw new ApiError(422, `Insufficient leave balance (${leave.employee.leaveBalance}) for ${leave.days} days`);
    }

    const updated = await tx.leaveRequest.update({
      where: { id: leaveId },
      data: { status, approvedById: approverUserId },
      include: { employee: { include: { user: true } } },
    });

    if (status === LEAVE_STATUS.APPROVED) {
      await tx.employee.update({
        where: { id: leave.employeeId },
        data: { leaveBalance: { decrement: leave.days } },
      });
    }

    await writeAudit(tx, {
      actorId: approverUserId,
      action: `LEAVE_${status}`,
      entity: 'LeaveRequest',
      entityId: leaveId,
      meta: { employeeId: leave.employeeId, days: leave.days },
    });

    return updated;
  });

  emitLeaveStatusUpdated(result);
  return result;
};
