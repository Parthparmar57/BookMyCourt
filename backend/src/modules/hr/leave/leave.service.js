import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { LEAVE_STATUS } from '../../../shared/index.js';

export const requestLeave = async (employeeId, data) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee) throw new ApiError(404, 'Employee record not found');

  if (employee.leaveBalance < data.days) {
    throw new ApiError(400, `Requested ${data.days} days, but remaining leave balance is only ${employee.leaveBalance} days`);
  }

  return prisma.leaveRequest.create({
    data: {
      employeeId,
      type: data.type,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      days: data.days,
      reason: data.reason,
      status: LEAVE_STATUS.PENDING,
    },
    include: { employee: { include: { user: true } } },
  });
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
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: { employee: true },
  });

  if (!leave) throw new ApiError(404, 'Leave request not found');

  return prisma.$transaction(async (tx) => {
    const updated = await tx.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        approvedById: approverUserId,
      },
      include: { employee: true },
    });

    // If approved, decrement leave balance
    if (status === LEAVE_STATUS.APPROVED) {
      await tx.employee.update({
        where: { id: leave.employeeId },
        data: {
          leaveBalance: { decrement: leave.days },
        },
      });
    }

    return updated;
  });
};
