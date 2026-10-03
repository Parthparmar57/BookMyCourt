import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk, toCollection } from '../lib/queryKeys';
import { paymentsApi, ledgerApi, invoicesApi, expensesApi } from '../services/finance.service';

/* ---------------- Payments ---------------- */
export const useCreatePaymentOrder = () => useMutation({ mutationFn: paymentsApi.createOrder });
export const useVerifyPayment = () => useMutation({ mutationFn: paymentsApi.verify });

/* ---------------- Ledger ---------------- */
export const useLedger = (filters = {}) =>
  useQuery({ queryKey: qk.ledger.list(filters), queryFn: () => ledgerApi.list(filters), select: (d) => toCollection(d, 'transactions') });

export const useLedgerSummary = () =>
  useQuery({ queryKey: qk.ledger.summary, queryFn: ledgerApi.summary });

/* ---------------- Invoices ---------------- */
export const useInvoices = (filters = {}) =>
  useQuery({ queryKey: qk.invoices.list(filters), queryFn: () => invoicesApi.list(filters), select: (d) => toCollection(d, 'invoices') });

export const useInvoice = (id) =>
  useQuery({ queryKey: qk.invoices.detail(id), queryFn: () => invoicesApi.get(id), enabled: !!id });

export const useCreateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: invoicesApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: qk.invoices.all }) });
};

export const useRecordInvoicePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => invoicesApi.recordPayment(id, payload),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: qk.invoices.all });
      qc.invalidateQueries({ queryKey: qk.invoices.detail(id) });
      qc.invalidateQueries({ queryKey: qk.ledger.all });
    },
  });
};

/* ---------------- Expenses ---------------- */
export const useExpenses = () =>
  useQuery({ queryKey: qk.expenses.list(), queryFn: expensesApi.list, select: (d) => toCollection(d, 'expenses').items });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: expensesApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: qk.expenses.all }) });
};

export const useMarkExpensePaid = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: expensesApi.markPaid, onSuccess: () => qc.invalidateQueries({ queryKey: qk.expenses.all }) });
};
