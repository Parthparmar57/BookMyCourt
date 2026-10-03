import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  // No defaults for secrets/connection strings: the app must refuse to boot
  // without them rather than silently fall back to public, repo-known values.
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  // Optional integrations: unset means the feature is disabled, never a fake key.
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@bookmycourt.com'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Derived flags so feature code can degrade gracefully instead of using fake keys.
export const isRazorpayConfigured = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
export const isMailConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

if (env.NODE_ENV === 'production') {
  if (!isRazorpayConfigured) {
    console.warn('[env] Razorpay is not configured — online payment endpoints will be rejected.');
  }
  if (!isMailConfigured) {
    console.warn('[env] SMTP is not configured — email notifications are disabled.');
  }
}
