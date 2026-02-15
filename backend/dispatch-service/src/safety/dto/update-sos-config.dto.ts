import { SosPenaltyType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateSosConfigDto {
    @IsEnum(SosPenaltyType)
    type: SosPenaltyType;

    @IsOptional()
    @IsNumber()
    @Min(0)
    feeAmount?: number;

    @IsOptional()
    @IsString()
    @IsUUID()
    badgeId?: string;
}
