import { z } from 'zod';
import { ROLES } from '../constants/roles.js';

export const loginSchema = z.object({
  login: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

// Public self-registration: role is NOT accepted here. It is forced to MEMBER
// server-side. Staff accounts are created only via the OWNER-only /users route.
export const registerUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Staff/admin user creation by an OWNER — role is allowed and defaults to MEMBER.
export const createUserSchema = registerUserSchema.extend({
  role: z.nativeEnum(ROLES).default(ROLES.MEMBER),
});

// Owner editing a user: only a whitelisted set of fields, never passwordHash directly.
export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z.nativeEnum(ROLES).optional(),
  })
  .strict();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
