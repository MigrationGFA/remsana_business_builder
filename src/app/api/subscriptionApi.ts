/**
 * Subscriptions – Web API client
 *
 * Uses the main API client (VITE_API_BASE_URL). Requires Bearer token.
 */

import { api, hasBackend } from './httpClient';

export { hasBackend };

export interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  started_at?: string;
  expires_at?: string;
  cancelled_at?: string;
}

/**
 * Get current user's subscription
 */
export async function getMySubscription(): Promise<Subscription | null> {
  if (!hasBackend()) return null;
  try {
    const { data } = await api.get<Subscription>('/subscriptions/me');
    return data;
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return null;
  }
}

/**
 * Upgrade subscription tier
 */
export async function upgradeSubscription(tier: string): Promise<Subscription> {
  const { data } = await api.post<Subscription>('/subscriptions/upgrade', { tier });
  return data;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(reason: string): Promise<Subscription> {
  const { data } = await api.post<Subscription>('/subscriptions/cancel', { reason });
  return data;
}
