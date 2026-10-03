import apiClient from '../lib/apiClient';

/** Pro-shop products. */
export const productsApi = {
  list: (params = {}) => apiClient.get('/products', { params }),
  get: (id) => apiClient.get(`/products/${id}`),
  create: (payload) => apiClient.post('/products', payload),
  update: (id, payload) => apiClient.patch(`/products/${id}`, payload),
  remove: (id) => apiClient.delete(`/products/${id}`),
};

/** Inventory movements. */
export const inventoryApi = {
  stockIn: (payload) => apiClient.post('/inventory/stock-in', payload),
  logs: () => apiClient.get('/inventory/logs'),
  lowStock: () => apiClient.get('/inventory/low-stock'),
};

/** Retail orders. */
export const shopOrdersApi = {
  // filters: { status, channel, memberId, page, limit }
  list: (params = {}) => apiClient.get('/shop-orders', { params }),
  get: (id) => apiClient.get(`/shop-orders/${id}`),
  create: (payload) => apiClient.post('/shop-orders', payload),
  updateStatus: (id, status) => apiClient.patch(`/shop-orders/${id}/status`, { status }),
};
