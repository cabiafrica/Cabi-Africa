import apiClient from '../apiClient';
import { Permission, Role, BlogPost } from './types';

export class SystemService {
    async getPermissions(): Promise<Permission[]> {
        const res = await apiClient.get('/admin/permissions');
        return res.data;
    }

    async createPermission(permission: Permission): Promise<Permission> {
        const res = await apiClient.post('/admin/permissions', permission);
        return res.data;
    }

    async updatePermission(permissionId: string, permission: Permission): Promise<Permission> {
        const res = await apiClient.put(`/admin/permissions/${permissionId}`, permission);
        return res.data;
    }

    async deletePermission(permissionId: string): Promise<void> {
        await apiClient.delete(`/admin/permissions/${permissionId}`);
    }

    async getRoles(): Promise<Role[]> {
        const res = await apiClient.get('/admin/roles');
        return res.data;
    }

    async createRole(roleData: Omit<Role, 'id'>): Promise<Role> {
        const res = await apiClient.post('/admin/roles', roleData);
        return res.data;
    }

    async updateRole(roleId: string, roleData: Omit<Role, 'id'>): Promise<Role> {
        const res = await apiClient.put(`/admin/roles/${roleId}`, roleData);
        return res.data;
    }

    async deleteRole(roleId: string): Promise<void> {
        await apiClient.delete(`/admin/roles/${roleId}`);
    }

    async globalSearch(query: string): Promise<any[]> {
        const res = await apiClient.get('/admin/search', { params: { query } });
        return res.data;
    }

    async getServices(): Promise<any[]> {
        const res = await apiClient.get('/v1/services');
        return res.data;
    }

    async createService(service: any): Promise<void> {
        await apiClient.post('/v1/services', service);
    }

    async getSupportTickets(): Promise<any[]> {
        const res = await apiClient.get('/v1/support/tickets');
        return res.data;
    }

    async getZones(type: 'SURGE' | 'AIRPORT'): Promise<any[]> {
        const res = await apiClient.get('/v1/zones', { params: { type } });
        return res.data;
    }

    async getVehicleCategories(): Promise<any[]> {
        const res = await apiClient.get('/v1/vehicles/categories');
        return res.data;
    }

    async getPromoCodes(): Promise<any[]> {
        const res = await apiClient.get('/v1/promos');
        return res.data;
    }

    async getScheduledRides(): Promise<any[]> {
        const res = await apiClient.get('/v1/rides/scheduled');
        return res.data;
    }

    async sendBulkMessage(segment: string, subject: string, body: string): Promise<void> {
        await apiClient.post('/v1/notifications/bulk', { segment, subject, body });
    }

    async getAdminPosts(): Promise<BlogPost[]> {
        const res = await apiClient.get('/v1/blog/posts');
        return res.data;
    }

    async createPost(postData: Omit<BlogPost, 'id' | 'publishedDate'>): Promise<BlogPost> {
        const res = await apiClient.post('/v1/blog/posts', postData);
        return res.data;
    }

    async updatePost(postId: string, postData: Omit<BlogPost, 'id' | 'publishedDate'>): Promise<BlogPost> {
        const res = await apiClient.put(`/v1/blog/posts/${postId}`, postData);
        return res.data;
    }

    async deletePost(postId: string): Promise<void> {
        await apiClient.delete(`/v1/blog/posts/${postId}`);
    }

    async getCMSContent(type: 'FAQ' | 'PAGE'): Promise<any[]> {
        const res = await apiClient.get('/v1/cms/content', { params: { type } });
        return res.data;
    }
}
