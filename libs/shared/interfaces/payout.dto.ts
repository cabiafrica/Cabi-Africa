import { IsNumber, IsString } from 'class-validator';

export type PayoutStatus = 'Pending' | 'Paid' | 'Failed';

export interface PayoutDto {
  id: string;
  driverId: string;
  driverName: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  requestedAt: string; // ISO 8601 string
  processedAt?: string; // ISO 8601 string
  paymentMethod: string;
}

/**
 * DTO for a driver to request a payout.
 */
export class RequestPayoutDto {
  @IsNumber()
  amount: number;

  @IsString()
  paymentMethod: string; // e.g., 'M-Pesa', 'Bank Transfer'
}