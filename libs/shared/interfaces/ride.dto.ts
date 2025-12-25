import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object for a scheduled ride, intended for admin views.
 */
export class ScheduledRideDto {
  id: string;
  passengerId: string;
  passengerName: string;
  scheduledPickupTime: string;
  origin: string;
  destination: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
}

/**
 * DTO for creating a new ride booking.
 */
export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  origin: string; // Could be a place ID or coordinates

  @IsString()
  @IsNotEmpty()
  destination: string; // Could be a place ID or coordinates

  @IsString()
  @IsNotEmpty()
  vehicleCategoryId: string;
}