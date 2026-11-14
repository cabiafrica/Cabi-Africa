import { Controller, Post, Get, Put, Patch, Body, ValidationPipe, UnauthorizedException, BadRequestException, UseInterceptors, UploadedFiles, UploadedFile, Req } from '@nestjs/common';
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
        accessToken: token,  // mobile apps expect accessToken
        token,
        user,
      };
    } catch (error) {
      console.error('Login error:', error?.message || error);
      throw new UnauthorizedException('Invalid email/phone or password.');
    }
  }

  @Post('admin/initiate-login')
  @Public()
  async initiateAdminLogin(@Body(new ValidationPipe()) loginDto: LoginDto) {
    try {
      return await this.userService.initiateAdminLogin(loginDto.email, loginDto.password);
    } catch (error: any) {
      throw new UnauthorizedException(error?.message || 'Invalid credentials.');
    }
  }

  @Post('admin/verify-identity')
  @Public()
  async verifyAdminIdentity(@Body() body: { challengeToken: string; otpCode: string }) {
    if (!body?.challengeToken || !body?.otpCode) {
      throw new UnauthorizedException('Verification token and 6-digit code are required.');
    }
    return this.userService.verifyAdminIdentity(body.challengeToken, body.otpCode);
  }

  @Post('admin/resend-otp')
  @Public()
  async resendAdminOtp(@Body() body: { challengeToken: string }) {
    if (!body?.challengeToken) {
      throw new UnauthorizedException('Verification challenge token is required.');
    }
    return this.userService.resendAdminOtp(body.challengeToken);
  }

  @Get('admin/onboarding/questions')
  @Public()
  getOnboardingQuestions() {
    return this.userService.getPredefinedSecurityQuestions();
  }

  @Post('admin/onboarding/totp-setup')
  @Public()
  async setupTotp(@Body() body: { challengeToken?: string; onboardingToken?: string }) {
    const token = body.onboardingToken || body.challengeToken;
    if (!token) {
      throw new UnauthorizedException('Onboarding token is required.');
    }
    return this.userService.generateOnboardingTotp(token);
  }

  @Post('admin/onboarding/complete')
  @Public()
  async completeOnboarding(@Body() body: {
    challengeToken?: string;
    onboardingToken?: string;
    newPassword: string;
    securityQuestions: Array<{ questionId: string; question: string; answer: string }>;
    totpSecret: string;
    totpCode: string;
    biometricCredential?: any;
  }) {
    return this.userService.completeAdminOnboarding(body);
  }

  @Post('admin/recover-account')
  @Public()
  async recoverAccount(@Body() body: { email: string; answers: Array<{ questionId: string; answer: string }> }) {
    if (!body?.email || !Array.isArray(body?.answers)) {
      throw new BadRequestException('Email and security answers are required.');
    }
    return this.userService.recoverAccountWithSecurityQuestions(body.email, body.answers);
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

  private extractAuthenticatedUserId(req: any, requestedUserId?: string): string {
    const authUserId = req?.user?.sub || req?.user?.id || req?.user?.userId;
    if (!authUserId) {
      throw new UnauthorizedException('Could not extract user identity from token.');
    }
    if (requestedUserId && requestedUserId !== authUserId && req?.user?.role !== 'ADMIN') {
      throw new UnauthorizedException('Cannot access or modify another user identity.');
    }
    return requestedUserId && req?.user?.role === 'ADMIN' ? requestedUserId : authUserId;
  }

  @Post('me')
  async getMe(@Req() req: any, @Body() body: { userId?: string }) {
    const userId = this.extractAuthenticatedUserId(req, body?.userId);
    return this.userService.getMe(userId);
  }

  @Get('me')
  async getMeFromToken(@Req() req: any) {
    const userId = this.extractAuthenticatedUserId(req);
    return this.userService.getMe(userId);
  }

  @Put('profile')
  async updateMyProfile(@Req() req: any, @Body() body: any) {
    const userId = this.extractAuthenticatedUserId(req, body?.userId);
    return this.userService.updateProfile(userId, body);
  }

  @Patch('profile')
  async patchMyProfile(@Req() req: any, @Body() body: any) {
    const userId = this.extractAuthenticatedUserId(req, body?.userId);
    return this.userService.updateProfile(userId, body);
  }

  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadMyProfilePicture(@Req() req: any, @UploadedFile() file: any, @Body() body: any) {
    const userId = this.extractAuthenticatedUserId(req, body?.userId);
    const photoUrl = body?.photoUrl || body?.passportPhotoUrl || body?.profilePicture;
    return this.userService.uploadProfilePicture(userId, file, photoUrl);
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