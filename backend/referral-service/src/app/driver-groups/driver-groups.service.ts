import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@cabi/database';
import { 
  CreateDriverGroupDto, 
  UpdateDriverGroupDto, 
  AssignDriverDto, 
  SearchDto 
} from './dto/driver-groups.dto';

@Injectable()
export class DriverGroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: SearchDto) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [groups, total] = await Promise.all([
      this.prisma.driverGroup.findMany({
        where,
        skip,
        take: limit,
        include: {
          parentGroup: {
            select: {
              id: true,
              name: true,
            },
          },
          subgroups: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              drivers: true,
              subgroups: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.driverGroup.count({ where }),
    ]);

    return {
      data: groups,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const group = await this.prisma.driverGroup.findUnique({
      where: { id },
      include: {
        parentGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        subgroups: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            _count: {
              select: {
                drivers: true,
              },
            },
          },
        },
        drivers: {
          select: {
            id: true,
            licenseNumber: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
            isOnline: true,
            totalRidesCompleted: true,
            averageRating: true,
            createdAt: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Driver group not found');
    }

    return group;
  }

  async create(createDriverGroupDto: CreateDriverGroupDto) {
    const { name, description, parentGroupId } = createDriverGroupDto;

    // Check for circular hierarchy if parent is specified
    if (parentGroupId) {
      await this.validateHierarchy(parentGroupId);
    }

    // Check if group name already exists (within same parent if applicable)
    const existingGroup = await this.prisma.driverGroup.findFirst({
      where: {
        name,
        parentGroupId: parentGroupId || null,
      },
    });

    if (existingGroup) {
      throw new BadRequestException('Group with this name already exists in this hierarchy level');
    }

    return this.prisma.driverGroup.create({
      data: {
        name,
        description,
        parentGroupId,
      },
      include: {
        parentGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            drivers: true,
            subgroups: true,
          },
        },
      },
    });
  }

  async update(id: string, updateDriverGroupDto: UpdateDriverGroupDto) {
    const { name, description, parentGroupId } = updateDriverGroupDto;

    // Check if group exists
    const existingGroup = await this.prisma.driverGroup.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      throw new NotFoundException('Driver group not found');
    }

    // Validate hierarchy change
    if (parentGroupId && parentGroupId !== existingGroup.parentGroupId) {
      // Check for circular hierarchy
      await this.validateHierarchy(parentGroupId, id);
      
      // Check for duplicate name in new hierarchy level
      const duplicateGroup = await this.prisma.driverGroup.findFirst({
        where: {
          name: name || existingGroup.name,
          parentGroupId,
          id: { not: id },
        },
      });

      if (duplicateGroup) {
        throw new BadRequestException('Group with this name already exists in this hierarchy level');
      }
    }

    return this.prisma.driverGroup.update({
      where: { id },
      data: {
        name,
        description,
        parentGroupId,
      },
      include: {
        parentGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        subgroups: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            drivers: true,
            subgroups: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const group = await this.prisma.driverGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            drivers: true,
            subgroups: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Driver group not found');
    }

    // Check if group has members or subgroups
    if (group._count.drivers > 0 || group._count.subgroups > 0) {
      throw new BadRequestException(
        'Cannot delete group with members or subgroups. Please remove them first.'
      );
    }

    return this.prisma.driverGroup.delete({
      where: { id },
    });
  }

  async assignDriver(groupId: string, driverId: string) {
    // Check if group exists
    const group = await this.prisma.driverGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Driver group not found');
    }

    // Check if driver exists
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Assign driver to group
    return this.prisma.driverProfile.update({
      where: { id: driverId },
      data: { driverGroupId: groupId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        driverGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async removeDriver(groupId: string, driverId: string) {
    const driver = await this.prisma.driverProfile.findFirst({
      where: {
        id: driverId,
        driverGroupId: groupId,
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found in this group');
    }

    return this.prisma.driverProfile.update({
      where: { id: driverId },
      data: { driverGroupId: null },
    });
  }

  async getHierarchy(groupId: string) {
    const group = await this.prisma.driverGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Driver group not found');
    }

    // Get full hierarchy tree
    const getHierarchyTree = async (id: string): Promise<any> => {
      const currentGroup = await this.prisma.driverGroup.findUnique({
        where: { id },
        include: {
          subgroups: true,
          drivers: {
            select: {
              id: true,
              licenseNumber: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                },
              },
              isOnline: true,
            },
          },
        },
      });

      if (!currentGroup) return null;

      return {
        ...currentGroup,
        subgroups: await Promise.all(
          currentGroup.subgroups.map(subgroup => getHierarchyTree(subgroup.id))
        ),
      };
    };

    return getHierarchyTree(groupId);
  }

  async getGroupMembers(groupId: string, params: { page: number; limit: number }) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.prisma.driverProfile.findMany({
        where: { driverGroupId: groupId },
        skip,
        take: limit,
        select: {
          id: true,
          licenseNumber: true,
          isOnline: true,
          totalRidesCompleted: true,
          averageRating: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.driverProfile.count({
        where: { driverGroupId: groupId },
      }),
    ]);

    return {
      data: members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async validateHierarchy(parentGroupId: string, excludeId?: string) {
    // Check for circular hierarchy
    const checkCircular = async (id: string): Promise<boolean> => {
      if (id === excludeId) return false;

      const parent = await this.prisma.driverGroup.findUnique({
        where: { id },
        select: { parentGroupId: true },
      });

      if (!parent) return false;

      if (parent.parentGroupId === excludeId) {
        return true; // Circular reference detected
      }

      if (parent.parentGroupId) {
        return checkCircular(parent.parentGroupId);
      }

      return false;
    };

    const isCircular = await checkCircular(parentGroupId);
    if (isCircular) {
      throw new BadRequestException('Circular hierarchy detected in group structure');
    }
  }
}