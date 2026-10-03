import { z } from 'zod';
import { PAYMENT_MODE } from '../constants/enums.js';

export const createSocialSessionSchema = z.object({
  courtId: z.string().uuid(),
  date: z.coerce.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):(00|30)$/),
  maxPlayers: z.coerce.number().int().min(2).max(30).default(8),
  feePerPlayer: z.coerce.number().min(0).default(100),
});

export const joinSocialPlaySchema = z.object({
  memberId: z.string().uuid().optional().nullable(),
  guestName: z.string().min(2).optional().nullable(),
  guestPhone: z.string().regex(/^[6-9]\d{9}$/).optional().nullable(),
  paymentMode: z.nativeEnum(PAYMENT_MODE).default(PAYMENT_MODE.UPI),
});

export const socialSessionIdParamSchema = z.object({
  id: z.string().uuid(),
});
