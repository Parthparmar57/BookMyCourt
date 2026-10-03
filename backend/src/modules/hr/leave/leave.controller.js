import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import { ApiError } from '../../../utils/ApiError.js';
import * as leaveService from './leave.service.js';

export const requestLeave = asyncHandler(async (req, res) => {
  if (!req.user?.employeeId) {
    throw new ApiError(403, 'Only staff with an employee record can request leave');
  }
  const result = await leaveService.requestLeave(req.user.employeeId, req.body);
  return success(res, result, 'Leave requested successfully', 201);
});

export const listLeaves = asyncHandler(async (req, res) => {
  const query = req.user.role === 'OWNER' ? req.query : { ...req.query, employeeId: req.user.employeeId };
  const leaves = await leaveService.listLeaveRequests(query);
  return success(res, leaves);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const updated = await leaveService.updateLeaveStatus(req.params.id, req.body.status, req.user.id);
  return success(res, updated, `Leave request ${req.body.status.toLowerCase()}`);
});
