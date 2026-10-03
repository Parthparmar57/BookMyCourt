import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as socialPlayService from './social-play.service.js';

export const listSessions = asyncHandler(async (req, res) => {
  const sessions = await socialPlayService.listSocialSessions();
  return success(res, sessions);
});

export const createSession = asyncHandler(async (req, res) => {
  const session = await socialPlayService.createSocialSession(req.body, req.user);
  return success(res, session, 'Social play session created', 201);
});

export const joinSession = asyncHandler(async (req, res) => {
  const participant = await socialPlayService.joinSocialPlay(req.params.id, req.body, req.user);
  return success(res, participant, 'Joined social play successfully');
});

export const leaveSession = asyncHandler(async (req, res) => {
  await socialPlayService.leaveSocialPlay(req.params.id, req.params.participantId, req.user);
  return success(res, null, 'Left social play successfully');
});
