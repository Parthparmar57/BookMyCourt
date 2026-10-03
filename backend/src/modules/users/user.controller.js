import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/response.js';
import * as userService from './user.service.js';

export const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  return success(res, result);
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return success(res, user);
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return success(res, user, 'User created successfully', 201);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  return success(res, user, 'User updated successfully');
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user);
  return success(res, null, 'User deleted successfully');
});
