import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PromotionService } from './promotion.service';

@Controller('promotions')
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) { }

    @Get()
    getAllPromoCodes() {
        return this.promotionService.getAllPromoCodes();
    }

    @Get('validate')
    validatePromo(@Query('code') code: string, @Query('userId') userId: string, @Query('amount') amount: string) {
        return this.promotionService.validateAndApplyPromo(code, userId, parseFloat(amount));
    }

    @Post()
    createPromoCode(@Body() body: any) {
        return this.promotionService.createPromoCode({
            code: body.code,
            discountType: body.discountType,
            value: body.value,
            expiresAt: new Date(body.expiresAt),
            maxUses: body.maxUses,
            usesPerUser: body.usesPerUser,
            isActive: body.isActive ?? true
        });
    }

    @Put(':id')
    updatePromoCode(@Param('id') id: string, @Body() body: any) {
        return this.promotionService.updatePromoCode(id, body);
    }

    @Delete(':id')
    deletePromoCode(@Param('id') id: string) {
        return this.promotionService.deletePromoCode(id);
    }
}
