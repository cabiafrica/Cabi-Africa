import {
    IsEnum,
    IsString,
    IsOptional,
    IsDateString,
    IsNumber,
    IsArray,
    IsUUID,
    MinLength,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OccurrenceCategory {
    CRIME = 'CRIME',
    TRAFFIC_OFFENSE = 'TRAFFIC_OFFENSE',
    SAFETY_VIOLATION = 'SAFETY_VIOLATION',
    POLICY_VIOLATION = 'POLICY_VIOLATION',
    HARASSMENT = 'HARASSMENT',
    FRAUD = 'FRAUD',
    PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
    MEDICAL_EMERGENCY = 'MEDICAL_EMERGENCY',
    DISPUTE = 'DISPUTE',
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
    VEHICLE_ISSUE = 'VEHICLE_ISSUE',
    ENVIRONMENTAL = 'ENVIRONMENTAL',
}

export enum OccurrenceSeverity {
    CRITICAL = 'CRITICAL', // SEV-1
    HIGH = 'HIGH',         // SEV-2
    MEDIUM = 'MEDIUM',     // SEV-3
    LOW = 'LOW',           // SEV-4
}

export enum OccurrenceSource {
    SOS = 'SOS',
    RATING = 'RATING',
    COMMENT = 'COMMENT',
    MANUAL = 'MANUAL',
    AUTO = 'AUTO',
}

export class LocationDto {
    @IsNumber()
    @IsOptional()
    lat?: number;

    @IsNumber()
    @IsOptional()
    lng?: number;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    placeName?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    country?: string;
}

export class CreateOccurrenceDto {
    @IsEnum(OccurrenceCategory)
    category: OccurrenceCategory;

    @IsEnum(OccurrenceSeverity)
    severity: OccurrenceSeverity;

    @IsString()
    @MinLength(5)
    @MaxLength(255)
    title: string;

    @IsString()
    @MinLength(10)
    description: string;

    // Involved parties (at least one required)
    @IsUUID()
    @IsOptional()
    driverId?: string;

    @IsUUID()
    @IsOptional()
    passengerId?: string;

    @IsUUID()
    @IsOptional()
    vehicleId?: string;

    @IsUUID()
    @IsOptional()
    rideId?: string;

    // Time, Date, and Place
    @IsDateString()
    occurrenceDate: string; // ISO date string

    @IsString()
    occurrenceTime: string; // HH:MM format

    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    // Source
    @IsEnum(OccurrenceSource)
    source: OccurrenceSource;

    @IsUUID()
    @IsOptional()
    sourceReferenceId?: string;

    // Registrar (will be set from auth token)
    @IsUUID()
    registeredById: string;

    // Optional metadata
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}

export class UpdateOccurrenceDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(OccurrenceSeverity)
    @IsOptional()
    severity?: OccurrenceSeverity;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}

export class ResolveOccurrenceDto {
    @IsString()
    @MinLength(10)
    resolutionNotes: string;

    @IsUUID()
    resolvedById: string;
}

export class FilterOccurrenceDto {
    @IsEnum(OccurrenceCategory)
    @IsOptional()
    category?: OccurrenceCategory;

    @IsEnum(OccurrenceSeverity)
    @IsOptional()
    severity?: OccurrenceSeverity;

    @IsString()
    @IsOptional()
    status?: string;

    @IsUUID()
    @IsOptional()
    driverId?: string;

    @IsUUID()
    @IsOptional()
    passengerId?: string;

    @IsUUID()
    @IsOptional()
    vehicleId?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit?: number = 20;
}
