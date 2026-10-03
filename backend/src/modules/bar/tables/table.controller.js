import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as tableService from './table.service.js';

export const listTables = asyncHandler(async (req, res) => {
  const tables = await tableService.listTables();
  return success(res, tables);
});

export const createTable = asyncHandler(async (req, res) => {
  const table = await tableService.createTable(req.body);
  return success(res, table, 'Table created successfully', 201);
});

export const updateTable = asyncHandler(async (req, res) => {
  const table = await tableService.updateTable(req.params.id, req.body);
  return success(res, table, 'Table updated successfully');
});

export const deleteTable = asyncHandler(async (req, res) => {
  await tableService.deleteTable(req.params.id);
  return success(res, null, 'Table deleted successfully');
});
