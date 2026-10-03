import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import { ApiError } from '../../../utils/ApiError.js';
import { ROLES } from '../../../shared/index.js';
import * as bookingService from './booking.service.js';
import { getMemberByUserId } from '../../membership/members/member.service.js';

export const getAvailability = asyncHandler(async (req, res) => {
  const slots = await bookingService.getAvailability(req.query);
  return success(res, slots);
});

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body, req.user);
  return success(res, booking, 'Booking confirmed successfully', 201);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user, req.body.reason);
  return success(res, booking, 'Booking cancelled successfully');
});

export const listBookings = asyncHandler(async (req, res) => {
  const query = { ...req.query };
  // A MEMBER may only ever list their own bookings — never the whole ledger
  // (which would expose other members' details and walk-in PII).
  if (req.user?.role === ROLES.MEMBER) {
    const me = await getMemberByUserId(req.user.id);
    if (!me) throw new ApiError(403, 'No member profile linked to this account');
    query.memberId = me.id;
  }
  const result = await bookingService.listBookings(query);
  return success(res, result);
});
