import axios from 'axios';

/**
 * Single axios instance for the whole app.
 *
 * - baseURL from VITE_API_URL. In dev this is "/api" and Vite proxies it to the
 *   backend (see vite.config.js), so there is no CORS. In production set
 *   VITE_API_URL to the absolute API origin, e.g. "https://api.example.com/api".
 * - withCredentials sends/receives the httpOnly refresh cookie the backend sets
 *   on /api/auth, used by the refresh flow below.
 * - The response interceptor unwraps the backend's { success, message, data }
 *   envelope so callers receive `data` directly, performs a transparent
 *   401 -> refresh -> retry, and normalizes errors into a predictable shape.
 *
 * No feature/UI code should import `axios` directly — everything goes through
 * this client.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

// Attach the access token (if present) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize an axios error into { status, message, errors, retryable }.
const normalizeError = (error) => {
  const res = error.response;
  return {
    status: res?.status ?? 0,
    message: res?.data?.message || error.message || 'Network error',
    errors: res?.data?.errors || null,
    // 503 = DB/transaction timeout, 429 = rate limited — both safe to retry.
    retryable: res?.status === 503 || res?.status === 429,
  };
};

// Single in-flight refresh shared by all concurrent 401s (prevents refresh storms).
let refreshPromise = null;

const runRefresh = async () => {
  const stored = localStorage.getItem(REFRESH_KEY);
  // Use a bare axios call so this request does not recurse through this interceptor.
  const { data } = await axios.post(
    `${apiClient.defaults.baseURL}/auth/refresh`,
    stored ? { refreshToken: stored } : {},
    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
  );
  return data?.data?.accessToken;
};

apiClient.interceptors.response.use(
  // Success: unwrap the envelope.
  (response) => (response.data && 'data' in response.data ? response.data.data : response.data),
  // Error: try one transparent refresh on 401, else normalize and reject.
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url = original.url || '';
    const isAuthCall = url.includes('/auth/');

    if (status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise || runRefresh();
        const newToken = await refreshPromise;
        refreshPromise = null;
        if (!newToken) throw new Error('No access token from refresh');
        localStorage.setItem(TOKEN_KEY, newToken);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original); // retry (re-unwrapped by this interceptor)
      } catch {
        refreshPromise = null;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        // Let the app (AuthContext) reset state and redirect to /login.
        window.dispatchEvent(new Event('auth:logout'));
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

export default apiClient;
