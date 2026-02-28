import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleType, BadgeTier } from '@prisma/client';

export class PrivacySettingsDto {
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @IsOptional()
  @IsBoolean()
  showRealName?: boolean;
}

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsBoolean()
  isTwoFactorEnabled?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacySettings?: PrivacySettingsDto;
}



export class UpdateRidePreferencesDto {
  @IsOptional()
  @IsEnum(VehicleType, { each: true })
  preferredVehicleTypes?: VehicleType[];

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(60)
  maxWaitMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(50)
  maxDistanceKm?: number;

  @IsOptional()
  @IsBoolean()
  quietRide?: boolean;

  @IsOptional()
  @IsBoolean()
  musicAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  acPreferred?: boolean;

  @IsOptional()
  @IsBoolean()
  petFriendly?: boolean;
}

export class UpdateDriverSavingsPreferenceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  personalSavingRate?: number;

  @IsOptional()
  @IsBoolean()
  isAutoSavingsEnabled?: boolean;

  @IsOptional()
  @IsString({ each: true })
  preferredZoneIds?: string[];
}

export class UpdateSystemSettingDto {
  @IsString()
  value: any; // Could be string, number, or JSON object
}
