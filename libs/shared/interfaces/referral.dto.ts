import { IsNumber, Min } from 'class-validator';

export enum ReferralStatus {
  PENDING = 'PENDING', // Signed up, but not completed first trip
  ACTIVE = 'ACTIVE',   // Completed first trip, commission paid
}

/**
 * DTO for a driver who was referred.
 */
export class ReferredDriverDto {
  name: string;
  status: ReferralStatus;
  joinedAt: string; // ISO 8601 string
}

/**
 * DTO for the main driver referral info screen.
 */
export class DriverReferralInfoDto {
  referralCode: string;
  referredDrivers: ReferredDriverDto[];
}

/**
 * DTO representing a single Referral commission payout transaction.
 */
export class ReferralCommissionPayoutDto {
  id: string;
  date: string; // ISO 8601 string
  amount: number;
  sourceDriverId: string;
  sourceDriverName: string;
}

/**
 * DTO for the Referral registration fee distribution formula.
 * All values are percentages.
 */
export class ReferralFeeDistributionDto {
  @IsNumber()
  @Min(0)
  level1UplinePercentage: number;

  @IsNumber()
  @Min(0)
  level2UplinePercentage: number;

  @IsNumber()
  @Min(0)
  platformFeePercentage: number;
}