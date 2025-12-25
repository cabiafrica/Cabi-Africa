import { IsNumber, Min, Max } from 'class-validator';

/**
 * DTO representing a single MLM commission payout transaction.
 */
export class MlmCommissionPayoutDto {
  id: string;
  date: string; // ISO 8601 string
  amount: number;
  sourceDriverId: string;
  sourceDriverName: string;
}

/**
 * DTO for the MLM registration fee distribution formula.
 * All values are percentages.
 */
export class MlmFeeDistributionDto {
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