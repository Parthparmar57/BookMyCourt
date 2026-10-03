import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  durationMonths: z.coerce.number().int().min(1, 'Duration must be at least 1 month'),
  courtRate: z.coerce.number().min(0, 'Court rate must be non-negative'),
  freeSessions: z.coerce.number().int().min(0).default(0),
  shopDiscountPct: z.coerce.number().int().min(0).max(100).default(0),
  barDiscountPct: z.coerce.number().int().min(0).max(100).default(0),
  maxBookingsDay: z.coerce.number().int().min(1).default(2),
  maxAge: z.coerce.number().int().positive().optional().nullable(),
});

export const updatePlanSchema = createPlanSchema.partial();
export const planIdParamSchema = z.object({ id: z.string().uuid() });
