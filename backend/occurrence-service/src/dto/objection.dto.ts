import {
    IsString,
    IsOptional,
    IsUUID,
    MinLength,
    IsEnum,
} from 'class-validator';

export enum ObjectionStatus {
    PENDING = 'PENDING',
    UNDER_REVIEW = 'UNDER_REVIEW',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

export class CreateObjectionDto {
    @IsUUID()
    occurrenceId: string;

    @IsUUID()
    objectorId: string;

    @IsString()
    @MinLength(20)
    objectionText: string;

    @IsOptional()
    supportingEvidence?: any; // JSON array of media URLs
}

export class ReviewObjectionDto {
    @IsUUID()
    reviewedById: string;

    @IsString()
    @MinLength(10)
    reviewNotes: string;

    @IsEnum(ObjectionStatus)
    status: ObjectionStatus;

    @IsString()
    @IsOptional()
    outcome?: string; // 'UPHELD', 'DISMISSED', 'MODIFIED'
}
