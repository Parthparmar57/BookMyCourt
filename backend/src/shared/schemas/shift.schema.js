import { z } from 'zod';

export const openShiftSchema = z.object({
  openingCash: z.coerce.number().min(0).default(0),
  notes: z.string().optional().nullable(),
});

export const closeShiftSchema = z.object({
  closingCash: z.coerce.number().min(0, 'Closing cash must be non-negative'),
  notes: z.string().optional().nullable(),
});

export const shiftIdParamSchema = z.object({ id: z.string().uuid() });
