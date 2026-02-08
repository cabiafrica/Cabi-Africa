import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/([A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(\d)/, { message: 'Password must contain at least one number' })
  password: string;
}