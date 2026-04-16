import { Controller, Post, Body, Delete, Param, Put, Req, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';


class AddTipDto {
  rideId: string;
  amount: number;
}

interface MockRequest {
  user?: { id: string };
}

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Delete('methods/:id')
  @HttpCode(204)
  deletePaymentMethod(@Param('id') methodId: string, @Req() req: MockRequest) {
    const userId = req.user?.id || 'user-passenger-123'; // Mocking for now
    return this.paymentService.deletePaymentMethod(userId, methodId);
  }

  @Put('methods/:id/set-default')
  setDefaultPaymentMethod(@Param('id') methodId: string, @Req() req: MockRequest) {
    const userId = req.user?.id || 'user-passenger-123'; // Mocking for now
    return this.paymentService.setDefaultPaymentMethod(userId, methodId);
  }

  @Post('add-tip')
  addTip(@Body() addTipDto: AddTipDto, @Req() req: MockRequest) {
    const userId = req.user?.id || 'user-passenger-123'; // Mocking for now
    return this.paymentService.addTip(userId, addTipDto.rideId, addTipDto.amount);
  }
}