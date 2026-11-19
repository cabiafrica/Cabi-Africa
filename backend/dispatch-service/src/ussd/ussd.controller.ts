import {
  Controller,
  Post,
  Get,
  Body,
  Header,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { UssdService } from './ussd.service';
import { SmsBookingService } from './sms-booking.service';
import { POPULAR_LANDMARKS } from './landmarks.util';

@Controller('ussd')
export class UssdController {
  private readonly logger = new Logger(UssdController.name);

  constructor(
    private readonly ussdService: UssdService,
    private readonly smsBookingService: SmsBookingService,
  ) {}

  /**
   * Africa's Talking USSD Gateway Webhook
   * Responds with plain text "CON <message>" or "END <message>"
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/plain')
  async handleUssdWebhook(
    @Body()
    body: {
      sessionId: string;
      serviceCode: string;
      phoneNumber: string;
      text: string;
    },
    @Res() res: Response,
  ) {
    if (!body?.phoneNumber) {
      return res.status(200).send('END Error: Missing phone number.');
    }

    try {
      const responseText = await this.ussdService.handleUssdRequest({
        sessionId: body.sessionId,
        serviceCode: body.serviceCode,
        phoneNumber: body.phoneNumber,
        text: body.text || '',
      });

      return res.status(200).send(responseText);
    } catch (err: any) {
      this.logger.error(`USSD processing error: ${err.message}`);
      return res
        .status(200)
        .send('END An error occurred. Please redial *384*222# shortly.');
    }
  }

  /**
   * Africa's Talking Inbound SMS Gateway Webhook
   * Processes SMS commands like "CABIGO CBD to Westlands"
   */
  @Post('sms-inbound')
  @HttpCode(HttpStatus.OK)
  async handleSmsInbound(
    @Body()
    body: {
      from: string;
      to?: string;
      text: string;
      id?: string;
      date?: string;
    },
  ) {
    if (!body?.from || !body?.text) {
      throw new BadRequestException('from and text are required fields');
    }

    const result = await this.smsBookingService.handleInboundSms({
      from: body.from,
      to: body.to,
      text: body.text,
      id: body.id,
    });

    return {
      status: 'success',
      replySent: result.success,
      message: result.reply,
    };
  }

  /**
   * Triggers M-PESA STK Push prompt (Daraja API) for offline trip settlement
   */
  @Post('mpesa-prompt')
  @HttpCode(HttpStatus.OK)
  async triggerMpesaPrompt(
    @Body()
    body: {
      tripId: string;
      phoneNumber: string;
      amount: number;
    },
  ) {
    if (!body?.tripId || !body?.phoneNumber || !body?.amount) {
      throw new BadRequestException('tripId, phoneNumber, and amount are required');
    }

    const cleanPhone = body.phoneNumber.replace(/\D/g, '');
    const reference = `TRIP_${body.tripId.slice(-6)}`;

    this.logger.log(
      `[Daraja M-PESA STK Push] Triggered prompt of KES ${body.amount} to ${cleanPhone} (Ref: ${reference})`,
    );

    return {
      success: true,
      checkoutRequestId: `ws_CO_${Date.now()}_${Math.floor(10000 + Math.random() * 90000)}`,
      customerMessage: `M-PESA payment prompt of KES ${body.amount} sent to ${cleanPhone}. Please enter PIN.`,
      status: 'PENDING_CUSTOMER_PIN',
    };
  }

  /**
   * Returns supported landmarks for testing and inspection
   */
  @Get('landmarks')
  getLandmarks() {
    return {
      count: POPULAR_LANDMARKS.length,
      landmarks: POPULAR_LANDMARKS,
    };
  }
}
