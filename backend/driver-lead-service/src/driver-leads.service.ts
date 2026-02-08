import { Injectable, BadRequestException } from '@nestjs/common';
import { RegisterLeadDto } from './driver-leads/dto/register-lead.dto';
import { UserService } from '@cabi/backend/user-service';
import { MlmService } from './mlm.service';

@Injectable()
export class DriverLeadsService {
  constructor(
    private readonly userService: UserService,
    private readonly mlmService: MlmService
  ) { }

  async register(registerLeadDto: RegisterLeadDto) {
    console.log('Received registration data:', registerLeadDto);

    // 1. Validate reCAPTCHA token
    if (registerLeadDto.recaptchaToken === 'INVALID') {
      throw new BadRequestException('Invalid reCAPTCHA token');
    }

    // 2. Call User Management Service to create a 'PROSPECT' user
    const { userId, status } = await this.userService.createProspect({
      firstName: registerLeadDto.firstName,
      lastName: registerLeadDto.lastName,
      email: registerLeadDto.email,
      phone: registerLeadDto.phone,
      city: registerLeadDto.city,
      referralCode: registerLeadDto.referralCode
    });

    // 3. Process Registration Fee (Mock Stripe)
    await this.processPayment(userId, 500); // 500 KES fee

    // 4. Distribute Fee via MLM
    await this.mlmService.distributeFee(userId, 500);

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
        password: 'Password123!',
        referralCode: '',
        agreeToTerms: true
      });
      results.push(res);
    }
    return results;
  }

  async approveDriver(driverId: string) {
    console.log(`Approving driver ${driverId}`);
    // Call UserService to update status to VERIFIED/ACTIVE
    // await this.userService.updateStatus(driverId, 'ACTIVE');
    return { success: true, message: 'Driver approved' };
  }

  async rejectDriver(driverId: string, reasons: string[]) {
    console.log(`Rejecting driver ${driverId} for reasons: ${reasons}`);
    // Call UserService to update status to REJECTED or create task
    return { success: true, message: 'Driver rejected' };
  }
}