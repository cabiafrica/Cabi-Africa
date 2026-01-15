import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { RegisterUserDto, UserRole } from './dto/register-user.dto';
import { PrismaService } from '@cabi/backend/database';
import * as bcrypt from 'bcryptjs';
import { LegacyRole, UserRole as PrismaUserRole, UserPermission as PrismaUserPermission, Role as PrismaRole, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async registerPassenger(registerUserDto: RegisterUserDto) {
    const { firstName, lastName, email, phone, password, role, referrerId, referralCode, licenseNumber, orgName, orgType } = registerUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('A user with this email or phone number already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Map frontend roles to Prisma roles
    const prismaRole = role.toUpperCase() as LegacyRole;

    try {
      const user = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Create the base user
        const newUser = await tx.user.create({
          data: {
            email,
            phone,
            password: hashedPassword,
            fullName: `${firstName} ${lastName}`,
            role: prismaRole,
            referralCode: referralCode || `CABI-${Math.random().toString(36).substring(7).toUpperCase()}`,
            referredById: referrerId,
          }
        });

        // Handle role-specific profiles
        if (role === UserRole.DRIVER) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (tx as any).driverProfile.create({
            data: {
              userId: newUser.id,
              licenseNumber: licenseNumber || `DL-${newUser.id.substring(0, 8)}`,
            }
          });
        } else if (role === UserRole.ORGANIZATION) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (tx as any).organization.create({
            data: {
              name: orgName || `${firstName}'s Organization`,
              email: email,
              registrationNumber: `REG-${newUser.id.substring(0, 8)}`,
              members: {
                create: {
                  userId: newUser.id,
                  name: `${firstName} ${lastName}`,
                  contact: phone,
                  position: 'FOUNDER',
                }
              }
            }
          });
        }

        return newUser;
      });

      return {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
      };
    } catch (error) {
      console.error('Error during registration:', error);
      throw new InternalServerErrorException('Failed to register user.');
    }
  }

  async login(identifier: string, password: string) {
    // Backdoor for admin access without DB
    if (identifier === 'admin@cabi.com' && password === 'password123') {
      return {
        id: 'admin-123',
        email: 'admin@cabi.com',
        fullName: 'System Admin',
        role: 'ADMIN',
        permissions: ['*'] // Full access
      };
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        },
        userPermissions: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new InternalServerErrorException('Invalid credentials.');
    }

    // Aggregate Permissions
    const permissions = new Set<string>();

    // 1. Add permissions from assigned roles
    // We explicitly define the type of 'ur' to match the included relation
    user.userRoles.forEach((ur: PrismaUserRole & { role: PrismaRole }) => {
      if (ur.isActive && ur.role.isActive) {
        ur.role.permissions.forEach((p: string) => permissions.add(p));
      }
    });

    // 2. Apply direct overrides
    user.userPermissions.forEach((up: PrismaUserPermission) => {
      if (up.isGranted) {
        permissions.add(up.permission);
      } else {
        permissions.delete(up.permission);
      }
    });

    // 3. Fallback for Legacy Role (if no RBAC roles assigned)
    if (permissions.size === 0 && user.role === 'ADMIN') {
      // Give basic admin permissions if legacy ADMIN but no sophisticated roles
      permissions.add('DISPATCH_DASHBOARD_VIEW');
      permissions.add('DISPATCH_RIDE_MONITOR');
    } else if (permissions.size === 0 && user.role === 'SUPER_ADMIN') {
      permissions.add('*');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: Array.from(permissions)
    };
  }
}
