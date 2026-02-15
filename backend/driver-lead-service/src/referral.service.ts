import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateReferralFormulaDto } from './driver-leads/dto/update-referral-formula.dto';

/**
 * Defines the structure for a single rule in the Referral Fee Formula.
 */
interface ReferralFeeRule {
  recipient: 'system' | 'referrer' | 'upline';
  value: number;
  ruleType: 'fixed' | 'percentage';
  uplineLevel: number;
}

/**
 * This is a mock service that simulates the behavior of the real ReferralService.
 * It validates referral codes and simulates processing a referral.
 */
@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  // Mock database of existing drivers with referral codes
  private readonly validReferralCodes = new Map<string, string>([
    ['REF-JOHN-DOE', 'user-id-123'],
    ['REF-JANE-SMITH', 'user-id-456'],
  ]);

  // Mock database model for ReferralFeeFormula, as per US-003
  private feeFormula: ReferralFeeRule[] = [
    { recipient: 'referrer', value: 5, ruleType: 'fixed', uplineLevel: 0 },
    { recipient: 'upline', value: 2, ruleType: 'fixed', uplineLevel: 1 },
    { recipient: 'system', value: 3, ruleType: 'fixed', uplineLevel: 0 },
  ];

  async processReferral(referralCode: string, newUserId: string): Promise<void> {
    this.logger.log(`Processing referral code '${referralCode}' for new user '${newUserId}'.`);

    // 1. Validate the referral code
    if (!this.validReferralCodes.has(referralCode)) {
      // In a real app, you might want to handle this differently, e.g., still create the user but flag the referral as invalid.
      this.logger.warn(`Referral code '${referralCode}' is not valid.`);
      // We will not throw an error to prevent the entire registration from failing.
      return;
    }

    const sponsorId = this.validReferralCodes.get(referralCode);
    this.logger.log(`Valid referral. Sponsor ID: ${sponsorId}. Linking new user '${newUserId}'.`);
    // In a real app, this would use the feeFormula to calculate commissions
    // for the sponsor and their upline.
    this.logger.log(`Calculating commission for sponsor '${sponsorId}' based on current formula.`);
  }

  /**
   * Validates if a referral code exists.
   * Throws a NotFoundException if the code is not valid.
   * @param referralCode The code to validate.
   */
  async validateReferralCode(referralCode: string): Promise<{ valid: true }> {
    this.logger.log(`Validating referral code: ${referralCode}`);
    if (!this.validReferralCodes.has(referralCode)) {
      throw new NotFoundException(`Referral code '${referralCode}' not found.`);
    }
    return { valid: true };
  }

  /**
   * Retrieves the current Referral Program fee formula.
   */
  async getFeeFormula(): Promise<ReferralFeeRule[]> {
    this.logger.log('Fetching current Referral Program fee formula.');
    return this.feeFormula;
  }

  /**
   * Updates the Referral Program fee formula.
   * @param formulaDto The new formula rules.
   */
  async updateFeeFormula(formulaDto: UpdateReferralFormulaDto): Promise<ReferralFeeRule[]> {
    this.logger.log('Updating Referral Program fee formula.');
    this.feeFormula = formulaDto.rules;
    return this.feeFormula;
  }

  async distributeFee(driverId: string, amount: number) {
    this.logger.log(`[Referral] Distributing registration fee of ${amount} for driver ${driverId}`);
    // Mock distribution logic based on feeFormula
    for (const rule of this.feeFormula) {
      const cut = rule.ruleType === 'percentage' ? (amount * rule.value / 100) : rule.value;
      this.logger.log(`[Referral] -> ${rule.recipient} receives ${cut} (${rule.ruleType} ${rule.value})`);
    }
    return { success: true };
  }
}