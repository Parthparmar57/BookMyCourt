import { z } from 'zod';
import { TRANSACTION_SOURCE } from '../constants/enums.js';

// The payment amount is NEVER taken from the client — the server derives it from
// an authoritative source (a plan's price or an invoice's outstanding balance).
// The caller sends a reference id only.
export const createOrderSchema = z
  .object({
    planId: z.string().uuid().optional(),
    invoiceId: z.string().uuid().optional(),
    currency: z.string().length(3).default('INR'),
    receipt: z.string().max(40).optional(),
  })
  .refine((d) => d.planId || d.invoiceId, {
    message: 'A planId or invoiceId is required',
  });

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
  paymentId: z.string().min(1, 'paymentId is required'),
  signature: z.string().min(1, 'signature is required'),
  source: z.nativeEnum(TRANSACTION_SOURCE).optional(),
  notes: z.string().max(255).optional(),
});
