import { IsString, IsNotEmpty, IsObject, IsBoolean, IsEnum, IsOptional } from 'class-validator';

interface LocationInfo {
  address: string;
  latitude: number;
  longitude: number;
}

/**
 * DTO for a passenger's saved route.
 */
export class SavedRouteDto {
  id: string;
  name: string;
  origin: LocationInfo;
  destination: LocationInfo;
}

/**
 * DTO for creating a new saved route.
 */
export class CreateSavedRouteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  origin: LocationInfo;

  @IsObject()
  destination: LocationInfo;
}

export enum TemperaturePreference {
  COOL = 'COOL',
  WARM = 'WARM',
  NO_PREFERENCE = 'NO_PREFERENCE',
}

/**
 * DTO representing a passenger's ride preferences.
 */
export class RidePreferencesDto {
  isQuietRide: boolean;
  temperature: TemperaturePreference;
}

/**
 * DTO for updating a passenger's ride preferences.
 */
export class UpdateRidePreferencesDto {
  @IsOptional()
  @IsBoolean()
  isQuietRide?: boolean;

  @IsOptional()
  @IsEnum(TemperaturePreference)
  temperature?: TemperaturePreference;
}

/**
 * DTO for applying a promo code to a ride.
 */
export class ApplyPromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

/**
 * DTO representing the result of applying a promo code.
 */
export class AppliedPromoCodeDto {
  originalFare: number;
  discountAmount: number;
  finalFare: number;
  message: string;
}