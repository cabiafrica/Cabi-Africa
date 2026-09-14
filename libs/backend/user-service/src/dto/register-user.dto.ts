import { IsString, IsNotEmpty, IsPhoneNumber, MinLength, Matches, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
  PASSENGER = 'passenger',
  DRIVER = 'driver',
  ORGANIZATION = 'organization',
}

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name cannot contain numbers or special characters' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name cannot contain numbers or special characters' })
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('KE', { message: 'Please provide a valid Kenyan phone number' })
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
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