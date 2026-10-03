import apiClient from '../lib/apiClient';

/** Bar/cafe menu. */
export const menuApi = {
  list: () => apiClient.get('/menu'),
  create: (payload) => apiClient.post('/menu', payload),
  update: (id, payload) => apiClient.patch(`/menu/${id}`, payload),
  remove: (id) => apiClient.delete(`/menu/${id}`),
};

/** Bar tables. */
export const barTablesApi = {
  list: () => apiClient.get('/bar-tables'),
  create: (payload) => apiClient.post('/bar-tables', payload),
  update: (id, payload) => apiClient.patch(`/bar-tables/${id}`, payload),
  remove: (id) => apiClient.delete(`/bar-tables/${id}`),
};

/** Bar orders. */
export const barOrdersApi = {
  list: () => apiClient.get('/bar-orders'),
  create: (payload) => apiClient.post('/bar-orders', payload),
  settle: (id, payload) => apiClient.post(`/bar-orders/${id}/settle`, payload),
};

/** Member tabs. */
export const tabsApi = {
  list: () => apiClient.get('/tabs'),
  get: (id) => apiClient.get(`/tabs/${id}`),
  open: (payload) => apiClient.post('/tabs', payload),
  settle: (id, payload) => apiClient.post(`/tabs/${id}/settle`, payload),
};

/** Kitchen display. */
export const kitchenApi = {
  queue: () => apiClient.get('/kitchen/queue'),
  updateStatus: (id, status) => apiClient.patch(`/kitchen/${id}/status`, { status }),
};

/** Cash shifts. */
export const shiftsApi = {
  open: (payload) => apiClient.post('/shifts/open', payload),
  close: (id, payload) => apiClient.post(`/shifts/${id}/close`, payload),
  active: () => apiClient.get('/shifts/active'),
  report: (id) => apiClient.get(`/shifts/${id}/report`),
};
