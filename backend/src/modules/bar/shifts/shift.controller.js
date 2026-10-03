import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as shiftService from './shift.service.js';

export const openShift = asyncHandler(async (req, res) => {
  const shift = await shiftService.openShift(req.user.employeeId || req.user.id, req.body);
  return success(res, shift, 'Shift opened successfully', 201);
});

export const closeShift = asyncHandler(async (req, res) => {
  const shift = await shiftService.closeShift(req.params.id, req.body);
  return success(res, shift, 'Shift closed successfully');
});

export const getActiveShift = asyncHandler(async (req, res) => {
  const shift = await shiftService.getActiveShift(req.user.employeeId || req.user.id);
  return success(res, shift);
});

export const getShiftReport = asyncHandler(async (req, res) => {
  const report = await shiftService.getShiftReport(req.params.id);
  return success(res, report);
});
