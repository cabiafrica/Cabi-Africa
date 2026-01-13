import { Injectable, BadRequestException } from '@nestjs/common';
import { RegisterLeadDto } from './dto/register-lead.dto';
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

    return {
      message: 'Registration successful. Please download the app to continue.',
      userId,
      status
    };
  }

  private async processPayment(userId: string, amount: number) {
    console.log(`[Payment] Processing ${amount} for ${userId} via Stripe...`);
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, transactionId: `tx_${Date.now()}` };
  }

  async getPendingDrivers(page: number, limit: number) {
    // Mock data for Admin Panel
    // In real app, query UserService for users with role DRIVER and status PENDING
    const drivers = [
      { id: 'driver-123', fullName: 'John Doe', phone: '0712345678', applicationDate: '2024-05-21T10:00:00Z', status: 'PENDING' },
      { id: 'driver-456', fullName: 'Peter Jones', phone: '0787654321', applicationDate: '2024-05-20T14:00:00Z', status: 'PENDING' },
    ];
    return { data: drivers, total: drivers.length };
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