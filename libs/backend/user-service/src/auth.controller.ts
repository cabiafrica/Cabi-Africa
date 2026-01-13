import { Controller, Post, Body, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) { }

  @Post('register')
  async register(@Body(new ValidationPipe()) registerUserDto: RegisterUserDto) {
    const result = await this.userService.registerPassenger(registerUserDto);
    return {
      message: 'Registration successful.',
      ...result,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.userService.login(loginDto.email, loginDto.password);
      return {
        message: 'Login successful.',
        token: 'mock-jwt-token-' + user.id,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials.');
    }
  }
}