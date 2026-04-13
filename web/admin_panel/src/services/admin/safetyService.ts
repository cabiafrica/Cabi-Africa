import apiClient from '../apiClient';
import {
    SOSIncidentDetails,
    SosPenaltyConfig
} from './types';

export class SafetyService {
    async getSosIncidentDetails(incidentId: string): Promise<SOSIncidentDetails> {
        const res = await apiClient.get(`/safety/incidents/${incidentId}`);
        return res.data;
    }

    async logSosIncidentAction(incidentId: string, notes: string): Promise<void> {
        await apiClient.post(`/safety/incidents/${incidentId}/log`, { notes });
    }

    async resolveSosIncident(incidentId: string, outcome: 'LEGITIMATE' | 'MISUSE'): Promise<void> {
        await apiClient.post(`/safety/incidents/${incidentId}/resolve`, { outcome });
    }

    async resolveSos(userId: string, isMisuse: boolean): Promise<void> {
        await apiClient.post('/safety/resolve-sos', { userId, isMisuse });
    }

    async getSosPenaltyConfig(): Promise<SosPenaltyConfig> {
        const res = await apiClient.get('/safety/sos-config');
        return res.data;
    }

    async updateSosPenaltyConfig(config: SosPenaltyConfig): Promise<void> {
        await apiClient.put('/safety/sos-config', config);
    }
}

