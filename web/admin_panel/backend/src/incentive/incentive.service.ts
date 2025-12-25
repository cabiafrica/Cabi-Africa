import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';

interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
  maxUses: number;
  currentUses: number;
}

@Injectable()
export class IncentiveService {
  private readonly logger = new Logger(IncentiveService.name);

  // Mock data stores
  private promoCodes: PromoCode[] = [
    { code: 'WELCOME10', discountType: 'percentage', value: 10, isActive: true, maxUses: 1000, currentUses: 50 },
    { code: 'RIDE5', discountType: 'fixed', value: 5, isActive: true, maxUses: 500, currentUses: 120 },
    { code: 'EXPIRED', discountType: 'percentage', value: 20, isActive: false, maxUses: 100, currentUses: 99 },
  ];

  private userAppliedCodes: Record<string, PromoCode> = {}; // Maps userId to an applied code

  applyPromoCode(userId: string, code: string) {
    this.logger.log(`User ${userId} attempting to apply promo code: ${code}`);

    const promo = this.promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase());

    if (!promo || !promo.isActive) {
      throw new NotFoundException('Promo code is invalid or has expired.');
    }

    if (promo.currentUses >= promo.maxUses) {
      throw new BadRequestException('This promo code has reached its usage limit.');
    }

    // In a real app, you'd check if the user has already used this specific code.

    this.userAppliedCodes[userId] = promo;
    this.logger.log(`Promo code ${code} successfully applied for user ${userId}.`);

    return { success: true, message: 'Promo code applied successfully!', details: promo };
  }

  // This would be called by the payment service
  getAppliedDiscount(userId: string): PromoCode | null {
    return this.userAppliedCodes[userId] || null;
  }
}