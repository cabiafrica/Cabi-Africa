import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import {
  BadgeIncentiveInput,
  CreateWealthProgramDto,
  UpdateWealthProgramDto,
  WealthService,
} from './wealth.service';

@Controller('wealth-programs')
export class WealthController {
  constructor(private readonly wealthService: WealthService) {}

  private extractUser(req: any): any {
    if (req?.user) return req.user;
    const internalKey = process.env.INTERNAL_API_KEY;
    const providedKey = req?.headers?.['x-internal-api-key'];
    if (internalKey && providedKey && typeof providedKey === 'string') {
      try {
        const a = Buffer.from(internalKey);
        const b = Buffer.from(providedKey);
        if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
          return { role: 'SUPER_ADMIN', permissions: ['SUPER_ADMIN'] };
        }
      } catch {
        // continue
      }
    }
    let user = req?.user;
    if (!user && req?.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
      if (secret) {
        try {
          user = jwt.verify(token, secret) as any;
        } catch {
          user = null;
        }
      }
    }
    return user;
  }

  private assertAdmin(req: any): void {
    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Authentication required for administrative wealth program operations.');
    }
    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const isAdmin =
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      perms.some((p: string) => p.startsWith('SYSTEM_SETTINGS_') || p.startsWith('WEALTH_') || p === 'SUPER_ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('Admin wealth privileges required.');
    }
  }

  private assertSelfOrAdmin(req: any, targetDriverProfileId: string): void {
    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }
    const callerId = user.driverProfile?.id || user.driverProfileId || user.id || user.sub;
    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const isAdmin =
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      perms.some((p: string) => p.startsWith('WEALTH_') || p.startsWith('DRIVER_') || p === 'SUPER_ADMIN');
    if (callerId !== targetDriverProfileId && !isAdmin) {
      throw new ForbiddenException('You are not authorized to manage another driver wealth profile.');
    }
  }

  @Get()
  async listPrograms(@Query('activeOnly') activeOnly?: string) {
    const programs = await this.wealthService.listPrograms(activeOnly !== 'true');
    return { success: true, data: programs };
  }

  @Get('available')
  async getAvailableForDriver(@Req() req: any, @Query('driverProfileId') driverProfileId: string) {
    this.assertSelfOrAdmin(req, driverProfileId);
    const programs = await this.wealthService.getAvailableForDriver(driverProfileId);
    return { success: true, data: programs };
  }

  @Post()
  async createProgram(@Req() req: any, @Body() dto: CreateWealthProgramDto) {
    this.assertAdmin(req);
    const program = await this.wealthService.createProgram(dto);
    return { success: true, message: 'Wealth creation program created', data: program };
  }

  @Put(':id')
  async updateProgram(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateWealthProgramDto) {
    this.assertAdmin(req);
    const program = await this.wealthService.updateProgram(id, dto);
    return { success: true, message: 'Wealth creation program updated', data: program };
  }

  @Delete(':id')
  async deleteProgram(@Req() req: any, @Param('id') id: string) {
    this.assertAdmin(req);
    await this.wealthService.deleteProgram(id);
    return { success: true, message: 'Wealth creation program deleted' };
  }

  @Post(':id/badge-incentives')
  async attachBadgeIncentive(@Req() req: any, @Param('id') id: string, @Body() dto: BadgeIncentiveInput) {
    this.assertAdmin(req);
    const incentive = await this.wealthService.upsertBadgeIncentive(id, dto);
    return { success: true, message: 'Badge incentive attached', data: incentive };
  }

  @Delete(':id/badge-incentives/:incentiveId')
  async removeBadgeIncentive(
    @Req() req: any,
    @Param('id') id: string,
    @Param('incentiveId') incentiveId: string
  ) {
    this.assertAdmin(req);
    await this.wealthService.removeBadgeIncentive(id, incentiveId);
    return { success: true, message: 'Badge incentive removed' };
  }

  @Post('enroll')
  async enrollDriver(
    @Req() req: any,
    @Body()
    body: {
      driverProfileId: string;
      allocations: Array<{ programId: string; deductionPct: number; isEnrolled: boolean }>;
    }
  ) {
    this.assertSelfOrAdmin(req, body.driverProfileId);
    const programs = await this.wealthService.enrollDriver(
      body.driverProfileId,
      body.allocations || []
    );
    return { success: true, message: 'Wealth program selections updated', data: programs };
  }

  /**
   * Driver submits a formal cancellation request for a wealth program.
   * Per policy, per-trip deductions continue normally until staff effects termination within 60 days.
   */
  @Post('cancel-request')
  async requestCancellation(
    @Req() req: any,
    @Body() body: { driverProfileId: string; programId: string; reason?: string }
  ) {
    this.assertSelfOrAdmin(req, body.driverProfileId);
    const result = await this.wealthService.requestCancellation(
      body.driverProfileId,
      body.programId,
      body.reason
    );
    return { success: true, data: result };
  }

  /**
   * Driver aborts/retracts a pending cancellation request before staff effects it (within the 60 days).
   */
  @Post('cancel-abort')
  async abortCancellation(
    @Req() req: any,
    @Body() body: { driverProfileId: string; programId: string }
  ) {
    this.assertSelfOrAdmin(req, body.driverProfileId);
    const result = await this.wealthService.abortCancellation(
      body.driverProfileId,
      body.programId
    );
    return { success: true, data: result };
  }

  /**
   * Alias: cancel-retract
   */
  @Post('cancel-retract')
  async retractCancellation(
    @Req() req: any,
    @Body() body: { driverProfileId: string; programId: string }
  ) {
    return this.abortCancellation(req, body);
  }

  /**
   * Staff/Admin lists pending cancellation requests approaching the 60-day deadline.
   */
  @Get('cancellations/pending')
  async listPendingCancellations(@Req() req: any, @Query('status') status?: string) {
    this.assertAdmin(req);
    const requests = await this.wealthService.listCancellationRequests(status || 'PENDING_CANCELLATION');
    return { success: true, count: requests.length, data: requests };
  }

  /**
   * Staff effects the cancellation after auditing liabilities and Sacco clearance.
   * Deductions cease immediately.
   */
  @Post('cancellations/:id/effect')
  async effectCancellation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { notes?: string }
  ) {
    this.assertAdmin(req);
    const staffUser = this.extractUser(req);
    const staffUserId = staffUser?.id || staffUser?.sub || 'STAFF_ADMIN';
    const result = await this.wealthService.effectCancellation(id, staffUserId, body?.notes);
    return { success: true, data: result };
  }
}

