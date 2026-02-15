import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ReferralService } from '../referral.service';
import { UpdateReferralFormulaDto } from './dto/update-referral-formula.dto';

// TODO: Implement a real AdminGuard for production
@UseGuards() // Placeholder for a real AdminGuard
@Controller('admin/referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) { }

  /**
   * Retrieves the current Referral Program fee distribution formula.
   * Corresponds to US-003.
   */
  @Get('formula')
  getFormula() {
    return this.referralService.getFeeFormula();
  }

  @Put('formula')
  updateFormula(@Body() updateReferralFormulaDto: UpdateReferralFormulaDto) {
    return this.referralService.updateFeeFormula(updateReferralFormulaDto);
  }
}