import { z } from 'zod';
import { QUOTATION_STATUS } from '../constants/enums.js';

export const createQuotationSchema = z.object({
  leadId: z.string().uuid(),
  planId: z.string().uuid().optional().nullable(),
  amount: z.coerce.number().positive(),
  discount: z.coerce.number().min(0).default(0),
  validUntil: z.coerce.date(),
  notes: z.string().optional().nullable(),
});

export const updateQuotationStatusSchema = z.object({
  status: z.nativeEnum(QUOTATION_STATUS),
});

export const quotationIdParamSchema = z.object({ id: z.string().uuid() });
