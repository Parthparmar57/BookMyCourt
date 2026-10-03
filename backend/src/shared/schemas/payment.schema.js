import { z } from 'zod';
import { TRANSACTION_SOURCE } from '../constants/enums.js';

export const createOrderSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  currency: z.string().length(3).default('INR'),
  receipt: z.string().max(40).optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
  paymentId: z.string().min(1, 'paymentId is required'),
  signature: z.string().min(1, 'signature is required'),
  source: z.nativeEnum(TRANSACTION_SOURCE).optional(),
  notes: z.string().max(255).optional(),
});
