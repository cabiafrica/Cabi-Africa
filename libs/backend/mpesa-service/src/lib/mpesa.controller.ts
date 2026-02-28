import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import {
  StkPushRequest,
  C2BRegisterRequest,
  B2CRequest,
  StkCallback,
} from './mpesa.types';

@Controller('mpesa')
export class MpesaController {
  private readonly logger = new Logger(MpesaController.name);

  constructor(private readonly mpesaService: MpesaService) {}

  @Post('stk-push')
  @HttpCode(HttpStatus.OK)
  async initiateStkPush(@Body() request: StkPushRequest) {
    this.logger.log(`STK Push request received for ${request.phoneNumber}`);

    if (!request.phoneNumber || !request.amount || !request.accountReference) {
      throw new BadRequestException('Missing required fields: phoneNumber, amount, accountReference');
    }

    const response = await this.mpesaService.initiateStkPush({
      ...request,
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
  async handleStkCallback(@Body() callback: StkCallback) {
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
  async registerC2B(@Body() request: C2BRegisterRequest) {
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
  async handleC2BConfirmation(@Body() callback: any) {
    this.logger.log('C2B Confirmation received');

    const transaction = this.mpesaService.handleC2BConfirmation(callback);

    this.logger.log(
      `C2B Transaction processed: ${transaction.id}, Amount: ${transaction.amount}`
    );

    return { success: true };
  }

  @Post('c2b/validation')
  @HttpCode(HttpStatus.OK)
  async handleC2BValidation(@Body() callback: any) {
    this.logger.log('C2B Validation received');

    return {
      ResultCode: 0,
      ResultDesc: 'Accept',
    };
  }

  @Post('b2c')
  @HttpCode(HttpStatus.OK)
  async initiateB2C(@Body() request: B2CRequest) {
    this.logger.log(`B2C request for ${request.phoneNumber}, Amount: ${request.amount}`);

    if (!request.phoneNumber || !request.amount || !request.occasion) {
      throw new BadRequestException('Missing required fields: phoneNumber, amount, occasion');
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
  async handleB2CCallback(@Body() callback: any) {
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
    @Body()
    body: {
      transactionId: string;
      amount: number;
      receiverPhone: string;
      remarks: string;
    }
  ) {
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
  async getBalance() {
    const balance = await this.mpesaService.getBalance();
    return {
      success: true,
      data: balance,
    };
  }

  @Get('transactions/:id')
  @HttpCode(HttpStatus.OK)
  async getTransaction(@Param('id') transactionId: string) {
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
  async getAllTransactions() {
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
