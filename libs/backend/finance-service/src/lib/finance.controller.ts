import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

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

    private assertSelfOrAdmin(req: any, driverId: string): void {
        const user = this.extractUser(req);
        if (!user) throw new UnauthorizedException('Authentication required.');
        const role = String(user.role || '').toUpperCase();
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') return;
        const callerId = String(user.sub || user.id || user.userId || '');
        const callerDriverId = String(user.driverProfile?.id || user.driverProfileId || '');
        if (callerId !== String(driverId) && callerDriverId !== String(driverId)) {
            throw new ForbiddenException('Access denied: Cannot access another driver\'s financial records.');
        }
    }

    @Get('drivers/:driverId/summary')
    getSummary(@Req() req: any, @Param('driverId') driverId: string) {
        this.assertSelfOrAdmin(req, driverId);
        return this.financeService.getFinanceSummary(driverId);
    }

    @Post('drivers/:driverId/goal')
    setGoal(@Req() req: any, @Param('driverId') driverId: string, @Body() body: any) {
        this.assertSelfOrAdmin(req, driverId);
        const amount = Number(body?.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new BadRequestException('Earnings goal amount must be a positive number.');
        }
        return this.financeService.setEarningsGoal(driverId, amount, body.period);
    }

    @Post('drivers/:driverId/cashout')
    cashOut(@Req() req: any, @Param('driverId') driverId: string) {
        this.assertSelfOrAdmin(req, driverId);
        return this.financeService.cashOut(driverId);
    }
}
