import { Controller, Get, Put, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { CategoryPricingConfig, CalculateFareDto, FareCalculationResult } from './pricing.types';

@ApiTags('Pricing & Taximeter')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all service category pricing configurations and rounding rules' })
  @ApiResponse({ status: 200, description: 'List of category pricing rules' })
  async getCategories(): Promise<CategoryPricingConfig[]> {
    return this.pricingService.getCategoriesPricing();
  }

  @Put('categories')
  @ApiOperation({ summary: 'Update service category pricing rules and rounding intervals (Admin)' })
  @ApiResponse({ status: 200, description: 'Updated pricing configurations' })
  async updateCategories(@Body() configs: CategoryPricingConfig[]): Promise<CategoryPricingConfig[]> {
    return this.pricingService.updateCategoriesPricing(configs);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate real-time metered fare based on distance, duration and category rounding' })
  @ApiResponse({ status: 200, description: 'Detailed fare breakdown and rounded figure' })
  async calculateFare(@Body() dto: CalculateFareDto): Promise<FareCalculationResult> {
    return this.pricingService.calculateFare(dto);
  }
}
