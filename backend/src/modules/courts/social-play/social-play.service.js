import { addMinutes, getDay } from 'date-fns';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { parseTimeOnDate } from '../../../utils/time.js';
import {
  BOOKING_TYPE,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  TRANSACTION_SOURCE,
  PAYMENT_MODE,
} from '../../../shared/index.js';

export const listSocialSessions = async () => {
  return prisma.booking.findMany({
    where: {
      type: BOOKING_TYPE.SOCIAL,
      status: { not: BOOKING_STATUS.CANCELLED },
      startTime: { gte: new Date() },
    },
    include: {
      court: true,
      socialParticipants: {
        include: {
          member: { include: { user: true } },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });
};

export const createSocialSession = async (data, user) => {
  const targetDate = new Date(data.date);

  // BR5: Must be Friday (day 5 in JS Date where 0 is Sunday, 5 is Friday)
  if (getDay(targetDate) !== 5) {
    throw new ApiError(400, 'Social play sessions can only be scheduled on Fridays');
  }

  const startTime = parseTimeOnDate(targetDate, data.startTime);
  const endTime = addMinutes(startTime, 60);

  return prisma.booking.create({
    data: {
      courtId: data.courtId,
      startTime,
      endTime,
      type: BOOKING_TYPE.SOCIAL,
      status: BOOKING_STATUS.CONFIRMED,
      price: data.feePerPlayer,
      maxPlayers: data.maxPlayers || 8,
      createdById: user.id,
    },
    include: { court: true },
  });
};

export const joinSocialPlay = async (bookingId, data, user) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { socialParticipants: true, court: true },
  });

  if (!booking || booking.type !== BOOKING_TYPE.SOCIAL) {
    throw new ApiError(404, 'Social play session not found');
  }

  if (booking.socialParticipants.length >= (booking.maxPlayers || 8)) {
    throw new ApiError(400, 'This social play session is full');
  }

  const memberId = data.memberId || (user?.role === 'MEMBER' ? user.memberId : null);

  if (memberId) {
    const alreadyJoined = booking.socialParticipants.some((p) => p.memberId === memberId);
    if (alreadyJoined) {
      throw new ApiError(400, 'Member has already joined this session');
    }
  }

  return prisma.$transaction(async (tx) => {
    const participant = await tx.socialParticipant.create({
      data: {
        bookingId,
        memberId: memberId || null,
        guestName: data.guestName || null,
        guestPhone: data.guestPhone || null,
        fee: booking.price,
        paymentStatus: PAYMENT_STATUS.PAID,
      },
    });

    if (Number(booking.price) > 0) {
      await tx.transaction.create({
        data: {
          transactionNo: `TXN-SOC-${Date.now().toString().slice(-6)}`,
          source: TRANSACTION_SOURCE.COURT,
          amount: booking.price,
          tax: 0,
          paymentMode: data.paymentMode || PAYMENT_MODE.UPI,
          reference: bookingId,
          bookingId,
          memberId: memberId || null,
          notes: `Social play on ${booking.court.name}`,
        },
      });
    }

    return participant;
  });
};

export const leaveSocialPlay = async (bookingId, participantId, user) => {
  const participant = await prisma.socialParticipant.findUnique({
    where: { id: participantId },
  });

  if (!participant || participant.bookingId !== bookingId) {
    throw new ApiError(404, 'Participant record not found');
  }

  if (user.role === 'MEMBER' && participant.memberId !== user.memberId) {
    throw new ApiError(403, 'You can only remove your own participation');
  }

  return prisma.socialParticipant.delete({
    where: { id: participantId },
  });
};
