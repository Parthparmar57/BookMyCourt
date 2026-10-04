import { z } from 'zod';

const courtBaseSchema = z.object({
  name: z.string().min(2, 'Court name must be at least 2 characters'),
  sport: z.string().min(2, 'Sport name is required'),
  openTime: z.string().regex(/^([01]\d|2[0-3]):(00|30)$/, 'Time must be HH:00 or HH:30').default('06:00'),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):(00|30)$/, 'Time must be HH:00 or HH:30').default('23:00'),
  walkInRate: z.coerce.number().min(0, 'Walk-in rate must be non-negative'),
  isOpen: z.boolean().default(true),
});

export const updateCourtSchema = courtBaseSchema.partial();

export const createCourtSchema = courtBaseSchema.refine((data) => {
  if (data.openTime && data.closeTime) {
    return data.openTime < data.closeTime;
  }
  return true;
}, {
  message: 'Closing time must be after opening time',
  path: ['closeTime'],
});

export const courtIdParamSchema = z.object({ id: z.string().uuid() });


