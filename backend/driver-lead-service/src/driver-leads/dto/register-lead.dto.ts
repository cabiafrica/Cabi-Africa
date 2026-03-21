import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  MinLength,
  Matches,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  TUK_TUK = 'tuktuk',
}

export class RegisterLeadDto {
  // Personal Information
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber(null)
  phone: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  // Address Information
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  county?: string;

  // Vehicle Information
  @IsEnum(VehicleType)
  @IsOptional()
  vehicleType?: VehicleType;

  @IsString()
  @IsOptional()
  vehicleMake?: string;

  @IsString()
  @IsOptional()
  vehicleModel?: string;

  @IsNumber()
  @Min(2000)
  @Max(new Date().getFullYear())
  @IsOptional()
  vehicleYear?: number;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  // Documents
  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  drivingLicense?: string;

  // Security & Validation
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character' })
  password: string;

  @IsString()
  @IsNotEmpty()
  recaptchaToken: string;

  // Referral Program
  @IsString()
  @IsOptional()
  referralCode?: string;

  // Terms & Conditions
  @IsBoolean()
  agreeToTerms: boolean;
}

export class GroupRegistrationDto {
  // Organization Information
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @IsEmail()
  contactEmail: string;

  @IsPhoneNumber(null)
  contactPhone: string;

  @IsEnum(['sacco', 'fleet', 'cooperative', 'other'])
  organizationType: string;

  @IsString()
  @IsOptional()
  referralCode?: string;

  // Array of drivers
  @IsNotEmpty()
  drivers: DriverEntryDto[];

  @IsString()
  @IsNotEmpty()
  recaptchaToken: string;
}

export class DriverEntryDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber(null)
  phone: string;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;
}