import apiClient from '../apiClient';
import { SimulationParams, SimulationResult } from './types';

export class AnalyticsService {
    async getBIStats(): Promise<any> {
        const res = await apiClient.get('/v1/analytics/bi-stats');
        return res.data;
    }

    async getHeatMapData(type: 'DEMAND' | 'SUPPLY', serviceId = 'ALL'): Promise<any[]> {
        const res = await apiClient.get('/v1/analytics/heatmap', { 
            params: { type, serviceId } 
        });
        return res.data;
    }

    async getLiveDrivers(): Promise<any[]> {
        try {
            const res = await apiClient.get('/dispatch/drivers');
            const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            return raw.map((d: any) => {
                const lat = d.currentLocation?.lat ?? d.lat ?? -1.286389;
                const lng = d.currentLocation?.lng ?? d.lng ?? 36.817223;
                let status = 'OFFLINE';
                if (d.isOnline) {
                    status = (d.status === 'ON_TRIP' || d.status === 'BUSY') ? 'ON_TRIP' : 'AVAILABLE';
                }
                return {
                    id: d.id,
                    name: d.user?.fullName || d.fullName || 'Driver',
                    lat: typeof lat === 'number' && !isNaN(lat) ? lat : -1.286389,
                    lng: typeof lng === 'number' && !isNaN(lng) ? lng : 36.817223,
                    status,
                    vehicle: d.vehicle,
                    rating: d.averageRating || d.rating || 5.0,
                };
            });
        } catch (err) {
            console.warn('Failed to fetch live drivers from dispatch service:', err);
            return [];
        }
    }

    async getFraudAlerts(): Promise<any[]> {
        const res = await apiClient.get('/v1/analytics/fraud-alerts');
        return res.data;
    }

    async getCityKPIs(cityId: string): Promise<any> {
        const res = await apiClient.get(`/v1/analytics/city-kpis/${cityId}`);
        return res.data;
    }

    async runSimulation(params: SimulationParams): Promise<SimulationResult> {
        const res = await apiClient.post('/v1/analytics/simulate', params);
        return res.data;
    }
}

