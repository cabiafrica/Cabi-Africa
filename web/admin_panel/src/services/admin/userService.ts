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
        const cached = this.getCachedUsers();
        try {
            const res = await apiClient.get('/admin/users');
            if (Array.isArray(res.data) && res.data.length > 0) {
                const remoteUsers: AdminUser[] = res.data;
                const merged = [...remoteUsers];
                cached.forEach(localUser => {
                    if (!merged.some(m => m.id === localUser.id || m.email.toLowerCase() === localUser.email.toLowerCase())) {
                        merged.push(localUser);
                    }
                });
                this.saveCachedUsers(merged);
                return merged;
            }
        } catch (err) {
            console.warn('[UserService] Upstream /admin/users unavailable, using local administrator cache');
        }
        return cached;
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
        const existingIdx = users.findIndex(u => u.email.toLowerCase() === created.email.toLowerCase());
        if (existingIdx !== -1) {
            users[existingIdx] = { ...users[existingIdx], ...created };
        } else {
            users.unshift(created);
        }
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

    private getCachedPlatformUsers(): PlatformUser[] {
        try {
            const cached = localStorage.getItem('cabi_platform_users_cache');
            if (cached) return JSON.parse(cached);
        } catch {
            // ignore
        }
        const defaultUsers: PlatformUser[] = [
            {
                id: 'usr-ken-001',
                name: 'David Mwangi',
                email: 'david.mwangi@cabi.africa',
                type: 'DRIVER',
                isDistressResponder: false,
                registrationDate: '2025-01-15T08:30:00Z',
                status: 'ACTIVE'
            },
            {
                id: 'usr-ken-002',
                name: 'Faith Chebet',
                email: 'faith.chebet@gmail.com',
                type: 'PASSENGER',
                isDistressResponder: false,
                registrationDate: '2025-02-10T14:15:00Z',
                status: 'ACTIVE'
            },
            {
                id: 'usr-ken-003',
                name: 'Joseph Ochieng',
                email: 'j.ochieng@nairobibusiness.co.ke',
                type: 'PASSENGER',
                isDistressResponder: false,
                registrationDate: '2025-03-01T11:45:00Z',
                status: 'ACTIVE'
            },
            {
                id: 'usr-ken-004',
                name: 'Benson Kimani',
                email: 'benson.kimani@cabi.africa',
                type: 'DRIVER',
                isDistressResponder: true,
                registrationDate: '2024-11-20T09:00:00Z',
                status: 'ACTIVE'
            }
        ];
        localStorage.setItem('cabi_platform_users_cache', JSON.stringify(defaultUsers));
        return defaultUsers;
    }

    private saveCachedPlatformUsers(users: PlatformUser[]): void {
        try {
            localStorage.setItem('cabi_platform_users_cache', JSON.stringify(users));
        } catch {
            // ignore
        }
    }

    async getPlatformUsers(): Promise<PlatformUser[]> {
        const cached = this.getCachedPlatformUsers();
        try {
            const res = await apiClient.get('/users/all');
            if (Array.isArray(res.data) && res.data.length > 0) {
                const remote: PlatformUser[] = res.data;
                const merged = [...remote];
                cached.forEach(localUser => {
                    if (!merged.some(m => m.id === localUser.id || m.email.toLowerCase() === localUser.email.toLowerCase())) {
                        merged.push(localUser);
                    }
                });
                this.saveCachedPlatformUsers(merged);
                return merged;
            }
        } catch (err) {
            console.warn('[UserService] Upstream /users/all unavailable, using cached platform users');
        }
        return cached;
    }

    async createPlatformUser(userData: { name: string; email: string; type: 'DRIVER' | 'PASSENGER'; phone?: string }): Promise<PlatformUser> {
        let created: PlatformUser;
        try {
            const res = await apiClient.post('/users/create', userData);
            created = res.data;
        } catch {
            console.warn('[UserService] Upstream platform user creation failed, caching locally');
            created = {
                id: 'usr-' + Math.random().toString(36).substring(2, 9),
                name: userData.name,
                email: userData.email,
                type: userData.type,
                isDistressResponder: false,
                registrationDate: new Date().toISOString(),
                status: 'ACTIVE'
            };
        }
        const cached = this.getCachedPlatformUsers();
        cached.unshift(created);
        this.saveCachedPlatformUsers(cached);
        return created;
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

