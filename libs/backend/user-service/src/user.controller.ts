import { Controller, Post, Put, Patch, Body, Param, Get, Req, ForbiddenException, UnauthorizedException, HttpException, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    private isAdminUser(user: any): boolean {
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        return perms.some((p) => p.startsWith('USER_MANAGEMENT_') || p.startsWith('DRIVER_APPROVAL_') || p === 'SUPER_ADMIN');
    }

    private assertAdmin(req: any): void {
        const user = req?.user;
        if (!user) {
            throw new UnauthorizedException('Authentication required.');
        }
        if (!this.isAdminUser(user)) {
            throw new ForbiddenException('Admin privileges required for this action.');
        }
    }

    private assertSelfOrAdmin(req: any, targetUserId: string): void {
        const user = req?.user;
        if (!user) {
            throw new UnauthorizedException('Authentication required.');
        }
        const callerId = user.id || user.sub || user.userId;
        if (callerId !== targetUserId && !this.isAdminUser(user)) {
            throw new ForbiddenException('You are not authorized to access or modify another user profile.');
        }
    }

    @Get('pending-drivers')
    async getPendingDrivers(@Req() req: any) {
        this.assertAdmin(req);
        return this.userService.getPendingDrivers();
    }

    @Get(':id/profile')
    async getProfile(@Req() req: any, @Param('id') id: string) {
        this.assertSelfOrAdmin(req, id);
        return this.userService.getMe(id);
    }

    @Put(':id/profile')
    async updateProfile(@Req() req: any, @Param('id') id: string, @Body() data: any) {
        this.assertSelfOrAdmin(req, id);
        return this.userService.updateProfile(id, data);
    }

    @Patch(':id/profile')
    async patchProfile(@Req() req: any, @Param('id') id: string, @Body() data: any) {
        this.assertSelfOrAdmin(req, id);
        return this.userService.updateProfile(id, data);
    }

    @Post(':id/profile-picture')
    @UseInterceptors(FileInterceptor('photo'))
    async uploadProfilePicture(
        @Req() req: any,
        @Param('id') id: string,
        @UploadedFile() file: any,
        @Body() body: any,
    ) {
        this.assertSelfOrAdmin(req, id);
        const photoUrl = body?.photoUrl || body?.passportPhotoUrl || body?.profilePicture;
        return this.userService.uploadProfilePicture(id, file, photoUrl);
    }

    @Post(':id/promote')
    async promoteToDriver(@Req() req: any, @Param('id') id: string) {
        this.assertAdmin(req);
        try {
            return await this.userService.promoteToDriver(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post(':id/status')
    async updateUserStatus(@Req() req: any, @Param('id') id: string, @Body('status') status: string) {
        this.assertAdmin(req);
        return this.userService.updateUserStatus(id, status);
    }

    @Post(':id/verify-biometric')
    async verifyBiometric(@Req() req: any, @Param('id') id: string) {
        this.assertSelfOrAdmin(req, id);
        return this.userService.verifyBiometric(id);
    }
}
