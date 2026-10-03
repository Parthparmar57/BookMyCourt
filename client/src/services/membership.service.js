import apiClient from '../lib/apiClient';

/** Membership plans (catalogue). */
export const plansApi = {
  list: () => apiClient.get('/plans'),
  get: (id) => apiClient.get(`/plans/${id}`),
  create: (payload) => apiClient.post('/plans', payload),
  update: (id, payload) => apiClient.patch(`/plans/${id}`, payload),
  remove: (id) => apiClient.delete(`/plans/${id}`),
};

/** Members (lifecycle). */
export const membersApi = {
  // filters: { q, planId, status, page, limit }
  list: (params = {}) => apiClient.get('/members', { params }),
  get: (id) => apiClient.get(`/members/${id}`),
  create: (payload) => apiClient.post('/members', payload),
  renew: (id, payload) => apiClient.post(`/members/${id}/renew`, payload),
  // Front-desk QR scan lookup. `payload` is the raw string decoded from the
  // member's QR card (a JSON string like {"memberNo","email","plan"}); the
  // backend resolves and returns the full member profile.
  scan: (payload) => apiClient.post('/members/scan', { payload }),
};
