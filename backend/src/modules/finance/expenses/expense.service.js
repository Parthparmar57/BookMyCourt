import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { EXPENSE_STATUS } from '../../../shared/index.js';

export const createExpense = async (data) => {
  const expenseNo = `EXP-${Date.now().toString().slice(-6)}`;
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
  const where = { ...(status && { status }) };

  const [total, expenses, aggregation] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
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
    page,
    totalPages: Math.ceil(total / limit),
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
