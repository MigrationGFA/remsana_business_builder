/**
 * Authentication Type Definitions
 * 
 * Centralized TypeScript types for authentication flow.
 * These types match the backend API contract and ensure type safety.
 */

/**
 * User object returned from API
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: 'free' | 'basic' | 'premium';
  phone_number?: string;
}

/**
 * Signup request payload
 * Matches the backend /auth/register endpoint
 */
export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
}

/**
 * Login request payload
 * For future use with /auth/login endpoint
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Authentication response from API
 * Returned by both /auth/register and /auth/login
 */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // Token expiration in seconds
  user: User;
}

/**
 * Authentication state for Context
 * Tracks current auth status and user data
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // Timestamp when token expires
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Stored auth data in localStorage
 * Used for persistence across sessions
 */
export interface StoredAuth {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

/**
 * Password validation result
 */
export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}
