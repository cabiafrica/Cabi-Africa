import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DisputeService } from './dispute.service';
import {
  FileDisputeDto,
  DriverAppealDto,
  AdjudicateDisputeDto,
} from './dispute.types';

@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  private extractUser(req: any): any {
    if (req?.user) return req.user;
    let user = null;
    const authHeader = req?.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret =
        process.env.JWT_SECRET ||
        (process.env.NODE_ENV !== 'production'
          ? 'dev-only-jwt-secret-do-not-use-in-prod'
          : '');
      if (secret) {
        try {
          user = jwt.verify(token, secret) as any;
        } catch {
          user = null;
        }
      }
    }

    if (!user && process.env.NODE_ENV !== 'production') {
      const devUserId = req?.headers?.['x-user-id'] || 'dev-user';
      const devUserRole = (req?.headers?.['x-user-role'] as string) || 'PASSENGER';
      return { id: devUserId, role: devUserRole.toUpperCase(), fullName: 'Dev User' };
    }

    return user;
  }

  /**
   * Pre-check trajectory detour and fair recalculated fare
   */
  @Get('assess/:tripId')
  async assessTrip(@Param('tripId') tripId: string, @Req() req: any) {
    const user = this.extractUser(req);
    const assessment = await this.disputeService.assessTripTrajectory(
      tripId,
      user?.id,
    );
    return {
      success: true,
      assessment,
    };
  }

  /**
   * Passenger files a fare dispute
   */
  @Post('file')
  @HttpCode(HttpStatus.OK)
  async fileDispute(@Body() body: FileDisputeDto, @Req() req: any) {
    const user = this.extractUser(req);
    if (!user) throw new UnauthorizedException('Valid authentication credentials required');

    const result = await this.disputeService.fileDispute(
      user.id || user.sub,
      body,
    );

    return {
      success: true,
      ...result,
      message:
        result.claim.status === 'AUTO_RESOLVED_VOUCHER'
          ? `Fare adjustment auto-approved! KES ${result.claim.awardedVoucherAmount} voucher issued: ${result.claim.voucherCode}`
          : 'Dispute submitted. Queued for Senior Adjudication review.',
    };
  }

  /**
   * Driver submits appeal within 48h
   */
  @Post(':id/appeal')
  submitAppeal(
    @Param('id') id: string,
    @Body() body: DriverAppealDto,
    @Req() req: any,
  ) {
    const user = this.extractUser(req);
    if (!user) throw new UnauthorizedException('Authentication required');

    const claim = this.disputeService.driverSubmitAppeal(
      id,
      user.id || user.sub,
      body,
    );

    return {
      success: true,
      claim,
      message: 'Appeal submitted successfully. Hearing desk notified.',
    };
  }

  /**
   * Admin adjudicates dispute
   */
  @Post(':id/adjudicate')
  adjudicate(
    @Param('id') id: string,
    @Body() body: AdjudicateDisputeDto,
    @Req() req: any,
  ) {
    const user = this.extractUser(req);
    const claim = this.disputeService.adjudicateDispute(
      id,
      user?.id || 'admin_action',
      body,
    );

    return {
      success: true,
      claim,
      message: `Dispute adjudicated: ${claim.status}.`,
    };
  }

  /**
   * Get dispute details
   */
  @Get(':id')
  getDispute(@Param('id') id: string) {
    return {
      success: true,
      claim: this.disputeService.getClaim(id),
    };
  }

  /**
   * List disputes for current user
   */
  @Get('user/:userId')
  listUserDisputes(@Param('userId') userId: string) {
    return {
      success: true,
      claims: this.disputeService.listUserDisputes(userId),
    };
  }

  /**
   * List all disputes for admin panel
   */
  @Get()
  listAll() {
    return {
      success: true,
      claims: this.disputeService.listAllDisputes(),
    };
  }
}
