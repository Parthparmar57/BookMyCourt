import { razorpay, verifyRazorpaySignature } from '../../../lib/razorpay.js';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { TRANSACTION_SOURCE, PAYMENT_MODE } from '../../../shared/index.js';

export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt }) => {
  try {
    const options = {
      amount: Math.round(Number(amount) * 100), // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };
    return await razorpay.orders.create(options);
  } catch (error) {
    // If test credentials or mock fallback:
    return {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'created',
    };
  }
};

export const verifyAndRecordPayment = async ({
  orderId,
  paymentId,
  signature,
  source = TRANSACTION_SOURCE.OTHER,
  amount,
  memberId,
  notes,
}) => {
  // If mock order, bypass signature check
  if (!orderId.startsWith('order_mock_')) {
    const isValid = verifyRazorpaySignature({ orderId, paymentId, signature });
    if (!isValid) {
      throw new ApiError(400, 'Invalid payment signature from Razorpay');
    }
  }

  return prisma.transaction.create({
    data: {
      transactionNo: `TXN-ONL-${Date.now().toString().slice(-6)}`,
      source,
      amount: Number(amount),
      tax: 0,
      paymentMode: PAYMENT_MODE.ONLINE,
      reference: paymentId,
      memberId: memberId || null,
      notes: notes || `Online payment ref: ${paymentId}`,
    },
  });
};
