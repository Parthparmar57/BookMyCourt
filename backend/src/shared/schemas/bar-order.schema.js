import { z } from 'zod';
import { ORDER_STATUS, PAYMENT_MODE, TABLE_STATUS, TAB_STATUS } from '../constants/enums.js';

export const createBarTableSchema = z.object({
  number: z.string().min(1, 'Table number is required'),
  capacity: z.coerce.number().int().min(1).default(4),
  status: z.nativeEnum(TABLE_STATUS).default(TABLE_STATUS.AVAILABLE),
});

export const updateBarTableSchema = createBarTableSchema.partial();
export const tableIdParamSchema = z.object({ id: z.string().uuid() });

export const createBarOrderSchema = z.object({
  barTableId: z.string().uuid().optional().nullable(),
  memberId: z.string().uuid().optional().nullable(),
  barTabId: z.string().uuid().optional().nullable(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.coerce.number().int().min(1).max(50),
  })).min(1, 'Order must contain at least 1 menu item'),
  notes: z.string().max(200).optional().nullable(),
  paymentMode: z.nativeEnum(PAYMENT_MODE).optional().nullable(),
});

export const updateKitchenStatusSchema = z.object({
  status: z.enum([ORDER_STATUS.PREPARING, ORDER_STATUS.SERVED, ORDER_STATUS.COMPLETED]),
});

export const openTabSchema = z.object({
  memberId: z.string().uuid('Valid member ID is required to open a tab'),
  notes: z.string().optional().nullable(),
});

export const settleTabSchema = z.object({
  paymentMode: z.nativeEnum(PAYMENT_MODE).default(PAYMENT_MODE.UPI),
  notes: z.string().optional().nullable(),
});

export const splitBillSchema = z.object({
  splits: z.array(z.object({
    paymentMode: z.nativeEnum(PAYMENT_MODE),
    amount: z.coerce.number().positive(),
  })).min(2, 'Must have at least 2 splits'),
});

// Settling a single bar order: either a single paymentMode, or a split bill.
export const settleBarOrderSchema = z.object({
  paymentMode: z.nativeEnum(PAYMENT_MODE).default(PAYMENT_MODE.UPI),
  splits: z
    .array(
      z.object({
        paymentMode: z.nativeEnum(PAYMENT_MODE),
        amount: z.coerce.number().positive(),
      })
    )
    .optional(),
});
