import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyForgotEmailDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}