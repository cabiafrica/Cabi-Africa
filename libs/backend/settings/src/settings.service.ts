import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { Setting, User, RidePreference, DriverSavingsPreference } from '@prisma/client';
import { UpdateUserSettingsDto, UpdateRidePreferencesDto, UpdateDriverSavingsPreferenceDto } from './dto/update-user-settings.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    // User Settings
    async getUserSettings(userId: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                ridePreference: true,
            }
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return user;
    }

    async updateUserSettings(userId: string, dto: UpdateUserSettingsDto): Promise<User> {
        const updateData: any = {
            ...dto,
        };

        if (dto.privacySettings) {
            updateData.privacySettings = dto.privacySettings as any; // Cast to JSON compatible
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
    }

    // Ride Preferences
    async getRidePreferences(userId: string): Promise<RidePreference | null> {
        return this.prisma.ridePreference.findUnique({
            where: { userId },
        });
    }

    async updateRidePreferences(userId: string, dto: UpdateRidePreferencesDto): Promise<RidePreference> {
        const existing = await this.prisma.ridePreference.findUnique({
            where: { userId },
        });

        if (existing) {
            return this.prisma.ridePreference.update({
                where: { userId },
                data: {
                    ...dto,
                },
            });
        } else {
            return this.prisma.ridePreference.create({
                data: {
                    userId,
                    ...dto,
                },
            });
        }
    }

    // Driver Savings Preferences
    async getDriverSavingsPreference(driverProfileId: string): Promise<DriverSavingsPreference | null> {
        return this.prisma.driverSavingsPreference.findUnique({
            where: { driverProfileId },
        });
    }

    async updateDriverSavingsPreference(driverProfileId: string, dto: UpdateDriverSavingsPreferenceDto): Promise<DriverSavingsPreference> {
        const existing = await this.prisma.driverSavingsPreference.findUnique({
            where: { driverProfileId },
        });

        if (existing) {
            return this.prisma.driverSavingsPreference.update({
                where: { driverProfileId },
                data: {
                    ...dto,
                },
            });
        } else {
            return this.prisma.driverSavingsPreference.create({
                data: {
                    driverProfileId,
                    ...dto,
                },
            });
        }
    }

    // System Settings
    async getSystemSetting(key: string): Promise<any> {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
        });

        if (!setting) {
            return null;
            // Alternatively, return a default value based on key if not found
        }

        return setting.value;
    }

    async updateSystemSetting(key: string, value: any): Promise<Setting> {
        // If value is object/array, ensure it's handled as JSON (Prisma default for Json type)

        return this.prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }

    async getAllSystemSettings(): Promise<Setting[]> {
        return this.prisma.setting.findMany();
    }
}
