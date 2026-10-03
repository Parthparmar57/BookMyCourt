import { z } from 'zod';

// Mirror the backend Zod rules so the client fails fast before the request.
export const phoneField = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');
export const timeSlotField = z.string().regex(/^([01]\d|2[0-3]):(00|30)$/, 'Time must be on :00 or :30');

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  phone: phoneField,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  login: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const memberSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: phoneField,
  email: z.string().email('Enter a valid email address'),
  dob: z.string().min(1, 'Date of birth is required'),
  planId: z.string().uuid('Select a membership plan'),
  startDate: z.string().optional(),
});

export const trialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneField,
  email: z.union([z.string().email('Enter a valid email address'), z.literal('')]).optional(),
  sport: z.string().min(2, 'Sport is required'),
  preferredDate: z.string().min(1, 'Pick a date'),
  preferredTime: timeSlotField,
});

/**
 * Map a normalized API error ({ errors: { field: [msg] } }) onto react-hook-form
 * fields. Returns true if any field error was applied. Falls back to a root error.
 */
export const applyServerErrors = (err, setError) => {
  if (err?.errors && typeof err.errors === 'object') {
    let applied = false;
    Object.entries(err.errors).forEach(([field, msgs]) => {
      setError(field, { type: 'server', message: Array.isArray(msgs) ? msgs[0] : String(msgs) });
      applied = true;
    });
    if (applied) return true;
  }
  setError('root', { type: 'server', message: err?.message || 'Something went wrong. Please try again.' });
  return false;
};
