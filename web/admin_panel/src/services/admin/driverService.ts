import {
    DriverApplication,
    DriverApplicationDetails,
    Badge,
    ExpiringDocumentResult
} from './types';

export class DriverService {
    async getPendingApplications(): Promise<DriverApplication[]> {
        try {
            const res = await fetch('/api/v1/driver-leads/pending');
            if (res.ok) {
                const data = await res.json();
                return data.data;
            }
        } catch (e) {
            console.error(e);
        }
        return [
            { id: 'driver-123', fullName: 'John Doe', phone: '0712345678', applicationDate: '2024-05-21T10:00:00Z', status: 'PENDING' },
            { id: 'driver-456', fullName: 'Peter Jones', phone: '0787654321', applicationDate: '2024-05-20T14:00:00Z', status: 'PENDING' },
        ];
    }

    async getApplicationDetails(driverId: string): Promise<DriverApplicationDetails> {
        console.log(`Fetching details for application ${driverId}...`);
        let documents: any[] = [];
        try {
            const res = await fetch(`/api/v1/documents/admin/drivers/${driverId}/documents`);
            if (res.ok) {
                const data = await res.json();
                documents = data.map((d: any) => ({
                    id: d.id,
                    type: d.type,
                    url: d.url,
                }));
            }
        } catch (e) {
            console.error("Failed to fetch documents", e);
        }

        return {
            id: driverId,
            fullName: 'John Doe',
            phone: '0712345678',
            applicationDate: '2024-05-21T10:00:00Z',
            status: 'PENDING',
            vehicleDetails: { make: 'Toyota', model: 'Vitz', year: 2018, licensePlate: 'KDA 123B' },
            documents: documents.length > 0 ? documents : [
                { id: 'doc-1', type: 'DRIVERS_LICENSE', url: 'https://placehold.co/400?text=License' },
            ] as any,
        };
    }

    async approveApplication(driverId: string): Promise<void> {
        const res = await fetch(`/api/v1/driver-leads/${driverId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to approve application');
    }

    async requestCorrection(driverId: string, reasons: string[]): Promise<void> {
        const res = await fetch(`/api/v1/driver-leads/${driverId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reasons })
        });
        if (!res.ok) throw new Error('Failed to submit correction request');
    }

    async getBadges(): Promise<Badge[]> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return [
            {
                id: 'EARNING_BADGE',
                name: 'Earning Badge',
                description: 'Qualifies user for all commission earnings.',
                icon: 'star',
                rules: [
                    { metric: 'averageRating', operator: 'GTE', value: 4.5 },
                    { metric: 'completedTrips', operator: 'GTE', value: 10 },
                ],
            },
        ];
    }

    async createBadge(badgeData: Omit<Badge, 'id'>): Promise<Badge> {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { ...badgeData, id: `badge-${Math.random().toString(36).substr(2, 9)}` };
    }

    async updateBadge(badgeId: string, badgeData: Omit<Badge, 'id'>): Promise<Badge> {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { ...badgeData, id: badgeId };
    }

    async deleteBadge(badgeId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async bulkRejectDrivers(driverIds: string[], reason: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    async getDriverApplicationsPaginated(page: number = 1, limit: number = 10): Promise<{ data: any[], total: number }> {
        try {
            const res = await fetch(`/api/v1/driver-leads/pending?page=${page}&limit=${limit}`);
            if (res.ok) return await res.json();
        } catch (e) {
            console.error(e);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        const all = [
            { id: '1', name: 'John Doe', status: 'PENDING', date: '2023-10-01' },
            { id: '2', name: 'Jane Smith', status: 'PENDING', date: '2023-10-02' },
        ];
        const start = (page - 1) * limit;
        const end = start + limit;
        return { data: all.slice(start, end), total: all.length };
    }

    async simulateDriverRegistrations(count: number): Promise<void> {
        const res = await fetch('/api/v1/driver-leads/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count })
        });
        if (!res.ok) throw new Error('Failed to simulate registrations');
    }

    async updateDriverProfile(driverId: string, updates: { name?: string; phone?: string; email?: string }): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    async bulkApproveDocuments(driverIds: string[]): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    async bulkRejectDocuments(driverIds: string[], reason: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    async getDriverPerformanceReport(driverId?: string): Promise<any> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { totalRides: 145, avgRating: 4.8, acceptanceRate: 92, earnings: 45000 };
    }

    async getExpiringDocuments(): Promise<ExpiringDocumentResult[]> {
        await new Promise(resolve => setTimeout(resolve, 700));
        return [
            { driverId: 'u101', driverName: 'Driver X', docType: 'INSURANCE', expiryDate: '2024-12-20' },
            { driverId: 'u105', driverName: 'Driver Z', docType: 'LICENSE', expiryDate: '2024-12-25' },
        ];
    }
}
