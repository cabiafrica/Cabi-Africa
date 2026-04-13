import apiClient from '../apiClient';
import {
    ReferralConfig,
    PromoConfig,
    CommissionLedgerEntry,
    LedgerAdjustment
} from './types';

export class ReferralService {
    async getReferralConfig(): Promise<ReferralConfig> {
        const res = await apiClient.get('/admin/referral/config');
        return res.data;
    }

    async updateReferralConfig(config: ReferralConfig): Promise<void> {
        await apiClient.post('/admin/referral/config', config);
    }

    async getPromoConfig(): Promise<PromoConfig> {
        const res = await apiClient.get('/admin/referral/promo-config');
        return res.data;
    }

    async updatePromoConfig(config: PromoConfig): Promise<void> {
        await apiClient.post('/admin/referral/promo-config', config);
    }

    async adjustDriverLedger(adjustment: LedgerAdjustment): Promise<void> {
        await apiClient.post('/admin/referral/ledger/adjust', adjustment);
    }

    async getCommissionLedger(
        filters: {
            page: number;
            limit: number;
            startDate?: string;
            endDate?: string;
            driverId?: string;
        }
    ): Promise<{ total: number; entries: CommissionLedgerEntry[] }> {
        const res = await apiClient.get('/admin/referral/ledger', { params: filters });
        return res.data;
    }

    async getReferralDashboardStats() {
        const res = await apiClient.get('/admin/referral/stats');
        return res.data;
    }

    async getDriverDownline(userId: string): Promise<any> {
        const res = await apiClient.get(`/admin/referral/downline/${userId}`);
        return res.data;
    }

    async getReferralRules(): Promise<any[]> {
        const res = await apiClient.get('/admin/referral/rules');
        return res.data;
    }

    async updateReferralRules(rules: any[]): Promise<void> {
        await apiClient.put('/admin/referral/rules', { rules });
    }
}

