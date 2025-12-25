import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number must not be empty.' })
  @Matches(/^(?:\+254|0)?(7|1)\d{8}$/, {
    message: 'Phone must be a valid Kenyan phone number.',
  })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP code must not be empty.' })
  @Length(6, 6, { message: 'OTP must be 6 digits long.' })
  otpCode: string;
}