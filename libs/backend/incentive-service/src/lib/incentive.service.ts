import { Injectable } from '@nestjs/common';

export interface Referral {
    id: string;
    referrerId: string;
    refereeId: string;
    refereeEmail: string;
    code: string;
    status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
    creditAmount: number;
    completedAt?: Date;
    createdAt: Date;
}

export interface IncentiveRule {
    id: string;
    type: 'CONSECUTIVE_TRIPS' | 'REFERRAL' | 'PEAK_HOURS';
    name: string;
    description: string;
    threshold: number;
    bonusAmount: number;
    isActive: boolean;
}

@Injectable()
export class IncentiveService {
    private referrals: Referral[] = [];
    private rules: IncentiveRule[] = [];
    private driverStreaks = new Map<string, number>(); // driverId -> streak count

    constructor() {
        // Seed referral rules
        this.rules.push({
            id: 'rule_1',
            type: 'REFERRAL',
            name: 'Passenger Referral Bonus',
            description: 'Both referrer and referee get $5 credit',
            threshold: 1,
            bonusAmount: 5.00,
            isActive: true
        });

        this.rules.push({
            id: 'rule_2',
            type: 'CONSECUTIVE_TRIPS',
            name: '3 Trips Streak Bonus',
            description: 'Complete 3 trips in a row without canceling',
            threshold: 3,
            bonusAmount: 10.00,
            isActive: true
        });
    }

    // Referral Methods
    async generateReferralCode(userId: string): Promise<string> {
        // Generate unique code based on user ID
        return `REF${userId.substring(0, 6).toUpperCase()}`;
    }

    async createReferral(referrerId: string, refereeEmail: string, code: string) {
        const newReferral: Referral = {
            id: `ref_${Date.now()}`,
            referrerId,
            refereeId: '', // Will be filled when referee signs up
            refereeEmail,
            code,
            status: 'PENDING',
            creditAmount: 5.00,
            createdAt: new Date()
        };

        this.referrals.push(newReferral);
        console.log(`[IncentiveService] Referral created: ${code} for ${refereeEmail}`);
        return newReferral;
    }

    async validateReferralCode(code: string, newUserId: string) {
        const referral = this.referrals.find(r => r.code === code && r.status === 'PENDING');

        if (!referral) {
            throw new Error('Invalid or expired referral code');
        }

        referral.refereeId = newUserId;
        return referral;
    }

    async completeReferral(referralId: string) {
        const referral = this.referrals.find(r => r.id === referralId);
        if (!referral) throw new Error('Referral not found');

        referral.status = 'COMPLETED';
        referral.completedAt = new Date();

        console.log(`[IncentiveService] Referral completed! Awarding $${referral.creditAmount} to both users`);
        // In real app: PaymentService.addCredit(referral.referrerId, referral.creditAmount)
        // In real app: PaymentService.addCredit(referral.refereeId, referral.creditAmount)

        return {
            referrerId: referral.referrerId,
            refereeId: referral.refereeId,
            creditAmount: referral.creditAmount
        };
    }

    async getReferralHistory(userId: string) {
        return this.referrals
            .filter(r => r.referrerId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Driver Streak Methods (Story 26.1)
    async incrementStreak(driverId: string) {
        const current = this.driverStreaks.get(driverId) || 0;
        const newStreak = current + 1;
        this.driverStreaks.set(driverId, newStreak);

        console.log(`[IncentiveService] Driver ${driverId} streak: ${newStreak}`);

        // Check if bonus should be awarded
        const rule = this.rules.find(r => r.type === 'CONSECUTIVE_TRIPS' && r.isActive);
        if (rule && newStreak === rule.threshold) {
            await this.awardBonus(driverId, rule);
            this.driverStreaks.set(driverId, 0); // Reset after bonus
        }

        return newStreak;
    }

    async resetStreak(driverId: string) {
        this.driverStreaks.set(driverId, 0);
        console.log(`[IncentiveService] Driver ${driverId} streak reset`);
    }

    async getStreak(driverId: string) {
        return this.driverStreaks.get(driverId) || 0;
    }

    async getStreakStatus(driverId: string) {
        const currentStreak = this.driverStreaks.get(driverId) || 0;
        const rule = this.rules.find(r => r.type === 'CONSECUTIVE_TRIPS' && r.isActive);

        return {
            currentStreak,
            requiredStreak: rule ? rule.threshold : 0,
            bonusAmount: rule ? rule.bonusAmount : 0,
            nextBonusLabel: rule ? rule.name : 'No Active Streak Bonus'
        };
    }

    private async awardBonus(driverId: string, rule: IncentiveRule) {
        console.log(`[IncentiveService] 🎉 Awarding ${rule.name} bonus of $${rule.bonusAmount} to driver ${driverId}`);
        // In real app: PaymentService.addBonus(driverId, rule.bonusAmount, rule.name)
        // In real app: NotificationService.send(driverId, `You earned a $${rule.bonusAmount} bonus!`)

        return {
            driverId,
            ruleName: rule.name,
            bonusAmount: rule.bonusAmount
        };
    }

    // Admin Methods
    async getAllRules() {
        return this.rules;
    }

    async createRule(data: Omit<IncentiveRule, 'id'>) {
        const newRule: IncentiveRule = {
            ...data,
            id: `rule_${Date.now()}`
        };
        this.rules.push(newRule);
        return newRule;
    }

    async updateRule(id: string, updates: Partial<IncentiveRule>) {
        const rule = this.rules.find(r => r.id === id);
        if (!rule) throw new Error('Rule not found');

        Object.assign(rule, updates);
        return rule;
    }
}
