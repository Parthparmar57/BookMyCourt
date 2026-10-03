// Issues #4 (no past bookings) and #8 (opening hours) — assertSlotBookable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertSlotBookable } from './time.js';

const hoursFromNow = (h) => new Date(Date.now() + h * 3600 * 1000);

test('rejects a slot that starts in the past', () => {
  assert.throws(
    () => assertSlotBookable({ startTime: hoursFromNow(-1), startHHMM: '06:00', openTime: '06:00', closeTime: '23:00' }),
    /past/
  );
});

test('rejects a slot before opening time', () => {
  assert.throws(
    () => assertSlotBookable({ startTime: hoursFromNow(48), startHHMM: '05:00', openTime: '06:00', closeTime: '23:00' }),
    /opening hours/
  );
});

test('rejects a slot whose hour-long session ends after closing time', () => {
  assert.throws(
    () => assertSlotBookable({ startTime: hoursFromNow(48), startHHMM: '23:00', openTime: '06:00', closeTime: '23:00' }),
    /opening hours/
  );
});

test('accepts a valid future in-hours slot', () => {
  assert.doesNotThrow(
    () => assertSlotBookable({ startTime: hoursFromNow(48), startHHMM: '07:00', openTime: '06:00', closeTime: '23:00' })
  );
});
