import Razorpay from 'razorpay';
import crypto from 'node:crypto';
import { env, isRazorpayConfigured } from '../config/env.js';

// Only construct a client when real credentials exist. When unconfigured the
// payment service rejects online-payment requests instead of using a fake key.
export const razorpay = isRazorpayConfigured
  ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
  : null;

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // Constant-time comparison to avoid timing attacks.
  const a = Buffer.from(expectedSignature);
  const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
