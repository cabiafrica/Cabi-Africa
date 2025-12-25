import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PrivacyService } from './privacy.service';

@Controller('privacy')
export class PrivacyController {
    constructor(private readonly privacyService: PrivacyService) { }

    // Privacy Settings
    @Get('settings/:userId')
    getPrivacySettings(@Param('userId') userId: string) {
        return this.privacyService.getPrivacySettings(userId);
    }

    @Put('settings/:userId')
    updatePrivacySettings(@Param('userId') userId: string, @Body() updates: any) {
        return this.privacyService.updatePrivacySettings(userId, updates);
    }

    // Data Export
    @Post('export/:userId')
    requestDataExport(@Param('userId') userId: string) {
        return this.privacyService.requestDataExport(userId);
    }

    @Get('export/:userId/status')
    getDataExportStatus(@Param('userId') userId: string) {
        return this.privacyService.getDataExportStatus(userId);
    }

    // Account Deletion
    @Post('delete-account/:userId')
    requestAccountDeletion(@Param('userId') userId: string, @Body() body: any) {
        return this.privacyService.requestAccountDeletion(userId, body.password);
    }

    @Delete('delete-account/:userId/cancel')
    cancelAccountDeletion(@Param('userId') userId: string) {
        return this.privacyService.cancelAccountDeletion(userId);
    }

    // Marketing Preferences Check
    @Get('marketing/:userId/can-email')
    canSendMarketingEmail(@Param('userId') userId: string) {
        return this.privacyService.canSendMarketingEmail(userId);
    }

    @Get('marketing/:userId/can-push')
    canSendMarketingPush(@Param('userId') userId: string) {
        return this.privacyService.canSendMarketingPush(userId);
    }
}
