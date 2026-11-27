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

    private getSimulatedLiveDrivers(): any[] {
        return [
            {
                id: 'drv-nrb-001',
                name: 'James Mwangi',
                lat: -1.28333,
                lng: 36.81667, // Nairobi CBD
                status: 'AVAILABLE',
                vehicle: { model: 'Toyota Belta', plate: 'KDA 124X', color: 'White' },
                rating: 4.9,
                phone: '+254 712 345 678'
            },
            {
                id: 'drv-nrb-002',
                name: 'Peter Omondi',
                lat: -1.26472,
                lng: 36.80417, // Westlands
                status: 'AVAILABLE',
                vehicle: { model: 'Nissan Note', plate: 'KDB 892M', color: 'Silver' },
                rating: 4.8,
                phone: '+254 723 456 789'
            },
            {
                id: 'drv-nrb-003',
                name: 'Brian Kiprono',
                lat: -1.29889,
                lng: 36.78722, // Kilimani (Yaya Centre)
                status: 'ON_TRIP',
                vehicle: { model: 'Honda Fit', plate: 'KDC 451L', color: 'Black' },
                rating: 4.95,
                phone: '+254 734 567 890'
            },
            {
                id: 'drv-nrb-004',
                name: 'Mary Wanjiku',
                lat: -1.29944,
                lng: 36.81972, // Upper Hill
                status: 'AVAILABLE',
                vehicle: { model: 'Mazda Demio', plate: 'KDD 673T', color: 'Blue' },
                rating: 4.7,
                phone: '+254 745 678 901'
            },
            {
                id: 'drv-nrb-005',
                name: 'Denis Mutua',
                lat: -1.33278,
                lng: 36.92750, // JKIA International Airport
                status: 'ON_TRIP',
                vehicle: { model: 'Toyota Premio', plate: 'KDE 312Z', color: 'Grey' },
                rating: 4.9,
                phone: '+254 756 789 012'
            },
            {
                id: 'drv-nrb-006',
                name: 'Emmanuel Korir',
                lat: -1.23417,
                lng: 36.80278, // Gigiri / UN Compound
                status: 'AVAILABLE',
                vehicle: { model: 'Toyota Fielder', plate: 'KDF 901P', color: 'White' },
                rating: 4.85,
                phone: '+254 767 890 123'
            },
            {
                id: 'drv-nrb-007',
                name: 'Kevin Otieno',
                lat: -1.30306,
                lng: 36.75861, // Karen / Ngong Road
                status: 'OFFLINE',
                vehicle: { model: 'Nissan Wingroad', plate: 'KDG 234K', color: 'Dark Grey' },
                rating: 4.6,
                phone: '+254 778 901 234'
            },
            {
                id: 'drv-nrb-008',
                name: 'Hassan Noor',
                lat: -1.27861,
                lng: 36.84333, // Pangani / Thika Rd
                status: 'AVAILABLE',
                vehicle: { model: 'Toyota Axio', plate: 'KDH 567J', color: 'Silver' },
                rating: 4.9,
                phone: '+254 789 012 345'
            }
        ];
    }

    async getLiveDrivers(): Promise<any[]> {
        try {
            const res = await apiClient.get('/dispatch/drivers');
            const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            if (raw.length > 0) {
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
            }
        } catch (err) {
            console.warn('Failed to fetch live drivers from dispatch service, using fleet simulation:', err);
        }
        return this.getSimulatedLiveDrivers();
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

