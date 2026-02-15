import { SimulationParams, SimulationResult } from './types';

export class AnalyticsService {
    async getBIStats(): Promise<any> {
        try {
            const res = await fetch('/api/v1/analytics/bi-stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            return await res.json();
        } catch (e) {
            console.error(e);
            return { grossBookings: 0, trips: 0, newUsers: 0, activeDrivers: 0, avgRating: 0 };
        }
    }

    async getHeatMapData(type: 'DEMAND' | 'SUPPLY', serviceId: string = 'ALL'): Promise<any[]> {
        try {
            const res = await fetch(`/api/v1/analytics/heatmap?type=${type}`);
            if (!res.ok) throw new Error('Heatmap fetch failed');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getLiveDrivers(): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return Array.from({ length: 15 }).map((_, i) => ({
            id: `d-${i}`,
            lat: -1.2921 + (Math.random() * 0.1 - 0.05),
            lng: 36.8219 + (Math.random() * 0.1 - 0.05),
            status: Math.random() > 0.5 ? 'AVAILABLE' : 'ON_TRIP',
            heading: Math.random() * 360
        }));
    }

    async getFraudAlerts(): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 600));
        return [
            { id: 'f-1', type: 'GPS_SPOOFING', user: 'Driver X', severity: 'HIGH', timestamp: new Date().toISOString() },
        ];
    }

    async getCityKPIs(cityId: string): Promise<any> {
        try {
            const res = await fetch(`/api/v1/analytics/city-kpis/${cityId}`);
            if (!res.ok) throw new Error('Failed to fetch city KPI');
            return await res.json();
        } catch (e) {
            console.error(e);
            return { activeDrivers: 0, totalTrips: 0, avgSurge: 1.0, complaints: 0 };
        }
    }

    async runSimulation(params: SimulationParams): Promise<SimulationResult> {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const revenueBase = 50000;
        const earningsBase = 40000;
        const ridesBase = 2500;
        const revenueChange = (params.fareIncreasePercentage * 0.8) - (params.incentiveBoostPercentage * 0.2);
        const earningsChange = (params.fareIncreasePercentage * 0.5) + (params.incentiveBoostPercentage * 0.5);
        const demandChange = -(params.fareIncreasePercentage * 1.2) + (params.surgeCapMultiplier > 2 ? 5 : -5);

        return {
            projectedRevenue: revenueBase * (1 + revenueChange / 100),
            revenueChange: Number(revenueChange.toFixed(1)),
            projectedDriverEarnings: earningsBase * (1 + earningsChange / 100),
            driverEarningsChange: Number(earningsChange.toFixed(1)),
            projectedRides: Math.round(ridesBase * (1 + demandChange / 100)),
            demandChange: Number(demandChange.toFixed(1))
        };
    }
}
