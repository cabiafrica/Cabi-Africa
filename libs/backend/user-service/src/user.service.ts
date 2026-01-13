import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { RegisterUserDto, UserRole } from './dto/register-user.dto';
import { PrismaService } from '@cabi/backend/database';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

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
    const prismaRole = role.toUpperCase() as Role;

    try {
      const user = await this.prisma.$transaction(async (tx) => {
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
          await tx.driverProfile.create({
            data: {
              userId: newUser.id,
              licenseNumber: licenseNumber || `DL-${newUser.id.substring(0, 8)}`,
            }
          });
        } else if (role === UserRole.ORGANIZATION) {
          await tx.organization.create({
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
      };
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      throw new Error('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new InternalServerErrorException('Invalid credentials.');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }
}
