import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as orderService from './shop-order.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createShopOrder(req.body, req.user);
  return success(res, order, 'Order created successfully', 201);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  return success(res, order, 'Order status updated');
});

export const listOrders = asyncHandler(async (req, res) => {
  const result = await orderService.listShopOrders(req.query);
  return success(res, result);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getShopOrderById(req.params.id);
  return success(res, order);
});
