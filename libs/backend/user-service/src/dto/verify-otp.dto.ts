import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  identifier?: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be 6 digits long.' })
  otpCode: string;
}
