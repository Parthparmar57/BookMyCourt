import apiClient from '../lib/apiClient';

/** Owner dashboard KPIs. */
export const dashboardApi = {
  summary: (params = {}) => apiClient.get('/dashboard/summary', { params }),
  utilisation: (params = {}) => apiClient.get('/dashboard/utilisation', { params }),
};

/** Reports + Excel/PDF export. */
export const reportsApi = {
  // JSON report views
  tax: (params = {}) => apiClient.get('/reports/tax', { params }),
  inventory: (params = {}) => apiClient.get('/reports/inventory', { params }),
  membership: (params = {}) => apiClient.get('/reports/membership', { params }),
  revenue: (params = {}) => apiClient.get('/reports/revenue', { params }),
  // Excel exports return a Blob.
  exportTax: (params = {}) => apiClient.get('/reports/tax/export', { params, responseType: 'blob' }),
  exportInventory: (params = {}) =>
    apiClient.get('/reports/inventory/export', { params, responseType: 'blob' }),
  exportRevenue: (params = {}) =>
    apiClient.get('/reports/revenue/export', { params, responseType: 'blob' }),
  exportMembership: (params = {}) =>
    apiClient.get('/reports/membership/export', { params, responseType: 'blob' }),
  // PDF exports return a Blob.
  pdfRevenue: (params = {}) => apiClient.get('/reports/revenue/pdf', { params, responseType: 'blob' }),
  pdfInventory: (params = {}) =>
    apiClient.get('/reports/inventory/pdf', { params, responseType: 'blob' }),
  pdfMembership: (params = {}) =>
    apiClient.get('/reports/membership/pdf', { params, responseType: 'blob' }),
};
