// Issue #1 regression test — the Razorpay order amount must be derived from a
// server-side source (plan price / invoice balance), never from the client.
// Before the fix, createRazorpayOrder used the client-supplied `amount`, so a
// caller could create an order for ₹1 for any plan.
import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

let createArgs;
const ordersCreate = async (opts) => {
  createArgs.push(opts);
  return { id: 'order_1', amount: opts.amount, currency: opts.currency };
};

// Mock external deps so no real Razorpay / DB / env validation runs.
mock.module('../../../lib/razorpay.js', {
  namedExports: { razorpay: { orders: { create: ordersCreate } }, verifyRazorpaySignature: () => true },
});
mock.module('../../../config/env.js', {
  namedExports: { isRazorpayConfigured: true, env: { NODE_ENV: 'test' } },
});
mock.module('../../../lib/prisma.js', {
  namedExports: {
    prisma: {
      plan: { findUnique: async ({ where }) => (where.id === 'plan-gold' ? { id: 'plan-gold', price: 4999 } : null) },
      invoice: { findUnique: async () => null },
      transaction: { aggregate: async () => ({ _sum: { amount: 0 } }) },
    },
  },
});

const { createRazorpayOrder } = await import('./payment.service.js');

beforeEach(() => { createArgs = []; });

test('order amount is derived from the plan price, ignoring any client-sent amount', async () => {
  // A malicious client tries to pay ₹1 — the extra `amount` must be ignored.
  await createRazorpayOrder({ planId: 'plan-gold', amount: 1 });
  assert.equal(createArgs.length, 1);
  assert.equal(createArgs[0].amount, 499900, 'must be 4999*100 paise, not the client-sent 1');
});

test('missing planId and invoiceId is rejected', async () => {
  await assert.rejects(() => createRazorpayOrder({ amount: 500 }), /planId or invoiceId is required/);
});

test('unknown plan returns a not-found error', async () => {
  await assert.rejects(() => createRazorpayOrder({ planId: 'nope' }), /Plan not found/);
});
