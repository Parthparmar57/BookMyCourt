import { razorpay, verifyRazorpaySignature } from '../../../lib/razorpay.js';
import { isRazorpayConfigured } from '../../../config/env.js';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { genDocNo } from '../../../utils/ids.js';
import { round2 } from '../../../utils/money.js';
import { TRANSACTION_SOURCE, PAYMENT_MODE } from '../../../shared/index.js';

const ensureConfigured = () => {
  if (!isRazorpayConfigured || !razorpay) {
    throw new ApiError(503, 'Online payments are not configured on this server');
  }
};

// Resolve the authoritative amount (in rupees) from a server-side source. The
// client only supplies the reference id; it can never dictate what it pays.
const resolveOrderAmount = async ({ planId, invoiceId }) => {
  if (planId) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new ApiError(404, 'Plan not found');
    return { amount: Number(plan.price), receipt: `plan_${planId}` };
  }
  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new ApiError(404, 'Invoice not found');
    // Charge only the outstanding balance (total minus what is already paid).
    const paid = await prisma.transaction.aggregate({
      where: { invoiceId },
      _sum: { amount: true },
    });
    const outstanding = round2(Number(invoice.total) - Number(paid._sum.amount || 0));
    if (outstanding <= 0) throw new ApiError(400, 'This invoice is already fully paid');
    return { amount: outstanding, receipt: `inv_${invoiceId}` };
  }
  throw new ApiError(400, 'A planId or invoiceId is required to create a payment order');
};

export const createRazorpayOrder = async ({ planId, invoiceId, currency = 'INR', receipt }) => {
  ensureConfigured();

  const resolved = await resolveOrderAmount({ planId, invoiceId });
  const paise = Math.round(resolved.amount * 100);
  if (!Number.isFinite(paise) || paise <= 0) {
    throw new ApiError(400, 'Computed order amount is invalid');
  }

  // No silent mock fallback: a real failure must surface, not route traffic into
  // an unverified path.
  return razorpay.orders.create({
    amount: paise,
    currency,
    receipt: receipt || resolved.receipt || `rcpt_${Date.now()}`,
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
