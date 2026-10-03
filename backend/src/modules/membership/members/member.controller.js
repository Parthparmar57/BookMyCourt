import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as memberService from './member.service.js';

export const registerMember = asyncHandler(async (req, res) => {
  const member = await memberService.registerMember(req.body, req.user?.id);
  return success(res, member, 'Member registered successfully', 201);
});

export const searchMembers = asyncHandler(async (req, res) => {
  const result = await memberService.searchMembers(req.query);
  return success(res, result);
});

export const getMemberProfile = asyncHandler(async (req, res) => {
  const profile = await memberService.getMemberProfile(req.params.id);
  return success(res, profile);
});

export const renewMembership = asyncHandler(async (req, res) => {
  const member = await memberService.renewMembership(req.params.id, req.body);
  return success(res, member, 'Membership renewed successfully');
});
