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

    if (member && member.status === MEMBER_STATUS.ACTIVE) {
      const now = new Date();
      if (now <= new Date(member.endDate)) {
        price = Number(member.plan.courtRate);
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

  if (!member || member.status !== MEMBER_STATUS.ACTIVE || new Date() > new Date(member.endDate)) {
    return { shopDiscountPct: 0, barDiscountPct: 0 };
  }

  return {
    shopDiscountPct: member.plan.shopDiscountPct || 0,
    barDiscountPct: member.plan.barDiscountPct || 0,
  };
};
