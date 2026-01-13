import { Controller, Get, Param, Put, Post, Body, Query, HttpCode } from '@nestjs/common';
import { RideService } from './ride.service';

class CreateRideDto {
  passengerId: string;
  pickup: any;
  dropoff: any;
}

class AcceptRideDto {
  driverId: string;
}

class StopActionDto {
  stopIndex: number;
}

class AddStopDto {
  address: string;
}

class RespondToChangeDto {
  response: 'accepted' | 'declined';
}

@Controller('rides')
export class RideController {
  constructor(private readonly rideService: RideService) { }

  @Get('current')
  getCurrentRide(@Query('userId') userId: string, @Query('role') role: string) {
    return this.rideService.getCurrentRide(userId, role);
  }

  @Post()
  createRide(@Body() body: CreateRideDto) {
    return this.rideService.createRide(body.passengerId, body.pickup, body.dropoff);
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
}