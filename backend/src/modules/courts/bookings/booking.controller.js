import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as bookingService from './booking.service.js';

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
  const result = await bookingService.listBookings(req.query);
  return success(res, result);
});
