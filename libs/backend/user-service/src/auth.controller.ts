import { Controller, Post, Body, ValidationPipe, UnauthorizedException, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, UploadedFile } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';

class LoginDto {
  @IsNotEmpty({ message: 'Email or phone is required' })
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
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
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    try {
      const user = await this.userService.login(loginDto.email, loginDto.password);
      const token = await this.userService.generateToken(user);
      return {
        message: 'Login successful.',
        token,
        user,
      };
    } catch (error) {
      console.error('Login error:', error?.message || error);
      throw new UnauthorizedException('Invalid email/phone or password.');
    }
  }

  @Post('register-driver')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'license_front', maxCount: 1 },
    { name: 'license_back', maxCount: 1 },
    { name: 'police_clearance', maxCount: 1 },
    { name: 'national_id', maxCount: 1 },
    { name: 'psv_badge', maxCount: 1 },
  ]))
  async registerDriver(@Body() body: any, @UploadedFiles() files: any) {
    const result = await this.userService.registerDriver(body, files);
    return {
      message: 'Driver registration received for verification.',
      ...result,
    };
  }

  @Post('register-organization')
  @UseInterceptors(FileInterceptor('registration_certificate'))
  async registerOrganization(@Body() body: any, @UploadedFile() file: any) {
    const result = await this.userService.registerOrganization(body, file);
    return {
      message: 'Organization registration received for verification.',
      ...result,
    };
  }
}