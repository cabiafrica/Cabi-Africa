import { Controller, Get, Param, Put, Post, Body, Query, HttpCode } from '@nestjs/common';
import { RideService } from './ride.service';

import { IsString, IsNotEmpty, IsOptional, IsObject, IsNumber, IsEnum } from 'class-validator';

class CreateRideDto {
  @IsString()
  @IsNotEmpty()
  passengerId: string;

  @IsNotEmpty()
  @IsObject()
  pickup: any;

  @IsNotEmpty()
  @IsObject()
  dropoff: any;

  @IsString()
  @IsOptional()
  vehicleType?: string;
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

@Controller('rides')
export class RideController {
  constructor(private readonly rideService: RideService) { }

  @Get('current')
  getCurrentRide(@Query('userId') userId: string, @Query('role') role: string) {
    return this.rideService.getCurrentRide(userId, role);
  }

  @Get('nearby-drivers')
  async getNearbyDrivers(
    @Query('pickupLat') pickupLat: string,
    @Query('pickupLng') pickupLng: string,
    @Query('vehicleType') vehicleType?: string,
    @Query('maxDistanceKm') maxDistanceKm?: string,
  ) {
    const drivers = await this.rideService.matchingService.findNearbyDrivers({
      pickupLat: parseFloat(pickupLat),
      pickupLng: parseFloat(pickupLng),
      vehicleType: vehicleType as any,
      maxDistanceKm: maxDistanceKm ? parseFloat(maxDistanceKm) : 5.0,
    });
    return { success: true, data: drivers };
  }

  @Post()
  createRide(@Body() body: CreateRideDto) {
    return this.rideService.createRide(
      body.passengerId,
      body.pickup,
      body.dropoff,
      body.vehicleType
    );
  }

  @Post(':id/accept')
  acceptRide(@Param('id') id: string, @Body() body: AcceptRideDto) {
    return this.rideService.acceptRide(id, body.driverId);
  }

  @Post(':id/start')
  startRide(@Param('id') id: string) {
    return this.rideService.startRide(id);
  }

  @Post(':id/complete')
  completeRide(@Param('id') id: string) {
    return this.rideService.completeRide(id);
  }

  @Post(':id/reject')
  rejectRide(@Param('id') id: string, @Body('driverId') driverId: string) {
    return this.rideService.rejectRide(id, driverId);
  }

  @Post(':id/confirm-cash')
  confirmCashPayment(@Param('id') id: string, @Body('amount') amount: number) {
    return this.rideService.confirmCashPayment(id, amount);
  }

  @Post(':id/rate')
  ratePassenger(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string
  ) {
    return this.rideService.ratePassenger(id, rating, comment);
  }

  @Post(':id/cancel')
  cancelRide(@Param('id') id: string, @Body('reason') reason: string) {
    return this.rideService.cancelRide(id, reason);
  }

  @Post(':id/arrive-at-stop')
  arriveAtStop(@Param('id') id: string, @Body() body: StopActionDto) {
    return this.rideService.arriveAtStop(id, body.stopIndex);
  }

  @Put(':id/add-stop')
  addStop(@Param('id') id: string, @Body() body: AddStopDto) {
    return this.rideService.addStop(id, body.address);
  }

  @Post(':id/respond-to-change')
  @HttpCode(200)
  respondToChange(@Param('id') id: string, @Body() body: RespondToChangeDto) {
    return this.rideService.respondToChange(id, body.response);
  }

  // This would typically be in a separate AdminRideController with an @UseGuards(AdminGuard)
  @Get('/admin/users/:userId/rides')
  findForUser(
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
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
    @Query('limit') limit = '50'
  ) {
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
    @Query('endDate') endDate?: string
  ) {
    return this.rideService.getRideStatistics(startDate, endDate);
  }
}