import { Controller, Post, Body, Logger, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

interface InitiateSplitDto {
  tripId: string;
  participantIds: string[];
  totalFare: number;
}

interface RespondToSplitDto {
  response: 'accepted' | 'declined';
}

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('split')
  initiateSplit(@Body() dto: InitiateSplitDto) {
    const initiatorId = 'passenger-123'; // From authenticated user
    return this.paymentService.initiateSplit(dto.tripId, initiatorId, dto.participantIds, dto.totalFare);
  }

  @Post('split/:splitId/respond')
  respondToSplit(@Param('splitId') splitId: string, @Body() dto: RespondToSplitDto) {
    const participantId = 'passenger-456'; // From authenticated user
    return this.paymentService.respondToSplit(splitId, participantId, dto.response);
  }
}