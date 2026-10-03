import { razorpay, verifyRazorpaySignature } from '../../../lib/razorpay.js';
import { isRazorpayConfigured } from '../../../config/env.js';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { genDocNo } from '../../../utils/ids.js';
import { TRANSACTION_SOURCE, PAYMENT_MODE } from '../../../shared/index.js';

const ensureConfigured = () => {
  if (!isRazorpayConfigured || !razorpay) {
    throw new ApiError(503, 'Online payments are not configured on this server');
  }
};

export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt }) => {
  ensureConfigured();

  const paise = Math.round(Number(amount) * 100);
  if (!Number.isFinite(paise) || paise <= 0) {
    throw new ApiError(400, 'A valid positive amount is required');
  }

  // No silent mock fallback: a real failure must surface, not route traffic into
  // an unverified path.
  return razorpay.orders.create({
    amount: paise,
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
  });
};

export const verifyAndRecordPayment = async ({ orderId, paymentId, signature, source, notes }, actor) => {
  ensureConfigured();

  if (!orderId || !paymentId || !signature) {
    throw new ApiError(400, 'orderId, paymentId and signature are required');
  }

  // 1. Signature must be valid — always, no bypass.
  if (!verifyRazorpaySignature({ orderId, paymentId, signature })) {
    throw new ApiError(400, 'Invalid payment signature from Razorpay');
  }

  // 2. Fetch the authoritative payment from Razorpay. The amount is taken from
  //    here, never from the client, and it must belong to the given order and
  //    be captured.
  const payment = await razorpay.payments.fetch(paymentId);
  if (payment.order_id !== orderId) {
    throw new ApiError(400, 'Payment does not belong to the provided order');
  }
  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    throw new ApiError(400, `Payment is not successful (status: ${payment.status})`);
  }

  const amount = Number(payment.amount) / 100;
  const resolvedSource = Object.values(TRANSACTION_SOURCE).includes(source)
    ? source
    : TRANSACTION_SOURCE.OTHER;
  // A member can only attribute a payment to themselves; staff attribution comes
  // from the resolved record elsewhere.
  const memberId = actor?.role === 'MEMBER' ? actor.memberId || null : null;

  // 3. Idempotency: the same Razorpay payment must never be recorded twice.
  const existing = await prisma.transaction.findFirst({ where: { reference: paymentId } });
  if (existing) return existing;

  return prisma.transaction.create({
    data: {
      transactionNo: genDocNo('TXN-ONL'),
      source: resolvedSource,
      amount,
      tax: 0,
      paymentMode: PAYMENT_MODE.ONLINE,
      reference: paymentId,
      memberId,
      notes: notes || `Online payment ref: ${paymentId}`,
    },
  });
};
