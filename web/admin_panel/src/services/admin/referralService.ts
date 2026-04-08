import {
    ReferralConfig,
    PromoConfig,
    CommissionLedgerEntry,
    LedgerAdjustment
} from './types';

export class ReferralService {
    async getReferralConfig(): Promise<ReferralConfig> {
        try {
            const res = await fetch('/api/admin/referral/config');
            if (res.ok) return await res.json();
        } catch (e) {
            console.error(e);
        }
        return {
            signup: {
                totalFee: 2000,
                allocations: {
                    sacco: 500,
                    directReferrer: 300,
                    indirectReferrer: 200
                }
            },
            registrationFee: {
                total: 2000,
                systemCut: 0.5,
                upline1Cut: 0.3,
                upline2Cut: 0.2
            },
            driverPromo: {
                enabled: true,
                rules: [
                    { recipient: 'Sacco', percentage: 2 },
                    { recipient: 'Direct Referrer', percentage: 1.5 },
                    { recipient: 'Indirect Referrer', percentage: 1 }
                ]
            },
            passengerPromo: {
                enabled: true,
                rules: [
                    { recipient: 'Direct Referrer', percentage: 2 },
                    { recipient: 'Indirect Referrer', percentage: 1 }
                ]
            }
        };
    }

    async updateReferralConfig(config: ReferralConfig): Promise<void> {
        const res = await fetch('/api/admin/referral/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        if (!res.ok) throw new Error('Failed to update Referral config');
    }

    async getPromoConfig(): Promise<PromoConfig> {
        try {
            const res = await fetch('/api/admin/referral/promo-config');
            if (res.ok) return await res.json();
        } catch (e) {
            console.error(e);
        }
        return {
            isActive: true,
            upline1Cut: 0.02,
            upline2Cut: 0.01,
            qualification: { requiredBadge: 'EARNING_BADGE' },
        };
    }

    async updatePromoConfig(config: PromoConfig): Promise<void> {
        const res = await fetch('/api/admin/referral/promo-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        if (!res.ok) throw new Error('Failed to update Promo config');
    }

    async adjustDriverLedger(adjustment: LedgerAdjustment): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));
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
        const params = new URLSearchParams({
            page: filters.page.toString(),
            limit: filters.limit.toString()
        });
        if (filters.startDate) params.set('startDate', filters.startDate);
        if (filters.endDate) params.set('endDate', filters.endDate);
        if (filters.driverId) params.set('driverId', filters.driverId);

        try {
            const res = await fetch(`/api/admin/referral/ledger?${params.toString()}`);
            if (res.ok) return await res.json();
            throw new Error('Failed to fetch ledger');
        } catch (e) {
            console.error(e);
            return { total: 0, entries: [] };
        }
    }

    async getReferralDashboardStats() {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            totalCommissions: 12500.50,
            totalReferredDrivers: 142,
            newReferredDriversLast30Days: 12,
            referralConversionRate: 15.5,
            avgReferralsPerDriver: 2.3,
            topReferrers: [
                { driverId: 'u5', name: 'John Doe', referrals: 45 },
                { driverId: 'u9', name: 'Jane Smith', referrals: 32 },
                { driverId: 'u12', name: 'Bob Brown', referrals: 28 },
                { driverId: 'u22', name: 'Alice White', referrals: 15 },
                { driverId: 'u31', name: 'Charlie Green', referrals: 10 },
            ],
            chartData: [
                { date: '2024-01', newReferrals: 12 },
                { date: '2024-02', newReferrals: 19 },
                { date: '2024-03', newReferrals: 15 },
                { date: '2024-04', newReferrals: 22 },
                { date: '2024-05', newReferrals: 18 },
                { date: '2024-06', newReferrals: 25 },
            ]
        };
    }

    async getDriverDownline(userId: string): Promise<any> {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            id: userId, name: 'Root Driver', level: 0, status: 'ACTIVE',
            children: [
                { id: 'd-101', name: 'Direct Recruit A', level: 1, status: 'ACTIVE', children: [] },
                {
                    id: 'd-102', name: 'Direct Recruit B', level: 1, status: 'Active', children: [
                        { id: 'd-201', name: 'Sub Recruit B1', level: 2, status: 'PROSPECT', children: [] }
                    ]
                },
            ]
        };
    }

    async getReferralRules(): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return [
            { id: 'r-1', recipient: 'COMPANY', type: 'PERCENTAGE', value: 20 },
            { id: 'r-2', recipient: 'SPONSOR', type: 'PERCENTAGE', value: 10 },
            { id: 'r-3', recipient: 'UPLINE', level: 2, type: 'PERCENTAGE', value: 5 },
        ];
    }

    async updateReferralRules(rules: any[]): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
