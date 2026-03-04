/**
 * Protected Route Component
 * 
 * Wraps pages that require authentication.
 * Redirects to login if user is not authenticated.
 * 
 * Usage:
 * ```tsx
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 * ```
 */

import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('remsana_auth_token');
    const user = localStorage.getItem('remsana_user');

    // Check if user is authenticated
    if (!token || !user) {
      console.warn('🔒 ProtectedRoute: User not authenticated. Redirecting to login...');
      
      // Save the attempted URL to redirect back after login
      const returnUrl = location.pathname + location.search;
      
      // Redirect to login with return URL
      navigate('/login', { 
        replace: true,
        state: { returnUrl } 
      });
    }
  }, [navigate, location]);

  // Check authentication before rendering
  const token = localStorage.getItem('remsana_auth_token');
  const user = localStorage.getItem('remsana_user');

  if (!token || !user) {
    // Don't render protected content while redirecting
    return null;
  }

  return <>{children}</>;
}
