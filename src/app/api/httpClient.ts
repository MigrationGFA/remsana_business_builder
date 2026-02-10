import axios, { AxiosError } from 'axios';

// Base URL for the authoritative backend (PHP / CodeIgniter 4)
// Configure via Vite env: VITE_API_BASE_URL="http://localhost:8080/api/v1"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('remsana_refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('remsana_auth_token', access_token);
          if (refresh_token) {
            localStorage.setItem('remsana_refresh_token', refresh_token);
          }
          // Retry original request
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${access_token}`;
            return api.request(error.config);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('remsana_auth_token');
          localStorage.removeItem('remsana_refresh_token');
          if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/insider')) {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('remsana_auth_token');
        if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/insider')) {
          window.location.href = '/login';
        }
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

