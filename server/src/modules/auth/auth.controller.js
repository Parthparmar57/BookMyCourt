import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/response.js';
import * as authService from './auth.service.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
  return success(res, result, 'Login successful');
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.refreshAccessToken(token);
  return success(res, result, 'Token refreshed successfully');
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  return success(res, null, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  return success(res, user, 'Current user profile retrieved');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return success(res, result, result.message);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  return success(res, result, result.message);
});

