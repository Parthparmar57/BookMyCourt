import { z } from 'zod';
import { PAYROLL_STATUS } from '../constants/enums.js';

export const runPayrollSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2050),
});

export const updatePayrollStatusSchema = z.object({
  status: z.nativeEnum(PAYROLL_STATUS),
  paidDate: z.coerce.date().optional(),
});

export const payrollIdParamSchema = z.object({ id: z.string().uuid() });
