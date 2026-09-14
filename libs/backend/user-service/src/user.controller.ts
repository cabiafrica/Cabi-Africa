import { Controller, Post, Put, Patch, Body, Param, Get, Query, HttpException, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('pending-drivers')
    async getPendingDrivers() {
        return this.userService.getPendingDrivers();
    }

    @Get(':id/profile')
    async getProfile(@Param('id') id: string) {
        return this.userService.getMe(id);
    }

    @Put(':id/profile')
    async updateProfile(@Param('id') id: string, @Body() data: any) {
        return this.userService.updateProfile(id, data);
    }

    @Patch(':id/profile')
    async patchProfile(@Param('id') id: string, @Body() data: any) {
        return this.userService.updateProfile(id, data);
    }

    @Post(':id/profile-picture')
    @UseInterceptors(FileInterceptor('photo'))
    async uploadProfilePicture(
        @Param('id') id: string,
        @UploadedFile() file: any,
        @Body() body: any,
    ) {
        const photoUrl = body?.photoUrl || body?.passportPhotoUrl || body?.profilePicture;
        return this.userService.uploadProfilePicture(id, file, photoUrl);
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

    @Post(':id/verify-biometric')
    async verifyBiometric(@Param('id') id: string) {
        return this.userService.verifyBiometric(id);
    }
}
