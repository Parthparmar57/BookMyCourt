import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as kitchenService from './kitchen.service.js';

export const getQueue = asyncHandler(async (req, res) => {
  const queue = await kitchenService.getKitchenQueue();
  return success(res, queue);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const updated = await kitchenService.updateKitchenOrderStatus(req.params.id, req.body.status);
  return success(res, updated, 'Kitchen order status updated');
});
