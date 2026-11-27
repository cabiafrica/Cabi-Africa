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
        let documents: any[] = [];
        try {
            const res = await apiClient.get(`/v1/documents/admin/drivers/${driverId}/documents`);
            if (Array.isArray(res.data)) {
                documents = res.data.map((d: any) => ({
                    id: d.id,
                    type: d.type,
                    url: d.url,
                }));
            }
        } catch {
            documents = [];
        }

        let driverData: any = {};
        try {
            const driverRes = await apiClient.get(`/v1/driver-leads/${driverId}`);
            driverData = driverRes.data || {};
        } catch {
            driverData = {};
        }

        return {
            id: driverId,
            fullName: driverData.fullName || driverData.name || 'Applicant Driver',
            phone: driverData.phone || 'N/A',
            email: driverData.email || '',
            status: driverData.status || 'PROSPECT',
            ...driverData,
            vehicleDetails: driverData.vehicleDetails || {
                make: driverData.vehicleMake || 'Not Specified',
                model: driverData.vehicleModel || 'Pending Verification',
                year: driverData.vehicleYear || new Date().getFullYear(),
                licensePlate: driverData.licensePlate || 'PENDING'
            },
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

    async getDriverApplicationsPaginated(page = 1, limit = 10): Promise<{ data: any[], total: number }> {
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
        try {
            if (driverId) {
                const res = await apiClient.get(`/v1/drivers/${driverId}/performance`);
                return res.data;
            }
            // Fetch live dispatch metrics & driver records
            const [metricsRes, driversRes] = await Promise.all([
                apiClient.get('/dispatch/metrics').catch(() => ({ data: {} })),
                apiClient.get('/dispatch/drivers').catch(() => ({ data: [] }))
            ]);

            const metrics = metricsRes.data || {};
            const drivers = Array.isArray(driversRes.data) ? driversRes.data : [];

            const totalRides = metrics.completedToday ?? 0;
            const earnings = metrics.revenue ?? 0;
            const avgRating = drivers.length > 0
                ? Number((drivers.reduce((acc: number, d: any) => acc + (d.averageRating || 5.0), 0) / drivers.length).toFixed(2))
                : 0.0;
            const acceptanceRate = drivers.length > 0
                ? Number((drivers.reduce((acc: number, d: any) => acc + (d.acceptanceRate || 100), 0) / drivers.length).toFixed(1))
                : 0.0;

            return {
                totalRides,
                earnings,
                avgRating,
                acceptanceRate,
                weeklyGrowth: 0.0,
                earningsGrowth: 0.0,
                ratingGrowth: 0.0,
                acceptanceGrowth: 0.0
            };
        } catch (err) {
            console.warn('Unable to aggregate driver performance metrics:', err);
            return {
                totalRides: 0,
                earnings: 0,
                avgRating: 0.0,
                acceptanceRate: 0.0,
                weeklyGrowth: 0.0,
                earningsGrowth: 0.0,
                ratingGrowth: 0.0,
                acceptanceGrowth: 0.0
            };
        }
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

