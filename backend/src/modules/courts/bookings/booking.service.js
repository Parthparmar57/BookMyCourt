import { addMinutes, startOfDay, endOfDay, isBefore, isAfter, differenceInMinutes } from 'date-fns';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { calculateCourtPrice } from '../../../utils/pricing.js';
import { generateDailySlots, parseTimeOnDate } from '../../../utils/time.js';
import { genDocNo } from '../../../utils/ids.js';
import { writeAudit } from '../../../utils/audit.js';
import { emitBookingUpdate } from '../../../sockets/booking.socket.js';
import {
  SESSION_MINUTES,
  BOOKING_STATUS,
  BOOKING_TYPE,
  TRANSACTION_SOURCE,
  PAYMENT_MODE,
} from '../../../shared/index.js';

// Full refund if cancelled at least this many hours before start time (PRD policy default).
const REFUND_WINDOW_HOURS = 2;

export const getAvailability = async ({ date = new Date(), courtId, sport }) => {
  const targetDate = new Date(date);
  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const courts = await prisma.court.findMany({
    where: {
      isOpen: true,
      ...(courtId && { id: courtId }),
      ...(sport && { sport: { equals: sport, mode: 'insensitive' } }),
    },
    include: {
      bookings: {
        where: {
          status: { not: BOOKING_STATUS.CANCELLED },
          startTime: { gte: start, lte: end },
        },
      },
    },
  });

  return courts.map((court) => {
    const slots = generateDailySlots(targetDate, court.openTime, court.closeTime, SESSION_MINUTES, 30);

    const slotAvailability = slots.map((slot) => {
      // Check if any booking on this court overlaps with this 60-min slot
      const overlappingBooking = court.bookings.find((b) => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        return isBefore(bStart, slot.endTime) && isAfter(bEnd, slot.startTime);
      });

      return {
        ...slot,
        isAvailable: !overlappingBooking,
        bookingType: overlappingBooking ? overlappingBooking.type : null,
        bookingId: overlappingBooking ? overlappingBooking.id : null,
      };
    });

    return {
      courtId: court.id,
      courtName: court.name,
      sport: court.sport,
      walkInRate: court.walkInRate,
      slots: slotAvailability,
    };
  });
};

