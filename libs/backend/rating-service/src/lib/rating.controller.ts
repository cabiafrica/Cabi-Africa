import {
    BadRequestException,
    Body,
    Controller,
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
import { RatingService } from './rating.service';

@Controller('ratings')
export class RatingController {
    constructor(private readonly ratingService: RatingService) { }

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

    @Post()
    submitRating(@Req() req: any, @Body() body: any) {
        const caller = this.assertAuthenticated(req);
        const stars = Number(body?.stars);
        if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
            throw new BadRequestException('Rating stars must be an integer between 1 and 5.');
        }
        const raterId = String(caller.sub || caller.id || caller.userId);
        return this.ratingService.submitRating({
            rideId: body.rideId,
            raterId,
            raterName: body.raterName,
            rateeId: body.rateeId,
            stars,
            comment: body.comment,
            type: body.type
        });
    }

    // Admin Endpoints
    @Get('admin/all')
    async getAll(@Req() req: any, @Query('stars') stars?: string, @Query('rateeId') rateeId?: string) {
        this.assertAdmin(req);
        return this.ratingService.getAllRatings(stars ? parseInt(stars, 10) : undefined, rateeId);
    }

    @Get('summary/:rateeId')
    async getSummary(@Req() req: any, @Param('rateeId') rateeId: string) {
        this.assertAuthenticated(req);
        return this.ratingService.getRatingSummary(rateeId);
    }

    @Put('admin/:id/hide')
    hideRating(@Req() req: any, @Param('id') id: string) {
        this.assertAdmin(req);
        return this.ratingService.hideRating(id);
    }
}
