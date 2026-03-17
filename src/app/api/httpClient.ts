import axios, { AxiosError } from 'axios';

// Base URL for the authoritative backend (PHP / CodeIgniter 4)
// IMPORTANT: 
// - Development: Use relative path "/api/v1" (Vite proxy handles routing)
// - Production: Must use full URL "https://backend-domain.com/api/v1" (no proxy)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Log configuration on startup (helps debug production issues)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL || 'Not set',
    mode: import.meta.env.MODE,
    isRelativePath: API_BASE_URL.startsWith('/'),
    note: API_BASE_URL.startsWith('/') 
      ? 'Using relative path (Vite proxy will handle routing)'
      : 'Using absolute URL (direct backend connection)'
  });
}

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('remsana_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (import.meta.env.DEV) {
    const baseURL = config.baseURL || '';
    const path = config.url || '';
    console.log('➡️ API request:', { method: config.method?.toUpperCase(), url: `${baseURL}${path}` });
  }
  return config;
});

// Handle token refresh on 401
// Uses a lock to prevent multiple simultaneous refresh attempts when
// several API calls return 401 at the same time (e.g. during dashboard load).
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let refreshFailSubscribers: Array<(err: unknown) => void> = [];

function onRefreshSuccess(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
  refreshFailSubscribers = [];
}

function onRefreshFail(err: unknown) {
  refreshFailSubscribers.forEach((cb) => cb(err));
  refreshSubscribers = [];
  refreshFailSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN_METHOD';
      const url = error.config?.baseURL
        ? `${error.config.baseURL}${error.config.url || ''}`
        : error.config?.url || 'UNKNOWN_URL';
      console.error('🚫 Network/CORS error:', {
        message: error.message,
        method,
        url,
      });
    }

    if (error.response?.status === 401) {
      const originalRequest = error.config;

      // Skip 401 handling for auth endpoints (login, register, refresh)
      const requestUrl = originalRequest?.url || '';
      if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue this request to retry after refresh completes
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((newToken: string) => {
            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api.request(originalRequest));
            } else {
              reject(error);
            }
          });
          refreshFailSubscribers.push(() => reject(error));
        });
      }

      // Try to refresh token
      const refreshToken = localStorage.getItem('remsana_refresh_token');
      if (refreshToken) {
        isRefreshing = true;
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('remsana_auth_token', access_token);
          if (refresh_token) {
            localStorage.setItem('remsana_refresh_token', refresh_token);
          }
          isRefreshing = false;
          onRefreshSuccess(access_token);

          // Retry original request
          if (originalRequest) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api.request(originalRequest);
          }
        } catch (refreshError: any) {
          isRefreshing = false;
          onRefreshFail(refreshError);

          const refreshStatus = refreshError?.response?.status;

          // Only clear auth if the refresh endpoint explicitly rejected us (401/403).
          // A 404 means the endpoint doesn't exist yet — the original token may still
          // be valid for other endpoints, so don't nuke the session.
          if (refreshStatus === 401 || refreshStatus === 403) {
            console.warn('🔒 Refresh token rejected (', refreshStatus, '). Clearing auth.');
            localStorage.removeItem('remsana_auth_token');
            localStorage.removeItem('remsana_refresh_token');
            localStorage.removeItem('remsana_auth_data');
            localStorage.removeItem('remsana_user');

            window.dispatchEvent(new Event('auth:expired'));
          } else {
            // 404, 500, network error, etc. — don't clear tokens, just log it.
            console.warn('⚠️ Token refresh failed (status:', refreshStatus ?? 'network error', '). Keeping auth, error may be transient.');
          }
        }
      } else {
        // No refresh token — but don't nuke the session immediately.
        // The original access token may still be valid for other endpoints.
        // Only /dashboard/me might be returning 401 because the route doesn't exist yet.
        console.warn('⚠️ No refresh token available. Original request returned 401 — endpoint may not exist.');
      }
    }
    return Promise.reject(error);
  }
);

export function hasBackend() {
  return Boolean(API_BASE_URL);
}

// Insider API client (separate base URL)
const INSIDER_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '/api/insider') || '';

export const insiderApi = axios.create({
  baseURL: INSIDER_API_BASE_URL || undefined,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add insider auth token to requests
insiderApi.interceptors.request.use((config) => {
  const auth = localStorage.getItem('remsana_insider_auth');
  if (auth) {
    try {
      const tokens = JSON.parse(auth);
      if (tokens.access_token) {
        config.headers.Authorization = `Bearer ${tokens.access_token}`;
      }
    } catch (e) {
      // Invalid stored auth
    }
  }
  return config;
});

// Handle 401 for insider API
insiderApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('remsana_insider_auth');
      if (window.location.pathname.startsWith('/insider')) {
        window.location.href = '/insider';
      }
    }
    return Promise.reject(error);
  }
);

