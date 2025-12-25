import { Controller, Get, Param, Put, Post, Body, Query, HttpCode } from '@nestjs/common';
import { RideService } from './ride.service';

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
  constructor(private readonly rideService: RideService) {}

  @Put(':id/complete')
  completeRide(@Param('id') id: string) {
    return this.rideService.completeRide(id);
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