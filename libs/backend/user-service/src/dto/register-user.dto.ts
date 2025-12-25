import { IsString, IsNotEmpty, IsPhoneNumber, MinLength, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsPhoneNumber('KE') // Validates against Kenyan phone number format
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message: 'Password must include uppercase, lowercase, number, and special character.',
  })
  password: string;

  // As per architecture, referral is part of the user model.
  // This will be provided if the user was referred.
  @IsString()
  referrerId?: string;
}