export const createBooking = async (data, user) => {
  const targetDate = new Date(data.date);
  const startTime = parseTimeOnDate(targetDate, data.startTime);
  const endTime = addMinutes(startTime, SESSION_MINUTES);

  const court = await prisma.court.findUnique({
    where: { id: data.courtId },
  });
  if (!court || !court.isOpen) {
    throw new ApiError(400, 'Selected court is either not found or currently closed');
  }

  // Resolve the member. A MEMBER may only ever book for themselves — they cannot
  // pass another member's id. Staff may book on behalf of any member.
  let memberId = data.memberId ?? null;
  let walkIn = data.walkIn ?? null;
  if (user?.role === 'MEMBER') {
    if (!user.memberId) throw new ApiError(403, 'Your account is not linked to a membership');
    memberId = user.memberId;
    walkIn = null; // members always book as members
  }

  if (!memberId && !(walkIn && walkIn.name && walkIn.phone)) {
    throw new ApiError(400, 'Either a member or complete walk-in details are required');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Daily booking limit (Rule BR3) — taken from the member's plan, not a constant.
    if (memberId) {
      const member = await tx.member.findUnique({
        where: { id: memberId },
        include: { plan: true },
      });
      if (!member) throw new ApiError(404, 'Member not found');

      const maxPerDay = member.plan?.maxBookingsDay ?? 2;
      const existingCount = await tx.booking.count({
        where: {
          memberId,
          status: { not: BOOKING_STATUS.CANCELLED },
          startTime: { gte: startOfDay(startTime), lte: endOfDay(startTime) },
        },
      });

      if (existingCount >= maxPerDay) {
        throw new ApiError(422, `Daily booking limit reached (${maxPerDay} per day for this plan).`);
      }
    }

    // 2. Early overlap check across ALL non-cancelled bookings (normal + social).
    //    This is a friendly pre-check; the DB EXCLUDE constraint `booking_no_overlap`
    //    is the authoritative guarantee under concurrency.
    const overlapping = await tx.booking.findFirst({
      where: {
        courtId: data.courtId,
        status: { not: BOOKING_STATUS.CANCELLED },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
    if (overlapping) {
      throw new ApiError(409, 'This court is already booked for that time');
    }

    // 3. Price based on plan or walk-in rate (Rule BR4 & BR8).
    const price = await calculateCourtPrice(tx, data.courtId, memberId);

    // 4. Create booking (DB constraint rejects a concurrent overlapping insert).
    const booking = await tx.booking.create({
      data: {
        courtId: data.courtId,
        memberId,
        walkInName: walkIn?.name ?? null,
        walkInPhone: walkIn?.phone ?? null,
        startTime,
        endTime,
        type: data.type || BOOKING_TYPE.NORMAL,
        status: BOOKING_STATUS.CONFIRMED,
        price,
        createdById: user.id,
      },
      include: {
        court: true,
        member: { include: { user: true, plan: true } },
      },
    });

    // 5. Post to Transaction Ledger (Rule BR11).
    if (price > 0) {
      await tx.transaction.create({
        data: {
          transactionNo: genDocNo('TXN-CRT'),
          source: TRANSACTION_SOURCE.COURT,
          amount: price,
          tax: 0,
          paymentMode: data.paymentMode || PAYMENT_MODE.UPI,
          reference: booking.id,
          bookingId: booking.id,
          memberId,
          notes: `Booking for ${court.name} on ${startTime.toISOString().slice(0, 10)}`,
        },
      });
    }

    await writeAudit(tx, {
      actorId: user.id,
      action: 'BOOKING_CREATE',
      entity: 'Booking',
      entityId: booking.id,
      meta: { courtId: data.courtId, memberId, price },
    });

    emitBookingUpdate(booking);
    return booking;
  });
};

export const cancelBooking = async (id, user, reason) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id },
      include: { court: true, member: true, transactions: true },
    });

    if (!booking) throw new ApiError(404, 'Booking not found');
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new ApiError(400, 'Booking is already cancelled');
    }

    // Members can only cancel their own bookings.
    if (user.role === 'MEMBER' && booking.memberId !== user.memberId) {
      throw new ApiError(403, 'You can only cancel your own bookings');
    }

    // Refund policy: full refund if cancelled at least REFUND_WINDOW_HOURS before start.
    const minutesToStart = differenceInMinutes(new Date(booking.startTime), new Date());
    const eligibleForRefund = minutesToStart >= REFUND_WINDOW_HOURS * 60;
    const paid = Number(booking.price);
    const refundAmount = eligibleForRefund ? paid : 0;

    const updated = await tx.booking.update({
      where: { id },
      data: {
        status: BOOKING_STATUS.CANCELLED,
        cancelReason: reason || null,
        cancelledById: user.id,
        cancelledAt: new Date(),
        refundAmount,
      },
      include: { court: true, member: true },
    });

    // Reverse the revenue from the ledger for whatever is refunded, so dashboards
    // and reports don't keep counting a cancelled booking's income.
    if (refundAmount > 0) {
      const original = booking.transactions.find((t) => t.source === TRANSACTION_SOURCE.COURT);
      await tx.transaction.create({
        data: {
          transactionNo: genDocNo('TXN-REF'),
          source: TRANSACTION_SOURCE.COURT,
          amount: -refundAmount,
          tax: 0,
          paymentMode: original?.paymentMode || PAYMENT_MODE.UPI,
          reference: booking.id,
          bookingId: booking.id,
          memberId: booking.memberId,
          notes: `Refund for cancelled booking on ${booking.court.name}`,
        },
      });
    }

    await writeAudit(tx, {
      actorId: user.id,
      action: 'BOOKING_CANCEL',
      entity: 'Booking',
      entityId: id,
      meta: { reason: reason || null, refundAmount },
    });

    emitBookingUpdate(updated);
    return updated;
  });
};

export const listBookings = async ({ courtId, date, status, memberId, page = 1, limit = 20 }) => {
  const where = {
    ...(courtId && { courtId }),
    ...(status && { status }),
    ...(memberId && { memberId }),
    ...(date && {
      startTime: {
        gte: startOfDay(new Date(date)),
        lte: endOfDay(new Date(date)),
      },
    }),
  };

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startTime: 'desc' },
      include: {
        court: true,
        member: { include: { user: true } },
      },
    }),
  ]);

  return { bookings, total, page, totalPages: Math.ceil(total / limit) };
};
