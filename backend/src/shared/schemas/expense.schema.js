import { z } from 'zod';
import { EXPENSE_STATUS, PAYMENT_MODE } from '../constants/enums.js';

export const createExpenseSchema = z.object({
  vendor: z.string().min(2, 'Vendor is required'),
  category: z.string().min(2, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  tax: z.coerce.number().min(0).default(0),
  dueDate: z.coerce.date(),
  paidDate: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(EXPENSE_STATUS).default(EXPENSE_STATUS.UNPAID),
  paymentMode: z.nativeEnum(PAYMENT_MODE).optional().nullable(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
export const expenseIdParamSchema = z.object({ id: z.string().uuid() });
