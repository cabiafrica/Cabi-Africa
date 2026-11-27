import { Controller, Get, Param, Put, Post, Body, Query, HttpCode, Logger, BadRequestException, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { RideService } from './ride.service';
import { PricingService } from '../pricing/pricing.service';

import { IsString, IsNotEmpty, IsOptional, IsObject, IsNumber, IsEnum } from 'class-validator';

class CreateRideDto {
  @IsString()
  @IsNotEmpty()
  passengerId: string;

  @IsNotEmpty()
  @IsObject()
  pickupLocation: any;

  @IsNotEmpty()
  @IsObject()
  dropoffLocation: any;

  @IsString()
  @IsOptional()
  vehicleType?: string;

  @IsNumber()
  @IsNotEmpty()
  fare: number;

  @IsOptional()
  isVerifiedPassenger?: boolean;

  @IsString()
  @IsOptional()
  verificationMethod?: string;

  @IsString()
  @IsOptional()
  preferredPublicName?: string;
}

class AcceptRideDto {
  @IsString()
  @IsNotEmpty()
  driverId: string;
}

class StopActionDto {
  @IsNumber()
  stopIndex: number;
}

class AddStopDto {
  @IsString()
  @IsNotEmpty()
  address: string;
}

class RespondToChangeDto {
  @IsEnum(['accepted', 'declined'])
  response: 'accepted' | 'declined';
}

class StartRideDto {
  @IsString()
  @IsOptional()
  tripCode?: string;
}

@Controller('rides')
export class RideController {
  private readonly logger = new Logger(RideController.name);

  constructor(
    private readonly rideService: RideService,
    private readonly pricingService: PricingService,
  ) { }

  @Post('estimate')
  async estimateFare(@Body() body: any) {
    const pickup = body.pickup;
    const destination = body.destination;
    const pickupCoords = body.pickupCoords;
    const dropoffCoords = body.dropoffCoords;
    const includeTrajectory = body.includeTrajectory;

    if (!pickup && !pickupCoords) {
      throw new BadRequestException('Pickup location is required');
    }
    if (!destination && !dropoffCoords) {
      throw new BadRequestException('Destination location is required');
    }

    const start = pickupCoords && Number.isFinite(Number(pickupCoords.lat))
      ? { lat: Number(pickupCoords.lat), lng: Number(pickupCoords.lng) }
      : { lat: -1.286389, lng: 36.817223 };
    const end = dropoffCoords && Number.isFinite(Number(dropoffCoords.lat))
      ? { lat: Number(dropoffCoords.lat), lng: Number(dropoffCoords.lng) }
      : { lat: -1.2655, lng: 36.8048 };

    // Calculate distance
    const R = 6371;
    const dLat = ((end.lat - start.lat) * Math.PI) / 180;
    const dLng = ((end.lng - start.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((start.lat * Math.PI) / 180) *
        Math.cos((end.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const rawKm = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Edge Case 1: Geofence validation (Coverage bounds)
    const inBounds =
      start.lat >= -5 && start.lat <= 5 && start.lng >= 28 && start.lng <= 42 &&
      end.lat >= -5 && end.lat <= 5 && end.lng >= 28 && end.lng <= 42;

    if (!inBounds || rawKm > 200) {
      throw new BadRequestException('OUT_OF_SERVICE_AREA: Selected location is currently outside CABI Africa direct coverage area.');
    }

    const distanceKm = Number(Math.max(2.0, rawKm * 1.25).toFixed(1));
    const durationMin = Math.max(5, Math.round(distanceKm * 2.5));

    const categories = await this.pricingService.getCategoriesPricing();
    const estimates = categories
      .filter((c) => c.isActive)
      .map((cat, idx) => {
        const rawPrice = Math.max(
          cat.minimumFare,
          cat.baseFare + distanceKm * cat.perKmRate + durationMin * cat.perMinuteRate,
        );
        const step = cat.roundingStep > 0 ? cat.roundingStep : 1;
        const roundedPrice = Math.round(rawPrice / step) * step;
        return {
          id: cat.category.toLowerCase(),
          categoryKey: cat.category,
          name: cat.displayName,
          price: roundedPrice,
          eta: Math.max(3, 3 + idx * 2),
          icon: cat.category === 'BODA' ? '🏍️' : cat.category === 'XL' ? '🚙' : cat.category === 'PREMIUM' ? '✨' : '🚗',
          colorCode: cat.category === 'BODA' ? '#D97706' : cat.category === 'BASIC' ? '#0D9488' : cat.category === 'PREMIUM' ? '#D4AF37' : '#2563EB',
          capacity: cat.category === 'BODA' ? '1 Passenger' : cat.category === 'XL' ? '6 Passengers' : '4 Passengers',
          tag: cat.category === 'BODA' ? 'FASTEST' : cat.category === 'PREMIUM' ? 'LUXURY' : cat.category === 'XL' ? 'DELEGATION' : 'POPULAR',
          description: cat.description,
        };
      });

    if (includeTrajectory) {
      return {
        estimates,
        trajectory: {
          distanceKm,
          durationMin,
          pickupCoords: start,
          dropoffCoords: end,
          summary: 'Fastest Direct Route',
        },
      };
    }

    return estimates;
  }

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

  private assertAuthenticated(req: any): any {
    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }

  private assertAdmin(req: any): void {
    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    const role = (user.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role) ||
      (Array.isArray(user.permissions) && (user.permissions.includes('ADMIN') || user.permissions.includes('SUPER_ADMIN') || user.permissions.includes('DISPATCHER')));
    if (!isAdmin) {
      throw new ForbiddenException('Administrative privilege required');
    }
  }

  private assertSelfOrAdmin(req: any, targetUserId?: string): void {
    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    const role = (user.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role) ||
      (Array.isArray(user.permissions) && (user.permissions.includes('ADMIN') || user.permissions.includes('SUPER_ADMIN') || user.permissions.includes('DISPATCHER')));
    if (isAdmin) return;

    const callerId = user.id || user.userId || user.sub;
    if (targetUserId && callerId !== targetUserId) {
      throw new ForbiddenException('Access denied: Cannot act on behalf of another user');
    }
  }

  @Get('current')
  getCurrentRide(
    @Query('userId') userId: string,
    @Query('role') role: string,
    @Req() req: any,
  ) {
    this.assertSelfOrAdmin(req, userId);
    return this.rideService.getCurrentRide(userId, role);
  }

  @Get('nearby-drivers')
  async getNearbyDrivers(
    @Query('pickupLat') pickupLat: string,
    @Query('pickupLng') pickupLng: string,
    @Query('vehicleType') vehicleType?: string,
    @Query('maxDistanceKm') maxDistanceKm?: string,
  ) {
    const lat = parseFloat(pickupLat);
    const lng = parseFloat(pickupLng);

    if (isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException('Valid pickupLat and pickupLng query parameters are required.');
    }

    try {
      const drivers = await this.rideService.matchingService.findNearbyDrivers({
        pickupLat: lat,
        pickupLng: lng,
        vehicleType: vehicleType as any,
        maxDistanceKm: maxDistanceKm ? parseFloat(maxDistanceKm) : 5.0,
      });
      return { success: true, data: drivers };
    } catch (error: any) {
      this.logger.error(`Error finding nearby drivers: ${error.message}`, error.stack);
      return { success: false, data: [], error: error.message };
    }
  }

  @Get('demand-hotspots')
  getDemandHotspots(@Req() req: any) {
    this.assertAuthenticated(req);
    return this.rideService.getDemandHotspots();
  }

  @Post()
  createRide(@Body() body: CreateRideDto, @Req() req: any) {
    this.assertSelfOrAdmin(req, body.passengerId);
    return this.rideService.createRide(
      body.passengerId,
      body.pickupLocation,
      body.dropoffLocation,
      body.fare,
      body.vehicleType,
      body.isVerifiedPassenger,
      body.verificationMethod
    );
  }

  @Post(':id/accept')
  acceptRide(@Param('id') id: string, @Body() body: AcceptRideDto, @Req() req: any) {
    this.assertSelfOrAdmin(req, body.driverId);
    return this.rideService.acceptRide(id, body.driverId);
  }

  @Post(':id/arrive')
  arriveAtPickup(
    @Param('id') id: string,
    @Body() body?: { lat?: number; lng?: number; accuracyMeters?: number },
    @Req() req?: any
  ) {
    this.assertAuthenticated(req);
    const coords =
      body?.lat !== undefined && body?.lng !== undefined
        ? { lat: Number(body.lat), lng: Number(body.lng), accuracyMeters: body.accuracyMeters ? Number(body.accuracyMeters) : undefined }
        : undefined;
    return this.rideService.arriveDriver(id, coords);
  }

  @Post(':id/start')
  startRide(@Param('id') id: string, @Body() body?: StartRideDto, @Req() req?: any) {
    this.assertAuthenticated(req);
    return this.rideService.startRide(id, body?.tripCode);
  }

  @Post(':id/complete')
  completeRide(
    @Param('id') id: string,
    @Body() body?: { distanceKm?: number; durationMinutes?: number },
    @Req() req?: any
  ) {
    this.assertAuthenticated(req);
    return this.rideService.completeRide(id, body);
  }

  @Post(':id/receipt')
  sendReceipts(@Param('id') id: string, @Req() req: any) {
    this.assertAuthenticated(req);
    return this.rideService.sendRideReceipts(id);
  }

  @Post(':id/reject')
  rejectRide(
    @Param('id') id: string,
    @Body('driverId') driverId: string,
    @Req() req: any
  ) {
    this.assertSelfOrAdmin(req, driverId);
    return this.rideService.rejectRide(id, driverId);
  }

  @Post(':id/pass')
  passRide(
    @Param('id') id: string,
    @Body('driverId') driverId: string,
    @Body('reason') reason?: string,
    @Req() req?: any
  ) {
    this.assertSelfOrAdmin(req, driverId);
    return this.rideService.passRide(id, driverId, reason);
  }

  @Post('drivers/:id/preferences')
  updateDriverPreferences(
    @Param('id') id: string,
    @Body() preferences: { preferredDestination?: any; excludedZones?: any[] },
    @Req() req: any
  ) {
    this.assertSelfOrAdmin(req, id);
    return this.rideService.updateDriverPreferences(id, preferences);
  }

  @Post(':id/confirm-cash')
  confirmCashPayment(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Req() req: any
  ) {
    this.assertAuthenticated(req);
    return this.rideService.confirmCashPayment(id, amount);
  }

  @Post(':id/rate')
  rateRide(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
    @Body('role') role?: 'PASSENGER' | 'DRIVER',
    @Body('raterId') raterId?: string,
    @Req() req?: any
  ) {
    if (raterId) {
      this.assertSelfOrAdmin(req, raterId);
    } else {
      this.assertAuthenticated(req);
    }
    return this.rideService.submitRating(id, rating, comment, role, raterId);
  }

  @Post(':id/cancel')
  cancelRide(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any
  ) {
    this.assertAuthenticated(req);
    return this.rideService.cancelRide(id, reason);
  }

  @Post(':id/arrive-at-stop')
  arriveAtStop(
    @Param('id') id: string,
    @Body() body: StopActionDto,
    @Req() req: any
  ) {
    this.assertAuthenticated(req);
    return this.rideService.arriveAtStop(id, body.stopIndex);
  }

  @Put(':id/add-stop')
  addStop(
    @Param('id') id: string,
    @Body() body: AddStopDto,
    @Req() req: any
  ) {
    this.assertAuthenticated(req);
    return this.rideService.addStop(id, body.address);
  }

  @Post(':id/respond-to-change')
  @HttpCode(200)
  respondToChange(
    @Param('id') id: string,
    @Body() body: RespondToChangeDto,
    @Req() req: any
  ) {
    this.assertAuthenticated(req);
    return this.rideService.respondToChange(id, body.response);
  }

  @Get('back-to-back/:driverId')
  findBackToBackRide(
    @Param('driverId') driverId: string,
    @Req() req: any
  ) {
    this.assertSelfOrAdmin(req, driverId);
    return this.rideService.findAndOfferBackToBackRide(driverId);
  }

  // Admin endpoint: Find rides for user
  @Get('/admin/users/:userId/rides')
  findForUser(
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req?: any
  ) {
    this.assertSelfOrAdmin(req, userId);
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.rideService.findForUser(userId, { page: pageNumber, limit: limitNumber });
  }

  // Admin endpoint for Job Activities Dashboard
  @Get('/admin/all')
  getAllRidesForAdmin(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('date') date?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Req() req?: any
  ) {
    this.assertAdmin(req);
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.rideService.getAllRidesForAdmin({
      status,
      search,
      date,
      page: pageNumber,
      limit: limitNumber
    });
  }

  // Admin endpoint to get ride statistics
  @Get('/admin/statistics')
  getRideStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any
  ) {
    this.assertAdmin(req);
    return this.rideService.getRideStatistics(startDate, endDate);
  }

  // Admin endpoint to get wait time fee configuration
  @Get('/admin/wait-time-config')
  getWaitTimeConfig(@Req() req: any) {
    this.assertAuthenticated(req);
    return this.rideService.getWaitTimeConfig();
  }

  // Admin endpoint to update wait time fee configuration
  @Put('/admin/wait-time-config')
  updateWaitTimeConfig(
    @Body('feePerMinute') feePerMinute: number,
    @Body('gracePeriodMinutes') gracePeriodMinutes: number,
    @Req() req: any
  ) {
    this.assertAdmin(req);
    return this.rideService.updateWaitTimeConfig(feePerMinute, gracePeriodMinutes);
  }
}