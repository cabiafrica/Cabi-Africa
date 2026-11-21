import { Controller, Get, Post, Body, Query, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { MockJwtAuthGuard } from '@cabi/backend/rbac';
import { AdminSecurityService } from './admin-security.service';
import { AdminSecurityGuard, RequireAdminStepUp, SkipAdminStepUp } from './admin-security.guard';
import { fetchUserAuditEvents } from './auditService';

@Controller('admin/security')
@UseGuards(MockJwtAuthGuard, AdminSecurityGuard)
export class AdminSecurityController {
  constructor(private readonly adminSecurityService: AdminSecurityService) {}

  private extractClientMeta(req: any) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      '';
    const userAgent = (req.headers['user-agent'] as string) || '';
    return { ipAddress, userAgent };
  }

  /**
   * Initiate TOTP 2FA setup for the authenticated admin.
   * POST /admin/security/2fa/setup
   */
  @Post('2fa/setup')
  @SkipAdminStepUp()
  async setup2FA(@Req() req: any) {
    return this.adminSecurityService.setup2FA(req.user.id, req.user.email);
  }

  /**
   * Confirm initial TOTP code to activate mandatory 2FA and receive first step-up token.
   * POST /admin/security/2fa/verify-setup
   */
  @Post('2fa/verify-setup')
  @SkipAdminStepUp()
  async verifySetup(@Req() req: any, @Body() body: { code: string }) {
    if (!body?.code) {
      throw new BadRequestException('A 6-digit TOTP code is required.');
    }
    const { ipAddress, userAgent } = this.extractClientMeta(req);
    return this.adminSecurityService.confirm2FASetup(req.user.id, body.code, ipAddress, userAgent);
  }

  /**
   * Verify TOTP or one-time backup code to obtain a 15-minute signed X-Admin-MFA-Token.
   * POST /admin/security/2fa/challenge
   */
  @Post('2fa/challenge')
  @SkipAdminStepUp()
  async challenge(@Req() req: any, @Body() body: { code: string }) {
    if (!body?.code) {
      throw new BadRequestException('A TOTP or backup recovery code is required.');
    }
    const { ipAddress, userAgent } = this.extractClientMeta(req);
    return this.adminSecurityService.verifyChallengeAndIssueStepUpToken(
      req.user.id,
      body.code,
      ipAddress,
      userAgent
    );
  }

  /**
   * Get current admin security status (2FA enrolled, lockout state, IP allowlist).
   * GET /admin/security/status
   */
  @Get('status')
  @SkipAdminStepUp()
  getStatus(@Req() req: any) {
    return this.adminSecurityService.getSecurityStatus(req.user.id);
  }

  /**
   * View tamper-evident hash-chained security audit logs (requires active Step-Up MFA).
   * GET /admin/security/audit-logs
   */
  @Get('audit-logs')
  @RequireAdminStepUp()
  async getAuditLogs(@Query('userId') userId?: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200) : 50;
    const events = await fetchUserAuditEvents(userId, parsedLimit);
    return {
      total: events.length,
      events,
    };
  }
}
