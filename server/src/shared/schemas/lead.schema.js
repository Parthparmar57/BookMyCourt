import { z } from 'zod';
import { LEAD_STAGE } from '../constants/enums.js';

// Helper for optional string fields that might be passed as empty string ""
const optionalEmail = z
  .string()
  .email('Please enter a valid email address')
  .optional()
  .nullable()
  .or(z.literal(''))
  .transform((val) => (val && val.trim() ? val.trim() : null));

const phoneRegex = /^[0-9]{10}$/;

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit phone number'),
  email: optionalEmail,
  source: z.string().default('WEBSITE'),
  interest: z.string().optional().nullable(),
  stage: z.nativeEnum(LEAD_STAGE).default(LEAD_STAGE.NEW),
  assignedToId: z.string().uuid().optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial();
export const leadIdParamSchema = z.object({ id: z.string().uuid() });

// Converting a won lead into a member needs the details a lead doesn't carry
// (plan, date of birth for the BR6 age check, membership start date).
export const convertLeadSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  dob: z.coerce.date().refine((d) => d < new Date(), { message: 'Date of birth must be in the past' }),
  startDate: z.coerce.date().default(() => new Date()),
  email: optionalEmail,
  password: z.string().min(8).optional(),
  emergencyContact: z.string().regex(phoneRegex, 'Enter a valid 10-digit emergency contact').optional().nullable(),
});

export const createFollowUpSchema = z.object({
  date: z.coerce.date(),
  type: z.enum(['CALL', 'EMAIL', 'VISIT']).default('CALL'),
  notes: z.string().min(1, 'Notes are required'),
});

export const publicEnquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit phone number'),
  email: z.string().email('Please enter a valid email address'),
  interest: z.string().optional().nullable(),
  message: z.string().max(1000).optional().nullable(),
});

// Enquiry status transitions (Issue #17 — the route was previously unvalidated).
export const updateEnquiryStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']),
});
export const enquiryIdParamSchema = z.object({ id: z.string().uuid() });

export const publicTrialBookingSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
    email: z.string().email().optional().nullable(),
    sport: z.string().min(2, 'Sport is required'),
    preferredDate: z.coerce.date(),
    preferredTime: z.string().regex(/^([01]\d|2[0-3]):(00|30)$/),
    courtId: z.string().uuid().optional().nullable(),
  })
  // A trial cannot be requested for a past date (Rule 26).
  .refine(
    (d) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d.preferredDate >= today;
    },
    { message: 'Preferred date cannot be in the past', path: ['preferredDate'] }
  );
