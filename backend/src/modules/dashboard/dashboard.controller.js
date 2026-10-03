import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/response.js';
import * as dashboardService from './dashboard.service.js';

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardSummary();
  return success(res, data);
});

export const getCourtUtilisation = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCourtUtilisation(req.query);
  return success(res, data);
});
