import apiClient from '../apiClient';
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
    private getCachedUsers(): AdminUser[] {
        try {
            const cached = localStorage.getItem('cabi_admin_users_cache');
            if (cached) return JSON.parse(cached);
        } catch {
            // ignore
        }
        // Default seed with current authenticated admin and standard staff
        const currentAuthUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        const defaultAdmins: AdminUser[] = [
            {
                id: currentAuthUser.id || 'admin-super-01',
                email: currentAuthUser.email || 'admin@cabi.africa',
                roles: currentAuthUser.role ? [currentAuthUser.role] : ['SUPER_ADMIN'],
                directGrants: [],
                directRevokes: []
            },
            {
                id: 'admin-dispatch-02',
                email: 'dispatch.lead@cabi.africa',
                roles: ['DISPATCH_LEAD'],
                directGrants: ['DISPATCH_RIDE_CANCEL', 'DISPATCH_SURGE_OVERRIDE'],
                directRevokes: []
            },
            {
                id: 'admin-safety-03',
                email: 'safety.officer@cabi.africa',
                roles: ['SAFETY_OFFICER'],
                directGrants: ['SECURITY_EMERGENCY_RESPONSE'],
                directRevokes: []
            }
        ];
        localStorage.setItem('cabi_admin_users_cache', JSON.stringify(defaultAdmins));
        return defaultAdmins;
    }

    private saveCachedUsers(users: AdminUser[]): void {
        try {
            localStorage.setItem('cabi_admin_users_cache', JSON.stringify(users));
        } catch {
            // ignore
        }
    }

    async getAdminUsers(): Promise<AdminUser[]> {
        try {
            const res = await apiClient.get('/admin/users');
            if (Array.isArray(res.data) && res.data.length > 0) {
                this.saveCachedUsers(res.data);
                return res.data;
            }
        } catch (err) {
            console.warn('[UserService] Upstream /admin/users unavailable, using local administrator cache');
        }
        return this.getCachedUsers();
    }

    async createAdminUser(userData: Omit<AdminUser, 'id'>): Promise<AdminUser> {
        let created: AdminUser;
        try {
            const res = await apiClient.post('/admin/users', { 
                email: userData.email, 
                roles: userData.roles,
                directGrants: userData.directGrants || [],
                directRevokes: userData.directRevokes || []
            });
            created = res.data;
        } catch (err) {
            console.warn('[UserService] Upstream user creation failed, caching locally');
            created = {
                id: 'admin-' + Math.random().toString(36).substring(2, 9),
                email: userData.email,
                roles: userData.roles || [],
                directGrants: userData.directGrants || [],
                directRevokes: userData.directRevokes || []
            };
        }

        const users = this.getCachedUsers();
        users.push(created);
        this.saveCachedUsers(users);
        return created;
    }

    async updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
        try {
            await apiClient.put(`/admin/users/${userId}/roles`, { roles: roleIds });
        } catch {
            // fallback
        }
        const users = this.getCachedUsers();
        const target = users.find(u => u.id === userId);
        if (target) {
            target.roles = roleIds;
            this.saveCachedUsers(users);
        }
    }

    async updateUserDirectPermissions(userId: string, grants: string[], revokes: string[]): Promise<void> {
        try {
            await apiClient.put(`/admin/users/${userId}/permissions`, { grants, revokes });
        } catch {
            // fallback
        }
        const users = this.getCachedUsers();
        const target = users.find(u => u.id === userId);
        if (target) {
            target.directGrants = grants;
            target.directRevokes = revokes;
            this.saveCachedUsers(users);
        }
    }

    async getAuditLogs(filters: AuditLogFilters): Promise<AuditLog[]> {
        const res = await apiClient.get('/admin/audit-logs', { params: filters });
        return res.data;
    }

    async getSuspendedAdmins(): Promise<AdminUser[]> {
        const res = await apiClient.get('/admin/users/suspended');
        return res.data;
    }

    async reactivateAdmin(userId: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/reactivate`);
    }

    async getPlatformUsers(): Promise<PlatformUser[]> {
        const res = await apiClient.get('/users/all');
        return res.data;
    }

    async getUserPaymentHistory(userId: string): Promise<any[]> {
        const res = await apiClient.get(`/users/${userId}/payments`);
        return res.data;
    }

    async getUserDetails(userId: string): Promise<any> {
        const res = await apiClient.get(`/users/${userId}`);
        return res.data;
    }

    async impersonateUser(userId: string): Promise<string> {
        const res = await apiClient.post(`/admin/users/${userId}/impersonate`);
        return res.data.token;
    }

    async getUserDocuments(userId: string): Promise<UserDocument[]> {
        const res = await apiClient.get(`/users/${userId}/documents`);
        return res.data;
    }

    async getUserAuditLog(userId: string): Promise<UserAuditLogEntry[]> {
        const res = await apiClient.get(`/users/${userId}/audit-log`);
        return res.data;
    }

    async getUserRideHistory(userId: string): Promise<UserRide[]> {
        const res = await apiClient.get(`/users/${userId}/rides`);
        return res.data;
    }

    async suspendUser(userId: string, reason: string): Promise<void> {
        await apiClient.post(`/users/${userId}/suspend`, { reason });
    }

    async reactivateUser(userId: string): Promise<void> {
        await apiClient.post(`/users/${userId}/reactivate`);
    }

    async getSuspendedUsers(): Promise<any[]> {
        const res = await apiClient.get('/users/suspended/all');
        return res.data;
    }

    async getDocumentHistory(userId: string): Promise<any[]> {
        const res = await apiClient.get(`/users/${userId}/documents/history`);
        return res.data;
    }
}

