/**
 * User Profile – Web API client
 *
 * Uses the main API client (VITE_API_BASE_URL). Requires Bearer token.
 */

import { api, hasBackend } from './httpClient';

export { hasBackend };

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at?: string;
  signup_date?: string;
  subscription_tier?: string;
  subscription_status?: string;
  mfa_enabled?: boolean;
  assessment_complete?: boolean;
  nps_score?: number | null;
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[Profile] ➡️ GET /users/me');
    const { data } = await api.get<UserProfile>('/users/me');
    console.log('[Profile] ⬅️ GET /users/me response:', data);
    return data;
  } catch (error) {
    console.error('[Profile] ❌ GET /users/me failed:', error);
    return null;
  }
}

/**
 * Update current user profile
 */
export async function updateUserProfile(payload: {
  full_name?: string;
  phone_number?: string;
}): Promise<UserProfile> {
  console.log('[Profile] ➡️ PUT /users/me', payload);
  const { data } = await api.put<UserProfile>('/users/me', payload);
  console.log('[Profile] ⬅️ PUT /users/me response:', data);
  return data;
}
