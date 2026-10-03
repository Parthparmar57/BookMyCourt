import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import { ApiError } from '../../../utils/ApiError.js';
import { ROLES } from '../../../shared/index.js';
import * as orderService from './shop-order.service.js';
import { getMemberByUserId } from '../../membership/members/member.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createShopOrder(req.body, req.user);
  return success(res, order, 'Order created successfully', 201);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  return success(res, order, 'Order status updated');
});

export const listOrders = asyncHandler(async (req, res) => {
  const query = { ...req.query };
  // A MEMBER may only list their own orders, not everyone's.
  if (req.user?.role === ROLES.MEMBER) {
    const me = await getMemberByUserId(req.user.id);
    if (!me) throw new ApiError(403, 'No member profile linked to this account');
    query.memberId = me.id;
  }
  const result = await orderService.listShopOrders(query);
  return success(res, result);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getShopOrderById(req.params.id);
  // Ownership gate: a MEMBER may only fetch their own order.
  if (req.user?.role === ROLES.MEMBER) {
    const me = await getMemberByUserId(req.user.id);
    if (!me || order?.memberId !== me.id) {
      throw new ApiError(403, 'You can only view your own orders');
    }
  }
  return success(res, order);
});
