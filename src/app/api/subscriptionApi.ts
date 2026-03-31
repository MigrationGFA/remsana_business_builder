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
    console.log('[Subscription] ➡️ GET /subscriptions/me');
    const { data } = await api.get<Subscription>('/subscriptions/me');
    console.log('[Subscription] ⬅️ GET /subscriptions/me response:', data);
    return data;
  } catch (error) {
    console.error('[Subscription] ❌ GET /subscriptions/me failed:', error);
    return null;
  }
}

/**
 * Upgrade subscription tier
 */
export async function upgradeSubscription(tier: string): Promise<Subscription> {
  console.log('[Subscription] ➡️ POST /subscriptions/upgrade', { tier });
  const { data } = await api.post<Subscription>('/subscriptions/upgrade', { tier });
  console.log('[Subscription] ⬅️ POST /subscriptions/upgrade response:', data);
  return data;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(reason: string): Promise<Subscription> {
  console.log('[Subscription] ➡️ POST /subscriptions/cancel', { reason });
  const { data } = await api.post<Subscription>('/subscriptions/cancel', { reason });
  console.log('[Subscription] ⬅️ POST /subscriptions/cancel response:', data);
  return data;
}
