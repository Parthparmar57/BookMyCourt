import { addMinutes, startOfDay, endOfDay, isBefore, isAfter } from 'date-fns';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { calculateCourtPrice } from '../../../utils/pricing.js';
import { generateDailySlots, parseTimeOnDate } from '../../../utils/time.js';
import { emitBookingUpdate } from '../../../sockets/booking.socket.js';
import {
  SESSION_MINUTES,
  MAX_PER_DAY,
  BOOKING_STATUS,
  BOOKING_TYPE,
  TRANSACTION_SOURCE,
  PAYMENT_MODE,
} from '../../../shared/index.js';

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

  // Validate member ID if provided or if booking as MEMBER
  let memberId = data.memberId;
  if (!memberId && user?.role === 'MEMBER') {
    memberId = user.memberId;
  }

  return prisma.$transaction(async (tx) => {
    // 1. Check member daily booking limit (Rule BR3)
    if (memberId) {
      const existingCount = await tx.booking.count({
        where: {
          memberId,
          status: { not: BOOKING_STATUS.CANCELLED },
          startTime: { gte: startOfDay(startTime), lte: endOfDay(startTime) },
        },
      });

      if (existingCount >= MAX_PER_DAY) {
        throw new ApiError(422, `Member already has ${existingCount} bookings today. Daily limit is ${MAX_PER_DAY}.`);
      }
    }

    // 2. Check for overlapping bookings (Rule BR2)
    const overlapping = await tx.booking.findFirst({
      where: {
        courtId: data.courtId,
        status: { not: BOOKING_STATUS.CANCELLED },
        type: BOOKING_TYPE.NORMAL,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlapping) {
      throw new ApiError(409, 'This court is already booked for that time');
    }

    // 3. Calculate price based on plan or walk-in rate (Rule BR4 & BR8)
    const price = await calculateCourtPrice(tx, data.courtId, memberId);

    // 4. Create booking
    const booking = await tx.booking.create({
      data: {
        courtId: data.courtId,
        memberId: memberId ?? null,
        walkInName: data.walkIn?.name ?? null,
        walkInPhone: data.walkIn?.phone ?? null,
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

    // 5. Post to Transaction Ledger (Rule BR11)
    if (price > 0) {
      await tx.transaction.create({
        data: {
          transactionNo: `TXN-CRT-${Date.now().toString().slice(-6)}`,
          source: TRANSACTION_SOURCE.COURT,
          amount: price,
          tax: 0,
          paymentMode: data.paymentMode || PAYMENT_MODE.UPI,
          reference: booking.id,
          bookingId: booking.id,
          memberId: memberId ?? null,
          notes: `Booking for ${court.name} on ${startTime.toLocaleDateString()}`,
        },
      });
    }

    // Emit live socket event
    emitBookingUpdate(booking);

    return booking;
  });
};

export const cancelBooking = async (id, user, reason) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { court: true, member: true },
  });

  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, 'Booking is already cancelled');
  }

  // Members can only cancel their own bookings
  if (user.role === 'MEMBER' && booking.memberId !== user.memberId) {
    throw new ApiError(403, 'You can only cancel your own bookings');
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: BOOKING_STATUS.CANCELLED },
    include: { court: true, member: true },
  });

  emitBookingUpdate(updated);
  return updated;
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
