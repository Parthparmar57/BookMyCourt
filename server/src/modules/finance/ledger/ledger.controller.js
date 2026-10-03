import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as ledgerService from './ledger.service.js';

export const listTransactions = asyncHandler(async (req, res) => {
  const result = await ledgerService.listTransactions(req.query);
  return success(res, result);
});

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await ledgerService.getLedgerSummary(req.query);
  return success(res, summary);
});
