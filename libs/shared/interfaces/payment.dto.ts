import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO representing a saved payment method.
 */
export class PaymentMethodDto {
  id: string;
  cardType: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  isDefault: boolean;
}

/**
 * DTO for adding a new payment method.
 * The token is provided by a payment gateway (e.g., Stripe, Braintree).
 */
export class AddPaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  paymentMethodToken: string;
}

/**
 * DTO for a single financial transaction entry in a user's history (admin view).
 */
export class UserPaymentHistoryEntryDto {
  transactionId: string;
  date: string; // ISO 8601 string
  type: 'Ride Payment' | 'Payout' | 'Refund' | 'Adjustment' | 'Fee';
  amount: number;
  status: 'Succeeded' | 'Failed' | 'Pending';
}