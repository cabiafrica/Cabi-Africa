import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for the driver registration request from the website.
 * Based on the requirements from story-104.2.
 */
export class RegistrationRequestDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  referralCode?: string;

  @IsString()
  @IsNotEmpty()
  recaptchaToken: string;
}