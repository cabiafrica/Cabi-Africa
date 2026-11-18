import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RegisterLeadDto } from './driver-leads/dto/register-lead.dto';
import { UserService } from '@cabi/backend/user-service';
import { ReferralService } from './referral.service';

@Injectable()
export class DriverLeadsService {
  constructor(
    private readonly userService: UserService,
    private readonly referralService: ReferralService,
    private readonly prisma: PrismaService
  ) { }

  async register(registerLeadDto: RegisterLeadDto) {
    console.log('Received registration data:', registerLeadDto);

    // 1. Validate bot protection token
    if (!registerLeadDto.recaptchaToken || registerLeadDto.recaptchaToken === 'INVALID' || registerLeadDto.recaptchaToken.trim() === '') {
      throw new BadRequestException('Invalid or missing bot protection token');
    }

    // 2. Call User Management Service to create a 'PROSPECT' user
    const { userId, status } = await this.userService.createProspect({
      firstName: registerLeadDto.firstName,
      lastName: registerLeadDto.lastName,
      email: registerLeadDto.email,
      phone: registerLeadDto.phone,
      city: registerLeadDto.city,
      password: registerLeadDto.password,
      referralCode: registerLeadDto.referralCode
    });

    // 3. Process Registration Fee (Mock Stripe)
    await this.processPayment(userId, 500); // 500 KES fee

    // 4. Distribute Fee via Referral Program
    await this.referralService.distributeFee(userId, 500);

    // 5. Update Status to PENDING (waiting for documents)
    await this.userService.updateUserStatus(userId, 'PENDING');

    return {
      message: 'Registration successful. Please download the app to continue.',
      userId,
      status: 'PENDING'
    };
  }

  private async processPayment(userId: string, amount: number) {
    console.log(`[Payment] Processing ${amount} for ${userId} via Stripe...`);
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, transactionId: `tx_${Date.now()}` };
  }

  async getPendingDrivers(page: number, limit: number) {
    const drivers = await this.userService.getPendingDrivers();
    // Wrap to match expected format
    const mapped = drivers.map(d => ({
      id: d.id,
      fullName: d.fullName,
      phone: d.phone,
      email: d.email,
      applicationDate: d.createdAt.toISOString(),
      status: 'PENDING'
    }));
    return { data: mapped, total: mapped.length };
  }

  async simulateRegistrations(count: number) {
    console.log(`Simulating ${count} driver registrations...`);
    const results = [];
    for (let i = 0; i < count; i++) {
      const timestamp = Date.now() + i;
      const firstName = `Simulated`;
      const lastName = `Driver ${i + 1}`;
      const email = `sim_driver_${timestamp}@cabi.test`;
      const phone = `+254700${Math.floor(100000 + Math.random() * 900000)}`;

      const res = await this.register({
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: '1990-01-01',
        street: 'Simulated Street',
        city: 'Nairobi',
        county: 'Nairobi',
        vehicleType: 'car' as any,
        licensePlate: `KDA ${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        nationalId: `ID-${timestamp}`,
        drivingLicense: `DL-${timestamp}`,
        recaptchaToken: 'SIMULATED',
        password: `CabiSim_${crypto.randomBytes(12).toString('hex')}!`,
        referralCode: '',
        agreeToTerms: true
      });
      results.push(res);
    }
    return results;
  }

  async approveDriver(driverId: string) {
    console.log(`Approving driver ${driverId}`);

    // Update user status to ACTIVE and role to DRIVER
    await this.userService.updateUserStatus(driverId, 'ACTIVE');
    const profile = await this.userService.promoteToDriver(driverId);

    return { success: true, message: 'Driver approved and activated', profileId: profile.id };
  }

  async rejectDriver(driverId: string, reasons: string[]) {
    console.log(`Rejecting driver ${driverId} for reasons: ${reasons}`);
    // Call UserService to update status to REJECTED or create task
    return { success: true, message: 'Driver rejected' };
  }

  // --- Profile & Security Enhancement (Component 2) ---

  async updateUserProfile(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const photo = data.passportPhotoUrl || data.profilePicture || data.photoUrl;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.city ? { city: data.city } : {}),
        ...(data.nickname ? { nickname: data.nickname } : {}),
        ...(photo ? { passportPhotoUrl: photo } : {}),
      },
    });
  }

  async updatePrivacySettings(userId: string, settings: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        privacySettings: settings,
      },
    });
  }

  async enable2FA(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: true,
      },
    });
  }

  async disable2FA(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });
  }

  async updateRecoveryCodes(userId: string, codes: string[]) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        recoveryCodes: codes,
      },
    });
  }
}