import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { DispatchService } from './dispatch-service.service';

@Controller('rides')
export class RideController {
    constructor(private readonly service: DispatchService) { }

    @Post()
    async createRide(@Body() body: any) {
        return await this.service.requestRide(body);
    }

    @Get('current')
    async getCurrentRide(
        @Query('userId') userId: string,
        @Query('role') role: 'PASSENGER' | 'DRIVER',
    ) {
        return this.service.getCurrentRide(userId, role);
    }

    @Get('status/:id')
    async getRideStatus(@Param('id') id: string) {
        return this.service.getRideStatus(id);
    }
}
