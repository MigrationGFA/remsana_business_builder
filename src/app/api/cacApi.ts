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
    const { data } = await api.get<CacRegistration>('/cac/business-name/me');
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
  const { data } = await api.get('/cac/business-name/check-availability', {
    params: { name },
  });
  return data;
}

/**
 * Get list of approved business objects for dropdown selection
 */
export async function getApprovedObjects(): Promise<ApprovedObject[]> {
  if (!hasBackend()) return [];
  try {
    const { data } = await api.get<ApprovedObject[]>('/cac/business-name/approved-objects');
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
  const { data } = await api.post<CacRegistration>('/cac/business-name/create', {
    registrationType,
  });
  return data;
}

/**
 * Get registration by ID
 */
export async function getCacRegistrationById(regId: string): Promise<CacRegistration | null> {
  if (!hasBackend()) return null;
  try {
    const { data } = await api.get<CacRegistration>(`/cac/business-name/${encodeURIComponent(regId)}`);
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
  const { data } = await api.post<CacRegistration>(
    `/cac/business-name/${encodeURIComponent(regId)}/step1`,
    payload,
  );
  return data;
}

/**
 * Step 2: Proprietors info
 */
export async function saveCacStep2(regId: string, proprietors: CacProprietor[]): Promise<CacRegistration> {
  const { data } = await api.post<CacRegistration>(
    `/cac/business-name/${encodeURIComponent(regId)}/step2`,
    { proprietors },
  );
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
  const formData = new FormData();
  for (const [key, file] of Object.entries(files)) {
    if (file) formData.append(key, file);
  }
  const { data } = await api.post<CacRegistration>(
    `/cac/business-name/${encodeURIComponent(regId)}/step3`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/**
 * Step 4: Address info
 */
export async function saveCacStep4(regId: string, payload: {
  registeredAddress: string;
  commencementDate: string;
}): Promise<CacRegistration> {
  const { data } = await api.post<CacRegistration>(
    `/cac/business-name/${encodeURIComponent(regId)}/step4`,
    payload,
  );
  return data;
}

/**
 * Submit registration to CAC
 */
export async function submitCacRegistration(regId: string): Promise<CacRegistration> {
  const { data } = await api.post<CacRegistration>(
    `/cac/business-name/${encodeURIComponent(regId)}/submit`,
  );
  return data;
}
