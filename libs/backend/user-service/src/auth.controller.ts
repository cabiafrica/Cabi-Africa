import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dtos/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body(new ValidationPipe()) registerUserDto: RegisterUserDto) {
    // The service will handle creating the user in Cognito and our DB.
    // Cognito will trigger the OTP SMS upon successful sign-up.
    const result = await this.userService.registerPassenger(registerUserDto);
    return {
      message: 'Registration successful. Please check your phone for an OTP to verify your account.',
      ...result,
    };
  }
}