/**
 * Authentication Context
 * 
 * Provides global authentication state management using React Context API.
 * 
 * Architecture benefits:
 * - Centralized auth state (no prop drilling)
 * - Automatic token refresh
 * - Persistent sessions via localStorage
 * - Type-safe API with TypeScript
 * 
 * Usage:
 * ```tsx
 * const { user, login, logout, signup, isAuthenticated } = useAuth();
 * ```
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AuthState, User, SignupRequest, LoginRequest, StoredAuth } from '../types/auth.types';
import * as authService from '../services/authService';

// LocalStorage keys
const STORAGE_KEYS = {
  AUTH: 'remsana_auth_data',
  USER: 'remsana_user', // Kept for backward compatibility
  TOKEN: 'remsana_auth_token', // Kept for backward compatibility
  REFRESH: 'remsana_refresh_token', // Kept for backward compatibility
} as const;

/**
 * Auth context actions interface
 */
interface AuthContextValue extends AuthState {
  signup: (data: SignupRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

// Create context with undefined default (will throw error if used outside provider)
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 * 
 * Wraps the app and provides authentication state to all children.
 * Handles token persistence, automatic refresh, and session restoration.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Store authentication data in localStorage
   * Uses a single key for cleaner storage management
   */
  const storeAuthData = useCallback((
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: User
  ) => {
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    const authData: StoredAuth = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      user,
    };
    
    // Store in new format
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData));
    
    // Store in old format for backward compatibility with existing code
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    // Update state
    setState({
      user,
      accessToken,
      refreshToken,
      expiresAt,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Clear authentication data from storage and state
   */
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Restore authentication from localStorage on app load
   */
  useEffect(() => {
    const restoreAuth = () => {
      try {
        // Try new storage format first
        const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
        
        if (storedAuth) {
          const authData: StoredAuth = JSON.parse(storedAuth);
          
          // Check if token is expired
          if (authData.expires_at && Date.now() < authData.expires_at) {
            setState({
              user: authData.user,
              accessToken: authData.access_token,
              refreshToken: authData.refresh_token,
              expiresAt: authData.expires_at,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        }
        
        // Fallback to old storage format
        const oldToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const oldUser = localStorage.getItem(STORAGE_KEYS.USER);
        const oldRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH);
        
        if (oldToken && oldUser) {
          const user = JSON.parse(oldUser);
          setState({
            user,
            accessToken: oldToken,
            refreshToken: oldRefresh,
            expiresAt: null, // Unknown for old format
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
        
        // No stored auth found
        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Failed to restore authentication:', error);
        clearAuthData();
      }
    };
    
    restoreAuth();
  }, [clearAuthData]);

  /**
   * Signup new user
   * 
   * Calls API, stores tokens, updates state, and redirects handled by caller
   */
  const signup = useCallback(async (data: SignupRequest): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.signup(data);
      storeAuthData(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.user
      );
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Signup failed',
      }));
      throw error; // Re-throw for component to handle
    }
  }, [storeAuthData]);

  /**
   * Login existing user
   */
  const login = useCallback(async (data: LoginRequest): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.login(data);
      storeAuthData(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.user
      );
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  }, [storeAuthData]);

  /**
   * Logout user
   * 
   * Calls API, clears tokens, updates state
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      clearAuthData();
    }
  }, [clearAuthData]);

  /**
   * Refresh authentication tokens
   * 
   * Called automatically when token expires or manually
   */
  const refreshAuth = useCallback(async (): Promise<void> => {
    if (!state.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await authService.refreshAccessToken(state.refreshToken);
      storeAuthData(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.user
      );
    } catch (error: any) {
      // Refresh failed - clear auth and force re-login
      clearAuthData();
      throw error;
    }
  }, [state.refreshToken, storeAuthData, clearAuthData]);

  /**
   * Update user data in state
   * Used after profile updates
   */
  const updateUser = useCallback((user: User) => {
    setState(prev => ({
      ...prev,
      user,
    }));
    
    // Update stored user data
    if (state.accessToken && state.refreshToken && state.expiresAt) {
      const authData: StoredAuth = {
        access_token: state.accessToken,
        refresh_token: state.refreshToken,
        expires_at: state.expiresAt,
        user,
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }, [state.accessToken, state.refreshToken, state.expiresAt]);

  /**
   * Auto-refresh token before it expires
   * Checks every minute if token needs refresh
   */
  useEffect(() => {
    if (!state.isAuthenticated || !state.expiresAt || !state.refreshToken) {
      return;
    }
    
    const checkTokenExpiry = () => {
      const now = Date.now();
      const timeUntilExpiry = state.expiresAt! - now;
      
      // Refresh token 5 minutes before expiry
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        refreshAuth().catch(error => {
          console.error('Auto token refresh failed:', error);
        });
      }
    };
    
    // Check immediately
    checkTokenExpiry();
    
    // Then check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.expiresAt, state.refreshToken, refreshAuth]);

  const value: AuthContextValue = {
    ...state,
    signup,
    login,
    logout,
    refreshAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * 
 * Custom hook to access auth context.
 * Throws error if used outside AuthProvider.
 * 
 * @returns Auth context value with state and actions
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Export types for external use
 */
export type { AuthContextValue, AuthProviderProps };
