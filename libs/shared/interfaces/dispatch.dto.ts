import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
/**
 * Data Transfer Object for a back-to-back trip offer.
 */
export class BackToBackTripOfferDto {
  tripId: string;
  pickupLocation: string;
  timeToPickupMinutes: number;
  distanceToPickupMiles: number;
}

/**
 * Data Transfer Object for a standard trip offer.
 */
export class TripOfferDto {
  tripId: string;
  pickupLocation: string;
  destination: string;
  estimatedFare: number;
  timeToPickupMinutes: number;
}

export enum RejectionReason {
  TOO_FAR = 'TOO_FAR',
  END_OF_SHIFT = 'END_OF_SHIFT',
  OTHER = 'OTHER',
}

/**
 * DTO for a driver rejecting a trip offer.
 */
export class RejectOfferDto {
  @IsEnum(RejectionReason)
  reason: RejectionReason;
}