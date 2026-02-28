import { Controller, Post, Body, Param, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('pending-drivers')
    async getPendingDrivers() {
        return this.userService.getPendingDrivers();
    }

    @Post(':id/promote')
    async promoteToDriver(@Param('id') id: string) {
        try {
            return await this.userService.promoteToDriver(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post(':id/status')
    async updateUserStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.userService.updateUserStatus(id, status);
    }
}
