import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/bookmycourt?schema=public'),
  JWT_ACCESS_SECRET: z.string().min(16).default('champions_club_jwt_access_secret_key_32chars_min'),
  JWT_REFRESH_SECRET: z.string().min(16).default('champions_club_jwt_refresh_secret_key_32chars_min'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_secret_placeholder'),
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().default('user'),
  SMTP_PASS: z.string().default('pass'),
  SMTP_FROM: z.string().default('noreply@championsclub.com'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
