import { MEMBER_STATUS } from '../shared/index.js';

export const calculateCourtPrice = async (prismaClient, courtId, memberId) => {
  const court = await prismaClient.court.findUnique({
    where: { id: courtId },
  });

  if (!court) {
    throw new Error('Court not found');
  }

  // Walk-in rate by default
  let price = Number(court.walkInRate);

  if (memberId) {
    const member = await prismaClient.member.findUnique({
      where: { id: memberId },
      include: { plan: true },
    });

    if (member && member.status === MEMBER_STATUS.ACTIVE && member.plan) {
      const now = new Date();
      const isExpired = member.endDate && now > new Date(member.endDate);
      if (!isExpired) {
        price = Number(member.plan.courtRate || 0);
      }
    }
  }

  return price;
};

export const getMemberDiscounts = async (prismaClient, memberId) => {
  if (!memberId) {
    return { shopDiscountPct: 0, barDiscountPct: 0 };
  }

  const member = await prismaClient.member.findUnique({
    where: { id: memberId },
    include: { plan: true },
  });

  if (!member || member.status !== MEMBER_STATUS.ACTIVE || !member.plan) {
    return { shopDiscountPct: 0, barDiscountPct: 0 };
  }

  const now = new Date();
  if (member.endDate && now > new Date(member.endDate)) {
    return { shopDiscountPct: 0, barDiscountPct: 0 };
  }

  return {
    shopDiscountPct: member.plan.shopDiscountPct ?? 0,
    barDiscountPct: member.plan.barDiscountPct ?? 0,
  };
};
