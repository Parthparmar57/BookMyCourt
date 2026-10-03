import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as barOrderService from './bar-order.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await barOrderService.createBarOrder(req.body, req.user);
  return success(res, order, 'Bar order placed and sent to kitchen', 201);
});

export const settleOrder = asyncHandler(async (req, res) => {
  const order = await barOrderService.settleBarOrder(req.params.id, req.body);
  return success(res, order, 'Bill settled successfully');
});

export const listOrders = asyncHandler(async (req, res) => {
  const result = await barOrderService.listBarOrders(req.query);
  return success(res, result);
});
