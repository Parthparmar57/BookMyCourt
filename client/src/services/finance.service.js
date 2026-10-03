import apiClient from '../lib/apiClient';

/** Razorpay payments. */
export const paymentsApi = {
  createOrder: (payload) => apiClient.post('/payments/create-order', payload),
  verify: (payload) => apiClient.post('/payments/verify', payload),
};

/** Transaction ledger. */
export const ledgerApi = {
  list: (params = {}) => apiClient.get('/ledger', { params }),
  summary: () => apiClient.get('/ledger/summary'),
};

/** Invoices. */
export const invoicesApi = {
  list: (params = {}) => apiClient.get('/invoices', { params }),
  get: (id) => apiClient.get(`/invoices/${id}`),
  create: (payload) => apiClient.post('/invoices', payload),
  recordPayment: (id, payload) => apiClient.post(`/invoices/${id}/payment`, payload),
  // PDF download — returns a Blob, so it bypasses the JSON-unwrapping path.
  downloadPdf: (id) =>
    apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

/** Expenses / payables. */
export const expensesApi = {
  list: () => apiClient.get('/expenses'),
  create: (payload) => apiClient.post('/expenses', payload),
  markPaid: (id) => apiClient.patch(`/expenses/${id}/pay`),
};
