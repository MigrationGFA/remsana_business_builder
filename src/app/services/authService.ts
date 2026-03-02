/**
 * Authentication Service Layer
 * 
 * Centralizes all authentication-related API calls.
 * Benefits:
 * - Separation of concerns (API logic separate from UI)
 * - Reusability across components
 * - Easier testing and maintenance
 * - Single source of truth for auth operations
 */

import { api } from '../api/httpClient';
import type { SignupRequest, LoginRequest, AuthResponse, User } from '../types/auth.types';

/**
 * Register a new user
 * 
 * @param payload - User registration data
 * @returns Promise with auth tokens and user data
 * @throws Error if registration fails
 */
export async function signup(payload: SignupRequest): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/register', {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      full_name: payload.full_name.trim(),
      phone_number: payload.phone_number.trim(),
    });
    
    return response.data;
  } catch (error: any) {
    // Transform API errors into user-friendly messages
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid registration data');
    } else if (error.response?.status === 409) {
      throw new Error('An account with this email already exists');
    } else if (error.response?.status === 422) {
      throw new Error('Please check your information and try again');
    } else if (!error.response) {
      throw new Error('Unable to connect to server. Please check your internet connection');
    }
    
    throw new Error(error.response?.data?.message || 'Registration failed. Please try again');
  }
}

/**
 * Login existing user
 * 
 * @param payload - User login credentials
 * @returns Promise with auth tokens and user data
 * @throws Error if login fails
 */
export async function login(payload: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/login', {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.response?.status === 429) {
      throw new Error('Too many login attempts. Please try again later');
    } else if (!error.response) {
      throw new Error('Unable to connect to server. Please check your internet connection');
    }
    
    throw new Error(error.response?.data?.message || 'Login failed. Please try again');
  }
}

/**
 * Logout current user
 * Clears server-side session if backend supports it
 */
export async function logout(): Promise<void> {
  try {
    // Attempt to logout on server (optional - continues even if it fails)
    await api.post('/auth/logout');
  } catch (error) {
    // Logout should succeed client-side even if server call fails
    console.warn('Server logout failed, continuing with client-side logout:', error);
  }
}

/**
 * Refresh access token using refresh token
 * 
 * @param refreshToken - Current refresh token
 * @returns Promise with new tokens
 * @throws Error if refresh fails
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error('Session expired. Please login again');
  }
}

/**
 * Get current user profile
 * 
 * @returns Promise with user data
 * @throws Error if request fails
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  } catch (error: any) {
    throw new Error('Failed to fetch user profile');
  }
}

/**
 * Update user profile
 * 
 * @param updates - Partial user data to update
 * @returns Promise with updated user data
 */
export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  try {
    const response = await api.patch<{ user: User }>('/auth/profile', updates);
    return response.data.user;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
}

/**
 * Validate password strength
 * Returns detailed validation result
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
} {
  let score = 0;
  
  // Check each requirement
  if (password.length >= 8) score++;
  if (password.length >= 12) score++; // Bonus for longer password
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (score >= 6) strength = 'strong';
  else if (score >= 5) strength = 'good';
  else if (score >= 3) strength = 'fair';
  
  // Password must meet minimum requirements:
  // - 8+ characters
  // - Uppercase letter
  // - Lowercase letter
  // - Number
  // - Special character
  const isValid = password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
  
  return { isValid, strength, score };
}
