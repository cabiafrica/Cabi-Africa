import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DispatchService } from './dispatch.service';

@Controller('dispatch')
export class DispatchController {
    constructor(private readonly dispatchService: DispatchService) { }

    @Get('metrics')
    async getMetrics() {
        return this.dispatchService.getDashboardMetrics();
    }

    @Get('rides')
    async getRides() {
        return this.dispatchService.getActiveRides();
    }

    @Get('drivers')
    async getDrivers() {
        return this.dispatchService.getDispatchDrivers();
    }

    @Post('rides')
    async createRide(@Body() body: any) {
        return this.dispatchService.createRide(body);
    }

    @Post('rides/:id/assign')
    async assignDriver(
        @Param('id') rideId: string,
        @Body('driverId') driverId: string,
    ) {
        return this.dispatchService.assignDriver(rideId, driverId);
    }

    @Get('drivers/:driverId/status')
    async getDriverStatus(@Param('driverId') driverId: string) {
        return this.dispatchService.getDriverStatus(driverId);
    }

    @Post('drivers/:driverId/toggle-status')
    async toggleDriverStatus(
        @Param('driverId') driverId: string,
        @Body('isOnline') isOnline: boolean,
    ) {
        return this.dispatchService.updateDriverStatus(driverId, isOnline);
    }

    @Post('drivers/:driverId/location')
    async updateDriverLocation(
        @Param('driverId') driverId: string,
        @Body() location: { lat: number; lng: number },
    ) {
        return this.dispatchService.updateDriverLocation(driverId, location);
    }

    @Get('rides/current')
    async getCurrentRide(
        @Query('userId') userId: string,
        @Query('role') role: 'PASSENGER' | 'DRIVER',
    ) {
        return this.dispatchService.getCurrentRide(userId, role);
    }
}
