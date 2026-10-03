import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as expenseService from './expense.service.js';

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.body);
  return success(res, expense, 'Expense recorded successfully', 201);
});

export const listExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.listExpenses(req.query);
  return success(res, result);
});

export const markPaid = asyncHandler(async (req, res) => {
  const expense = await expenseService.markExpensePaid(req.params.id, req.body);
  return success(res, expense, 'Expense marked as paid');
});
