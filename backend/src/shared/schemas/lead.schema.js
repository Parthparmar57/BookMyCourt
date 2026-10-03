import { z } from 'zod';
import { LEAD_STAGE } from '../constants/enums.js';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  email: z.string().email().optional().nullable(),
  source: z.string().default('WEBSITE'),
  interest: z.string().optional().nullable(),
  stage: z.nativeEnum(LEAD_STAGE).default(LEAD_STAGE.NEW),
  assignedToId: z.string().uuid().optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial();
export const leadIdParamSchema = z.object({ id: z.string().uuid() });

export const createFollowUpSchema = z.object({
  date: z.coerce.date(),
  type: z.enum(['CALL', 'EMAIL', 'VISIT']).default('CALL'),
  notes: z.string().min(1, 'Notes are required'),
});

export const publicEnquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  email: z.string().email().optional().nullable(),
  interest: z.string().optional().nullable(),
  message: z.string().max(1000).optional().nullable(),
});

export const publicTrialBookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  email: z.string().email().optional().nullable(),
  sport: z.string().min(2, 'Sport is required'),
  preferredDate: z.coerce.date(),
  preferredTime: z.string().regex(/^([01]\d|2[0-3]):(00|30)$/),
  courtId: z.string().uuid().optional().nullable(),
});
