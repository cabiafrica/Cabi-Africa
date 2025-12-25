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