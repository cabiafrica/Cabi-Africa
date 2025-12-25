import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  IsBoolean,
} from 'class-validator';

export enum PromoCodeType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum PromoCodeScope {
  ALL_USERS = 'ALL_USERS',
  NEW_USERS_ONLY = 'NEW_USERS_ONLY',
}

export class PromoCodeDto {
  id: string;
  code: string;
  type: PromoCodeType;
  value: number;
  expiresAt?: string;
  maxUses?: number;
  uses: number;
  scope: PromoCodeScope;
  isActive: boolean;
  createdAt: string;
}

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(PromoCodeType)
  type: PromoCodeType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsEnum(PromoCodeScope)
  scope: PromoCodeScope;

  @IsBoolean()
  isActive: boolean;
}