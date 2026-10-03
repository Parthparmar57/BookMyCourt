import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  subWeeks,
  subMonths,
} from 'date-fns';
import { prisma } from '../../lib/prisma.js';

export const getDashboardSummary = async ({ period = 'month' } = {}) => {
  const now = new Date();

  // Normalize period parameter: 'today' | 'week' | 'month' (supports 'daily', 'weekly', 'monthly')
  let normalizedPeriod = 'month';
  const rawPeriod = String(period || '').toLowerCase();
  if (['today', 'daily', 'day'].includes(rawPeriod)) {
    normalizedPeriod = 'today';
  } else if (['week', 'weekly'].includes(rawPeriod)) {
    normalizedPeriod = 'week';
  } else {
    normalizedPeriod = 'month';
  }

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  let periodStart, periodEnd, prevPeriodStart, prevPeriodEnd, periodLabel;
  if (normalizedPeriod === 'today') {
    periodStart = todayStart;
    periodEnd = todayEnd;
    prevPeriodStart = startOfDay(subDays(now, 1));
    prevPeriodEnd = endOfDay(subDays(now, 1));
    periodLabel = 'Today';
  } else if (normalizedPeriod === 'week') {
    periodStart = weekStart;
    periodEnd = weekEnd;
    prevPeriodStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    prevPeriodEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    periodLabel = 'This Week';
  } else {
    periodStart = monthStart;
    periodEnd = monthEnd;
    prevPeriodStart = startOfMonth(subMonths(now, 1));
    prevPeriodEnd = endOfMonth(subMonths(now, 1));
    periodLabel = 'This Month';
  }

  const [
    todayRevenueAgg,
    weekRevenueAgg,
    monthRevenueAgg,
    periodRevenueAgg,
    prevPeriodRevenueAgg,
    revenueBySource,
    paymentModeSplit,
    activeMembersCount,
    expiringMembersCount,
    totalBookingsToday,
    periodBookingsCount,
    prevPeriodBookingsCount,
    pendingOrdersCount,
    unpaidExpensesAgg,
    receivablesAgg,
  ] = await Promise.all([
    // Today revenue
    prisma.transaction.aggregate({
      where: { date: { gte: todayStart, lte: todayEnd } },
      _sum: { amount: true },
    }),
    // This week revenue
    prisma.transaction.aggregate({
      where: { date: { gte: weekStart, lte: weekEnd } },
      _sum: { amount: true },
    }),
    // This month revenue
    prisma.transaction.aggregate({
      where: { date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    // Selected period revenue
    prisma.transaction.aggregate({
      where: { date: { gte: periodStart, lte: periodEnd } },
      _sum: { amount: true },
    }),
    // Previous period revenue
    prisma.transaction.aggregate({
      where: { date: { gte: prevPeriodStart, lte: prevPeriodEnd } },
      _sum: { amount: true },
    }),
    // Revenue by source for selected period
    prisma.transaction.groupBy({
      by: ['source'],
      where: { date: { gte: periodStart, lte: periodEnd } },
      _sum: { amount: true },
    }),
    // Payment mode split for selected period
    prisma.transaction.groupBy({
      by: ['paymentMode'],
      where: { date: { gte: periodStart, lte: periodEnd } },
      _sum: { amount: true },
    }),
    // Active members
    prisma.member.count({
      where: { status: 'ACTIVE' },
    }),
    // Expiring soon (within next 15 days)
    prisma.member.count({
      where: {
        status: 'ACTIVE',
        endDate: { gte: now, lte: addDays(now, 15) },
      },
    }),
    // Today's bookings
    prisma.booking.count({
      where: {
        startTime: { gte: todayStart, lte: todayEnd },
        status: { not: 'CANCELLED' },
      },
    }),
    // Selected period bookings
    prisma.booking.count({
      where: {
        startTime: { gte: periodStart, lte: periodEnd },
        status: { not: 'CANCELLED' },
      },
    }),
    // Previous period bookings
    prisma.booking.count({
      where: {
        startTime: { gte: prevPeriodStart, lte: prevPeriodEnd },
        status: { not: 'CANCELLED' },
      },
    }),
    // Pending kitchen / bar orders
    prisma.order.count({
      where: {
        status: { in: ['PLACED', 'PREPARING'] },
      },
    }),
    // Unpaid expenses (payables)
    prisma.expense.aggregate({
      where: { status: 'UNPAID' },
      _sum: { amount: true },
    }),
    // Outstanding invoices (receivables)
    prisma.invoice.aggregate({
      where: { status: { in: ['SENT', 'OVERDUE'] } },
      _sum: { total: true },
    }),
  ]);

  const currentRevenue = Number(periodRevenueAgg._sum.amount || 0);
  const prevRevenue = Number(prevPeriodRevenueAgg._sum.amount || 0);
  const revenueGrowthPct = prevRevenue > 0
    ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
    : (currentRevenue > 0 ? 100 : 0);

  const currentBookings = periodBookingsCount;
  const prevBookings = prevPeriodBookingsCount;
  const bookingsGrowthPct = prevBookings > 0
    ? Math.round(((currentBookings - prevBookings) / prevBookings) * 100)
    : (currentBookings > 0 ? 100 : 0);

  return {
    period: normalizedPeriod,
    periodLabel,
    kpis: {
      period: normalizedPeriod,
      periodLabel,
      periodRevenue: currentRevenue,
      prevPeriodRevenue: prevRevenue,
      revenueGrowthPct,
      periodBookings: currentBookings,
      prevPeriodBookings: prevBookings,
      bookingsGrowthPct,
      todayRevenue: Number(todayRevenueAgg._sum.amount || 0),
      weekRevenue: Number(weekRevenueAgg._sum.amount || 0),
      monthRevenue: Number(monthRevenueAgg._sum.amount || 0),
      activeMembers: activeMembersCount,
      expiringMembersSoon: expiringMembersCount,
      todayBookings: totalBookingsToday,
      activeKitchenOrders: pendingOrdersCount,
      payables: Number(unpaidExpensesAgg._sum.amount || 0),
      unpaidExpenses: Number(unpaidExpensesAgg._sum.amount || 0),
      receivables: Number(receivablesAgg._sum.total || 0),
    },
    revenueBySource: revenueBySource.map((s) => ({
      source: s.source,
      amount: Number(s._sum.amount || 0),
    })),
    paymentModeSplit: paymentModeSplit.map((m) => ({
      mode: m.paymentMode,
      amount: Number(m._sum.amount || 0),
    })),
  };
};

export const getCourtUtilisation = async ({ date = new Date(), period = 'today' } = {}) => {
  const targetDate = new Date(date);
  let start = startOfDay(targetDate);
  let end = endOfDay(targetDate);

  const rawPeriod = String(period || '').toLowerCase();
  if (['week', 'weekly'].includes(rawPeriod)) {
    start = startOfWeek(targetDate, { weekStartsOn: 1 });
    end = endOfWeek(targetDate, { weekStartsOn: 1 });
  } else if (['month', 'monthly'].includes(rawPeriod)) {
    start = startOfMonth(targetDate);
    end = endOfMonth(targetDate);
  }

  const courts = await prisma.court.findMany({
    where: { isOpen: true },
    include: {
      bookings: {
        where: {
          startTime: { gte: start, lte: end },
          status: { not: 'CANCELLED' },
        },
      },
    },
  });

  const toHours = (hhmm, fallback) => {
    const [h, m] = String(hhmm || fallback).split(':').map(Number);
    return (Number.isFinite(h) ? h : 0) + (Number.isFinite(m) ? m : 0) / 60;
  };

  const daysCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  return courts.map((court) => {
    // Operating hours from court opening/closing times multiplied by number of days in window
    const dailyOperatingHours = Math.max(0, toHours(court.closeTime, '23:00') - toHours(court.openTime, '06:00'));
    const totalOperatingHours = dailyOperatingHours * daysCount;

    // Booked hours from actual booking durations
    const bookedHours = court.bookings.reduce((sum, b) => {
      const ms = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
      return sum + ms / (1000 * 60 * 60);
    }, 0);

    const utilisationPct = totalOperatingHours > 0
      ? Math.min(100, Math.round((bookedHours / totalOperatingHours) * 100))
      : 0;

    return {
      courtId: court.id,
      courtName: court.name,
      sport: court.sport,
      bookedHours: Math.round(bookedHours * 100) / 100,
      totalAvailableHours: Math.round(totalOperatingHours * 100) / 100,
      utilisationPct,
      bookings: court.bookings.map((b) => ({
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        type: b.type,
      })),
    };
  });
};
