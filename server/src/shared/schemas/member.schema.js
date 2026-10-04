import { z } from 'zod';
import { MEMBER_STATUS } from '../constants/enums.js';

export const registerMemberSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6).optional(),
  dob: z.coerce.date().refine((d) => d < new Date(), { message: 'Date of birth must be in the past' }),
  planId: z.string().uuid('Invalid plan ID'),
  startDate: z.coerce.date().default(() => new Date()),
  photoUrl: z.string().url().optional().nullable(),
  emergencyContact: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number').optional().nullable(),
});

export const updateMemberSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  email: z.string().email().optional(),
  photoUrl: z.string().url().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  status: z.nativeEnum(MEMBER_STATUS).optional(),
  planId: z.string().uuid().optional(),
});

export const renewMemberSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'ONLINE']).default('UPI'),
});

export const memberIdParamSchema = z.object({ id: z.string().uuid() });
export const memberSearchQuerySchema = z.object({
  q: z.string().optional(),
  planId: z.string().uuid().optional(),
  status: z.nativeEnum(MEMBER_STATUS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z
    .preprocess(
      (val) => (String(val).toLowerCase() === 'all' ? 1000 : val),
      z.coerce.number().int().min(1).max(1000)
    )
    .default(20),
});
