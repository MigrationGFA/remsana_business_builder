import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredInsiderAuth } from '../../api/insider/auth';
import type { InsiderRole } from '../../api/insider/types';

interface ProtectedInsiderRouteProps {
  children: React.ReactNode;
  allowedRoles?: InsiderRole[];
}

/** Redirects to /insider if not authenticated; optionally restricts by role (e.g. only ADMIN for /insider/admin). */
export function ProtectedInsiderRoute({ children, allowedRoles }: ProtectedInsiderRouteProps) {
  const location = useLocation();
  const auth = getStoredInsiderAuth();

  if (!auth?.user) {
    return <Navigate to="/insider" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(auth.user.role)) {
    const fallback = auth.user.role === 'ADMIN' ? '/insider/admin' : '/insider/analyst';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
