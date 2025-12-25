import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MlmService } from './mlm-service.service';

@Controller('mlm-service')
export class MlmController {
  constructor(private readonly service: MlmService) { }

  @Get('health')
  healthCheck() {
    return { status: 'OK', service: 'mlm-service' };
  }

  @Get('admin/mlm/formula')
  getFormula() {
    // Return hardcoded formula for now
    return {
      rules: [
        { recipient: 'sponsor', value: 200, type: 'fixed' },
        { recipient: 'upline', value: 100, type: 'fixed' },
        { recipient: 'company', value: 200, type: 'fixed' }
      ]
    };
  }

  @Post('admin/mlm/formula')
  updateFormula(@Body() body: any) {
    console.log('Updating MLM formula:', body);
    return { message: 'Formula updated successfully', formula: body };
  }
}
