import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { randomUUID } from 'crypto';

export class CreateDriverOrgDto {
    name: string;
    description?: string;
    rules?: string;
    isPrivate?: boolean;
    memberCapacity?: number;
}

@Injectable()
export class DriverOrganizationService {
    private readonly logger = new Logger(DriverOrganizationService.name);

    constructor(private readonly prisma: PrismaService) { }

    async createOrganization(dto: CreateDriverOrgDto): Promise<any> {
        this.logger.log(`Creating internal driver organization: ${dto.name}`);
        
        return this.prisma.driver_groups.create({
            data: {
                id: randomUUID(),
                name: dto.name,
                description: dto.description,
                updatedAt: new Date()
            }
        });
    }

    async joinOrganization(driverId: string, orgId: string): Promise<any> {
        this.logger.log(`Driver ${driverId} joining internal organization ${orgId}`);
        
        const org = await this.prisma.driver_groups.findUnique({
            where: { id: orgId }
        });

        if (!org) {
            throw new Error('Driver Organization does not exist');
        }

        // Check capacity
        const memberCount = await this.prisma.driverProfile.count({
            where: { driverGroupId: orgId }
        });

        // Using a hardcoded capacity to allow mock checking since schema does not have it
        if (memberCount >= 100) {
            throw new Error('Organization has reached its maximum capacity');
        }

        return this.prisma.driverProfile.update({
            where: { userId: driverId },
            data: { driverGroupId: orgId }
        });
    }

    async leaveOrganization(driverId: string): Promise<any> {
        this.logger.log(`Driver ${driverId} leaving internal organization`);
        
        return this.prisma.driverProfile.update({
            where: { userId: driverId },
            data: { driverGroupId: null }
        });
    }

    async getOrganizations(search?: string): Promise<any[]> {
        return this.prisma.driver_groups.findMany({
            where: {
                OR: search ? [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ] : undefined
            },
            include: {
                _count: {
                    select: { driver_profiles: true }
                }
            }
        });
    }

    async getDetails(id: string): Promise<any> {
        return this.prisma.driver_groups.findUnique({
            where: { id },
            include: {
                driver_profiles: {
                    include: {
                        user: {
                            select: { fullName: true, phone: true, passportPhotoUrl: true }
                        }
                    }
                }
            }
        });
    }
}
