export type DisputeReason =
  | 'ROUTE_DETOUR'
  | 'GPS_DRIFT_ANOMALY'
  | 'UNAUTHORIZED_WAIT_TIME'
  | 'FARE_DISCREPANCY'
  | 'DRIVER_BEHAVIOR'
  | 'VEHICLE_SOILING'
  | 'FARE_EVASION_REVERSAL'
  | 'OTHER';

export type DisputeStatus =
  | 'PENDING_REVIEW'
  | 'AUTO_RESOLVED_VOUCHER'
  | 'ESCALATED_MANUAL_AUDIT'
  | 'RESOLVED_REFUND'
  | 'REJECTED';

export interface DisputeClaim {
  id: string;
  tripId: string;
  tripCode: string;
  passengerId: string;
  passengerPhone: string;
  driverId: string;
  driverPhone: string;
  reason: DisputeReason;
  description: string;
  originalFare: number;
  optimalFare: number;
  detourPercent: number;
  claimedAmount: number;
  awardedVoucherAmount: number;
  voucherCode?: string;
  status: DisputeStatus;
  driverAppealWindowExpiresAt: Date; // 48 hours
  driverAppealed: boolean;
  driverAppealNotes?: string;
  driverAppealSubmittedAt?: Date;
  trafficProofUrl?: string;
  adjudicatorNotes?: string;
  occurrenceId?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface DisputeAssessmentResult {
  tripId: string;
  optimalDistanceKm: number;
  actualDistanceKm: number;
  detourPercent: number;
  isDetourAnomaly: boolean;
  originalFare: number;
  fairRecalculatedFare: number;
  suggestedCompensation: number;
  eligibleForAutoVoucher: boolean;
  recentDisputeCount: number;
  antiAbuseReason?: string;
}

export interface FileDisputeDto {
  tripId: string;
  reason: DisputeReason;
  description: string;
  claimedAmount?: number;
}

export interface DriverAppealDto {
  appealNotes: string;
  trafficProofUrl?: string;
}

export interface AdjudicateDisputeDto {
  decision: 'UPHOLD_RIDER' | 'REVERSE_IN_FAVOR_OF_DRIVER';
  notes: string;
  adjustedAmount?: number;
}
