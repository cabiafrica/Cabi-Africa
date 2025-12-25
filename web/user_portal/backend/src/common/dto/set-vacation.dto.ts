import { IsOptional, IsDateString } from 'class-validator';

export class SetVacationDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}