import { Controller, Post, Body, Req, Get, Query, UseGuards, Param } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { LoginDto } from './dto/login.dto';
import { Login2faDto } from './dto/login-2fa.dto';
import { LoginRecoveryDto } from './dto/login-recovery.dto';
import { InitiateForgotEmailDto } from './dto/initiate-forgot-email.dto';
import { VerifyForgotEmailDto } from './dto/verify-forgot-email.dto';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly userManagementService: UserManagementService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        const details = {
            ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Unknown',
        };
        return this.userManagementService.login(loginDto.email, loginDto.password, details);
    }

    @Post('login/2fa')
    async login2fa(@Body() login2faDto: Login2faDto, @Req() req: Request) {
        const details = {
            ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Unknown',
        };
        return this.userManagementService.loginWithTwoFactor(login2faDto.email, login2faDto.code, details);
    }

    @Post('login/recovery')
    async loginRecovery(@Body() loginRecoveryDto: LoginRecoveryDto, @Req() req: Request) {
        const details = {
            ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Unknown',
        };
        return this.userManagementService.loginWithRecoveryCode(loginRecoveryDto.email, loginRecoveryDto.recoveryCode, details);
    }

    @Post('forgot-email/initiate')
    async initiateForgotEmail(@Body() dto: InitiateForgotEmailDto) {
        return this.userManagementService.initiateForgotEmail(dto.phone);
    }

    @Post('forgot-email/verify')
    async verifyForgotEmail(@Body() dto: VerifyForgotEmailDto) {
        return this.userManagementService.verifyForgotEmail(dto.phone, dto.otp);
    }

    @UseGuards(JwtAuthGuard)
    @Post('report-suspicious/:loginId')
    async reportSuspicious(@Param('loginId') loginId: string, @Req() req: any) {
        return this.userManagementService.reportSuspiciousLogin(req.user.id, loginId);
    }
}
