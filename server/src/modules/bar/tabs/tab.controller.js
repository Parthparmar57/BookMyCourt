import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import { ApiError } from '../../../utils/ApiError.js';
import { ROLES } from '../../../shared/index.js';
import * as tabService from './tab.service.js';
import { getMemberByUserId } from '../../membership/members/member.service.js';

export const openTab = asyncHandler(async (req, res) => {
  const tab = await tabService.openTab(req.body);
  return success(res, tab, 'Bar tab opened successfully', 201);
});

export const listTabs = asyncHandler(async (req, res) => {
  const filter = {};
  // A MEMBER may only see their own open tab, not every member's.
  if (req.user?.role === ROLES.MEMBER) {
    const me = await getMemberByUserId(req.user.id);
    if (!me) throw new ApiError(403, 'No member profile linked to this account');
    filter.memberId = me.id;
  }
  const tabs = await tabService.listOpenTabs(filter);
  return success(res, tabs);
});

export const getTab = asyncHandler(async (req, res) => {
  const tab = await tabService.getTabById(req.params.id);
  // Ownership gate: a MEMBER may only view their own tab.
  if (req.user?.role === ROLES.MEMBER) {
    const me = await getMemberByUserId(req.user.id);
    if (!me || tab?.memberId !== me.id) {
      throw new ApiError(403, 'You can only view your own tab');
    }
  }
  return success(res, tab);
});

export const settleTab = asyncHandler(async (req, res) => {
  const tab = await tabService.settleTab(req.params.id, req.body);
  return success(res, tab, 'Bar tab settled successfully');
});
