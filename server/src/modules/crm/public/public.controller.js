import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as publicService from './public.service.js';

export const submitEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await publicService.submitEnquiry(req.body);
  return success(res, enquiry, 'Enquiry submitted successfully', 201);
});

export const bookTrial = asyncHandler(async (req, res) => {
  const trial = await publicService.bookTrial(req.body);
  return success(res, trial, 'Trial session booked successfully', 201);
});

export const getPlans = asyncHandler(async (req, res) => {
  const plans = await publicService.getPublicPlans();
  return success(res, plans);
});

export const getAvailability = asyncHandler(async (req, res) => {
  const availability = await publicService.getPublicAvailability(req.query);
  return success(res, availability);
});

export const getShop = asyncHandler(async (req, res) => {
  const products = await publicService.getPublicShop();
  return success(res, products);
});
