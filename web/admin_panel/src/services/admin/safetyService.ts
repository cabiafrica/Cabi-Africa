import {
    SOSIncidentDetails,
    SosPenaltyConfig
} from './types';

export class SafetyService {
    async getSosIncidentDetails(incidentId: string): Promise<SOSIncidentDetails> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            id: incidentId,
            driver: { id: 'driver-1', name: 'John Doe', phone: '0712345678' },
            passenger: { id: 'pass-1', name: 'Jane Smith', phone: '0787654321' },
            upline1: { id: 'upline-1', name: 'Upline One', phone: '0722000001' },
            upline2: { id: 'upline-2', name: 'Upline Two', phone: '0722000002' },
            liveLocation: { lat: -1.28, lon: 36.81 },
            logs: [
                { timestamp: '2024-05-22T12:00:00Z', notes: 'Initial alert received.' },
                { timestamp: '2024-05-22T12:01:15Z', notes: 'Admin user super@cabi.com viewed the incident.' },
            ],
        };
    }

    async logSosIncidentAction(incidentId: string, notes: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    async resolveSosIncident(incidentId: string, outcome: 'LEGITIMATE' | 'MISUSE'): Promise<void> {
        try {
            const details = await this.getSosIncidentDetails(incidentId);
            await this.resolveSos(details.driver.id, outcome === 'MISUSE');
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async resolveSos(userId: string, isMisuse: boolean): Promise<void> {
        const res = await fetch('/api/safety/resolve-sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isMisuse }),
        });
        if (!res.ok) throw new Error('Failed to resolve SOS');
    }

    async getSosPenaltyConfig(): Promise<SosPenaltyConfig> {
        try {
            const res = await fetch('/api/safety/sos-config');
            if (res.ok) return await res.json();
        } catch (e) {
            console.error('Failed to fetch SOS config', e);
        }
        return { type: 'FEE', feeAmount: 500 };
    }

    async updateSosPenaltyConfig(config: SosPenaltyConfig): Promise<void> {
        const res = await fetch('/api/safety/sos-config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        if (!res.ok) throw new Error('Failed to update SOS config');
    }
}
