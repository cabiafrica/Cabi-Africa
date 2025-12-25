import { Controller, Get, Patch, Param, UseGuards, Req, Query, Post, Body, ValidationPipe } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutStatus, RequestPayoutDto } from '@cabi/shared/interfaces';

// In a real app, this would be a proper JWT/Role-based guard
class AdminGuard {
  canActivate() {
    console.log('AdminGuard: Allowing access for admin action.');
    return true;
  }
}

@Controller('admin/payouts')
@UseGuards(new AdminGuard())
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get()
  findAll(
    @Query('status') status?: PayoutStatus,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'driverName' | 'amount' | 'requestedAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.payoutService.findAll(status, search, sortBy, sortOrder, parseInt(page, 10), parseInt(limit, 10));
  }

  @Patch(':id/mark-paid')
  async markAsPaid(@Param('id') id: string, /* @Req() req */) {
    // In a real app, adminId would come from the authenticated request, e.g., req.user.id
    const mockAdminId = 'admin-007';
    return this.payoutService.markAsPaid(id, mockAdminId);
  }
}

@Controller('payouts')
@UseGuards(new AdminGuard()) // Placeholder for a real UserAuthGuard
export class PayoutRequestController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post('request')
  requestPayout(
    @Body(new ValidationPipe()) requestPayoutDto: RequestPayoutDto,
    /* @Req() req */
  ) {
    // In a real app, driverId would come from the authenticated request
    const mockDriverId = 'driver-123';
    return this.payoutService.requestPayout(
      mockDriverId,
      requestPayoutDto.amount,
      requestPayoutDto.paymentMethod,
    );
  }
}