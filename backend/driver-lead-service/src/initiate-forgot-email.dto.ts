import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class InitiateForgotEmailDto {
  @IsPhoneNumber() // Use a specific region in production, e.g., @IsPhoneNumber('KE')
  @IsNotEmpty()
  phone: string;
}