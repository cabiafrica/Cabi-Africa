import { IsString, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name must not be empty.' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number must not be empty.' })
  // This regex validates a Kenyan number that may or may not have the country code.
  // The service will be responsible for normalizing it to E.164 format.
  @Matches(/^(?:\+254|0)?(7|1)\d{8}$/, {
    message: 'Phone must be a valid Kenyan phone number.',
  })
  phone: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message: 'Password must include uppercase, lowercase, number, and special character.',
  })
  password: string;
}