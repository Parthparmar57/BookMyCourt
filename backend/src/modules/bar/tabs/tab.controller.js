import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as tabService from './tab.service.js';

export const openTab = asyncHandler(async (req, res) => {
  const tab = await tabService.openTab(req.body);
  return success(res, tab, 'Bar tab opened successfully', 201);
});

export const listTabs = asyncHandler(async (req, res) => {
  const tabs = await tabService.listOpenTabs();
  return success(res, tabs);
});

export const getTab = asyncHandler(async (req, res) => {
  const tab = await tabService.getTabById(req.params.id);
  return success(res, tab);
});

export const settleTab = asyncHandler(async (req, res) => {
  const tab = await tabService.settleTab(req.params.id, req.body);
  return success(res, tab, 'Bar tab settled successfully');
});
