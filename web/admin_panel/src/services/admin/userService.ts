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
    async getAdminUsers(): Promise<AdminUser[]> {
        const res = await apiClient.get('/admin/users');
        return res.data;
    }

    async createAdminUser(userData: Omit<AdminUser, 'id'>): Promise<AdminUser> {
        const res = await apiClient.post('/admin/users', { 
            email: userData.email, 
            roles: userData.roles 
        });
        return res.data;
    }

    async updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
        await apiClient.put(`/admin/users/${userId}/roles`, { roles: roleIds });
    }

    async updateUserDirectPermissions(userId: string, grants: string[], revokes: string[]): Promise<void> {
        await apiClient.put(`/admin/users/${userId}/permissions`, { grants, revokes });
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

