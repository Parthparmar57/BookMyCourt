import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as attendanceService from './attendance.service.js';

export const checkIn = asyncHandler(async (req, res) => {
  const empId = req.user.employeeId || req.body.employeeId;
  const result = await attendanceService.checkIn(empId, req.body);
  return success(res, result, 'Check-in recorded successfully');
});

export const checkOut = asyncHandler(async (req, res) => {
  const empId = req.user.employeeId || req.body.employeeId;
  const result = await attendanceService.checkOut(empId, req.body);
  return success(res, result, 'Check-out recorded successfully');
});

export const listAttendance = asyncHandler(async (req, res) => {
  const list = await attendanceService.listAttendance(req.query);
  return success(res, list);
});
