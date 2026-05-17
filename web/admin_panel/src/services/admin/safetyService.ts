import apiClient from '../apiClient';
import {
    OccurrenceSummary,
    SOSIncidentDetails,
    SosPenaltyConfig
} from './types';

export class SafetyService {
    async getIncidents(): Promise<OccurrenceSummary[]> {
        const res = await apiClient.get('/admin/sos-incidents');
        return res.data.data; // The controller wraps it in { data: ... }
    }
    async getSosIncidentDetails(incidentId: string): Promise<SOSIncidentDetails> {
        const res = await apiClient.get(`/admin/sos-incidents/${incidentId}`);
        return res.data.data;
    }

    async logSosIncidentAction(incidentId: string, notes: string): Promise<void> {
        // Since the current SOSController doesn't have a dedicated log endpoint, 
        // we might use a generic resolution note or a separate audit log if needed.
        // For now, let's keep it as is if there's no backend match, or map to a generic endpoint.
        await apiClient.post(`/admin/sos-incidents/${incidentId}/log`, { notes });
    }

    async resolveSosIncident(incidentId: string, outcome: string): Promise<void> {
        // outcome might be 'note' in the current controller
        await apiClient.post(`/admin/sos-incidents/${incidentId}/resolve`, { note: outcome });
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

    async reviewStatement(
        objectionId: string,
        adminId: string,
        status: 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED',
        reviewNotes: string,
    ): Promise<void> {
        await apiClient.post(`/admin/sos-incidents/statement/${objectionId}/review`, {
            adminId,
            status,
            reviewNotes,
        });
    }

    async adjudicateStatement(incidentId: string, statementId: string, status: 'Verified' | 'Dismissed' | 'UnderReview', notes?: string): Promise<void> {
        await apiClient.post(`/admin/sos-incidents/${incidentId}/adjudicate-statement`, { statementId, status, notes });
    }
}

