import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as payrollService from './payroll.service.js';

export const runPayroll = asyncHandler(async (req, res) => {
  const result = await payrollService.runPayroll(req.body);
  return success(res, result, 'Payroll run processed successfully');
});

export const listPayrolls = asyncHandler(async (req, res) => {
  const list = await payrollService.listPayrolls(req.query);
  return success(res, list);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const result = await payrollService.updatePayrollStatus(req.params.id, req.body);
  return success(res, result, 'Payroll status updated');
});
