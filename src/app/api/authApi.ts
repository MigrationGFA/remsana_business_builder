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
  const response = await api.post<RegisterResponse>('/auth/register', {
    email: payload.email.trim(),
    password: payload.password,
    full_name: payload.full_name?.trim() || undefined,
    phone_number: payload.phone_number?.trim() || undefined,
  });
  return response.data;
}

export function canUseRegistrationApi(): boolean {
  return hasBackend();
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email: email.trim() });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post('/auth/reset-password', { token, password });
}

export interface MfaSetupResponse { secret: string; qr_url: string; }
export async function mfaSetup(): Promise<MfaSetupResponse> {
  const response = await api.post<MfaSetupResponse>('/auth/mfa/setup');
  return response.data;
}

export async function mfaVerifySetup(code: string): Promise<void> {
  await api.post('/auth/mfa/verify-setup', { code });
}

export interface MfaChallengeResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email: string; full_name?: string; subscription_tier: string };
}
export async function mfaChallenge(challengeToken: string, code: string): Promise<MfaChallengeResponse> {
  const response = await api.post<MfaChallengeResponse>('/auth/mfa/challenge', { challenge_token: challengeToken, code });
  return response.data;
}

export async function mfaDisable(password: string): Promise<void> {
  await api.post('/auth/mfa/disable', { password });
}
