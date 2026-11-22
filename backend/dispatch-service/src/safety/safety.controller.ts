import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Query,
  Req,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { SafetyService, SosSignalDto } from './safety.service';

@Controller('safety')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) { }

  private extractUser(req: any): any {
    if (req?.user) return req.user;
    const internalKey = process.env.INTERNAL_API_KEY;
    const providedKey = req?.headers?.['x-internal-api-key'];
    if (internalKey && providedKey && typeof providedKey === 'string') {
      try {
        const a = Buffer.from(internalKey);
        const b = Buffer.from(providedKey);
        if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
          return { id: 'system-internal', role: 'SUPER_ADMIN', permissions: ['SUPER_ADMIN'] };
        }
      } catch {
        // continue
      }
    }
    let user = req?.user;
    if (!user && req?.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      const secret =
        process.env.JWT_SECRET ||
        (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
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

  private assertAdmin(req: any): any {
    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    const role = (user.role || '').toUpperCase();
    const isAdmin =
      ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role) ||
      (Array.isArray(user.permissions) &&
        (user.permissions.includes('ADMIN') ||
          user.permissions.includes('SUPER_ADMIN') ||
          user.permissions.includes('DISPATCHER')));
    if (!isAdmin) {
      throw new ForbiddenException('Administrative privilege required');
    }
    return user;
  }

  private assertAuthenticated(req: any): any {
    const user = this.extractUser(req);
    if (!user || (!user.id && !user.userId && !user.sub)) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }

  /**
   * Primary Emergency Distress Signal Trigger (Standard & Alias endpoints)
   */
  @Post('sos')
  triggerSos(@Body() body: any, @Req() req: any) {
    return this.handleEmergencyTrigger(body, req);
  }

  @Post('alert')
  triggerAlert(@Body() body: any, @Req() req: any) {
    return this.handleEmergencyTrigger(body, req);
  }

  private handleEmergencyTrigger(body: any, req: any) {
    const user = this.assertAuthenticated(req);
    const callerId = user.id || user.userId || user.sub;
    const callerRole = user.role || 'PASSENGER';

    // Normalize signal DTO from different client conventions
    const lat = body.location?.lat ?? body.lat ?? body.latitude;
    const lon = body.location?.lon ?? body.location?.lng ?? body.lon ?? body.lng ?? body.longitude;

    if (lat === undefined || lon === undefined || isNaN(Number(lat)) || isNaN(Number(lon))) {
      throw new BadRequestException('Valid GPS coordinates (lat, lon/lng) are required');
    }

    const signal: SosSignalDto = {
      tripId: body.tripId || 'UNASSIGNED',
      location: { lat: Number(lat), lon: Number(lon) },
      emergencyContacts: Array.isArray(body.emergencyContacts) ? body.emergencyContacts : undefined,
    };

    return this.safetyService.handleSosSignal(callerId, callerRole, signal);
  }

  /**
   * Lists SOS incidents (Admins see all; regular users see their own)
   */
  @Get('alerts')
  getAlerts(@Query('status') status: string, @Req() req: any) {
    const user = this.assertAuthenticated(req);
    const role = (user.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role);

    if (isAdmin) {
      return this.safetyService.getAlerts({ status });
    }

    // For non-admin, filter by caller identity
    const callerId = user.id || user.userId || user.sub;
    return this.safetyService.getAlerts({ status }).then((alerts) =>
      alerts.filter((a: any) => a.driverUserId === callerId || a.passengerId === callerId || a.registeredById === callerId)
    );
  }

  /**
   * Retrieves single incident details
   */
  @Get('alerts/:id')
  async getAlertDetails(@Param('id') id: string, @Req() req: any) {
    this.assertAuthenticated(req);
    return this.safetyService.getAlertById(id);
  }

  /**
   * Operations dispatcher acknowledges an emergency incident
   */
  @Put('alerts/:id/acknowledge')
  acknowledgeAlert(@Param('id') id: string, @Req() req: any) {
    const admin = this.assertAdmin(req);
    const adminId = admin.id || admin.userId || admin.sub || 'dispatcher';
    return this.safetyService.acknowledgeAlert(id, adminId);
  }

  /**
   * Resolves an emergency incident with outcome adjudication
   */
  @Post('resolve-sos')
  async resolveSosLegacy(
    @Body() body: { incidentId?: string; userId?: string; isMisuse?: boolean; notes?: string },
    @Req() req: any
  ) {
    const admin = this.assertAdmin(req);
    const adminId = admin.id || admin.userId || admin.sub || 'admin';

    let targetId = body.incidentId;
    if (!targetId && body.userId) {
      // Find open incident for user
      const alerts = await this.safetyService.getAlerts({ status: 'OPEN' });
      const match = alerts.find(
        (a: any) => a.driverId === body.userId || a.passengerId === body.userId || a.driverName === body.userId
      );
      if (!match) {
        throw new NotFoundException(`No open emergency SOS incident found for user ${body.userId}`);
      }
      targetId = match.id;
    }

    if (!targetId) {
      throw new BadRequestException('incidentId or userId is required to resolve incident');
    }

    return this.safetyService.resolveSosIncident(
      targetId,
      adminId,
      body.isMisuse ?? false,
      body.notes || 'Resolved via Safety Console'
    );
  }

  @Post('alerts/:id/resolve')
  resolveAlertDirect(
    @Param('id') id: string,
    @Body() body: { isMisuse: boolean; notes: string },
    @Req() req: any
  ) {
    const admin = this.assertAdmin(req);
    const adminId = admin.id || admin.userId || admin.sub || 'admin';
    return this.safetyService.resolveSosIncident(
      id,
      adminId,
      body.isMisuse ?? false,
      body.notes || 'Resolved via Safety Console'
    );
  }

  /**
   * Good Samaritan Captain responds to proximity distress call
   */
  @Post('alerts/:id/respond')
  respondAsGoodSamaritan(@Param('id') id: string, @Req() req: any) {
    const user = this.assertAuthenticated(req);
    const captainUserId = user.id || user.userId || user.sub;
    const captainName = user.fullName || user.name || 'Fellow Captain';
    return this.safetyService.respondAsGoodSamaritan(id, captainUserId, captainName);
  }

  /**
   * Distressed Captain requests distress fee pardon
   */
  @Post('alerts/:id/pardon-request')
  requestDistressPardon(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any
  ) {
    const user = this.assertAuthenticated(req);
    const driverUserId = user.id || user.userId || user.sub;
    if (!reason?.trim()) {
      throw new BadRequestException('Pardon justification reason is required');
    }
    return this.safetyService.requestDistressPardon(id, driverUserId, reason);
  }

  /**
   * Senior Official reviews and adjudicates distress fee pardon
   */
  @Post('alerts/:id/pardon')
  pardonDistressFee(
    @Param('id') id: string,
    @Body() body: { approved: boolean; notes: string },
    @Req() req: any
  ) {
    const admin = this.assertAdmin(req);
    const officialId = admin.id || admin.userId || admin.sub;
    const officialName = admin.fullName || admin.username || 'Senior Cabi Distress Official';
    if (!body.notes?.trim()) {
      throw new BadRequestException('Pardon adjudication notes are required');
    }
    return this.safetyService.pardonDistressFee(id, {
      officialId,
      officialName,
      approved: body.approved,
      notes: body.notes,
    });
  }

  /**
   * Passenger Emergency Contacts Synchronization Endpoints
   */
  @Get('emergency-contacts')
  getEmergencyContacts(@Req() req: any) {
    const user = this.assertAuthenticated(req);
    const userId = user.id || user.userId || user.sub;
    return this.safetyService.getEmergencyContacts(userId);
  }

  @Post('emergency-contacts')
  saveEmergencyContacts(
    @Body('contacts') contacts: Array<{ id?: string; name: string; phone: string }>,
    @Req() req: any
  ) {
    const user = this.assertAuthenticated(req);
    const userId = user.id || user.userId || user.sub;
    if (!Array.isArray(contacts)) {
      throw new BadRequestException('contacts must be an array of emergency contacts');
    }
    return this.safetyService.saveEmergencyContacts(userId, contacts);
  }
}
