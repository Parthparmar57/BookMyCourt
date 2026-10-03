import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { genDocNo } from '../../../utils/ids.js';
import { round2 } from '../../../utils/money.js';
import {
  TAB_STATUS,
  PAYMENT_STATUS,
  ORDER_STATUS,
  TRANSACTION_SOURCE,
  PAYMENT_MODE,
} from '../../../shared/index.js';

export const openTab = async ({ memberId, notes }) => {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { user: true },
  });
  if (!member) throw new ApiError(404, 'Member not found');

  const existingOpenTab = await prisma.barTab.findFirst({
    where: { memberId, status: TAB_STATUS.OPEN },
  });

  // A member may have at most one open tab (also enforced by the
  // bartab_one_open_per_member unique index). Surface a clear conflict instead
  // of silently returning the existing tab with a misleading 201.
  if (existingOpenTab) {
    throw new ApiError(409, 'This member already has an open tab');
  }

  return prisma.barTab.create({
    data: {
      memberId,
      notes,
      status: TAB_STATUS.OPEN,
    },
    include: {
      member: { include: { user: true } },
    },
  });
};

export const listOpenTabs = async ({ memberId } = {}) => {
  return prisma.barTab.findMany({
    where: { status: TAB_STATUS.OPEN, ...(memberId && { memberId }) },
    include: {
      member: { include: { user: true, plan: true } },
      orders: {
        include: { items: { include: { menuItem: true } } },
      },
    },
    orderBy: { openedAt: 'desc' },
  });
};

export const getTabById = async (id) => {
  const tab = await prisma.barTab.findUnique({
    where: { id },
    include: {
      member: { include: { user: true, plan: true } },
      orders: {
        include: { items: { include: { menuItem: true } } },
      },
    },
  });
  if (!tab) throw new ApiError(404, 'Bar tab not found');
  return tab;
};

export const settleTab = async (tabId, { paymentMode = PAYMENT_MODE.UPI, notes }) => {
  return prisma.$transaction(async (tx) => {
    // Lock the tab row first so two concurrent settlements serialize here — the
    // status re-check below then guarantees the ledger is posted exactly once.
    await tx.$queryRaw`SELECT id FROM "BarTab" WHERE id = ${tabId} FOR UPDATE`;

    const tab = await tx.barTab.findUnique({
      where: { id: tabId },
      include: { orders: true, member: true },
    });
    if (!tab) throw new ApiError(404, 'Bar tab not found');
    if (tab.status === TAB_STATUS.SETTLED) {
      throw new ApiError(400, 'Tab is already settled');
    }

    // Amount and tax come from the tab's own orders (authoritative), not the
    // cached totalAmount, so the ledger carries the correct GST.
    const amount = round2(tab.orders.reduce((s, o) => s + Number(o.total), 0));
    const tax = round2(tab.orders.reduce((s, o) => s + Number(o.tax), 0));

    // 1. Mark all orders under this tab as completed and paid.
    await tx.order.updateMany({
      where: { barTabId: tabId },
      data: {
        paymentStatus: PAYMENT_STATUS.PAID,
        status: ORDER_STATUS.COMPLETED,
        paymentMode,
      },
    });

    // 2. Mark tab as settled (Rule BR12).
    const settledTab = await tx.barTab.update({
      where: { id: tabId },
      data: {
        status: TAB_STATUS.SETTLED,
        settledAt: new Date(),
        totalAmount: amount,
        notes: notes || tab.notes,
      },
    });

    // 3. Post a single ledger entry for the whole tab (Rule BR11). The individual
    //    orders were never posted immediately, so there is no double counting.
    if (amount > 0) {
      await tx.transaction.create({
        data: {
          transactionNo: genDocNo('TXN-TAB'),
          source: TRANSACTION_SOURCE.BAR,
          amount,
          tax,
          paymentMode,
          reference: `TAB-${tab.id}`,
          memberId: tab.memberId,
          notes: `Settled tab for member ${tab.member.memberNo}`,
        },
      });
    }

    return settledTab;
  });
};
