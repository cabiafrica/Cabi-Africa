import {
  // Keep only the necessary imports
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TwoFactorAuthCodeDto } from './dto/two-factor-auth.dto';
import { LoginDto } from './dto/login.dto';
import { Login2faDto } from './dto/login-2fa.dto';
import { LoginRecoveryDto } from './dto/login-recovery.dto';
import { InitiateForgotEmailDto } from './dto/initiate-forgot-email.dto';
import { VerifyForgotEmailDto } from './dto/verify-forgot-email.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req, @Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    const loginDetails = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
    return this.userManagementService.login(email, password, loginDetails);
  }

  // Assume a real login endpoint would exist here that returns a JWT

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    await this.userManagementService.generatePasswordResetToken(email);

    // In a real app, an email would be sent here.
    // We return a generic message to prevent email enumeration attacks.
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;
    const user = await this.userManagementService.findUserByResetToken(token);

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    await this.userManagementService.resetPassword(user.id, password);

    return { message: 'Your password has been reset successfully.' };
  }

  @Post('forgot-email/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateForgotPassword(@Body() initiateForgotEmailDto: InitiateForgotEmailDto) {
    await this.userManagementService.initiateForgotEmail(initiateForgotEmailDto.phone);
    // Always return a generic message to prevent phone number enumeration
    return {
      message: 'If an account is associated with this phone number, an SMS with a verification code has been sent.',
    };
  }

  @Post('forgot-email/verify')
  @HttpCode(HttpStatus.OK)
  async verifyForgotPassword(@Body() verifyForgotEmailDto: VerifyForgotEmailDto) {
    return this.userManagementService.verifyForgotEmail(verifyForgotEmailDto.phone, verifyForgotEmailDto.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generateTwoFactorSecret(@Req() req) {
    const userId = req.user.userId;
    return this.userManagementService.generateTwoFactorSecret(userId);
  }

  @Post('2fa/login')
  @HttpCode(HttpStatus.OK)
  async loginWithTwoFactor(@Req() req, @Body() login2faDto: Login2faDto) {
    const loginDetails = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
    return this.userManagementService.loginWithTwoFactor(login2faDto.email, login2faDto.twoFactorCode, loginDetails);
  }

  @Post('2fa/recover')
  @HttpCode(HttpStatus.OK)
  async loginWithRecoveryCode(@Req() req, @Body() loginRecoveryDto: LoginRecoveryDto) {
    const loginDetails = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
    return this.userManagementService.loginWithRecoveryCode(loginRecoveryDto.email, loginRecoveryDto.recoveryCode, loginDetails);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyTwoFactor(
    @Req() req,
    @Body() twoFactorAuthCodeDto: TwoFactorAuthCodeDto,
  ) {
    const userId = req.user.userId;
    return this.userManagementService.verifyTwoFactor(userId, twoFactorAuthCodeDto.twoFactorCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disableTwoFactor(@Req() req) {
    const userId = req.user.userId;
    return this.userManagementService.disableTwoFactor(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('login-history')
  async getLoginHistory(@Req() req, @Query() paginationDto: PaginationDto) {
    const userId = req.user.userId;
    return this.userManagementService.getLoginHistory(userId, paginationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('login-history/:id/report')
  @HttpCode(HttpStatus.OK)
  async reportSuspiciousLogin(@Req() req, @Param('id') loginHistoryId: string) {
    const userId = req.user.userId;
    await this.userManagementService.reportSuspiciousLogin(userId, loginHistoryId);
    return { message: 'The suspicious activity has been reported. Please check your email for recommendations.' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('devices/register')
  @HttpCode(HttpStatus.OK)
  async registerDevice(@Req() req, @Body() registerDeviceDto: RegisterDeviceDto) {
    const userId = req.user.userId;
    await this.userManagementService.addDeviceToken(userId, registerDeviceDto.deviceToken);
    return { message: 'Device token registered successfully.' };
  }
}