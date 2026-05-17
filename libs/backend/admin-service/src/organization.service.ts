import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import * as crypto from 'crypto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async updateDistressResponder(orgId: string, userId: string, isDistressResponder: boolean): Promise<void> {
    const member = await this.prisma.organization_members.findFirst({
      where: {
        organizationId: orgId,
        userId: userId,
      },
    });

    if (!member) {
      throw new NotFoundException(`Organization member with user ID ${userId} not found in org ${orgId}`);
    }

    await this.prisma.organization_members.update({
      where: { id: member.id },
      data: { isDistressResponder },
    });
  }
  async getSubgroups(orgId: string) {
    return this.prisma.organizations.findMany({
      where: { parentId: orgId },
      include: {
        _count: {
          select: { organization_members: true }
        }
      }
    });
  }

  async getSubgroupDetails(orgId: string, subgroupId: string) {
    const subgroup = await this.prisma.organizations.findFirst({
      where: { id: subgroupId, parentId: orgId },
      include: {
        _count: { select: { organization_members: true } }
      }
    });
    if (!subgroup) throw new NotFoundException('Subgroup not found');
    return subgroup;
  }

  async createSubgroup(orgId: string, name: string, features?: string[]) {
    return this.prisma.organizations.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email: `${crypto.randomUUID()}@subgroup.cabi.local`,
        registrationNumber: `SUB-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
        organizations: { connect: { id: orgId } },
        features: features || [],
        status: 'VERIFIED',
        updatedAt: new Date(),
      }
    });
  }

  async updateSubgroup(subgroupId: string, data: any) {
    return this.prisma.organizations.update({
      where: { id: subgroupId },
      data,
    });
  }

  async deleteSubgroup(subgroupId: string) {
    return this.prisma.organizations.delete({
      where: { id: subgroupId },
    });
  }
}
