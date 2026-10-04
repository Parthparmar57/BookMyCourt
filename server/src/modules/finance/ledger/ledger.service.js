import { startOfDay, endOfDay } from 'date-fns';
import { prisma } from '../../../lib/prisma.js';

export const listTransactions = async ({
  startDate,
  endDate,
  source,
  paymentMode,
  page = 1,
  limit = 50,
}) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 50);

  const where = {
    ...(source && { source }),
    ...(paymentMode && { paymentMode }),
    ...((startDate || endDate) && {
      date: {
        ...(startDate && { gte: startOfDay(new Date(startDate)) }),
        ...(endDate && { lte: endOfDay(new Date(endDate)) }),
      },
    }),
  };

  const [total, transactions, aggregations] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      skip: (p - 1) * l,
      take: l,
      orderBy: { date: 'desc' },
      include: {
        member: { include: { user: true } },
      },
    }),
    prisma.transaction.aggregate({
      where,
      _sum: { amount: true, tax: true },
    }),
  ]);

  return {
    transactions,
    total,
    page: p,
    totalPages: Math.ceil(total / l),
    totalAmount: aggregations._sum.amount || 0,
    totalTax: aggregations._sum.tax || 0,
  };
};

export const getLedgerSummary = async ({ startDate, endDate }) => {
  const where = {
    ...((startDate || endDate) && {
      date: {
        ...(startDate && { gte: startOfDay(new Date(startDate)) }),
        ...(endDate && { lte: endOfDay(new Date(endDate)) }),
      },
    }),
  };

  const [bySource, byMode, total] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['source'],
      where,
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['paymentMode'],
      where,
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return {
    totalRevenue: total._sum.amount || 0,
    totalTransactions: total._count,
    bySource: bySource.map((s) => ({ source: s.source, total: s._sum.amount })),
    byPaymentMode: byMode.map((m) => ({ mode: m.paymentMode, total: m._sum.amount })),
  };
};
