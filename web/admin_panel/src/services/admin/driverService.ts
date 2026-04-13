import apiClient from '../apiClient';
import {
    DriverApplication,
    DriverApplicationDetails,
    Badge,
    ExpiringDocumentResult,
    DriverGroup
} from './types';

export class DriverService {
    async getPendingApplications(): Promise<DriverApplication[]> {
        const res = await apiClient.get('/v1/driver-leads/pending');
        return res.data.data;
    }

    async getApplicationDetails(driverId: string): Promise<DriverApplicationDetails> {
        const res = await apiClient.get(`/v1/documents/admin/drivers/${driverId}/documents`);
        // Note: The original code had a complex mapping here, but since we are removing mocks, 
        // we should expect the backend to return the correct structure or wrap it.
        // For now, I'll keep the expected return structure but fetch real data.
        
        // As we don't know the exact response of the backend for detail, we will try to adapt.
        // If the backend /documents/ path only returns docs, the basic info might come from driver-leads.
        
        const driverRes = await apiClient.get(`/v1/driver-leads/${driverId}`);
        const documents = res.data.map((d: any) => ({
            id: d.id,
            type: d.type,
            url: d.url,
        }));

        return {
            ...driverRes.data,
            documents
        };
    }

    async approveApplication(driverId: string): Promise<void> {
        await apiClient.post(`/v1/driver-leads/${driverId}/approve`);
    }

    async requestCorrection(driverId: string, reasons: string[]): Promise<void> {
        await apiClient.post(`/v1/driver-leads/${driverId}/reject`, { reasons });
    }

    async getBadges(): Promise<Badge[]> {
        const res = await apiClient.get('/v1/badges');
        return res.data;
    }

    async createBadge(badgeData: Omit<Badge, 'id'>): Promise<Badge> {
        const res = await apiClient.post('/v1/badges', badgeData);
        return res.data;
    }

    async updateBadge(badgeId: string, badgeData: Omit<Badge, 'id'>): Promise<Badge> {
        const res = await apiClient.put(`/v1/badges/${badgeId}`, badgeData);
        return res.data;
    }

    async deleteBadge(badgeId: string): Promise<void> {
        await apiClient.delete(`/v1/badges/${badgeId}`);
    }

    async bulkRejectDrivers(driverIds: string[], reason: string): Promise<void> {
        await apiClient.post('/v1/driver-leads/bulk-reject', { driverIds, reason });
    }

    async getDriverApplicationsPaginated(page: number = 1, limit: number = 10): Promise<{ data: any[], total: number }> {
        const res = await apiClient.get(`/v1/driver-leads/pending`, { params: { page, limit } });
        return res.data;
    }

    async simulateDriverRegistrations(count: number): Promise<void> {
        await apiClient.post('/v1/driver-leads/simulate', { count });
    }

    async updateDriverProfile(driverId: string, updates: { name?: string; phone?: string; email?: string }): Promise<void> {
        await apiClient.put(`/v1/drivers/${driverId}`, updates);
    }

    async bulkApproveDocuments(driverIds: string[]): Promise<void> {
        await apiClient.post('/v1/documents/bulk-approve', { driverIds });
    }

    async bulkRejectDocuments(driverIds: string[], reason: string): Promise<void> {
        await apiClient.post('/v1/documents/bulk-reject', { driverIds, reason });
    }

    async getDriverPerformanceReport(driverId?: string): Promise<any> {
        const url = driverId ? `/v1/drivers/${driverId}/performance` : '/v1/drivers/performance/aggregate';
        const res = await apiClient.get(url);
        return res.data;
    }

    async getExpiringDocuments(): Promise<ExpiringDocumentResult[]> {
        const res = await apiClient.get('/v1/documents/expiring');
        return res.data;
    }

    async getDriverGroups(): Promise<DriverGroup[]> {
        const res = await apiClient.get('/admin/driver-groups');
        return res.data.data;
    }

    async createDriverGroup(groupData: any): Promise<DriverGroup> {
        const res = await apiClient.post('/admin/driver-groups', groupData);
        return res.data.data;
    }

    async assignDriverToGroup(groupId: string, driverId: string): Promise<void> {
        await apiClient.post(`/admin/driver-groups/${groupId}/assign-driver`, { driverId });
    }
}

