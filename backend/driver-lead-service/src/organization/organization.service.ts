import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Organization, OrganizationStatus } from '@prisma/client';

@Injectable()
export class OrganizationService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        // Return all organizations
        // We might want to include member count.
        // Prisma can do _count on relations.
        const orgs = await this.prisma.organization.findMany({
            include: {
                _count: {
                    select: { members: true, drivers: true }
                }
            }
        });

        // Transform to flat object expected by controller/frontend if needed
        // The frontend expects: { id, name, ownerId, memberCount, status, type }
        return orgs.map(org => ({
            id: org.id,
            name: org.name,
            // Owner/Founder logic depends on schema. 
            // Schema has NO ownerId on Organization, but OrganizationMember has `duties` or `position`.
            // Let's assume for now we don't return specific owner info unless we query members.
            // Frontend mock uses 'ownerId'.
            ownerId: 'N/A',
            memberCount: org._count.members + org._count.drivers,
            status: org.status,
            type: 'GROUP', // Schema doesn't have type yet, defaulting
        }));
    }

    async updateStatus(id: string, status: OrganizationStatus) {
        return this.prisma.organization.update({
            where: { id },
            data: { status },
        });
    }

    // Subgroup Logic (Organizations with parentId)
    async findSubgroups(parenOrgId: string) {
        // In our Schema, Organization has parentId, so subgroups are just Organizations.
        // But wait, the schema has `Organization` model which has `parentId`.
        // The frontend treats 'Subgroup' as children of an Org.
        // Ideally, an Org is a top-level entity, and it has sub-orgs.
        // `adminService.getSubgroups(orgId)` fetches children.

        const subgroups = await this.prisma.organization.findMany({
            where: { parentId: parenOrgId },
            include: {
                _count: { select: { members: true } }
            }
        });

        return subgroups.map(sg => ({
            id: sg.id,
            orgId: parenOrgId,
            name: sg.name,
            parentId: sg.parentId,
            memberCount: sg._count.members
        }));
    }

    async createSubgroup(parentId: string, name: string) {
        // We need to know who the parent is to set relation.
        // Since parentId IS the organization ID of the parent.
        // But check if parent exists first.
        const parent = await this.prisma.organization.findUnique({ where: { id: parentId } });
        if (!parent) throw new NotFoundException('Parent organization not found');

        // Create new organization with parentId
        // Required fields for Organization: email, registrationNumber.
        // We need to generate dummies or make them optional in schema?
        // Checking schema... email and registrationNumber are unique and required.
        // This is blocking for "Subgroups" which might just be logical groupings.
        // Only "Top Level" organizations might need legal entities.
        // For now, I will generate dummy unique values for subgroups.

        return this.prisma.organization.create({
            data: {
                name,
                parentId,
                email: `sub-${Date.now()}@cabi.internal`,
                registrationNumber: `SUB-${Date.now()}`,
                status: OrganizationStatus.VERIFIED, // Subgroups inherit verified?
            }
        });
    }

    async updateSubgroup(id: string, name: string) {
        return this.prisma.organization.update({
            where: { id },
            data: { name }
        });
    }

    async deleteSubgroup(id: string) {
        return this.prisma.organization.delete({
            where: { id }
        });
    }
}
