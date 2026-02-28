import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DriverLeadsService } from './driver-leads.service';

@ApiTags('User Profile')
@Controller('api/users')
export class UserProfileController {
    constructor(private readonly driverLeadsService: DriverLeadsService) { }

    @Get(':userId/profile')
    @ApiOperation({ summary: 'Get user profile' })
    async getProfile(@Param('userId') userId: string) {
        // Reusing the service logic or prisma directly
        // For now, let's just return what we have in the service context
        return this.driverLeadsService.updateUserProfile(userId, {}); // Mocking a call to get info if no dedicated get method
    }

    @Put(':userId/profile')
    @ApiOperation({ summary: 'Update user profile' })
    async updateProfile(@Param('userId') userId: string, @Body() data: any) {
        return this.driverLeadsService.updateUserProfile(userId, data);
    }

    @Put(':userId/privacy')
    @ApiOperation({ summary: 'Update privacy settings' })
    async updatePrivacy(@Param('userId') userId: string, @Body() settings: any) {
        return this.driverLeadsService.updatePrivacySettings(userId, settings);
    }

    @Post(':userId/2fa/enable')
    @ApiOperation({ summary: 'Enable 2FA' })
    async enable2FA(@Param('userId') userId: string) {
        return this.driverLeadsService.enable2FA(userId);
    }

    @Post(':userId/2fa/disable')
    @ApiOperation({ summary: 'Disable 2FA' })
    async disable2FA(@Param('userId') userId: string) {
        return this.driverLeadsService.disable2FA(userId);
    }
}
