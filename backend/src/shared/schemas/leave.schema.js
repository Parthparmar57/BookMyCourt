import { z } from 'zod';
import { LEAVE_STATUS, LEAVE_TYPE } from '../constants/enums.js';

export const createLeaveRequestSchema = z.object({
  type: z.nativeEnum(LEAVE_TYPE).default(LEAVE_TYPE.CASUAL),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  days: z.coerce.number().int().positive().default(1),
  reason: z.string().min(3, 'Reason is required'),
}).refine(d => d.endDate >= d.startDate, {
  message: 'End date must be on or after start date',
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum([LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED]),
});

export const leaveIdParamSchema = z.object({ id: z.string().uuid() });
