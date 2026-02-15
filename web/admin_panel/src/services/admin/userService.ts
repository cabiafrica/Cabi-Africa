import {
    AdminUser,
    AuditLog,
    AuditLogFilters,
    PlatformUser,
    UserDocument,
    UserAuditLogEntry,
    UserRide
} from './types';

export class UserService {
    async getAdminUsers(): Promise<AdminUser[]> {
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Failed to fetch admin users');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async createAdminUser(userData: Omit<AdminUser, 'id'>): Promise<AdminUser> {
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userData.email, roles: userData.roles })
        });
        if (!res.ok) throw new Error('Failed to create admin user');
        return await res.json();
    }

    async updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
        const res = await fetch(`/api/admin/users/${userId}/roles`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roles: roleIds })
        });
        if (!res.ok) throw new Error('Failed to update roles');
    }

    async updateUserDirectPermissions(userId: string, grants: string[], revokes: string[]): Promise<void> {
        const res = await fetch(`/api/admin/users/${userId}/permissions`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grants, revokes })
        });
        if (!res.ok) throw new Error('Failed to update permissions');
    }

    async getAuditLogs(filters: AuditLogFilters): Promise<AuditLog[]> {
        await new Promise(resolve => setTimeout(resolve, 700));
        return [
            {
                id: 'log-1', adminUserId: 'user-1', adminUserEmail: 'super@cabi.com', action: 'AdminLogin',
                details: { method: 'password', ip: '192.168.1.1' }, ipAddress: '192.168.1.1',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            {
                id: 'log-2', adminUserId: 'system', adminUserEmail: 'system@cabi.internal', action: 'UserRegistered',
                details: { userId: 'u-101', type: 'DRIVER' }, ipAddress: '10.0.0.5',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
            },
            {
                id: 'log-3', adminUserId: 'user-2', adminUserEmail: 'content@cabi.com', action: 'UPDATE_REFERRAL_CONFIG',
                details: { change: 'sacco.rate from 0.05 to 0.06' }, ipAddress: '127.0.0.1',
                timestamp: '2024-05-22T10:00:00Z',
            },
            {
                id: 'log-4', adminUserId: 'admin-3', adminUserEmail: 'support@cabi.com', action: 'AccountSuspended',
                details: { userId: 'd-5', reason: 'Fraud detected' }, ipAddress: '192.168.1.20',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: 'log-5', adminUserId: 'system', adminUserEmail: 'system@cabi.internal', action: 'PaymentFailed',
                details: { rideId: 'ride-999', amount: 500, reason: 'Insufficient Funds' }, ipAddress: '10.0.0.5',
                timestamp: new Date(Date.now() - 90000000).toISOString(),
            },
            {
                id: 'log-6', adminUserId: 'system', adminUserEmail: 'system@cabi.internal', action: 'PayoutProcessed',
                details: { driverId: 'd-1', amount: 1500, status: 'SUCCESS' }, ipAddress: '10.0.0.5',
                timestamp: new Date(Date.now() - 100000000).toISOString(),
            },
        ];
    }

    async getSuspendedAdmins(): Promise<AdminUser[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            {
                id: 'user-3', email: 'suspended@cabi.com', roles: [], directGrants: [], directRevokes: [],
                suspensionReason: 'BIOMETRIC_FAILURE', suspensionDate: '2024-05-22T14:00:00Z',
            },
        ];
    }

    async reactivateAdmin(userId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    async getPlatformUsers(): Promise<PlatformUser[]> {
        await new Promise(resolve => setTimeout(resolve, 600));
        return [
            { id: 'u1', name: 'Alice Driver', email: 'alice@driver.com', type: 'DRIVER', registrationDate: '2024-01-15', status: 'ACTIVE' },
            { id: 'u2', name: 'Bob Rider', email: 'bob@rider.com', type: 'PASSENGER', registrationDate: '2024-02-20', status: 'ACTIVE' },
            { id: 'u3', name: 'Charlie Driver', email: 'charlie@driver.com', type: 'DRIVER', registrationDate: '2024-03-10', status: 'SUSPENDED' },
        ];
    }

    async getUserPaymentHistory(userId: string): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 600));
        return [
            { id: 'tx-1', date: '2024-05-01T10:00:00Z', type: 'Ride Payment', amount: -450, status: 'COMPLETED' },
            { id: 'tx-2', date: '2024-05-02T14:30:00Z', type: 'Wallet Top-up', amount: 1000, status: 'COMPLETED' },
            { id: 'tx-3', date: '2024-05-05T09:15:00Z', type: 'Ride Payment', amount: -300, status: 'COMPLETED' },
            { id: 'tx-4', date: '2024-05-10T11:20:00Z', type: 'Refund', amount: 300, status: 'PENDING' },
        ];
    }

    async getUserDetails(userId: string): Promise<any> {
        await new Promise(resolve => setTimeout(resolve, 400));
        if (userId.startsWith('d')) {
            return { id: userId, name: 'Jane Driver', email: 'jane@driver.com', type: 'DRIVER', phone: '+254700000000', status: 'ACTIVE', rating: 4.8, rides: 120, joined: '2023-01-15', balance: 4500 };
        }
        return { id: userId, name: 'John Doe', email: 'john@example.com', type: 'PASSENGER', phone: '+254711111111', status: 'ACTIVE', rating: 4.5, rides: 45, joined: '2023-02-20', balance: 0 };
    }

    async impersonateUser(userId: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return 'mock-impersonation-token-12345';
    }

    async getUserDocuments(userId: string): Promise<UserDocument[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 'doc-1', type: 'LICENSE', url: '#', status: 'APPROVED', expiryDate: '2025-01-01' },
            { id: 'doc-2', type: 'INSURANCE', url: '#', status: 'PENDING', expiryDate: '2024-12-20' },
        ];
    }

    async getUserAuditLog(userId: string): Promise<UserAuditLogEntry[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 'ual-1', timestamp: new Date().toISOString(), adminName: 'Admin Bob', action: 'SUSPEND_ACCOUNT', reason: ' suspicious activity' },
        ];
    }

    async getUserRideHistory(userId: string): Promise<UserRide[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 'ride-1', date: '2024-05-10T10:00:00Z', pickup: 'Nairobi CBD', dropoff: 'Westlands', amount: 450, status: 'COMPLETED' },
        ];
    }

    async suspendUser(userId: string, reason: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    async reactivateUser(userId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    async getSuspendedUsers(): Promise<any[]> {
        try {
            const res = await fetch('/api/users/suspended/all');
            if (res.ok) return await res.json();
        } catch (e) {
            console.error(e);
        }
        return [];
    }

    async getDocumentHistory(userId: string): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 600));
        return [
            { id: 'sub-3', type: 'LICENSE', status: 'APPROVED', date: '2024-05-10T10:00:00Z', notes: 'Clear image' },
            { id: 'sub-2', type: 'LICENSE', status: 'REJECTED', date: '2024-05-08T14:00:00Z', notes: 'Blurred text' },
            { id: 'sub-1', type: 'LICENSE', status: 'REJECTED', date: '2024-05-01T09:00:00Z', notes: 'Expired' },
        ];
    }
}
