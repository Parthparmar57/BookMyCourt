import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import { ApiError } from '../../../utils/ApiError.js';
import * as leaveService from './leave.service.js';

export const requestLeave = asyncHandler(async (req, res) => {
  const employeeId = req.user?.employeeId || (req.user?.role === 'OWNER' ? req.body.employeeId : null);
  if (!employeeId) {
    throw new ApiError(403, 'Only staff with an employee record can request leave');
  }
  const result = await leaveService.requestLeave(employeeId, req.body);
  return success(res, result, 'Leave requested successfully', 201);
});

export const listLeaves = asyncHandler(async (req, res) => {
  // OWNER sees everything; any other role is scoped to their own employee record.
  // A non-owner without an employee record must NEVER see other employees' leave
  // (an empty/undefined employeeId previously fell through to an unfiltered query).
  if (req.user.role === 'OWNER') {
    const leaves = await leaveService.listLeaveRequests(req.query);
    return success(res, leaves);
  }
  if (!req.user.employeeId) {
    return success(res, []);
  }
  const leaves = await leaveService.listLeaveRequests({ ...req.query, employeeId: req.user.employeeId });
  return success(res, leaves);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const updated = await leaveService.updateLeaveStatus(req.params.id, req.body.status, req.user.id);
  return success(res, updated, `Leave request ${req.body.status.toLowerCase()}`);
});
