import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as menuService from './menu.service.js';

export const listMenu = asyncHandler(async (req, res) => {
  const items = await menuService.listMenuItems({
    category: req.query.category,
    availableOnly: req.query.availableOnly === 'true',
  });
  return success(res, items);
});

export const createMenuItem = asyncHandler(async (req, res) => {
  const item = await menuService.createMenuItem(req.body);
  return success(res, item, 'Menu item created successfully', 201);
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await menuService.updateMenuItem(req.params.id, req.body);
  return success(res, item, 'Menu item updated successfully');
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  await menuService.deleteMenuItem(req.params.id);
  return success(res, null, 'Menu item deleted successfully');
});
