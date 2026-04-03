import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { organizations, OrganizationStatus } from '@prisma/client';

@Injectable()
export class OrganizationService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const orgs = await this.prisma.organizations.findMany({
            include: {
                _count: {
                    select: { driver_profiles: true }
                }
            }
        });

        return orgs.map(org => ({
            id: org.id,
            name: org.name,
            ownerId: 'N/A',
            memberCount: org._count.driver_profiles,
            status: org.status,
            type: 'PUBLIC',
        }));
    }

    async updateStatus(id: string, isVerified: boolean) {
        return this.prisma.organizations.update({
            where: { id },
            data: { status: isVerified ? 'VERIFIED' : 'UNVERIFIED' },
        });
    }

    // Subgroup Logic (Organizations with parentId)
    async findSubgroups(parenOrgId: string) {
        const subgroups = await this.prisma.organizations.findMany({
            where: { parentId: parenOrgId },
            include: {
                _count: { select: { driver_profiles: true } }
            }
        });

        return subgroups.map(sg => ({
            id: sg.id,
            orgId: parenOrgId,
            name: sg.name,
            parentId: sg.parentId,
            memberCount: sg._count.driver_profiles
        }));
    }

    async createSubgroup(parentId: string, name: string) {
        const parent = await this.prisma.organizations.findUnique({ where: { id: parentId } });
        if (!parent) throw new NotFoundException('Parent organization not found');

        return this.prisma.organizations.create({
            data: {
                id: Math.random().toString(36).substring(7),
                name,
                email: `${Math.random().toString(36).substring(7)}@demo.com`,
                registrationNumber: Math.random().toString(36).substring(7),
                parentId: parentId,
                updatedAt: new Date(),
            }
        });
    }

    async updateSubgroup(id: string, name: string) {
        return this.prisma.organizations.update({
            where: { id },
            data: { name }
        });
    }

    async deleteSubgroup(id: string) {
        return this.prisma.organizations.delete({
            where: { id }
        });
    }
}
