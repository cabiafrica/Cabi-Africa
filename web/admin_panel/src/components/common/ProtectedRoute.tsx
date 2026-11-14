import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  requiredRole?: string;
}

/**
 * A wrapper component for routes that require specific permissions or roles.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  permission,
  requiredRole 
}) => {
  const { user, isAuthenticated } = useAuthContext();

  if (!isAuthenticated || !user || user.identityVerified !== true) {
    return <Navigate to="/login" replace />;
  }

  // Administrative override: Super Admins and Admins have all permissions
  const role = (user.role as string)?.toUpperCase();
  const isElevated = role === 'SUPER_ADMIN' || role === 'ADMIN';

  if (isElevated) {
    return <>{children}</>;
  }

  // Role check
  if (requiredRole && role !== requiredRole.toUpperCase()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Permission check
  if (permission) {
    const hasPermission = user.permissions?.includes('*') || user.permissions?.includes(permission);
    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
