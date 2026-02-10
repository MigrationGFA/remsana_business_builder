/** Insider auth – login, refresh, logout. Uses real API if backend is available, falls back to mock. */

import { insiderApi, hasBackend } from '../httpClient';
import type { InsiderRole, InsiderUser, InsiderAuthTokens } from './types';

const STORAGE_KEY = 'remsana_insider_auth';
const MOCK_ADMIN = { email: 'admin@remsana.com', password: 'admin123' };
const MOCK_ANALYST = { email: 'analyst@remsana.com', password: 'analyst123' };

export function getStoredInsiderAuth(): InsiderAuthTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as InsiderAuthTokens & { storedAt?: number };
    const expiresIn = (data.expires_in || 86400) * 1000;
    if (data.storedAt && Date.now() - data.storedAt > expiresIn) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setStoredInsiderAuth(tokens: InsiderAuthTokens): void {
  const payload = { ...tokens, storedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredInsiderAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getInsiderUser(): InsiderUser | null {
  const auth = getStoredInsiderAuth();
  return auth?.user ?? null;
}

export function getInsiderRole(): InsiderRole | null {
  return getInsiderUser()?.role ?? null;
}

export interface LoginParams {
  email: string;
  password: string;
  role: InsiderRole;
}

export async function insiderLogin(params: LoginParams): Promise<InsiderAuthTokens> {
  const { email, password, role } = params;

  // Try real API first
  if (hasBackend()) {
    try {
      const response = await insiderApi.post('/auth/login', {
        email,
        password,
        role,
      });
      const tokens: InsiderAuthTokens = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in || 86400,
        user: response.data.user,
      };
      setStoredInsiderAuth(tokens);
      return tokens;
    } catch (error: any) {
      // If API fails, fall back to mock (for development)
      console.warn('Backend login failed, using mock:', error.message);
    }
  }

  // Mock fallback
  const adminOk = role === 'ADMIN' && email === MOCK_ADMIN.email && password === MOCK_ADMIN.password;
  const analystOk = role === 'ANALYST' && email === MOCK_ANALYST.email && password === MOCK_ANALYST.password;
  if (!adminOk && !analystOk) {
    throw new Error('Invalid email or password');
  }
  const user: InsiderUser = {
    id: `admin-${role.toLowerCase()}-${Date.now()}`,
    email,
    role,
    permissions:
      role === 'ADMIN'
        ? ['user:manage', 'financial:override', 'support:triage', 'audit:view', 'content:manage', 'system:view']
        : ['analyst:view', 'analyst:export'],
  };
  const tokens: InsiderAuthTokens = {
    access_token: `insider_jwt_${role}_${Date.now()}`,
    refresh_token: `insider_refresh_${Date.now()}`,
    expires_in: 86400,
    user,
  };
  setStoredInsiderAuth(tokens);
  return tokens;
}

export async function insiderVerifyMfa(code: string): Promise<void> {
  if (!hasBackend()) {
    // Mock: any 6-digit code passes
    if (!/^\d{6}$/.test(code)) throw new Error('Invalid code');
    return;
  }

  try {
    await insiderApi.post('/auth/verify-mfa', { code });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Invalid MFA code');
  }
}

export async function insiderLogout(): Promise<void> {
  if (hasBackend()) {
    try {
      await insiderApi.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    }
  }
  clearStoredInsiderAuth();
}
