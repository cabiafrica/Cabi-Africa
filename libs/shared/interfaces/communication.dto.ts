import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum UserSegment {
  ALL_USERS = 'ALL_USERS',
  ALL_PASSENGERS = 'ALL_PASSENGERS',
  ALL_DRIVERS = 'ALL_DRIVERS',
  ACTIVE_DRIVERS = 'ACTIVE_DRIVERS',
}

/**
 * Data Transfer Object for sending a bulk message.
 */
export class BulkMessageRequestDto {
  @IsEnum(UserSegment)
  segment: UserSegment;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}