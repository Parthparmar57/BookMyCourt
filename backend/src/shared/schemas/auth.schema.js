import { z } from 'zod';
import { ROLES } from '../constants/roles.js';

export const loginSchema = z.object({
  login: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(ROLES).default(ROLES.MEMBER),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
