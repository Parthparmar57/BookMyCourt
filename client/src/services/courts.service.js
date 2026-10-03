import apiClient from '../lib/apiClient';

/** Courts. */
export const courtsApi = {
  list: () => apiClient.get('/courts'),
  get: (id) => apiClient.get(`/courts/${id}`),
  create: (payload) => apiClient.post('/courts', payload),
  update: (id, payload) => apiClient.patch(`/courts/${id}`, payload),
  remove: (id) => apiClient.delete(`/courts/${id}`),
};

/** Bookings + availability. */
export const bookingsApi = {
  // filters: { courtId, date, status, memberId, page, limit }
  list: (params = {}) => apiClient.get('/bookings', { params }),
  // { date (YYYY-MM-DD), courtId?, sport? }
  availability: (params = {}) => apiClient.get('/bookings/availability', { params }),
  create: (payload) => apiClient.post('/bookings', payload),
  cancel: (id, reason) => apiClient.patch(`/bookings/${id}/cancel`, reason ? { reason } : {}),
};

/** Friday social play sessions. */
export const socialPlayApi = {
  list: () => apiClient.get('/social-play'),
  create: (payload) => apiClient.post('/social-play', payload),
  join: (id, payload) => apiClient.post(`/social-play/${id}/join`, payload),
  leave: (id, participantId) => apiClient.delete(`/social-play/${id}/participants/${participantId}`),
};
