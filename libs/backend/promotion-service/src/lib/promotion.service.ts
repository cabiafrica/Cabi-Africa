import { Injectable } from '@nestjs/common';

export interface PromoCode {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    value: number;
    expiresAt: Date;
    maxUses: number;
    usesPerUser: number;
    currentUses: number;
    isActive: boolean;
    createdAt: Date;
    usageHistory: { userId: string; usedAt: Date }[];
}

@Injectable()
export class PromotionService {
    private promoCodes: PromoCode[] = [];

    constructor() {
        // Seed data
        this.promoCodes.push({
            id: 'promo_1',
            code: 'SAVE10',
            discountType: 'PERCENTAGE',
            value: 10,
            expiresAt: new Date('2025-12-31'),
            maxUses: 1000,
            usesPerUser: 1,
            currentUses: 45,
            isActive: true,
            createdAt: new Date(),
            usageHistory: []
        });
        this.promoCodes.push({
            id: 'promo_2',
            code: 'FIRSTRIDE',
            discountType: 'FIXED',
            value: 5.00,
            expiresAt: new Date('2025-12-31'),
            maxUses: -1, // Unlimited
            usesPerUser: 1,
            currentUses: 234,
            isActive: true,
            createdAt: new Date(),
            usageHistory: []
        });
    }

    async createPromoCode(data: Omit<PromoCode, 'id' | 'currentUses' | 'createdAt' | 'usageHistory'>) {
        const newPromo: PromoCode = {
            ...data,
            id: `promo_${Date.now()}`,
            currentUses: 0,
            createdAt: new Date(),
            usageHistory: []
        };
        this.promoCodes.push(newPromo);
        console.log(`[PromotionService] Created promo code: ${newPromo.code}`);
        return newPromo;
    }

    async getAllPromoCodes() {
        return this.promoCodes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async getPromoCode(code: string) {
        return this.promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase());
    }

    async validateAndApplyPromo(code: string, userId: string, fareAmount: number) {
        const promo = await this.getPromoCode(code);

        if (!promo) throw new Error('Invalid promo code');
        if (!promo.isActive) throw new Error('Promo code is inactive');
        if (promo.expiresAt < new Date()) throw new Error('Promo code has expired');
        if (promo.maxUses !== -1 && promo.currentUses >= promo.maxUses) throw new Error('Promo code usage limit reached');

        // Check user-specific usage
        const userUses = promo.usageHistory.filter(h => h.userId === userId).length;
        if (userUses >= promo.usesPerUser) throw new Error('You have already used this promo code');

        // Calculate discount
        let discount = 0;
        if (promo.discountType === 'PERCENTAGE') {
            discount = fareAmount * (promo.value / 100);
        } else {
            discount = Math.min(promo.value, fareAmount); // Can't discount more than fare
        }

        // Record usage
        promo.currentUses++;
        promo.usageHistory.push({ userId, usedAt: new Date() });

        console.log(`[PromotionService] Applied promo ${code} for user ${userId}: -$${discount.toFixed(2)}`);

        return {
            originalAmount: fareAmount,
            discount,
            finalAmount: fareAmount - discount,
            promoCode: promo.code
        };
    }

    async updatePromoCode(id: string, updates: Partial<PromoCode>) {
        const promo = this.promoCodes.find(p => p.id === id);
        if (!promo) throw new Error('Promo code not found');

        Object.assign(promo, updates);
        return promo;
    }

    async deletePromoCode(id: string) {
        const index = this.promoCodes.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Promo code not found');

        this.promoCodes.splice(index, 1);
        return { success: true };
    }
}
