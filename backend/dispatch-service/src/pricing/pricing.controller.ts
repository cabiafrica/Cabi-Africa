import { Controller, Get, Put, Post, Body, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { PricingService } from './pricing.service';
import { CategoryPricingConfig, CalculateFareDto, FareCalculationResult } from './pricing.types';

@ApiTags('Pricing & Taximeter')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  private assertAdmin(req: any): void {
    const internalKey = process.env.INTERNAL_API_KEY;
    const providedKey = req?.headers?.['x-internal-api-key'];
    if (internalKey && providedKey && typeof providedKey === 'string') {
      try {
        const a = Buffer.from(internalKey);
        const b = Buffer.from(providedKey);
        if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
          return;
        }
      } catch {
        // continue
      }
    }
    let user = req?.user;
    if (!user && req?.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
      if (secret) {
        try {
          user = jwt.verify(token, secret) as any;
        } catch {
          user = null;
        }
      }
    }
    if (!user) {
      throw new UnauthorizedException('Authentication required for administrative pricing operations.');
    }
    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const isAdmin =
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      perms.some((p: string) => p.startsWith('SYSTEM_SETTINGS_') || p.startsWith('PRICING_') || p === 'SUPER_ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('Admin pricing privileges required.');
    }
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all service category pricing configurations and rounding rules' })
  @ApiResponse({ status: 200, description: 'List of category pricing rules' })
  async getCategories(): Promise<CategoryPricingConfig[]> {
    return this.pricingService.getCategoriesPricing();
  }

  @Put('categories')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service category pricing rules and rounding intervals (Admin)' })
  @ApiResponse({ status: 200, description: 'Updated pricing configurations' })
  async updateCategories(@Req() req: any, @Body() configs: CategoryPricingConfig[]): Promise<CategoryPricingConfig[]> {
    this.assertAdmin(req);
    return this.pricingService.updateCategoriesPricing(configs);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate real-time metered fare based on distance, duration and category rounding' })
  @ApiResponse({ status: 200, description: 'Detailed fare breakdown and rounded figure' })
  async calculateFare(@Body() dto: CalculateFareDto): Promise<FareCalculationResult> {
    return this.pricingService.calculateFare(dto);
  }
}
