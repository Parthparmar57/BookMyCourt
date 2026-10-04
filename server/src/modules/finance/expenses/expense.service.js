import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { EXPENSE_STATUS } from '../../../shared/index.js';
import { genDocNo } from '../../../utils/ids.js';

export const createExpense = async (data) => {
  const expenseNo = genDocNo('EXP');
  return prisma.expense.create({
    data: {
      expenseNo,
      vendor: data.vendor,
      category: data.category,
      amount: Number(data.amount),
      tax: Number(data.tax || 0),
      dueDate: new Date(data.dueDate),
      paidDate: data.paidDate ? new Date(data.paidDate) : null,
      status: data.status || EXPENSE_STATUS.UNPAID,
      paymentMode: data.paymentMode || null,
      reference: data.reference || null,
      notes: data.notes || null,
    },
  });
};

export const listExpenses = async ({ status, page = 1, limit = 50 }) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 50);
  const where = { ...(status && { status }) };

  const [total, expenses, aggregation] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      skip: (p - 1) * l,
      take: l,
      orderBy: { dueDate: 'asc' },
    }),
    prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    }),
  ]);

  return {
    expenses,
    total,
    page: p,
    totalPages: Math.ceil(total / l),
    totalAmount: aggregation._sum.amount || 0,
  };
};

export const markExpensePaid = async (id, { paidDate = new Date(), paymentMode, reference }) => {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw new ApiError(404, 'Expense record not found');

  return prisma.expense.update({
    where: { id },
    data: {
      status: EXPENSE_STATUS.PAID,
      paidDate: new Date(paidDate),
      paymentMode,
      reference,
    },
  });
};
