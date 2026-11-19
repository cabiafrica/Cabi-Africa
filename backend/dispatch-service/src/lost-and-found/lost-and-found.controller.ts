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
import { LostAndFoundService } from './lost-and-found.service';
import {
  ReportLostItemDto,
  DriverConfirmCustodyDto,
  VerifyHandoverDto,
} from './lost-and-found.types';

@Controller('lost-and-found')
export class LostAndFoundController {
  constructor(private readonly lostAndFoundService: LostAndFoundService) {}

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
   * Driver App Legacy / Common POST endpoint compatibility
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleDriverOfficeDropoff(
    @Body()
    body: {
      description: string;
      reporterRole?: string;
      tripCode: string;
      droppedAtOffice?: boolean;
    },
    @Req() req: any,
  ) {
    const user = this.extractUser(req);
    // Find or create incident for this trip
    let incident = this.lostAndFoundService.getIncidentByTrip(body.tripCode);
    if (!incident) {
      incident = await this.lostAndFoundService.reportLostItem(user?.id || 'driver-reported', {
        tripId: body.tripCode,
        category: 'OTHER',
        description: body.description || 'Driver turned in left property',
      });
    }

    const updated = await this.lostAndFoundService.driverConfirmCustody(
      incident.id,
      user?.id || 'driver_custody',
      {
        itemFound: true,
        droppedAtOffice: body.droppedAtOffice ?? true,
        officeLocation: 'Cabi Partner Hub (Westlands HQ)',
        driverNotes: body.description,
      },
    );

    return {
      success: true,
      incident: updated,
      message: 'Item recorded! Passenger notified to collect with Handover PIN.',
    };
  }

  /**
   * Passenger reports a lost item
   */
  @Post('report')
  async reportLostItem(@Body() body: ReportLostItemDto, @Req() req: any) {
    const user = this.extractUser(req);
    if (!user) throw new UnauthorizedException('Valid authentication credentials required');

    const incident = await this.lostAndFoundService.reportLostItem(
      user.id || user.sub,
      body,
    );

    return {
      success: true,
      incident,
      message: 'Lost item report registered with Police OB Number. Driver notified.',
    };
  }

  /**
   * Driver confirms finding item or reports office drop-off
   */
  @Post(':id/driver-confirm')
  async confirmCustody(
    @Param('id') id: string,
    @Body() body: DriverConfirmCustodyDto,
    @Req() req: any,
  ) {
    const user = this.extractUser(req);
    const incident = await this.lostAndFoundService.driverConfirmCustody(
      id,
      user?.id || 'driver_action',
      body,
    );

    return {
      success: true,
      incident,
      message: body.itemFound ? 'Custody confirmed. Passenger alerted.' : 'Item marked not found.',
    };
  }

  /**
   * Passenger adds an extra voluntary reward tip held in escrow
   */
  @Post(':id/escrow-reward')
  escrowReward(@Param('id') id: string, @Body() body: { amount: number }) {
    if (!body?.amount || body.amount <= 0) {
      throw new BadRequestException('Valid tip amount required');
    }

    const incident = this.lostAndFoundService.escrowVoluntaryReward(id, body.amount);
    return {
      success: true,
      incident,
      message: `Voluntary tip of KES ${body.amount} escrowed. Driver notified.`,
    };
  }

  /**
   * Driver submits 4-digit Handover PIN + photo proof to release return funds
   */
  @Post(':id/verify-handover')
  async verifyHandover(
    @Param('id') id: string,
    @Body() body: VerifyHandoverDto,
    @Req() req: any,
  ) {
    const user = this.extractUser(req);
    const result = await this.lostAndFoundService.verifyHandoverAndReleaseFunds(
      id,
      user?.id || 'driver_handover',
      body,
    );

    return {
      success: true,
      ...result,
      message: `Handover verified! KES ${result.disbursedAmount} credited to driver wallet. Case resolved.`,
    };
  }

  /**
   * Fetch incident details
   */
  @Get(':id')
  getIncident(@Param('id') id: string) {
    return {
      success: true,
      incident: this.lostAndFoundService.getIncident(id),
    };
  }

  /**
   * Fetch incident by Trip ID
   */
  @Get('trip/:tripId')
  getIncidentByTrip(@Param('tripId') tripId: string) {
    const incident = this.lostAndFoundService.getIncidentByTrip(tripId);
    return {
      success: true,
      incident: incident || null,
    };
  }

  /**
   * List all incidents (for admin/dispatch overview)
   */
  @Get()
  listIncidents() {
    return {
      success: true,
      incidents: this.lostAndFoundService.listIncidents(),
    };
  }
}
