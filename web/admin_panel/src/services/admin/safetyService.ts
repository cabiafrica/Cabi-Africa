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

    async adjudicateDispute(
        incidentId: string,
        payload: {
            action: string;
            adjudicatorComment: string;
            refundOrCreditAmount?: number;
            adminId?: string;
            adminName?: string;
            escalationRuling?: 'UPHOLD_ESCALATOR' | 'REJECT_ESCALATOR' | 'MUTUAL_SETTLEMENT';
        }
    ): Promise<any> {
        const res = await apiClient.post(`/admin/sos-incidents/${incidentId}/adjudicate`, payload);
        return res.data;
    }

    async requestDistressPardon(incidentId: string, driverUserId: string, reason: string): Promise<any> {
        const res = await apiClient.post(`/admin/sos-incidents/${incidentId}/pardon-request`, { driverUserId, reason });
        return res.data;
    }

    async pardonDistressFee(
        incidentId: string,
        payload: {
            officialId: string;
            officialName: string;
            approved: boolean;
            notes: string;
        }
    ): Promise<any> {
        const res = await apiClient.post(`/admin/sos-incidents/${incidentId}/pardon`, payload);
        return res.data;
    }

    async escalateDispute(
        incidentId: string,
        payload: {
            escalatedById: string;
            escalatorRole: 'DRIVER' | 'PASSENGER';
            escalatorName?: string;
            reason: string;
            paymentMethod?: 'WALLET' | 'MPESA' | 'AIRTEL';
            paymentReference?: string;
        }
    ): Promise<any> {
        const res = await apiClient.post(`/admin/sos-incidents/${incidentId}/escalate`, payload);
        return res.data;
    }
}

