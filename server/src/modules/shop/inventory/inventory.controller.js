import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as inventoryService from './inventory.service.js';

export const stockIn = asyncHandler(async (req, res) => {
  const result = await inventoryService.stockIn(req.body);
  return success(res, result, 'Stock added successfully');
});

export const getLogs = asyncHandler(async (req, res) => {
  const result = await inventoryService.getInventoryLogs(req.query);
  return success(res, result);
});

export const getLowStock = asyncHandler(async (req, res) => {
  const products = await inventoryService.getLowStockProducts();
  return success(res, products);
});
