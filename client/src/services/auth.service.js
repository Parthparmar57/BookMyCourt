import apiClient from '../lib/apiClient';

/**
 * Auth API (Phase 2). All calls return the unwrapped `data` payload
 * (the apiClient response interceptor strips the { success, data } envelope).
 */
export const authService = {
  // { login (email or phone), password } -> { user, accessToken, refreshToken }
  login: (credentials) => apiClient.post('/auth/login', credentials),

  // { name, email, phone, password } -> { user, accessToken, refreshToken }
  // (role is always forced to MEMBER by the backend)
  register: (payload) => apiClient.post('/auth/register', payload),

  // reads the httpOnly refresh cookie, or a { refreshToken } body fallback -> { accessToken }
  refresh: (refreshToken) =>
    apiClient.post('/auth/refresh', refreshToken ? { refreshToken } : {}),

  logout: () => apiClient.post('/auth/logout'),

  // -> current user (includes member / employee relations)
  me: () => apiClient.get('/auth/me'),

  // { login (email or phone) } -> { message, emailMasked, resetToken, otpCode }
  forgotPassword: (payload) => apiClient.post('/auth/forgot-password', payload),

  // { token, otp, newPassword, email } -> { message }
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload),
};

export default authService;

