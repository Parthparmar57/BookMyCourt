import crypto from 'node:crypto';

/**
 * Generate a collision-resistant human-readable document number.
 * Combines the full millisecond timestamp (base36) with 3 random bytes, so two
 * inserts in the same millisecond still differ — unlike the old
 * `Date.now().toString().slice(-6)` which wrapped every ~16 minutes and
 * collided on `@unique` columns under load.
 *
 * Example: genDocNo('TXN-CRT') -> 'TXN-CRT-LXZ4K9-A1B2C3'
 */
export const genDocNo = (prefix) => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${ts}-${rand}`;
};
