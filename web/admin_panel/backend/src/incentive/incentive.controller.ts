import { Controller, Post, Body, Req } from '@nestjs/common';
import { IncentiveService } from './incentive.service';

class ApplyPromoCodeDto {
  code: string;
}

interface MockRequest {
  user?: { id: string };
}

@Controller('incentives')
export class IncentiveController {
  constructor(private readonly incentiveService: IncentiveService) {}

  @Post('apply-promo')
  applyPromoCode(@Body() body: ApplyPromoCodeDto, @Req() req: MockRequest) {
    const userId = req.user?.id || 'user-passenger-123'; // Mocking for now
    return this.incentiveService.applyPromoCode(userId, body.code);
  }
}