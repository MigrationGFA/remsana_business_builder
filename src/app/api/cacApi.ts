/**
 * CAC Business Registration – Web API client
 *
 * Endpoints for Business Name Registration and Company Incorporation
 * via the Core API (VITE_API_BASE_URL). Requires Bearer token.
 */

import { api, hasBackend } from './httpClient';

export { hasBackend };

export interface CacRegistration {
  id: string;
  user_id: string;
  registration_type: 'business_name' | 'company_incorporation';
  status: string;
  current_step: number;
  business_name?: string;
  business_name_alt?: string;
  business_objects?: string[];
  proprietors?: CacProprietor[];
  registered_address?: string;
  commencement_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CacProprietor {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  occupation: string;
}

export interface ApprovedObject {
  id: string;
  name: string;
  category?: string;
}

/**
 * Get current user's CAC registration (most recent)
 */
export async function getCacRegistration(): Promise<CacRegistration | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[CAC] ➡️ GET /cac/business-name/me');
    const { data } = await api.get<CacRegistration>('/cac/business-name/me');
    console.log('[CAC] ⬅️ GET /cac/business-name/me response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch CAC registration:', error);
    return null;
  }
}

/**
 * Check business name availability
 */
export async function checkNameAvailability(name: string): Promise<{ available: boolean; message?: string }> {
  console.log('[CAC] ➡️ GET /cac/business-name/check-availability', { name });
  const { data } = await api.get('/cac/business-name/check-availability', {
    params: { name },
  });
  console.log('[CAC] ⬅️ GET /cac/business-name/check-availability response:', data);
  return data;
}

/**
 * Get list of approved business objects for dropdown selection
 */
export async function getApprovedObjects(): Promise<ApprovedObject[]> {
  if (!hasBackend()) return [];
  try {
    console.log('[CAC] ➡️ GET /cac/business-name/approved-objects');
    const { data } = await api.get<ApprovedObject[]>('/cac/business-name/approved-objects');
    console.log('[CAC] ⬅️ GET /cac/business-name/approved-objects response:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch approved objects:', error);
    return [];
  }
}

/**
 * Create a new CAC registration
 */
export async function createCacRegistration(registrationType: 'business_name' | 'company_incorporation'): Promise<CacRegistration> {
  console.log('[CAC] ➡️ POST /cac/business-name/create', { registrationType });
  const { data } = await api.post<CacRegistration>('/cac/business-name/create', {
    registrationType,
  });
  console.log('[CAC] ⬅️ POST /cac/business-name/create response:', data);
  return data;
}

/**
 * Get registration by ID
 */
export async function getCacRegistrationById(regId: string): Promise<CacRegistration | null> {
  if (!hasBackend()) return null;
  try {
    console.log('[CAC] ➡️ GET /cac/business-name/' + regId);
    const { data } = await api.get<CacRegistration>(`/cac/business-name/${encodeURIComponent(regId)}`);
    console.log('[CAC] ⬅️ GET /cac/business-name/' + regId + ' response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch CAC registration by ID:', error);
    return null;
  }
}

/**
 * Step 1: Business info (names + objects)
 */
export async function saveCacStep1(regId: string, payload: {
  businessName: string;
  businessNameAlt: string;
  businessObjects: string[];
}): Promise<CacRegistration> {
  console.log('[CAC] ➡️ POST /cac/business-name/' + regId + '/step1', payload);
  const { data } = await api.post<CacRegistration>(
    `/cac/business-name/${encodeURIComponent(regId)}/step1`,
    payload,
  );
  console.log('[CAC] ⬅️ POST /cac/business-name/' + regId + '/step1 response:', data);
  return data;
}

/**
 * Step 2: Proprietors info
 */
export async function saveCacStep2(regId: string, proprietors: CacProprietor[]): Promise<CacRegistration> {
  console.log('[CAC] ➡️ POST /cac/business-name/' + regId + '/step2', { proprietors });
  const { data } = await api.post<CacRegistration>(
    `/cac/business-name/${encodeURIComponent(regId)}/step2`,
    { proprietors },
  );
  console.log('[CAC] ⬅️ POST /cac/business-name/' + regId + '/step2 response:', data);
  return data;
}

/**
 * Step 3: Upload documents (multipart/form-data)
 */
export async function saveCacStep3(regId: string, files: {
  'national-id'?: File;
  'proof-of-address'?: File;
  'passport-photo'?: File;
}): Promise<CacRegistration> {
  console.log('[CAC] ➡️ POST /cac/business-name/' + regId + '/step3 (multipart)');
  const formData = new FormData();
  for (const [key, file] of Object.entries(files)) {
    if (file) formData.append(key, file);
  }
  const { data } = await api.post<CacRegistration>(
    `/cac/business-name/${encodeURIComponent(regId)}/step3`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  console.log('[CAC] ⬅️ POST /cac/business-name/' + regId + '/step3 response:', data);
  return data;
}

/**
 * Step 4: Address info
 */
export async function saveCacStep4(regId: string, payload: {
  registeredAddress: string;
  commencementDate: string;
}): Promise<CacRegistration> {
  console.log('[CAC] ➡️ POST /cac/business-name/' + regId + '/step4', payload);
  const { data } = await api.post<CacRegistration>(
    `/cac/business-name/${encodeURIComponent(regId)}/step4`,
    payload,
  );
  console.log('[CAC] ⬅️ POST /cac/business-name/' + regId + '/step4 response:', data);
  return data;
}

/**
 * Submit registration to CAC
 */
export async function submitCacRegistration(regId: string): Promise<CacRegistration> {
  console.log('[CAC] ➡️ POST /cac/business-name/' + regId + '/submit');
  const { data } = await api.post<CacRegistration>(
    `/cac/business-name/${encodeURIComponent(regId)}/submit`,
  );
  console.log('[CAC] ⬅️ POST /cac/business-name/' + regId + '/submit response:', data);
  return data;
}
