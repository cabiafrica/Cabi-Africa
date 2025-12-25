import { IsString, IsNotEmpty, IsNumber, Min, IsBoolean } from 'class-validator';

export class VehicleCategoryDto {
  id: string;
  name: string;
  description: string;
  baseFare: number;
  perKilometerRate: number;
  perMinuteRate: number;
  isActive: boolean;
}

export class CreateOrUpdateVehicleCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  baseFare: number;

  @IsNumber()
  @Min(0)
  perKilometerRate: number;

  @IsNumber()
  @Min(0)
  perMinuteRate: number;

  @IsBoolean()
  isActive: boolean;
}