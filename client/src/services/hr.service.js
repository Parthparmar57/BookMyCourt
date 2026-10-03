import apiClient from '../lib/apiClient';

/** Employees. */
export const employeesApi = {
  list: () => apiClient.get('/employees'),
  get: (id) => apiClient.get(`/employees/${id}`),
  create: (payload) => apiClient.post('/employees', payload),
  update: (id, payload) => apiClient.patch(`/employees/${id}`, payload),
};

/** Attendance. */
export const attendanceApi = {
  list: (params = {}) => apiClient.get('/attendance', { params }),
  checkIn: (payload = {}) => apiClient.post('/attendance/check-in', payload),
  checkOut: (payload = {}) => apiClient.post('/attendance/check-out', payload),
};

/** Leave. */
export const leaveApi = {
  list: () => apiClient.get('/leave'),
  request: (payload) => apiClient.post('/leave', payload),
  updateStatus: (id, status) => apiClient.patch(`/leave/${id}/status`, { status }),
};

/** Payroll. */
export const payrollApi = {
  list: () => apiClient.get('/payroll'),
  run: (payload) => apiClient.post('/payroll/run', payload),
  updateStatus: (id, payload) => apiClient.patch(`/payroll/${id}/status`, payload),
};
