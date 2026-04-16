import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Alert } from '@mui/material';

interface ProtectedRouteProps {
  requiredRole?: string;
  requiredPermission?: string;
  children: JSX.Element;
}

export const ProtectedRoute = ({ requiredRole, requiredPermission, children }: ProtectedRouteProps) => {
  const { isAuthenticated, user, role } = useAuth(); // Assuming useAuth exposes 'user' now? it checked user in if(!isAuthenticated)

  if (!isAuthenticated) {
    // In a real app, you'd redirect to a login page.
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Alert severity="error">You do not have permission to access this page.</Alert>;
  }

  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    return <Alert severity="error">You do not have the required permission ({requiredPermission}) to access this page.</Alert>;
  }

  return children;
};