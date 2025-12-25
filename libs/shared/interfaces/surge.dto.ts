import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Represents a single coordinate point [longitude, latitude].
 */
type Coordinate = [number, number];

/**
 * Data Transfer Object for a surge pricing zone.
 */
export class SurgeZoneDto {
  id: string;
  name: string;
  multiplier: number;
  // GeoJSON Polygon format: an array of linear rings, where the first is the exterior ring.
  geofence: Coordinate[][];
  isActive: boolean;
}

export class CreateOrUpdateSurgeZoneDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  multiplier: number;

  @IsArray()
  @ArrayMinSize(1)
  geofence: Coordinate[][];

  @IsBoolean()
  isActive: boolean;
}