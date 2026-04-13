import apiClient from '../apiClient';
import { SimulationParams, SimulationResult } from './types';

export class AnalyticsService {
    async getBIStats(): Promise<any> {
        const res = await apiClient.get('/v1/analytics/bi-stats');
        return res.data;
    }

    async getHeatMapData(type: 'DEMAND' | 'SUPPLY', serviceId: string = 'ALL'): Promise<any[]> {
        const res = await apiClient.get('/v1/analytics/heatmap', { 
            params: { type, serviceId } 
        });
        return res.data;
    }

    async getLiveDrivers(): Promise<any[]> {
        const res = await apiClient.get('/v1/analytics/live-drivers');
        return res.data;
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

