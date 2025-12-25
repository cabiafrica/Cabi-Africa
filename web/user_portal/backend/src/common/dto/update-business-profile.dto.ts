import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateBusinessProfileDto {
  @IsEmail()
  @IsNotEmpty()
  workEmail: string;

  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  @IsString()
  @IsOptional()
  expenseCode?: string;
}