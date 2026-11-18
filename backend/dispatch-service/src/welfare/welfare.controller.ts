import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Req,
    HttpCode,
    HttpStatus,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import {
    WelfareService,
    CreateSchemeDto,
    UpdateSchemeDto,
    EnrollDriverDto,
} from './welfare.service';

@Controller('welfare')
export class WelfareController {
    constructor(private welfareService: WelfareService) {}

    private extractUser(req: any): any {
        if (req?.user) return req.user;
        const internalKey = process.env.INTERNAL_API_KEY;
        const providedKey = req?.headers?.['x-internal-api-key'];
        if (internalKey && providedKey && typeof providedKey === 'string') {
            try {
                const a = Buffer.from(internalKey);
                const b = Buffer.from(providedKey);
                if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
                    return { role: 'SUPER_ADMIN', permissions: ['SUPER_ADMIN'] };
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
        return user;
    }

    private assertAdmin(req: any): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required for administrative welfare operations.');
        }
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p: string) => p.startsWith('SYSTEM_SETTINGS_') || p.startsWith('WELFARE_') || p === 'SUPER_ADMIN');
        if (!isAdmin) {
            throw new ForbiddenException('Admin welfare privileges required.');
        }
    }

    private assertSelfOrAdmin(req: any, targetDriverProfileId: string): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required.');
        }
        const callerId = user.driverProfile?.id || user.driverProfileId || user.id || user.sub;
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p: string) => p.startsWith('WELFARE_') || p.startsWith('DRIVER_') || p === 'SUPER_ADMIN');
        if (callerId !== targetDriverProfileId && !isAdmin) {
            throw new ForbiddenException('You are not authorized to manage another driver welfare profile.');
        }
    }

    // ─── Scheme CRUD (Admin) ───────────────────────────────────────

    @Get('schemes')
    async getAllSchemes() {
        const schemes = await this.welfareService.getAllSchemes();
        return { success: true, message: 'Welfare schemes retrieved', data: schemes };
    }

    @Get('schemes/active')
    async getActiveSchemes() {
        const schemes = await this.welfareService.getActiveSchemes();
        return { success: true, message: 'Active welfare schemes retrieved', data: schemes };
    }

    @Get('schemes/:id')
    async getSchemeById(@Param('id') id: string) {
        const scheme = await this.welfareService.getSchemeById(id);
        return { success: true, message: 'Welfare scheme retrieved', data: scheme };
    }

    @Post('schemes')
    async createScheme(@Req() req: any, @Body() dto: CreateSchemeDto) {
        this.assertAdmin(req);
        const scheme = await this.welfareService.createScheme(dto);
        return { success: true, message: 'Welfare scheme created', data: scheme };
    }

    @Put('schemes/:id')
    async updateScheme(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateSchemeDto) {
        this.assertAdmin(req);
        const scheme = await this.welfareService.updateScheme(id, dto);
        return { success: true, message: 'Welfare scheme updated', data: scheme };
    }

    // ─── Driver Enrollment ─────────────────────────────────────────

    @Post('enroll')
    async enrollDriver(@Req() req: any, @Body() dto: EnrollDriverDto) {
        this.assertSelfOrAdmin(req, dto.driverProfileId);
        const enrollment = await this.welfareService.enrollDriver(dto);
        return { success: true, message: 'Driver enrolled successfully', data: enrollment };
    }

    @Delete('enroll/:driverProfileId/:schemeId')
    @HttpCode(HttpStatus.OK)
    async unenrollDriver(
        @Req() req: any,
        @Param('driverProfileId') driverProfileId: string,
        @Param('schemeId') schemeId: string,
    ) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const result = await this.welfareService.unenrollDriver(driverProfileId, schemeId);
        return { success: true, message: 'Driver unenrolled successfully', data: result };
    }

    @Get('enrollments/:driverProfileId')
    async getDriverEnrollments(@Req() req: any, @Param('driverProfileId') driverProfileId: string) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const enrollments = await this.welfareService.getDriverEnrollments(driverProfileId);
        return { success: true, message: 'Driver enrollments retrieved', data: enrollments };
    }

    // ─── Summary & Reports ─────────────────────────────────────────

    @Get('summary/:driverProfileId')
    async getDriverWelfareSummary(@Req() req: any, @Param('driverProfileId') driverProfileId: string) {
        this.assertSelfOrAdmin(req, driverProfileId);
        const summary = await this.welfareService.getDriverWelfareSummary(driverProfileId);
        return { success: true, message: 'Driver welfare summary retrieved', data: summary };
    }

    @Get('report/:schemeId')
    async getSchemeReport(@Req() req: any, @Param('schemeId') schemeId: string) {
        this.assertAdmin(req);
        const report = await this.welfareService.getSchemeReport(schemeId);
        return { success: true, message: 'Scheme report retrieved', data: report };
    }

    // ─── Pension Ledger & Pension Company Integration ─────────────

    /**
     * View itemized compulsory Ksh. 10 per trip pension deductions.
     */
    @Get('pension/ledger')
    async getPensionLedger(
        @Req() req: any,
        @Body() body: any,
    ) {
        this.assertAdmin(req);
        const query = req?.query || {};
        const result = await this.welfareService.getPensionLedger({
            driverProfileId: query.driverProfileId,
            startDate: query.startDate,
            endDate: query.endDate,
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 50,
        });
        return { success: true, message: 'Pension ledger retrieved', data: result };
    }

    /**
     * Export pension deductions batch formatted for Pension Company upload (CSV/JSON).
     */
    @Get('pension/export')
    async exportPensionBatch(@Req() req: any) {
        this.assertAdmin(req);
        const query = req?.query || {};
        const result = await this.welfareService.exportPensionLedgerBatch({
            startDate: query.startDate,
            endDate: query.endDate,
            format: (query.format?.toUpperCase() === 'CSV' ? 'CSV' : 'JSON') as any,
        });
        return { success: true, message: 'Pension batch exported', data: result };
    }

    /**
     * Dispatch pension deductions batch to Pension Company REST API.
     */
    @Post('pension/dispatch-api')
    async dispatchPensionRemittance(
        @Req() req: any,
        @Body() body: { startDate?: string; endDate?: string; partnerId?: string },
    ) {
        this.assertAdmin(req);
        const result = await this.welfareService.dispatchPensionRemittanceToApi(body);
        return { success: result.success, message: result.message, data: result };
    }
}
