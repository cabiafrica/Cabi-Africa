import { IsString, IsNotEmpty, IsPhoneNumber, MinLength, Matches, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
  PASSENGER = 'passenger',
  DRIVER = 'driver',
  ORGANIZATION = 'organization',
}

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('KE')
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsOptional()
  referrerId?: string;

  @IsString()
  @IsOptional()
  referralCode?: string;

  // Driver specific
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  // Organization specific
  @IsString()
  @IsOptional()
  orgName?: string;

  @IsString()
  @IsOptional()
  orgType?: string;

  @IsString()
  @IsOptional()
  profilePhotoUrl?: string;
}