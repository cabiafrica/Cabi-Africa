import { Controller, Post, Body, ValidationPipe, UnauthorizedException, UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Public } from '@cabi/backend/rbac';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
  @Public()
  async register(@Body(new ValidationPipe()) registerUserDto: RegisterUserDto) {
    const result = await this.userService.registerPassenger(registerUserDto);
    return {
      message: 'Registration successful.',
      ...result,
    };
  }

  @Post('verify-otp')
  @Public()
  async verifyOtp(@Body(new ValidationPipe()) verifyOtpDto: any) {
    return this.userService.verifyOtp(verifyOtpDto.phone, verifyOtpDto.otpCode);
  }

  @Post('login')
  @Public()
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

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body(new ValidationPipe()) resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @Post('me')
  async getMe(@Body() body: { userId: string }) {
    // For now, we'll take userId from body if sent by gateway/mobile, 
    // or we could use a proper AuthGuard. 
    // The passenger app currently doesn't have an easy way to pass the user id from token 
    // so we'll just implement a simple fetch for now.
    return this.userService.getMe(body.userId);
  }

  @Post('register-driver')
  @Public()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'license_front', maxCount: 1 },
    { name: 'license_back', maxCount: 1 },
    { name: 'police_clearance', maxCount: 1 },
    { name: 'national_id', maxCount: 1 },
    { name: 'psv_badge', maxCount: 1 },
  ]))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async registerDriver(@Body() body: any, @UploadedFiles() files: any) {
    const result = await this.userService.registerDriver(body, files);
    return {
      message: 'Driver registration received for verification.',
      ...result,
    };
  }

  @Post('register-organization')
  @Public()
  @UseInterceptors(FileInterceptor('registration_certificate'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async registerOrganization(@Body() body: any, @UploadedFile() file: any) {
    const result = await this.userService.registerOrganization(body, file);
    return {
      message: 'Organization registration received for verification.',
      ...result,
    };
  }
}