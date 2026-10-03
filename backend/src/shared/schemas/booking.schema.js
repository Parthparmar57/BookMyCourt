import { z } from 'zod';
import { BOOKING_TYPE, PAYMENT_MODE } from '../constants/enums.js';

export const createBookingSchema = z
  .object({
    courtId: z.string().uuid('Valid court ID is required'),
    date: z.coerce.date(),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):(00|30)$/, 'Start time must be on :00 or :30'),
    type: z.nativeEnum(BOOKING_TYPE).default(BOOKING_TYPE.NORMAL),
    memberId: z.string().uuid().optional().nullable(),
    walkIn: z
      .object({
        name: z.string().min(2, 'Walk-in name must be at least 2 characters').max(100),
        phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
      })
      .optional()
      .nullable(),
    paymentMode: z.nativeEnum(PAYMENT_MODE).default(PAYMENT_MODE.UPI),
  });
// Note: whether a member or walk-in is required is enforced in the service, because
// a logged-in MEMBER books for themselves and sends neither field.

export const cancelBookingSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required').optional(),
});

export const bookingIdParamSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  courtId: z.string().uuid().optional(),
  sport: z.string().optional(),
});
