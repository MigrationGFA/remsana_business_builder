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
  subscription_tier?: string;
  subscription_status?: string;
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  if (!hasBackend()) return null;
  try {
    const { data } = await api.get<UserProfile>('/users/me');
    return data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
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
  const { data } = await api.put<UserProfile>('/users/me', payload);
  return data;
}
