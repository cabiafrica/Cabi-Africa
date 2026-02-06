import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { MlmService } from '../mlm.service';
import { UpdateMlmFormulaDto } from './update-mlm-formula.dto';

// TODO: Implement a real AdminGuard for production
@UseGuards() // Placeholder for a real AdminGuard
@Controller('admin/mlm')
export class MlmController {
  constructor(private readonly mlmService: MlmService) { }

  /**
   * Retrieves the current MLM fee distribution formula.
   * Corresponds to US-003.
   */
  @Get('formula')
  getFormula() {
    return this.mlmService.getFeeFormula();
  }

  @Put('formula')
  updateFormula(@Body() updateMlmFormulaDto: UpdateMlmFormulaDto) {
    return this.mlmService.updateFeeFormula(updateMlmFormulaDto);
  }
}