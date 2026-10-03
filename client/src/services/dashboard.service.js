import apiClient from '../lib/apiClient';

/** Owner dashboard KPIs. */
export const dashboardApi = {
  summary: () => apiClient.get('/dashboard/summary'),
  utilisation: () => apiClient.get('/dashboard/utilisation'),
};

/** Reports + Excel export. */
export const reportsApi = {
  tax: (params = {}) => apiClient.get('/reports/tax', { params }),
  inventory: (params = {}) => apiClient.get('/reports/inventory', { params }),
  membership: (params = {}) => apiClient.get('/reports/membership', { params }),
  // Excel exports return a Blob.
  exportTax: (params = {}) => apiClient.get('/reports/tax/export', { params, responseType: 'blob' }),
  exportInventory: (params = {}) =>
    apiClient.get('/reports/inventory/export', { params, responseType: 'blob' }),
};
