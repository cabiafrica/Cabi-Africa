import {
    Controller,
    Post,
    Body,
    Get,
    Put,
    Req,
    Logger,
    Query,
    HttpException,
    HttpStatus,
    Param,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import {
    SaccoService,
    CreateSaccoPartnerDto,
    UpdateSaccoPartnerDto,
    SaccoFinancialConfigDto,
    VoluntaryDeductionInput,
    DriverSaccoSummary,
    UpdateDriverSavingsSettingsDto,
} from './sacco.service';
import { SaccoIntegrationService } from './sacco-integration.service';
import { FinancialConsentService, RequestOtpDto, VerifyOtpDto } from './financial-consent.service';
import { FinancialPartnerService, CreatePartnerDto, UpdatePartnerDto } from './financial-partner.service';

@Controller('sacco')
export class SaccoController {
    private readonly logger = new Logger(SaccoController.name);

    constructor(
        private readonly saccoService: SaccoService,
        private readonly saccoIntegrationService: SaccoIntegrationService,
        private readonly financialConsentService: FinancialConsentService,
        private readonly financialPartnerService: FinancialPartnerService,
    ) {}

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
            const secret =
                process.env.JWT_SECRET ||
                (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
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

    private assertSaccoAdmin(req: any): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required for administrative Sacco operations.');
        }
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p) => p.startsWith('Sacco_') || p.startsWith('FINANCE_') || p === 'SUPER_ADMIN');
        if (!isAdmin) {
            throw new ForbiddenException('Admin privileges required for this Sacco operation.');
        }
    }

    private assertSelfOrAdmin(req: any, targetUserId?: string): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required.');
        }
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p) => p.startsWith('Sacco_') || p.startsWith('FINANCE_') || p === 'SUPER_ADMIN');
        if (isAdmin) return;

        const callerId = user.id || user.userId || user.sub;
        const callerDriverId = user.driverProfile?.id || user.driverProfileId;
        if (targetUserId && callerId !== targetUserId && callerDriverId !== targetUserId) {
            throw new ForbiddenException('Access denied: Cannot access another driver\'s financial records.');
        }
    }

    private redactPartnerSecret(partner: any): any {
        if (!partner || typeof partner !== 'object') return partner;
        const { apiKey, ...rest } = partner;
        return {
            ...rest,
            hasApiKey: Boolean(apiKey),
        };
    }

    // ─── Health ────────────────────────────────────────────────────────────────

    @Get('health')
    getHealth() {
        return this.saccoService.getHealth();
    }

    // ─── Admin: Partner Management (Multi-Category: Sacco, Insurance, Investments) ───

    /** List all configured financial partners, optionally filtered by category */
    @Get('admin/partners')
    async listPartners(@Req() req: any, @Query('category') category?: string) {
        this.assertSaccoAdmin(req);
        const partners = await this.financialPartnerService.listPartners(category);
        return Array.isArray(partners) ? partners.map((p) => this.redactPartnerSecret(p)) : partners;
    }

    /** Get a single partner by ID */
    @Get('admin/partners/:id')
    async getPartner(@Req() req: any, @Param('id') id: string) {
        this.assertSaccoAdmin(req);
        try {
            const partner = await this.financialPartnerService.getPartnerById(id);
            return this.redactPartnerSecret(partner);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    /** Create / register a new external Sacco, Insurance, or Investment partner */
    @Post('admin/partners')
    async createPartner(@Req() req: any, @Body() dto: CreatePartnerDto) {
        this.assertSaccoAdmin(req);
        try {
            const created = await this.financialPartnerService.createPartner(dto);
            return this.redactPartnerSecret(created);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /** Update an existing partner */
    @Put('admin/partners/:id')
    async updatePartner(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePartnerDto) {
        this.assertSaccoAdmin(req);
        try {
            const updated = await this.financialPartnerService.updatePartner(id, dto);
            return this.redactPartnerSecret(updated);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Test connectivity to a partner's REST API.
     * Returns { ok, latencyMs, message }
     */
    @Post('admin/partners/:id/test-connection')
    async testConnection(@Req() req: any, @Param('id') id: string) {
        this.assertSaccoAdmin(req);
        try {
            const partner = await this.financialPartnerService.getPartnerById(id);
            return await this.saccoIntegrationService.testConnection(partner.apiBaseUrl, partner.apiKey);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /** Get the currently active Sacco partner */
    @Get('active-partner')
    async getActivePartner() {
        const partner = await this.saccoService.getActivePartner();
        return this.redactPartnerSecret(partner);
    }

    // ─── Driver Wealth Programs & Allocations (30% Max Limit) ──────────────────

    /** List all active admin-provided wealth programs (Sacco, Insurance, MMF, Pension) */
    @Get('wealth-programs')
    async getWealthPrograms() {
        return this.financialPartnerService.getDriverWealthPrograms();
    }

    /** Get a driver's active enrolled wealth allocations & remaining capacity */
    @Get('wealth-programs/my-allocations')
    async getDriverAllocations(@Query('driverProfileId') driverProfileId: string, @Req() req: any) {
        if (!driverProfileId) {
            throw new HttpException('driverProfileId is required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, driverProfileId);
        return this.financialPartnerService.getDriverAllocations(driverProfileId);
    }

    /** Update driver's selected wealth programs & percentage contributions (30% cap) */
    @Post('wealth-programs/update-allocations')
    async updateDriverAllocations(
        @Body() body: {
            driverProfileId: string;
            allocations: Array<{
                partnerId: string;
                serviceType: string;
                deductionPct: number;
                isConsented: boolean;
            }>;
        },
        @Req() req: any,
    ) {
        if (!body.driverProfileId || !Array.isArray(body.allocations)) {
            throw new HttpException('driverProfileId and allocations array are required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, body.driverProfileId);
        try {
            return await this.financialPartnerService.updateDriverAllocations(
                body.driverProfileId,
                body.allocations
            );
        } catch (error: any) {
            throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Driver aborts/retracts a deduction stoppage within the 60-day notice window.
     */
    @Post('wealth-programs/cancel-abort')
    async abortDriverCancellation(
        @Body() body: { driverProfileId: string; partnerId: string },
        @Req() req: any,
    ) {
        if (!body.driverProfileId || !body.partnerId) {
            throw new HttpException('driverProfileId and partnerId are required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, body.driverProfileId);
        try {
            return await this.financialPartnerService.abortCancellation(
                body.driverProfileId,
                body.partnerId
            );
        } catch (error: any) {
            throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.BAD_REQUEST);
        }
    }

    // ─── Admin: Financial Configuration ───────────────────────────────────────

    /** Retrieve current financial split configuration */
    @Get('config')
    async getFinancialConfig() {
        return this.saccoService.getFinancialConfig();
    }

    /** Update financial split configuration (Super Admin only) */
    @Put('config')
    async updateFinancialConfig(@Req() req: any, @Body() dto: SaccoFinancialConfigDto) {
        this.assertSaccoAdmin(req);
        try {
            return await this.saccoService.updateFinancialConfig(dto);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Preview trip split breakdown for a given fare.
     * Supports voluntary deductions across Insurance, Investment, and Sacco
     * Enforces the 15% maximum cap and 4-tier waterfall.
     */
    @Post('split-preview')
    async previewSplit(
        @Body()
        body: {
            fare: number;
            enrolled?: boolean;
            incentiveOverride?: boolean;
            voluntaryDeductions?: VoluntaryDeductionInput[];
        },
    ) {
        try {
            return await this.saccoService.previewSplit(
                body.fare,
                body.enrolled ?? false,
                body.incentiveOverride,
                body.voluntaryDeductions
            );
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    // ─── Stackable Incentive Evaluator ─────────────────────────────────────────

    /** Evaluates stackable 3% incentive qualification for a driver */
    @Get('incentive/evaluate')
    async evaluateIncentive(
        @Query('driverId') driverId: string,
        @Query('completedTrips') completedTrips?: string,
        @Req() req?: any,
    ) {
        if (!driverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, driverId);
        return this.saccoService.evaluateStackableIncentives(driverId, {
            completedTrips: completedTrips ? parseInt(completedTrips) : undefined
        });
    }

    // ─── Driver: Consent & SMS OTP Flow ────────────────────────────────────────

    /** Request an SMS OTP for consenting to a product deduction (enforces 15% cap) */
    @Post('consent/request-otp')
    async requestConsentOtp(@Body() dto: RequestOtpDto, @Req() req: any) {
        this.assertSelfOrAdmin(req, dto.driverProfileId);
        try {
            return await this.financialConsentService.requestEnrollmentOtp(dto);
        } catch (error: any) {
            throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.BAD_REQUEST);
        }
    }

    /** Verify SMS OTP and activate driver consent record */
    @Post('consent/verify-otp')
    async verifyConsentOtp(@Body() dto: VerifyOtpDto, @Req() req: any) {
        this.assertSelfOrAdmin(req, dto.driverProfileId);
        try {
            return await this.financialConsentService.verifyEnrollmentOtp(dto);
        } catch (error: any) {
            throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Driver requests opt-out of a financial product.
     * - Voluntary products take effect on the 1st day of the next calendar month cycle.
     * - Sacco and Insurance are exempt and reject instant cancellation.
     */
    @Post('consent/opt-out')
    async requestOptOut(@Body() body: { driverProfileId: string; partnerId: string }, @Req() req: any) {
        if (!body.driverProfileId || !body.partnerId) {
            throw new HttpException('driverProfileId and partnerId are required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, body.driverProfileId);
        try {
            return await this.financialConsentService.requestOptOut(body.driverProfileId, body.partnerId);
        } catch (error: any) {
            throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.BAD_REQUEST);
        }
    }

    /** Get active consented financial products for a driver */
    @Get('consent/active')
    async getActiveConsents(@Query('driverProfileId') driverProfileId: string, @Req() req: any) {
        if (!driverProfileId) {
            throw new HttpException('driverProfileId is required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, driverProfileId);
        return this.financialConsentService.getActiveConsents(driverProfileId);
    }

    // ─── Legacy Driver Enrollment (Backward Compatibility) ─────────────────────

    /** Opt a driver into the external Sacco */
    @Post('enroll')
    async enrollDriver(@Body() body: { driverId: string; partnerId: string }, @Req() req: any) {
        if (!body.driverId || !body.partnerId) {
            throw new HttpException('driverId and partnerId are required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, body.driverId);
        try {
            return await this.saccoService.enrollDriver(body.driverId, body.partnerId);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /** Opt a driver out of the external Sacco */
    @Post('unenroll')
    async unenrollDriver(@Body() body: { driverId: string }, @Req() req: any) {
        if (!body.driverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, body.driverId);
        try {
            return await this.saccoService.unenrollDriver(body.driverId);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /** Get enrollment status for a driver */
    @Get('enrollment-status')
    async getEnrollmentStatus(@Query('driverId') driverId: string, @Req() req: any) {
        if (!driverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, driverId);
        return this.saccoService.getDriverEnrollmentStatus(driverId);
    }

    /** List all enrolled drivers (Admin) */
    @Get('enrolled-drivers')
    async getEnrolledDrivers(@Req() req: any) {
        this.assertSaccoAdmin(req);
        return this.saccoService.getEnrolledDrivers();
    }

    // ─── Driver: Remittance / Balance ──────────────────────────────────────────

    /** Get total remitted by a driver to the Sacco */
    @Get('balance')
    async getBalance(@Query('driverId') driverId: string, @Req() req: any) {
        if (!driverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, driverId);
        return this.saccoService.getTotalRemitted(driverId);
    }

    /** Get remittance transaction history for a driver */
    @Get('transactions')
    async getTransactions(@Query('driverId') driverId: string, @Req() req: any) {
        if (!driverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, driverId);
        return this.saccoService.getRemittanceHistory(driverId);
    }

    /** Get comprehensive Sacco summary, accumulated balance, and remittance percentage settings */
    @Get('driver/summary')
    async getDriverSummary(@Query('driverId') driverId: string, @Req() req: any) {
        const user = this.extractUser(req);
        const resolvedDriverId = driverId || user?.id || user?.userId || user?.sub;
        if (!resolvedDriverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, resolvedDriverId);
        return this.saccoService.getDriverSaccoSummary(resolvedDriverId);
    }

    /** Update driver's per-trip percentage savings rate and welfare contributions */
    @Post('driver/settings')
    async updateDriverSettings(
        @Body() body: {
            driverId?: string;
            savingsRate?: number;
            isAutoSavingsEnabled?: boolean;
            isWelfareEnabled?: boolean;
            dailyWelfareAmount?: number;
        },
        @Req() req: any
    ) {
        const user = this.extractUser(req);
        const resolvedDriverId = body.driverId || user?.id || user?.userId || user?.sub;
        if (!resolvedDriverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        this.assertSelfOrAdmin(req, resolvedDriverId);
        return this.saccoService.updateDriverSavingsSettings(resolvedDriverId, body);
    }
}

