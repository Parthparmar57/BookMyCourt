import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { prisma } from '../../lib/prisma.js';

export const getDashboardSummary = async () => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    todayRevenueAgg,
    weekRevenueAgg,
    monthRevenueAgg,
    revenueBySource,
    paymentModeSplit,
    activeMembersCount,
    expiringMembersCount,
    totalBookingsToday,
    pendingOrdersCount,
    unpaidExpensesAgg,
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
    // Revenue by source this month
    prisma.transaction.groupBy({
      by: ['source'],
      where: { date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    // Payment mode split this month
    prisma.transaction.groupBy({
      by: ['paymentMode'],
      where: { date: { gte: monthStart, lte: monthEnd } },
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
    // Pending kitchen / bar orders
    prisma.order.count({
      where: {
        status: { in: ['PLACED', 'PREPARING'] },
      },
    }),
    // Unpaid expenses
    prisma.expense.aggregate({
      where: { status: 'UNPAID' },
      _sum: { amount: true },
    }),
  ]);

  return {
    kpis: {
      todayRevenue: todayRevenueAgg._sum.amount || 0,
      weekRevenue: weekRevenueAgg._sum.amount || 0,
      monthRevenue: monthRevenueAgg._sum.amount || 0,
      activeMembers: activeMembersCount,
      expiringMembersSoon: expiringMembersCount,
      todayBookings: totalBookingsToday,
      activeKitchenOrders: pendingOrdersCount,
      unpaidExpenses: unpaidExpensesAgg._sum.amount || 0,
    },
    revenueBySource: revenueBySource.map((s) => ({
      source: s.source,
      amount: s._sum.amount || 0,
    })),
    paymentModeSplit: paymentModeSplit.map((m) => ({
      mode: m.paymentMode,
      amount: m._sum.amount || 0,
    })),
  };
};

export const getCourtUtilisation = async ({ date = new Date() }) => {
  const targetDate = new Date(date);
  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

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

  // Calculate court occupancy assuming 17 hours operation (6:00 to 23:00 = 17 1-hour slots)
  const totalSlotsPerCourt = 17;

  return courts.map((court) => {
    const bookedHours = court.bookings.length;
    const utilisationPct = Math.min(100, Math.round((bookedHours / totalSlotsPerCourt) * 100));

    return {
      courtId: court.id,
      courtName: court.name,
      sport: court.sport,
      bookedHours,
      totalAvailableHours: totalSlotsPerCourt,
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
