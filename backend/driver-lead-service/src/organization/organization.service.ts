import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DriverOrganization } from '@prisma/client';

@Injectable()
export class OrganizationService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const orgs = await this.prisma.driverOrganization.findMany({
            include: {
                _count: {
                    select: { drivers: true }
                }
            }
        });

        return orgs.map(org => ({
            id: org.id,
            name: org.name,
            ownerId: 'N/A',
            memberCount: org._count.drivers,
            status: org.isVerified ? 'VERIFIED' : 'PENDING',
            type: org.isPrivate ? 'PRIVATE' : 'PUBLIC',
        }));
    }

    async updateStatus(id: string, isVerified: boolean) {
        return this.prisma.driverOrganization.update({
            where: { id },
            data: { isVerified },
        });
    }

    // Subgroup Logic (Organizations with parentId)
    async findSubgroups(parenOrgId: string) {
        const subgroups = await this.prisma.driverOrganization.findMany({
            where: { parentOrgId: parenOrgId },
            include: {
                _count: { select: { drivers: true } }
            }
        });

        return subgroups.map(sg => ({
            id: sg.id,
            orgId: parenOrgId,
            name: sg.name,
            parentId: sg.parentOrgId,
            memberCount: sg._count.drivers
        }));
    }

    async createSubgroup(parentId: string, name: string) {
        const parent = await this.prisma.driverOrganization.findUnique({ where: { id: parentId } });
        if (!parent) throw new NotFoundException('Parent organization not found');

        return this.prisma.driverOrganization.create({
            data: {
                name,
                parentOrgId: parentId,
            }
        });
    }

    async updateSubgroup(id: string, name: string) {
        return this.prisma.driverOrganization.update({
            where: { id },
            data: { name }
        });
    }

    async deleteSubgroup(id: string) {
        return this.prisma.driverOrganization.delete({
            where: { id }
        });
    }
}
