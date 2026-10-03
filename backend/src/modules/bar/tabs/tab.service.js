import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
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

  if (existingOpenTab) {
    return existingOpenTab;
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

export const listOpenTabs = async () => {
  return prisma.barTab.findMany({
    where: { status: TAB_STATUS.OPEN },
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
  const tab = await prisma.barTab.findUnique({
    where: { id: tabId },
    include: { orders: true, member: true },
  });

  if (!tab) throw new ApiError(404, 'Bar tab not found');
  if (tab.status === TAB_STATUS.SETTLED) {
    throw new ApiError(400, 'Tab is already settled');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Mark all pending orders under this tab as completed and paid
    await tx.order.updateMany({
      where: { barTabId: tabId },
      data: {
        paymentStatus: PAYMENT_STATUS.PAID,
        status: ORDER_STATUS.COMPLETED,
        paymentMode,
      },
    });

    // 2. Mark tab as settled (Rule BR12)
    const settledTab = await tx.barTab.update({
      where: { id: tabId },
      data: {
        status: TAB_STATUS.SETTLED,
        settledAt: new Date(),
        notes: notes || tab.notes,
      },
    });

    // 3. Post to Transaction Ledger (Rule BR11)
    if (Number(tab.totalAmount) > 0) {
      await tx.transaction.create({
        data: {
          transactionNo: `TXN-TAB-${Date.now().toString().slice(-6)}`,
          source: TRANSACTION_SOURCE.BAR,
          amount: tab.totalAmount,
          tax: 0,
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
