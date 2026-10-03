import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import { ApiError } from '../../../utils/ApiError.js';
import * as shiftService from './shift.service.js';

// A shift belongs to an Employee; a user with no employee record cannot open one.
const requireEmployeeId = (req) => {
  if (!req.user?.employeeId) {
    throw new ApiError(403, 'Only staff with an employee record can manage shifts');
  }
  return req.user.employeeId;
};

export const openShift = asyncHandler(async (req, res) => {
  const shift = await shiftService.openShift(requireEmployeeId(req), req.body);
  return success(res, shift, 'Shift opened successfully', 201);
});

export const closeShift = asyncHandler(async (req, res) => {
  const shift = await shiftService.closeShift(req.params.id, req.body);
  return success(res, shift, 'Shift closed successfully');
});

export const getActiveShift = asyncHandler(async (req, res) => {
  const shift = await shiftService.getActiveShift(requireEmployeeId(req));
  return success(res, shift);
});

export const getShiftReport = asyncHandler(async (req, res) => {
  const report = await shiftService.getShiftReport(req.params.id);
  return success(res, report);
});
