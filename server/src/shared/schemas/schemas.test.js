// Validation-fix regression tests: #12 (trial past-date), #17 (enquiry status),
// #1 (payment create-order requires a server-side source, ignores client amount).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicTrialBookingSchema, updateEnquiryStatusSchema } from './lead.schema.js';
import { createOrderSchema } from './payment.schema.js';

const base = { name: 'Jo', phone: '9876543210', sport: 'Tennis', preferredTime: '07:00' };

test('#12 trial booking rejects a past preferredDate', () => {
  const r = publicTrialBookingSchema.safeParse({ ...base, preferredDate: '2000-01-01' });
  assert.equal(r.success, false);
});

test('#12 trial booking accepts a future preferredDate', () => {
  const future = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const r = publicTrialBookingSchema.safeParse({ ...base, preferredDate: future });
  assert.equal(r.success, true);
});

test('#17 enquiry status only accepts allowed values', () => {
  assert.equal(updateEnquiryStatusSchema.safeParse({ status: 'HACK' }).success, false);
  assert.equal(updateEnquiryStatusSchema.safeParse({ status: 'CONTACTED' }).success, true);
});

test('#1 payment create-order requires planId/invoiceId and strips client amount', () => {
  assert.equal(createOrderSchema.safeParse({ amount: 1 }).success, false, 'no source → rejected');
  const ok = createOrderSchema.safeParse({ planId: '11111111-1111-1111-1111-111111111111', amount: 1 });
  assert.equal(ok.success, true);
  assert.equal('amount' in ok.data, false, 'client-sent amount must be stripped');
});
