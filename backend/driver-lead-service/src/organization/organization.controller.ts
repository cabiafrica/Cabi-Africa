import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { OrganizationService } from './organization.service';

@Controller('organizations')
export class OrganizationController {
    constructor(private readonly orgService: OrganizationService) { }

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
    async getAll(@Req() req: any) {
        this.assertAuthenticated(req);
        return this.orgService.findAll();
    }

    @Patch(':id/status')
    async updateStatus(
        @Req() req: any,
        @Param('id') id: string,
        @Body('isVerified') isVerified: boolean
    ) {
        this.assertAdmin(req);
        return this.orgService.updateStatus(id, isVerified);
    }

    // Subgroups
    @Get(':id/subgroups')
    async getSubgroups(@Req() req: any, @Param('id') id: string) {
        this.assertAuthenticated(req);
        return this.orgService.findSubgroups(id);
    }

    @Post(':id/subgroups')
    async createSubgroup(
        @Req() req: any,
        @Param('id') id: string,
        @Body('name') name: string
    ) {
        this.assertAdmin(req);
        return this.orgService.createSubgroup(id, name);
    }

    @Patch('subgroups/:subgroupId')
    async updateSubgroup(
        @Req() req: any,
        @Param('subgroupId') id: string,
        @Body('name') name: string
    ) {
        this.assertAdmin(req);
        return this.orgService.updateSubgroup(id, name);
    }

    @Delete('subgroups/:subgroupId')
    async deleteSubgroup(@Req() req: any, @Param('subgroupId') id: string) {
        this.assertAdmin(req);
        return this.orgService.deleteSubgroup(id);
    }
}
