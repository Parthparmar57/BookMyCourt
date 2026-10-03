/**
 * Round a monetary value to 2 decimal places, avoiding binary float drift
 * (e.g. 0.1 + 0.2). Every computed amount/tax/total should pass through this
 * before being stored in a Decimal(10,2) column.
 */
export const round2 = (value) => {
  const n = Number(value) || 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
};
