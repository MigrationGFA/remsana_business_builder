import { api, hasBackend } from './httpClient';

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
  phone_number?: string;
}

export interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email: string; full_name?: string; subscription_tier: string };
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  console.log('[Auth] ➡️ POST /auth/register', { email: payload.email });
  const response = await api.post<RegisterResponse>('/auth/register', {
    email: payload.email.trim(),
    password: payload.password,
    full_name: payload.full_name?.trim() || undefined,
    phone_number: payload.phone_number?.trim() || undefined,
  });
  console.log('[Auth] ⬅️ POST /auth/register response:', response.data);
  return response.data;
}

export function canUseRegistrationApi(): boolean {
  return hasBackend();
}

export async function forgotPassword(email: string): Promise<void> {
  console.log('[Auth] ➡️ POST /auth/forgot-password', { email });
  try {
    await api.post('/auth/forgot-password', { email: email.trim() });
    console.log('[Auth] ⬅️ POST /auth/forgot-password success');
  } catch (error: any) {
    // Handle specific error cases
    if (error?.response?.status === 429) {
      throw new Error('Too many reset requests. Please wait a few minutes and try again.');
    } else if (error?.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (!error?.response) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    // For security, don't reveal if email exists - just throw generic error
    // Backend should handle this properly by always returning success
    throw error;
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  console.log('[Auth] ➡️ POST /auth/reset-password');
  try {
    await api.post('/auth/reset-password', { token, password });
    console.log('[Auth] ⬅️ POST /auth/reset-password success');
  } catch (error: any) {
    // Handle specific error cases
    if (error?.response?.status === 400) {
      // Token invalid or expired
      throw new Error('This reset link has expired or is invalid. Please request a new one.');
    } else if (error?.response?.status === 422) {
      // Password validation failed
      throw new Error('Password does not meet security requirements.');
    } else if (error?.response?.status === 429) {
      throw new Error('Too many reset attempts. Please wait a few minutes.');
    } else if (error?.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (!error?.response) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    } else if (error?.response?.data?.message) {
      // Use server's specific message
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export interface MfaSetupResponse { secret: string; qr_url: string; }
export async function mfaSetup(): Promise<MfaSetupResponse> {
  console.log('[Auth] ➡️ POST /auth/mfa/setup');
  const response = await api.post<MfaSetupResponse>('/auth/mfa/setup');
  console.log('[Auth] ⬅️ POST /auth/mfa/setup response:', response.data);
  return response.data;
}

export async function mfaVerifySetup(code: string): Promise<void> {
  console.log('[Auth] ➡️ POST /auth/mfa/verify-setup');
  await api.post('/auth/mfa/verify-setup', { code });
  console.log('[Auth] ⬅️ POST /auth/mfa/verify-setup success');
}

export interface MfaChallengeResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email: string; full_name?: string; subscription_tier: string };
}
export async function mfaChallenge(challengeToken: string, code: string): Promise<MfaChallengeResponse> {
  console.log('[Auth] ➡️ POST /auth/mfa/challenge');
  const response = await api.post<MfaChallengeResponse>('/auth/mfa/challenge', { challenge_token: challengeToken, code });
  console.log('[Auth] ⬅️ POST /auth/mfa/challenge response:', response.data);
  return response.data;
}

export async function mfaDisable(password: string): Promise<void> {
  console.log('[Auth] ➡️ POST /auth/mfa/disable');
  await api.post('/auth/mfa/disable', { password });
  console.log('[Auth] ⬅️ POST /auth/mfa/disable success');
}
