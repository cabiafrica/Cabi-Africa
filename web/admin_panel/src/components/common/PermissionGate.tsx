import React from 'react';
import { useAuthContext } from '../../AuthContext';

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requireAll?: boolean; // Future extension
}

/**
 * A wrapper component that only renders its children if the user has the specified permission.
 * Otherwise, it renders the fallback (null by default).
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({ permission, children, fallback = null }) => {
    const { user } = useAuthContext();

    const hasPermission = () => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes('*') || user.permissions.includes(permission);
    };

    if (hasPermission()) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
