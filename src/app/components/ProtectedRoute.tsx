/**
 * Protected Route Component
 * 
 * Wraps pages that require authentication.
 * Redirects to login if user is not authenticated.
 * 
 * Listens for 'auth:expired' events dispatched by the Axios 401 interceptor
 * so that token expiry during a session redirects via React Router
 * (instead of a hard window.location.href reload).
 */

import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [authValid, setAuthValid] = useState(() => {
    const token = localStorage.getItem('remsana_auth_token');
    const user = localStorage.getItem('remsana_user');
    return Boolean(token && user);
  });

  // Check on mount
  useEffect(() => {
    const token = localStorage.getItem('remsana_auth_token');
    const user = localStorage.getItem('remsana_user');

    if (!token || !user) {
      console.warn('🔒 ProtectedRoute: User not authenticated. Redirecting to login...');
      const returnUrl = location.pathname + location.search;
      navigate('/login', { replace: true, state: { returnUrl } });
    }
  }, []); // only on mount — don't re-run on every location/navigate change

  // Listen for auth:expired events from the Axios 401 interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      console.warn('🔒 ProtectedRoute: Auth expired (401 interceptor). Redirecting to login...');
      setAuthValid(false);
      const returnUrl = location.pathname + location.search;
      navigate('/login', { replace: true, state: { returnUrl } });
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [navigate, location.pathname, location.search]);

  if (!authValid) {
    return null;
  }

  return <>{children}</>;
}
