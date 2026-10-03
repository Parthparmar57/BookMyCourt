import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as planService from './plan.service.js';

export const listPlans = asyncHandler(async (req, res) => {
  const plans = await planService.listPlans();
  return success(res, plans);
});

export const getPlan = asyncHandler(async (req, res) => {
  const plan = await planService.getPlanById(req.params.id);
  return success(res, plan);
});

export const createPlan = asyncHandler(async (req, res) => {
  const plan = await planService.createPlan(req.body);
  return success(res, plan, 'Plan created successfully', 201);
});

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await planService.updatePlan(req.params.id, req.body);
  return success(res, plan, 'Plan updated successfully');
});

export const deletePlan = asyncHandler(async (req, res) => {
  await planService.deletePlan(req.params.id);
  return success(res, null, 'Plan deleted successfully');
});
