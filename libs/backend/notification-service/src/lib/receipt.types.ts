export interface ReceiptLocation {
  address: string;
  name?: string;
  lat?: number;
  lng?: number;
}

export interface FareBreakdownItem {
  label: string;
  amount: number;
  isDiscount?: boolean;
}

export interface PassengerReceiptPayload {
  to: string;
  passengerName: string;
  rideId: string;
  rideDate: string | Date;
  pickupLocation: ReceiptLocation | string;
  dropoffLocation: ReceiptLocation | string;
  distanceKm?: number;
  durationMinutes?: number;
  currency?: string;
  totalFare: number;
  baseFare?: number;
  distanceFare?: number;
  timeFare?: number;
  surgeMultiplier?: number;
  surgeAmount?: number;
  waitTimeFee?: number;
  discountAmount?: number;
  paymentMethod: 'CASH' | 'WALLET' | 'CARD' | 'MPESA' | string;
  transactionReference?: string;
  driverName: string;
  driverRating?: number;
  driverPhotoUrl?: string;
  vehicleModel?: string;
  vehiclePlateNumber?: string;
  vehicleColor?: string;
  supportUrl?: string;
  invoiceNumber?: string;
}

export interface DriverReceiptPayload {
  to: string;
  driverName: string;
  rideId: string;
  rideDate: string | Date;
  pickupLocation: ReceiptLocation | string;
  dropoffLocation: ReceiptLocation | string;
  distanceKm?: number;
  durationMinutes?: number;
  currency?: string;
  grossFare: number;
  platformCommissionRate?: number; // e.g. 20 for 20%
  platformCommissionAmount: number;
  saccoDeductionAmount?: number;
  tipAmount?: number;
  netDriverEarnings: number;
  paymentMethod: 'CASH' | 'WALLET' | 'CARD' | 'MPESA' | string;
  payoutStatus?: 'CREDITED_TO_WALLET' | 'CASH_COLLECTED' | 'PENDING_PAYOUT';
  passengerName: string;
  passengerRating?: number;
  driverDashboardUrl?: string;
  supportUrl?: string;
}

export interface ReceiptEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}
