import { Controller, Post, Body } from '@nestjs/common';
import { AuthService, RegisterDriverDto } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint for new drivers to sign up.
   * It takes the driver's details and orchestrates the creation of the user
   * and auth credentials.
   */
  @Post('register/driver')
  registerDriver(@Body() registerDriverDto: RegisterDriverDto) {
    // In a real app, the password would be hashed here or in the service
    // before being stored. For this simulation, we pass it through.
    return this.authService.registerDriver(registerDriverDto);
  }
}