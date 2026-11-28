import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PromotionService } from './promotion.service';

@Controller('promotions')
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) { }

    private extractUser(req: any): any {
        if (req?.user) return req.user;
        const authHeader = req?.headers?.authorization;
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7).trim();
            const secret =
                process.env.JWT_SECRET ||
                process.env.SUPABASE_JWT_SECRET ||
                (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
            if (secret) {
                try {
                    return jwt.verify(token, secret) as any;
                } catch {
                    return null;
                }
            }
        }
        return null;
    }

    private assertAuthenticated(req: any): any {
        const user = this.extractUser(req);
        if (!user) throw new UnauthorizedException('Authentication required.');
        return user;
    }

    private assertAdmin(req: any): void {
        const user = this.assertAuthenticated(req);
        const role = String(user.role || '').toUpperCase();
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Administrator privileges required.');
        }
    }

    @Get()
    getAllPromoCodes(@Req() req: any) {
        this.assertAdmin(req);
        return this.promotionService.getAllPromoCodes();
    }

    @Get('validate')
    validatePromo(
        @Req() req: any,
        @Query('code') code: string,
        @Query('userId') userId: string,
        @Query('amount') amount: string
    ) {
        const caller = this.assertAuthenticated(req);
        const role = String(caller.role || '').toUpperCase();
        const effectiveUserId =
            role === 'ADMIN' || role === 'SUPER_ADMIN'
                ? userId || String(caller.sub || caller.id)
                : String(caller.sub || caller.id || caller.userId);
        const parsedAmount = Number(amount);
        if (!code || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            throw new BadRequestException('Valid promo code and positive amount are required.');
        }
        return this.promotionService.validateAndApplyPromo(code, effectiveUserId, parsedAmount);
    }

    @Post()
    createPromoCode(@Req() req: any, @Body() body: any) {
        this.assertAdmin(req);
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
    updatePromoCode(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        this.assertAdmin(req);
        return this.promotionService.updatePromoCode(id, body);
    }

    @Delete(':id')
    deletePromoCode(@Req() req: any, @Param('id') id: string) {
        this.assertAdmin(req);
        return this.promotionService.deletePromoCode(id);
    }
}
