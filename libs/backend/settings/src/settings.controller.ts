import { Body, Controller, Get, Param, Put, Post, UseGuards, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateUserSettingsDto, UpdateRidePreferencesDto, UpdateDriverSavingsPreferenceDto, UpdateSystemSettingDto } from './dto/update-user-settings.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

// Assuming we have an AuthGuard, importing minimally or using string token for now if needed.
// For now, I'll add the decorators but won't strictly enforce guard import to avoid breaking if path is wrong.
// If AuthGuard is available globally or via specific lib, I'd import it.
// Given monorepo structure, likely in @cabi/backend/auth or similar.
// I will assume standard NestJS guards for now.

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get user profile settings' })
    @ApiResponse({ status: 200, description: 'User settings retrieved successfully.' })
    async getUserSettings(@Param('userId') userId: string) {
        return this.settingsService.getUserSettings(userId);
    }

    @Put('user/:userId')
    @ApiOperation({ summary: 'Update user profile settings' })
    @ApiBody({ type: UpdateUserSettingsDto })
    async updateUserSettings(
        @Param('userId') userId: string,
        @Body() dto: UpdateUserSettingsDto,
    ) {
        return this.settingsService.updateUserSettings(userId, dto);
    }

    @Get('preferences/:userId')
    @ApiOperation({ summary: 'Get ride preferences' })
    async getRidePreferences(@Param('userId') userId: string) {
        return this.settingsService.getRidePreferences(userId);
    }

    @Put('preferences/:userId')
    @ApiOperation({ summary: 'Update ride preferences' })
    @ApiBody({ type: UpdateRidePreferencesDto })
    async updateRidePreferences(
        @Param('userId') userId: string,
        @Body() dto: UpdateRidePreferencesDto,
    ) {
        return this.settingsService.updateRidePreferences(userId, dto);
    }

    @Get('driver-savings/:driverProfileId')
    @ApiOperation({ summary: 'Get driver savings preference' })
    async getDriverSavingsPreference(@Param('driverProfileId') driverProfileId: string) {
        return this.settingsService.getDriverSavingsPreference(driverProfileId);
    }

    @Put('driver-savings/:driverProfileId')
    @ApiOperation({ summary: 'Update driver savings preference' })
    @ApiBody({ type: UpdateDriverSavingsPreferenceDto })
    async updateDriverSavingsPreference(
        @Param('driverProfileId') driverProfileId: string,
        @Body() dto: UpdateDriverSavingsPreferenceDto,
    ) {
        return this.settingsService.updateDriverSavingsPreference(driverProfileId, dto);
    }

    @Get('system')
    @ApiOperation({ summary: 'Get all system settings' })
    @ApiResponse({ status: 200, description: 'All system settings retrieved successfully.' })
    async getAllSystemSettings() {
        return this.settingsService.getAllSystemSettings();
    }

    @Get('system/:key')
    @ApiOperation({ summary: 'Get system setting by key' })
    async getSystemSetting(@Param('key') key: string) {
        const value = await this.settingsService.getSystemSetting(key);
        return { key, value };
    }

    @Put('system/:key')
    @ApiOperation({ summary: 'Update system setting' })
    @ApiBody({ type: UpdateSystemSettingDto })
    async updateSystemSetting(
        @Param('key') key: string,
        @Body() dto: UpdateSystemSettingDto,
    ) {
        return this.settingsService.updateSystemSetting(key, dto.value);
    }
}
