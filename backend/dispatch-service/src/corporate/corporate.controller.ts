import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CorporateService } from './corporate.service';
import {
  CorporateAccount,
  CostCenter,
  CorporateEmployee,
  CorporateTripAuthorization,
  CorporateInvoice,
} from './corporate.types';

@Controller('corporate')
export class CorporateController {
  constructor(private readonly corporateService: CorporateService) {}

  private extractUser(req: any): any {
    if (req?.user) return req.user;
    let user = null;
    const authHeader = req?.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret =
        process.env.JWT_SECRET ||
        (process.env.NODE_ENV !== 'production'
          ? 'dev-only-jwt-secret-do-not-use-in-prod'
          : '');
      if (secret) {
        try {
          user = jwt.verify(token, secret) as any;
        } catch {
          user = null;
        }
      }
    }

    if (!user && process.env.NODE_ENV !== 'production') {
      const devUserId = req?.headers?.['x-user-id'] || 'dev-corp-user';
      const devUserRole = (req?.headers?.['x-user-role'] as string) || 'PASSENGER';
      return { id: devUserId, role: devUserRole.toUpperCase(), fullName: 'Corporate User' };
    }

    return user;
  }

  // --- Corporate Accounts ---

  @Get('accounts')
  listAccounts() {
    return {
      success: true,
      accounts: this.corporateService.listAccounts(),
    };
  }

  @Post('accounts')
  createAccount(@Body() body: Partial<CorporateAccount>) {
    if (!body?.companyName) {
      throw new BadRequestException('companyName is required');
    }
    const account = this.corporateService.createAccount(body);
    return {
      success: true,
      account,
      message: 'Corporate account established successfully.',
    };
  }

  @Get('accounts/:id')
  getAccount(@Param('id') id: string) {
    const account = this.corporateService.getAccount(id);
    const costCenters = this.corporateService.listCostCenters(id);
    return {
      success: true,
      account,
      costCenters,
      availableCredit: account.creditLimit * (1 + account.graceBufferPercent / 100) - account.creditUsed,
    };
  }

  // --- Cost Centers ---

  @Post('cost-centers')
  createCostCenter(@Body() body: Partial<CostCenter>) {
    const cc = this.corporateService.createCostCenter(body);
    return {
      success: true,
      costCenter: cc,
    };
  }

  @Get('cost-centers/:accountId')
  listCostCenters(@Param('accountId') accountId: string) {
    return {
      success: true,
      costCenters: this.corporateService.listCostCenters(accountId),
    };
  }

  // --- Employee Enrolment ---

  @Post('employees')
  enrolEmployee(@Body() body: Partial<CorporateEmployee>) {
    const emp = this.corporateService.enrolEmployee(body);
    return {
      success: true,
      employee: emp,
      message: 'Employee enrolled in corporate cost center successfully.',
    };
  }

  // --- Pre-Trip Authorization Flow ---

  @Post('authorize-trip')
  @HttpCode(HttpStatus.OK)
  async requestTripAuthorization(
    @Body()
    body: {
      pickup: { address: string; latitude: number; longitude: number };
      dropoff: { address: string; latitude: number; longitude: number };
      estimatedFare: number;
      vehicleType?: string;
      purpose?: string;
    },
    @Req() req: any,
  ) {
    const user = this.extractUser(req);
    if (!user) throw new UnauthorizedException('Valid authentication credentials required');

    return this.corporateService.requestTripAuthorization({
      userId: user.id || user.sub,
      pickup: body.pickup,
      dropoff: body.dropoff,
      estimatedFare: Number(body.estimatedFare || 300),
      vehicleType: body.vehicleType || 'STANDARD',
      purpose: body.purpose,
    });
  }

  // --- Manager Sign-off ---

  @Post('approvals/:id/approve')
  async approveTrip(@Param('id') id: string, @Req() req: any) {
    const user = this.extractUser(req);
    const result = await this.corporateService.approveTrip(id, user?.id || 'mgr_action');
    return {
      success: true,
      ...result,
      message: 'Trip approved and dispatched to matching queue.',
    };
  }

  @Post('approvals/:id/reject')
  rejectTrip(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Req() req: any,
  ) {
    const user = this.extractUser(req);
    const auth = this.corporateService.rejectTrip(id, user?.id || 'mgr_action', body?.reason);
    return {
      success: true,
      authorization: auth,
      message: 'Corporate trip request rejected.',
    };
  }

  @Post('approvals/:id/switch-personal')
  async switchPersonal(@Param('id') id: string, @Req() req: any) {
    const user = this.extractUser(req);
    const result = await this.corporateService.switchToPersonalPayment(
      id,
      user?.id || 'emp_action',
    );
    return {
      success: true,
      ...result,
      message: 'Trip switched to personal payment. Expense voucher generated.',
    };
  }

  // --- Monthly Consolidated Invoices ---

  @Post('invoices/:accountId/generate')
  generateInvoice(
    @Param('accountId') accountId: string,
    @Body() body: { billingMonth?: string },
  ) {
    const month = body?.billingMonth || new Date().toISOString().substring(0, 7);
    const invoice = this.corporateService.generateMonthlyInvoice(accountId, month);
    return {
      success: true,
      invoice,
      message: `Consolidated tax invoice issued for billing period ${month}.`,
    };
  }

  @Get('invoices/:accountId')
  listInvoices(@Param('accountId') accountId: string) {
    return {
      success: true,
      invoices: this.corporateService.listInvoices(accountId),
    };
  }

  @Post('invoices/:invoiceId/pay')
  payInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() body: { paymentReference: string },
  ) {
    const invoice = this.corporateService.recordInvoicePayment(
      invoiceId,
      body?.paymentReference || `EFT_${Date.now()}`,
    );
    return {
      success: true,
      invoice,
      message: 'Invoice marked as settled. Corporate credit limit updated.',
    };
  }
}
