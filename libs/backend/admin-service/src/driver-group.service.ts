import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

export interface DriverGroup {
  id: string;
  name: string;
  description?: string;
  parentGroupId?: string;
  createdAt: Date;
  parentGroup?: DriverGroup;
  subgroups?: DriverGroup[];
  _count?: {
    drivers: number;
    subgroups: number;
  };
}

@Injectable()
export class DriverGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroups(): Promise<DriverGroup[]> {
    const groups = await this.prisma.driver_groups.findMany({
      include: {
        _count: {
          select: {
            driver_profiles: true,
            other_driver_groups: true,
          }
        },
        other_driver_groups: true,
      }
    });

    return groups.map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description || undefined,
      parentGroupId: g.parentGroupId || undefined,
      createdAt: g.createdAt,
      _count: {
        drivers: g._count.driver_profiles,
        subgroups: g._count.other_driver_groups,
      },
      subgroups: g.other_driver_groups.map((sg: any) => ({
          id: sg.id,
          name: sg.name,
          description: sg.description || undefined,
          createdAt: sg.createdAt,
      }))
    }));
  }

  async getGroup(id: string): Promise<DriverGroup> {
    const group = await this.prisma.driver_groups.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            driver_profiles: true,
            other_driver_groups: true,
          }
        },
        other_driver_groups: {
          include: {
             _count: {
               select: {
                 driver_profiles: true,
               }
             }
          }
        }
      }
    });

    if (!group) throw new NotFoundException('Group not found');

    return {
      id: group.id,
      name: group.name,
      description: group.description || undefined,
      parentGroupId: group.parentGroupId || undefined,
      createdAt: group.createdAt,
      _count: {
        drivers: group._count.driver_profiles,
        subgroups: group._count.other_driver_groups,
      },
      subgroups: group.other_driver_groups.map((sg: any) => ({
          id: sg.id,
          name: sg.name,
          description: sg.description || undefined,
          createdAt: sg.createdAt,
          _count: {
            drivers: sg._count.driver_profiles,
            subgroups: 0
          }
      }))
    } as DriverGroup;
  }

  async createGroup(data: Partial<DriverGroup>): Promise<DriverGroup> {
    const id = `group-${Math.random().toString(36).substr(2, 9)}`;
    const group = await this.prisma.driver_groups.create({
      data: {
        id,
        name: data.name || 'Untitled Group',
        description: data.description,
        parentGroupId: data.parentGroupId,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            driver_profiles: true,
            other_driver_groups: true,
          }
        }
      }
    });

    return {
       id: group.id,
       name: group.name,
       description: group.description || undefined,
       createdAt: group.createdAt,
       _count: {
         drivers: group._count.driver_profiles,
         subgroups: group._count.other_driver_groups,
       }
    };
  }

  async assignDriver(groupId: string, driverId: string): Promise<void> {
    // Note: In case we need to move driver from another group, we just update driverGroupId
    await this.prisma.driverProfile.update({
      where: { id: driverId },
      data: { driverGroupId: groupId },
    });
  }

  async getGroupMembers(groupId: string): Promise<any[]> {
    const profiles = await this.prisma.driverProfile.findMany({
      where: { driverGroupId: groupId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    return profiles.map(profile => ({
      id: profile.id,
      licenseNumber: profile.licenseNumber,
      isOnline: profile.isOnline,
      totalRidesCompleted: profile.totalRidesCompleted,
      averageRating: profile.averageRating,
      createdAt: profile.user.fullName, // Using user name as placeholder for join date since DriverProfile might not have createdAt.
      user: profile.user,
    }));
  }
}
