import { Injectable, InternalServerErrorException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SmsProvider, PaymentProvider, StorageProvider, EmailProvider } from '@cabi/backend/common';
import { RegisterUserDto, UserRole } from './dto/register-user.dto';
import { PrismaService } from '@cabi/backend/database';
import * as bcrypt from 'bcryptjs';
import { LegacyRole, UserRole as PrismaUserRole, UserPermission as PrismaUserPermission, Role as PrismaRole, Prisma } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('SmsProvider') private readonly smsProvider: SmsProvider,
    @Inject('PaymentProvider') private readonly paymentProvider: PaymentProvider,
    @Inject('StorageProvider') private readonly storageProvider: StorageProvider,
    @Inject('EmailProvider') private readonly emailProvider: EmailProvider,
  ) { }

  async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    };
    return this.jwtService.sign(payload);
  }

  async registerPassenger(registerUserDto: RegisterUserDto) {
    const { firstName, lastName, email, phone, password, referrerId, referralCode, profilePhotoUrl, role, licenseNumber, orgName } = registerUserDto;

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
            passportPhotoUrl: profilePhotoUrl,
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

      // Send Welcome SMS/OTP hook
      await this.smsProvider.sendSms(user.phone, `Welcome to Cabi Africa, ${user.fullName}! Your account has been created.`);

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

  async registerDriver(data: any, files?: any) {
    const { firstName, lastName, middleName, email, phone, idNumber, password, referralCode, licenseNumber } = data;

    // 1. Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    if (existingUser) throw new ConflictException('User already exists');

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;

    // 3. Handle Documents via StorageProvider
    const documentsData = [];
    if (files) {
      for (const [key, file] of Object.entries(files)) {
        const { url } = await this.storageProvider.uploadFile(file, `drivers/${email}/${key}`);
        documentsData.push({
          type: key.toUpperCase(), // e.g., LICENSE_FRONT, POLICE_CLEARANCE
          url,
          status: 'PENDING'
        });
      }
    }

    // 4. Create User and Profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          fullName,
          role: LegacyRole.DRIVER,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: 'PENDING' as any,
          referralCode: `CABI-D-${Math.random().toString(36).substring(7).toUpperCase()}`,
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any).driverProfile.create({
        data: {
          userId: user.id,
          licenseNumber,
          documents: {
            createMany: {
              data: documentsData
            }
          }
        }
      });

      return user;
    });

    // Notify driver via SMS
    await this.smsProvider.sendSms(phone, `Hello ${firstName}, your driver registration documents for Cabi Africa have been received and are now pending verification.`);

    return result;
  }

  async registerOrganization(data: any, certificateFile?: any) {
    const { firstName, lastName, email, phone, password, orgName, founderName } = data;

    const hashedPassword = await bcrypt.hash(password, 10);
    let certUrl = '';
    if (certificateFile) {
      const { url } = await this.storageProvider.uploadFile(certificateFile, `orgs/${email}/cert`);
      certUrl = url;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          fullName: `${firstName} ${lastName}`,
          role: LegacyRole.ADMIN,
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const org = await (tx as any).organizations.create({
        data: {
          name: orgName,
          founderName,
          email: `${orgName.replace(/\s+/g, '').toLowerCase()}@cabi.com`,
          registrationNumber: `ORG-${Date.now()}`,
          registrationCertificateUrl: certUrl,
          status: 'PENDING',
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any).organization_members.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          name: user.fullName,
          contact: user.phone,
          position: 'Founder',
        }
      });

      return { user, org };
    });

    // Notify founder via SMS
    await this.smsProvider.sendSms(phone, `Congratulations! The organization ${orgName} has been registered on Cabi Africa. Our team will review your certificate shortly.`);

    return result;
  }

  async login(identifier: string, password: string) {
    // Backdoor removed for production/DB auth
    // if (identifier === 'admin@cabi.com' && password === 'password123') { ... }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { phone: identifier }
        ]
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        },
        userPermissions: true,
        driverProfile: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials.');
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
    if (permissions.size === 0 && user.role === LegacyRole.ADMIN) {
      // Give basic admin permissions if legacy ADMIN but no sophisticated roles
      permissions.add('DISPATCH_DASHBOARD_VIEW');
      permissions.add('DISPATCH_RIDE_MONITOR');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: Array.from(permissions),
      driverProfileId: user.driverProfile?.id,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isIdentityVerified: user.isIdentityVerified,
      passportPhotoUrl: user.passportPhotoUrl,
    };
  }

  async createProspect(data: { firstName: string, lastName: string, email: string, phone: string, city: string, password?: string, referralCode?: string }) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone }
        ]
      }
    });

    if (existingUser) {
      return { userId: existingUser.id, status: (existingUser as any).status || 'PROSPECT' };
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        fullName: `${data.firstName} ${data.lastName}`,
        password: await bcrypt.hash(data.password || 'Prospect@2026', 10),
        role: LegacyRole.DRIVER,
        status: 'PROSPECT' as any,
        city: data.city,
        referralCode: data.referralCode || `CABI-${Math.random().toString(36).substring(7).toUpperCase()}`,
      }
    });

    return { userId: user.id, status: (user as any).status };
  }

  async getPendingDrivers() {
    return this.prisma.user.findMany({
      where: {
        role: LegacyRole.DRIVER,
        status: 'PENDING' as any
      },
      include: {
        driverProfile: true
      }
    });
  }

  async updateUserStatus(userId: string, status: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: status as any }
    });
  }

  async promoteToDriver(userId: string) {
    // Check if driver profile already exists
    const existingProfile = await this.prisma.driverProfile.findFirst({
      where: { userId }
    });

    if (existingProfile) {
      return existingProfile;
    }

    // Get the user to retrieve their password from registration
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create driver profile
    const driverProfile = await this.prisma.driverProfile.create({
      data: {
        userId: userId,
        licenseNumber: `DL-${userId.substring(0, 8)}`,
      }
    });

    // Trigger Referral Commission for Registration
    // Fee is hardcoded to 500 for now, should be configurable
    try {
      const referralServiceUrl = process.env.REFERRAL_SERVICE_URL || 'http://referral-service:3337';
      const response = await fetch(`${referralServiceUrl}/api/admin/referral/process-registration-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: driverProfile.id,
          fee: 500
        })
      });

      if (!response.ok) {
        console.error(`Failed to trigger referral commission: ${response.status} ${response.statusText}`);
      } else {
        console.log(`Referral commission triggered for new driver ${driverProfile.id}`);
      }
    } catch (error) {
      console.error('Error triggering referral commission:', error);
    }

    // Notify driver of activation
    await this.smsProvider.sendSms(user.phone, `Congratulations ${user.fullName}! Your Cabi Africa driver account has been activated. You can now start receiving rides.`);

    return driverProfile;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email, phone } = forgotPasswordDto;
    
    if (!email && !phone) {
      throw new BadRequestException('Please provide either an email or a phone number');
    }

    let user;
    if (email) {
      user = await this.prisma.user.findUnique({ where: { email } });
    } else if (phone) {
      user = await this.prisma.user.findUnique({ where: { phone } });
    }

    if (!user) {
      throw new NotFoundException('If an account with those details exists, a reset link has been sent.');
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3600000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    const body = `Your Cabi Africa password reset token is: ${token}. This token expires in 1 hour.`;

    if (email) {
      const subject = 'Cabi Africa - Password Reset';
      await this.emailProvider.sendEmail(email, subject, body);
    } else if (phone) {
      await this.smsProvider.sendSms(user.phone, body);
    }

    return { message: 'Reset token sent successfully.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new ConflictException('Invalid or expired reset token.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password reset successful.' };
  }
}
