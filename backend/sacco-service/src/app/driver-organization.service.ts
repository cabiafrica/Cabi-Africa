import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

export interface CreateDriverOrgDto {
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
        
        return this.prisma.driverOrganization.create({
            data: {
                name: dto.name,
                description: dto.description,
                rules: dto.rules,
                isPrivate: dto.isPrivate ?? false,
                memberCapacity: dto.memberCapacity ?? 100,
                isVerified: true, // Internal ones are often verified by default or via admin
            }
        });
    }

    async joinOrganization(driverId: string, orgId: string): Promise<any> {
        this.logger.log(`Driver ${driverId} joining internal organization ${orgId}`);
        
        const org = await this.prisma.driverOrganization.findUnique({
            where: { id: orgId }
        });

        if (!org) {
            throw new Error('Driver Organization does not exist');
        }

        // Check capacity
        const memberCount = await this.prisma.driverProfile.count({
            where: { driverOrganizationId: orgId }
        });

        if (memberCount >= org.memberCapacity) {
            throw new Error('Organization has reached its maximum capacity');
        }

        return this.prisma.driverProfile.update({
            where: { id: driverId },
            data: { driverOrganizationId: orgId }
        });
    }

    async leaveOrganization(driverId: string): Promise<any> {
        this.logger.log(`Driver ${driverId} leaving internal organization`);
        
        return this.prisma.driverProfile.update({
            where: { id: driverId },
            data: { driverOrganizationId: null }
        });
    }

    async getOrganizations(search?: string): Promise<any[]> {
        return this.prisma.driverOrganization.findMany({
            where: {
                OR: search ? [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ] : undefined
            },
            include: {
                _count: {
                    select: { drivers: true }
                }
            }
        });
    }

    async getDetails(id: string): Promise<any> {
        return this.prisma.driverOrganization.findUnique({
            where: { id },
            include: {
                drivers: {
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
