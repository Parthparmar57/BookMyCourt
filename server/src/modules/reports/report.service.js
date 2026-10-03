import { startOfDay, endOfDay } from 'date-fns';
import { prisma } from '../../lib/prisma.js';

export const getTaxReport = async ({ startDate, endDate }) => {
  const where = {
    ...((startDate || endDate) && {
      date: {
        ...(startDate && { gte: startOfDay(new Date(startDate)) }),
        ...(endDate && { lte: endOfDay(new Date(endDate)) }),
      },
    }),
  };

  const [bySource, totalTaxAgg] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['source'],
      where,
      _sum: { tax: true, amount: true },
    }),
    prisma.transaction.aggregate({
      where,
      _sum: { tax: true, amount: true },
    }),
  ]);

  return {
    totalCollectedTax: totalTaxAgg._sum.tax || 0,
    totalTaxableAmount: totalTaxAgg._sum.amount || 0,
    byCategory: bySource.map((s) => ({
      category: s.source,
      tax: s._sum.tax || 0,
      totalAmount: s._sum.amount || 0,
    })),
  };
};

export const getInventoryReport = async () => {
  const products = await prisma.product.findMany({
    orderBy: { stock: 'asc' },
    include: {
      _count: { select: { orderItems: true } },
    },
  });

  let totalStockValue = 0;
  const items = products.map((p) => {
    const val = Number(p.price) * p.stock;
    totalStockValue += val;
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      stock: p.stock,
      reorderLevel: p.reorderLevel,
      stockValue: val,
      totalOrders: p._count.orderItems,
      isLowStock: p.stock <= p.reorderLevel,
    };
  });

  return {
    totalStockValue,
    totalProducts: products.length,
    lowStockCount: items.filter((i) => i.isLowStock).length,
    items,
  };
};

export const getMembershipReport = async () => {
  const [plans, membersByStatus] = await Promise.all([
    prisma.plan.findMany({
      include: { _count: { select: { members: true } } },
    }),
    prisma.member.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  return {
    plans: plans.map((p) => ({ plan: p.name, memberCount: p._count.members })),
    statusBreakdown: membersByStatus.map((m) => ({ status: m.status, count: m._count })),
  };
};

// G2: Revenue report — grouped by source and payment mode, with date-range support
export const getRevenueReport = async ({ startDate, endDate } = {}) => {
  const where = {
    ...((startDate || endDate) && {
      date: {
        ...(startDate && { gte: startOfDay(new Date(startDate)) }),
        ...(endDate && { lte: endOfDay(new Date(endDate)) }),
      },
    }),
  };

  const [bySource, byMode, totalAgg] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['source'],
      where,
      _sum: { amount: true, tax: true },
    }),
    prisma.transaction.groupBy({
      by: ['paymentMode'],
      where,
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where,
      _sum: { amount: true, tax: true },
      _count: true,
    }),
  ]);

  return {
    totalRevenue: totalAgg._sum.amount || 0,
    totalTax: totalAgg._sum.tax || 0,
    totalTransactions: totalAgg._count,
    bySource: bySource.map((s) => ({
      source: s.source,
      amount: s._sum.amount || 0,
      tax: s._sum.tax || 0,
    })),
    byPaymentMode: byMode.map((m) => ({
      mode: m.paymentMode,
      amount: m._sum.amount || 0,
    })),
  };
};
