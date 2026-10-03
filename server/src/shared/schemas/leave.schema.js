import { z } from 'zod';
import { LEAVE_STATUS, LEAVE_TYPE } from '../constants/enums.js';

// `days` is intentionally NOT accepted from the client — it is always derived
// from the date range server-side so the leave balance cannot be gamed.
export const createLeaveRequestSchema = z.object({
  employeeId: z.string().uuid().optional(),
  type: z.nativeEnum(LEAVE_TYPE).default(LEAVE_TYPE.CASUAL),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().min(3, 'Reason is required'),
}).refine(d => d.endDate >= d.startDate, {
  message: 'End date must be on or after start date',
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum([LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED]),
});

export const leaveIdParamSchema = z.object({ id: z.string().uuid() });
