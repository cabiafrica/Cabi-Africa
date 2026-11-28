import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { MpesaService } from './mpesa.service';
import {
  StkPushRequest,
  C2BRegisterRequest,
  B2CRequest,
  StkCallback,
} from './mpesa.types';

const SAFARICOM_ALLOWED_IPS = new Set([
  '196.201.214.200',
  '196.201.214.206',
  '196.201.213.114',
  '196.201.214.207',
  '196.201.214.208',
  '196.201.213.44',
  '196.201.212.127',
  '196.201.212.138',
  '196.201.212.129',
  '196.201.212.136',
  '196.201.212.74',
  '196.201.212.69',
]);

@Controller('mpesa')
export class MpesaController {
  private readonly logger = new Logger(MpesaController.name);

  constructor(private readonly mpesaService: MpesaService) {}

  private assertFinanceAdmin(req: any): void {
    const user = req?.user;
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }
    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const isAdmin =
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      perms.some((p) => p.startsWith('FINANCE_') || p === 'SUPER_ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('Finance or Admin privileges required for M-Pesa administrative operations.');
    }
  }

  private verifyWebhookOrigin(req: any, headers: Record<string, string>): void {
    const expectedSecret = process.env.MOBILE_MONEY_WEBHOOK_SECRET || process.env.MPESA_WEBHOOK_SECRET;
    if (expectedSecret) {
      // Header-only secret verification (never accept secrets in URL query parameters)
      const provided = headers?.['x-mobile-money-webhook-secret'] || headers?.['x-mpesa-webhook-secret'];
      if (!provided || typeof provided !== 'string') {
        this.logger.warn('Rejected Mobile Money callback: missing webhook secret header');
        throw new UnauthorizedException('Invalid Mobile Money webhook signature');
      }
      const bufExpected = Buffer.from(expectedSecret);
      const bufProvided = Buffer.from(provided);
      if (bufExpected.length !== bufProvided.length || !crypto.timingSafeEqual(bufExpected, bufProvided)) {
        this.logger.warn('Rejected Mobile Money callback with invalid webhook secret');
        throw new UnauthorizedException('Invalid Mobile Money webhook signature');
      }
      return;
    }

    const env = (process.env.NODE_ENV || '').toLowerCase();
    if (env === 'production' || env === 'staging') {
      // Never trust client-spoofable leftmost x-forwarded-for[0]; rely on Express req.ip / socket address
      const rawIp = req?.ip || req?.socket?.remoteAddress || '';
      const normalizedIp = String(rawIp).replace(/^::ffff:/, '').trim();
      if (!normalizedIp || !SAFARICOM_ALLOWED_IPS.has(normalizedIp)) {
        this.logger.warn(`Rejected Mobile Money callback from untrusted IP in ${env}: ${normalizedIp || 'unknown'}`);
        throw new ForbiddenException('Untrusted Mobile Money callback origin');
      }
      return;
    }

    this.logger.warn('[SECURITY WARNING] Mobile Money callback received without MOBILE_MONEY_WEBHOOK_SECRET / MPESA_WEBHOOK_SECRET configured (dev only).');
  }

  @Post('stk-push')
  @HttpCode(HttpStatus.OK)
  async initiateStkPush(@Body() request: StkPushRequest) {
    this.logger.log(`STK Push request received for ${request.phoneNumber}`);

    if (!request.phoneNumber || !request.amount || !request.accountReference) {
      throw new BadRequestException('Missing required fields: phoneNumber, amount, accountReference');
    }
    const cleanPhone = String(request.phoneNumber).replace(/[\s-]/g, '');
    const phoneRegex = /^(?:\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      throw new BadRequestException('Invalid Kenyan mobile phone number format');
    }

    const numAmount = Number(request.amount);
    if (!Number.isFinite(numAmount) || numAmount < 1 || numAmount > 250000) {
      throw new BadRequestException('Amount must be between KES 1 and 250,000');
    }

    const response = await this.mpesaService.initiateStkPush({
      ...request,
      phoneNumber: cleanPhone,
      amount: numAmount,
      transactionDesc: request.transactionDesc || 'Cabi Africa Payment',
    });

    return {
      success: true,
      message: 'STK Push initiated successfully',
      data: response,
    };
  }

  @Post('stk-push/query/:checkoutRequestId')
  @HttpCode(HttpStatus.OK)
  async queryStkStatus(@Param('checkoutRequestId') checkoutRequestId: string) {
    const result = await this.mpesaService.queryStkStatus(checkoutRequestId);
    return {
      success: true,
      data: result,
    };
  }

  @Post('stk-callback')
  @HttpCode(HttpStatus.OK)
  async handleStkCallback(
    @Req() req: any,
    @Headers() headers: Record<string, string>,
    @Body() callback: StkCallback
  ) {
    this.verifyWebhookOrigin(req, headers);
    this.logger.log('STK Callback received');

    const transaction = this.mpesaService.handleStkCallback(callback);

    if (transaction) {
      this.logger.log(
        `Transaction ${transaction.id} status: ${transaction.status}`
      );
    }

    return { success: true };
  }

  @Post('c2b/register')
  @HttpCode(HttpStatus.OK)
  async registerC2B(@Req() req: any, @Body() request: C2BRegisterRequest) {
    this.assertFinanceAdmin(req);
    this.logger.log('C2B registration request');

    const response = await this.mpesaService.registerC2BUrls({
      ...request,
      shortCode: request.shortCode || process.env.MPESA_SHORT_CODE,
    });

    return {
      success: true,
      message: 'C2B URLs registered successfully',
      data: response,
    };
  }

  @Post('c2b/confirmation')
  @HttpCode(HttpStatus.OK)
  async handleC2BConfirmation(
    @Req() req: any,
    @Headers() headers: Record<string, string>,
    @Body() callback: any
  ) {
    this.verifyWebhookOrigin(req, headers);
    this.logger.log('C2B Confirmation received');

    const transaction = this.mpesaService.handleC2BConfirmation(callback);

    this.logger.log(
      `C2B Transaction processed: ${transaction.id}, Amount: ${transaction.amount}`
    );

    return { success: true };
  }

  @Post('c2b/validation')
  @HttpCode(HttpStatus.OK)
  async handleC2BValidation(
    @Req() req: any,
    @Headers() headers: Record<string, string>,
    @Body() callback: any
  ) {
    this.verifyWebhookOrigin(req, headers);
    this.logger.log('C2B Validation received');

    return {
      ResultCode: 0,
      ResultDesc: 'Accept',
    };
  }

  @Post('b2c')
  @HttpCode(HttpStatus.OK)
  async initiateB2C(@Req() req: any, @Body() request: B2CRequest) {
    this.assertFinanceAdmin(req);
    this.logger.log(`B2C request for ${request.phoneNumber}, Amount: ${request.amount}`);

    if (!request.phoneNumber || !request.amount || !request.occasion) {
      throw new BadRequestException('Missing required fields: phoneNumber, amount, occasion');
    }
    if (!Number.isFinite(Number(request.amount)) || Number(request.amount) <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }

    const response = await this.mpesaService.initiateB2C(request);

    return {
      success: true,
      message: 'B2C payment initiated successfully',
      data: response,
    };
  }

  @Post('b2c/callback')
  @HttpCode(HttpStatus.OK)
  async handleB2CCallback(
    @Req() req: any,
    @Headers() headers: Record<string, string>,
    @Body() callback: any
  ) {
    this.verifyWebhookOrigin(req, headers);
    this.logger.log('B2C Callback received');

    const transaction = this.mpesaService.handleB2CCallback(callback);

    if (transaction) {
      this.logger.log(
        `B2C Transaction ${transaction.id} status: ${transaction.status}`
      );
    }

    return { success: true };
  }

  @Post('reverse')
  @HttpCode(HttpStatus.OK)
  async reverseTransaction(
    @Req() req: any,
    @Body()
    body: {
      transactionId: string;
      amount: number;
      receiverPhone: string;
      remarks: string;
    }
  ) {
    this.assertFinanceAdmin(req);
    const { transactionId, amount, receiverPhone, remarks } = body;

    if (!transactionId || !amount || !receiverPhone) {
      throw new BadRequestException(
        'Missing required fields: transactionId, amount, receiverPhone'
      );
    }

    const response = await this.mpesaService.reverseTransaction(
      transactionId,
      amount,
      receiverPhone,
      remarks || 'Cabi Africa refund'
    );

    return {
      success: true,
      message: 'Reversal initiated',
      data: response,
    };
  }

  @Get('balance')
  @HttpCode(HttpStatus.OK)
  async getBalance(@Req() req: any) {
    this.assertFinanceAdmin(req);
    const balance = await this.mpesaService.getBalance();
    return {
      success: true,
      data: balance,
    };
  }

  @Get('transactions/:id')
  @HttpCode(HttpStatus.OK)
  async getTransaction(@Req() req: any, @Param('id') transactionId: string) {
    this.assertFinanceAdmin(req);
    const transaction = this.mpesaService.getTransaction(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    return {
      success: true,
      data: transaction,
    };
  }

  @Get('transactions')
  @HttpCode(HttpStatus.OK)
  async getAllTransactions(@Req() req: any) {
    this.assertFinanceAdmin(req);
    const transactions = this.mpesaService.getAllTransactions();
    return {
      success: true,
      count: transactions.length,
      data: transactions,
    };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return {
      status: 'ok',
      service: 'mpesa-service',
      timestamp: new Date().toISOString(),
    };
  }
}
