import {
    Body,
    Controller,
    Get,
    Param,
    Put,
    Req,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SettingsService } from './settings.service';
import { UpdateUserSettingsDto, UpdateRidePreferencesDto, UpdateDriverSavingsPreferenceDto, UpdateSystemSettingDto } from './dto/update-user-settings.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    private extractUser(req: any): any {
        if (req?.user) return req.user;
        const authHeader = req?.headers?.authorization;
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7).trim();
            const secret =
                process.env.JWT_SECRET ||
                process.env.SUPABASE_JWT_SECRET ||
                (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
            if (secret) {
                try {
                    return jwt.verify(token, secret) as any;
                } catch {
                    return null;
                }
            }
        }
        return null;
    }

    private assertAdmin(req: any): void {
        const user = this.extractUser(req);
        if (!user) throw new UnauthorizedException('Authentication required.');
        const role = String(user.role || '').toUpperCase();
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Administrator privileges required.');
        }
    }

    private assertSelfOrAdmin(req: any, targetId: string): void {
        const user = this.extractUser(req);
        if (!user) throw new UnauthorizedException('Authentication required.');
        const role = String(user.role || '').toUpperCase();
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') return;
        const callerId = String(user.sub || user.id || user.userId || '');
        const callerDriverId = String(user.driverProfile?.id || user.driverProfileId || '');
        if (callerId !== String(targetId) && callerDriverId !== String(targetId)) {
            throw new ForbiddenException('Access denied: Cannot access another user\'s settings.');
        }
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get user profile settings' })
    @ApiResponse({ status: 200, description: 'User settings retrieved successfully.' })
    async getUserSettings(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.settingsService.getUserSettings(userId);
    }

    @Put('user/:userId')
    @ApiOperation({ summary: 'Update user profile settings' })
    @ApiBody({ type: UpdateUserSettingsDto })
    async updateUserSettings(
        @Req() req: any,
        @Param('userId') userId: string,
        @Body() dto: UpdateUserSettingsDto,
    ) {
        this.assertSelfOrAdmin(req, userId);
        return this.settingsService.updateUserSettings(userId, dto);
    }

    @Get('preferences/:userId')
    @ApiOperation({ summary: 'Get ride preferences' })
    async getRidePreferences(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.settingsService.getRidePreferences(userId);
    }

    @Put('preferences/:userId')
    @ApiOperation({ summary: 'Update ride preferences' })
    @ApiBody({ type: UpdateRidePreferencesDto })
    async updateRidePreferences(
        @Req() req: any,
        @Param('userId') userId: string,
        @Body() dto: UpdateRidePreferencesDto,
    ) {
        this.assertSelfOrAdmin(req, userId);
        return this.settingsService.updateRidePreferences(userId, dto);
    }

    @Get('driver-savings/:driverProfileId')
    @ApiOperation({ summary: 'Get driver savings preference' })
    async getDriverSavingsPreference(@Req() req: any, @Param('driverProfileId') driverProfileId: string) {
        this.assertSelfOrAdmin(req, driverProfileId);
        return this.settingsService.getDriverSavingsPreference(driverProfileId);
    }

    @Put('driver-savings/:driverProfileId')
    @ApiOperation({ summary: 'Update driver savings preference' })
    @ApiBody({ type: UpdateDriverSavingsPreferenceDto })
    async updateDriverSavingsPreference(
        @Req() req: any,
        @Param('driverProfileId') driverProfileId: string,
        @Body() dto: UpdateDriverSavingsPreferenceDto,
    ) {
        this.assertSelfOrAdmin(req, driverProfileId);
        return this.settingsService.updateDriverSavingsPreference(driverProfileId, dto);
    }

    @Get('system')
    @ApiOperation({ summary: 'Get all system settings' })
    @ApiResponse({ status: 200, description: 'All system settings retrieved successfully.' })
    async getAllSystemSettings(@Req() req: any) {
        this.assertAdmin(req);
        return this.settingsService.getAllSystemSettings();
    }

    @Get('system/:key')
    @ApiOperation({ summary: 'Get system setting by key' })
    async getSystemSetting(@Req() req: any, @Param('key') key: string) {
        this.assertAdmin(req);
        const value = await this.settingsService.getSystemSetting(key);
        return { key, value };
    }

    @Put('system/:key')
    @ApiOperation({ summary: 'Update system setting' })
    @ApiBody({ type: UpdateSystemSettingDto })
    async updateSystemSetting(
        @Req() req: any,
        @Param('key') key: string,
        @Body() dto: UpdateSystemSettingDto,
    ) {
        this.assertAdmin(req);
        return this.settingsService.updateSystemSetting(key, dto.value);
    }
}
