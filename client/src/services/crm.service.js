import apiClient from '../lib/apiClient';

/** Public website intake (no auth). */
export const publicApi = {
  plans: () => apiClient.get('/public/plans'),
  availability: (params = {}) => apiClient.get('/public/availability', { params }),
  shop: () => apiClient.get('/public/shop'),
  submitEnquiry: (payload) => apiClient.post('/public/enquiry', payload),
  bookTrial: (payload) => apiClient.post('/public/trial', payload),
};

/** Enquiries (staff). */
export const enquiriesApi = {
  list: () => apiClient.get('/enquiries'),
  updateStatus: (id, status) => apiClient.patch(`/enquiries/${id}/status`, { status }),
};

/** Sales leads pipeline (staff). */
export const leadsApi = {
  list: (params = {}) => apiClient.get('/leads', { params }),
  get: (id) => apiClient.get(`/leads/${id}`),
  create: (payload) => apiClient.post('/leads', payload),
  update: (id, payload) => apiClient.patch(`/leads/${id}`, payload),
  addFollowUp: (id, payload) => apiClient.post(`/leads/${id}/follow-ups`, payload),
  createQuotation: (id, payload) => apiClient.post(`/leads/${id}/quotations`, payload),
  sendQuote: (id, payload) => apiClient.post(`/leads/${id}/send-quote`, payload),
  updateQuotationStatus: (quotationId, status) =>
    apiClient.patch(`/leads/quotations/${quotationId}/status`, { status }),
  convert: (id, payload) => apiClient.post(`/leads/${id}/convert`, payload),
};

