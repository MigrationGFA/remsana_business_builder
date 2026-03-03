/**
 * ADDON: Onboarding – Web API client
 *
 * Copy to: remsana-web/src/app/api/onboardingApi.ts
 *
 * Uses the main API client (VITE_API_BASE_URL). Requires Bearer token.
 * 401 responses trigger redirect to /login via httpClient interceptor.
 */

import { api, hasBackend } from './httpClient';

/** Re-export for use in OnboardingPage; avoids importing from two modules */
export { hasBackend };

/** Form data shape matching the 5-step questionnaire */
export interface OnboardingFormData {
  businessType: string;
  businessName: string;
  tradingName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  state: string;
  lga: string;
  industry: string;
  revenue: string;
  employees: string;
  goals: string[];
}

/** API response shape */
export interface OnboardingProgress {
  current_step: number;
  form_data: OnboardingFormData;
  completed_at: string | null;
  is_complete: boolean;
}

/**
 * Fetch current onboarding progress.
 * Returns default (step 1, empty form) if none exists.
 */
export async function getOnboardingProgress(): Promise<OnboardingProgress> {
  const { data } = await api.get<OnboardingProgress>('/onboarding');
  return data;
}

/**
 * Save onboarding progress (partial or full).
 * Use when user exits, skips, or moves between steps.
 */
export async function saveOnboardingProgress(params: {
  current_step?: number;
  form_data?: Partial<OnboardingFormData>;
}): Promise<OnboardingProgress> {
  const { data } = await api.put<OnboardingProgress>('/onboarding', params);
  return data;
}

/**
 * Mark onboarding as complete.
 * Call when user submits the final step (review & confirm).
 */
export async function completeOnboarding(params: {
  form_data: OnboardingFormData;
}): Promise<OnboardingProgress> {
  const { data } = await api.post<OnboardingProgress>('/onboarding/complete', params);
  return data;
}
