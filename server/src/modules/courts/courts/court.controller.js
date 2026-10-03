import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as courtService from './court.service.js';

export const listCourts = asyncHandler(async (req, res) => {
  const courts = await courtService.listCourts(req.query.sport);
  return success(res, courts);
});

export const getCourt = asyncHandler(async (req, res) => {
  const court = await courtService.getCourtById(req.params.id);
  return success(res, court);
});

export const createCourt = asyncHandler(async (req, res) => {
  const court = await courtService.createCourt(req.body);
  return success(res, court, 'Court created successfully', 201);
});

export const updateCourt = asyncHandler(async (req, res) => {
  const court = await courtService.updateCourt(req.params.id, req.body);
  return success(res, court, 'Court updated successfully');
});

export const deleteCourt = asyncHandler(async (req, res) => {
  await courtService.deleteCourt(req.params.id);
  return success(res, null, 'Court deleted successfully');
});
