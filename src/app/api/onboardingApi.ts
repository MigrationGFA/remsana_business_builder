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

const shouldLogApi = import.meta.env.DEV || import.meta.env.VITE_LOG_API === 'true';

function toSnakeCaseFormData(formData: Partial<OnboardingFormData>): Record<string, unknown> {
  return {
    business_type: formData.businessType,
    business_name: formData.businessName,
    trading_name: formData.tradingName,
    business_phone: formData.businessPhone,
    business_email: formData.businessEmail,
    business_address: formData.businessAddress,
    state: formData.state,
    lga: formData.lga,
    industry: formData.industry,
    revenue: formData.revenue,
    employees: formData.employees,
    goals: formData.goals,
  };
}

function toCamelCaseFormData(formData: Record<string, unknown> | null | undefined): OnboardingFormData {
  return {
    businessType: (formData?.business_type as string) || '',
    businessName: (formData?.business_name as string) || '',
    tradingName: (formData?.trading_name as string) || '',
    businessPhone: (formData?.business_phone as string) || '',
    businessEmail: (formData?.business_email as string) || '',
    businessAddress: (formData?.business_address as string) || '',
    state: (formData?.state as string) || '',
    lga: (formData?.lga as string) || '',
    industry: (formData?.industry as string) || '',
    revenue: (formData?.revenue as string) || '',
    employees: (formData?.employees as string) || '',
    goals: (formData?.goals as string[]) || [],
  };
}

/**
 * Fetch current onboarding progress.
 * Returns default (step 1, empty form) if none exists.
 */
export async function getOnboardingProgress(): Promise<OnboardingProgress> {
  if (shouldLogApi) {
    console.log('➡️ GET /onboarding');
  }
  const { data } = await api.get<OnboardingProgress>('/onboarding');
  if (shouldLogApi) {
    console.log('⬅️ GET /onboarding response:', data);
  }
  return {
    ...data,
    form_data: toCamelCaseFormData(data.form_data as unknown as Record<string, unknown>),
  };
}

/**
 * Save onboarding progress (partial or full).
 * Use when user exits, skips, or moves between steps.
 */
export async function saveOnboardingProgress(params: {
  current_step?: number;
  form_data?: Partial<OnboardingFormData>;
}): Promise<OnboardingProgress> {
  const payload = {
    current_step: params.current_step,
    form_data: params.form_data ? toSnakeCaseFormData(params.form_data) : undefined,
  };
  if (shouldLogApi) {
    console.log('➡️ PUT /onboarding payload:', payload);
  }
  const { data } = await api.put<OnboardingProgress>('/onboarding', payload);
  if (shouldLogApi) {
    console.log('⬅️ PUT /onboarding response:', data);
  }
  return {
    ...data,
    form_data: toCamelCaseFormData(data.form_data as unknown as Record<string, unknown>),
  };
}

/**
 * Mark onboarding as complete.
 * Call when user submits the final step (review & confirm).
 */
export async function completeOnboarding(params: {
  form_data: OnboardingFormData;
}): Promise<OnboardingProgress> {
  const payload = {
    form_data: toSnakeCaseFormData(params.form_data),
  };
  if (shouldLogApi) {
    console.log('➡️ POST /onboarding/complete payload:', payload);
  }
  const { data } = await api.post<OnboardingProgress>('/onboarding/complete', payload);
  if (shouldLogApi) {
    console.log('⬅️ POST /onboarding/complete response:', data);
  }
  return {
    ...data,
    form_data: toCamelCaseFormData(data.form_data as unknown as Record<string, unknown>),
  };
}
