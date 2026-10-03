import { addMinutes, getDay } from 'date-fns';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { parseTimeOnDate } from '../../../utils/time.js';
import { genDocNo } from '../../../utils/ids.js';
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

  // The court must exist and be open. Overlap with any other booking on the same
  // court is rejected by the DB EXCLUDE constraint `booking_no_overlap`.
  const court = await prisma.court.findUnique({ where: { id: data.courtId } });
  if (!court || !court.isOpen) {
    throw new ApiError(400, 'Selected court is either not found or currently closed');
  }

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
  // A MEMBER always joins as themselves; staff may add a member or a guest.
  const memberId = user?.role === 'MEMBER' ? user.memberId : data.memberId || null;

  if (!memberId && !(data.guestName && data.guestPhone)) {
    throw new ApiError(400, 'Either a member or complete guest details (name and phone) are required');
  }

  return prisma.$transaction(async (tx) => {
    // Lock the session row so concurrent joins serialize — otherwise two players
    // could both pass the capacity check and exceed maxPlayers (Rule 11).
    await tx.$queryRaw`SELECT id FROM "Booking" WHERE id = ${bookingId} FOR UPDATE`;

    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { court: true, _count: { select: { socialParticipants: true } } },
    });

    if (!booking || booking.type !== BOOKING_TYPE.SOCIAL) {
      throw new ApiError(404, 'Social play session not found');
    }

    // Capacity is re-checked inside the transaction so concurrent joins cannot
    // exceed maxPlayers.
    if (booking._count.socialParticipants >= (booking.maxPlayers || 8)) {
      throw new ApiError(409, 'This social play session is full');
    }

    let participant;
    try {
      participant = await tx.socialParticipant.create({
        data: {
          bookingId,
          memberId,
          guestName: data.guestName || null,
          guestPhone: data.guestPhone || null,
          fee: booking.price,
          paymentStatus: PAYMENT_STATUS.PAID,
        },
      });
    } catch (err) {
      // Unique (bookingId, memberId) — the member is already in this session.
      if (err.code === 'P2002') {
        throw new ApiError(409, 'Member has already joined this session');
      }
      throw err;
    }

    if (Number(booking.price) > 0) {
      await tx.transaction.create({
        data: {
          transactionNo: genDocNo('TXN-SOC'),
          source: TRANSACTION_SOURCE.COURT,
          amount: booking.price,
          tax: 0,
          paymentMode: data.paymentMode || PAYMENT_MODE.UPI,
          reference: bookingId,
          bookingId,
          memberId,
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
