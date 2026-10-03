import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import { ApiError } from '../../../utils/ApiError.js';
import * as attendanceService from './attendance.service.js';

// Attendance is self-service — a user can only mark their own, derived from the
// token, never an employeeId supplied in the request body.
const requireEmployeeId = (req) => {
  if (!req.user?.employeeId) {
    throw new ApiError(403, 'Only staff with an employee record can record attendance');
  }
  return req.user.employeeId;
};

export const checkIn = asyncHandler(async (req, res) => {
  const result = await attendanceService.checkIn(requireEmployeeId(req), req.body);
  return success(res, result, 'Check-in recorded successfully');
});

export const checkOut = asyncHandler(async (req, res) => {
  const result = await attendanceService.checkOut(requireEmployeeId(req), req.body);
  return success(res, result, 'Check-out recorded successfully');
});

export const listAttendance = asyncHandler(async (req, res) => {
  const list = await attendanceService.listAttendance(req.query);
  return success(res, list);
});
