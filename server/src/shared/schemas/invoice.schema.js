import { z } from 'zod';
import { INVOICE_STATUS, INVOICE_TYPE, PAYMENT_MODE } from '../constants/enums.js';

export const createInvoiceSchema = z.object({
  memberId: z.string().uuid().optional().nullable(),
  companyName: z.string().optional().nullable(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid 15-character GSTIN').optional().nullable(),
  clientEmail: z.string().email().optional().nullable(),
  type: z.nativeEnum(INVOICE_TYPE).default(INVOICE_TYPE.MEMBERSHIP),
  dueDate: z.coerce.date(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.coerce.number().int().min(1).default(1),
    unitPrice: z.coerce.number().positive(),
    taxPct: z.coerce.number().min(0).max(100).default(0),
  })).min(1, 'At least one invoice item is required'),
});

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  paymentMode: z.nativeEnum(PAYMENT_MODE).default(PAYMENT_MODE.UPI),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const invoiceIdParamSchema = z.object({ id: z.string().uuid() });
