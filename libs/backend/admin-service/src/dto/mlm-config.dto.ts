import { IsNumber, IsPositive, IsArray, IsString, ValidateNested, Max } from 'class-validator';
import { Type } from 'class-transformer';

class SplitDto {
  @IsNumber()
  @IsPositive()
  system: number;

  @IsNumber()
  @IsPositive()
  upline1: number;

  @IsNumber()
  @IsPositive()
  upline2: number;
}

export class MlmConfigDto {
  @IsNumber()
  @IsPositive()
  registrationFee: number;

  @ValidateNested()
  @Type(() => SplitDto)
  registrationFeeSplit: SplitDto;

  @ValidateNested()
  @Type(() => SplitDto)
  fareCommissionSplit: SplitDto;

  @IsNumber()
  @Max(100)
  saccoSavingsRate: number;

  @IsArray()
  @IsString({ each: true })
  earningBadgeIds: string[];
}