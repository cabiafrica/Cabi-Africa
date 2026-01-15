import React from 'react';
import { useAuth } from '../../AuthContext';

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * A wrapper component that only renders its children if the user has the specified permission.
 * Otherwise, it renders the fallback (null by default).
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({ permission, children, fallback = null }) => {
    const { hasPermission } = useAuth();

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
