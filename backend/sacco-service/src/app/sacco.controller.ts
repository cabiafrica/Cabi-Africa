import {
    Controller,
    Post,
    Body,
    Get,
    Put,
    Logger,
    Query,
    HttpException,
    HttpStatus,
    Param,
} from '@nestjs/common';
import {
    SaccoService,
    CreateSaccoPartnerDto,
    UpdateSaccoPartnerDto,
    SaccoFinancialConfigDto,
    VoluntaryDeductionInput,
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

    // ─── Health ────────────────────────────────────────────────────────────────

    @Get('health')
    getHealth() {
        return this.saccoService.getHealth();
    }

    // ─── Admin: Partner Management (Multi-Category: Sacco, Insurance, Investments) ───

    /** List all configured financial partners, optionally filtered by category */
    @Get('admin/partners')
    async listPartners(@Query('category') category?: string) {
        return this.financialPartnerService.listPartners(category);
    }

    /** Get a single partner by ID */
    @Get('admin/partners/:id')
    async getPartner(@Param('id') id: string) {
        try {
            return await this.financialPartnerService.getPartnerById(id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    /** Create / register a new external Sacco, Insurance, or Investment partner */
    @Post('admin/partners')
    async createPartner(@Body() dto: CreatePartnerDto) {
        try {
            return await this.financialPartnerService.createPartner(dto);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /** Update an existing partner */
    @Put('admin/partners/:id')
    async updatePartner(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
        try {
            return await this.financialPartnerService.updatePartner(id, dto);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Test connectivity to a partner's REST API.
     * Returns { ok, latencyMs, message }
     */
    @Post('admin/partners/:id/test-connection')
    async testConnection(@Param('id') id: string) {
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
        return this.saccoService.getActivePartner();
    }

    // ─── Driver Wealth Programs & Allocations (30% Max Limit) ──────────────────

    /** List all active admin-provided wealth programs (SACCO, Insurance, MMF, Pension) */
    @Get('wealth-programs')
    async getWealthPrograms() {
        return this.financialPartnerService.getDriverWealthPrograms();
    }

    /** Get a driver's active enrolled wealth allocations & remaining capacity */
    @Get('wealth-programs/my-allocations')
    async getDriverAllocations(@Query('driverProfileId') driverProfileId: string) {
        if (!driverProfileId) {
            throw new HttpException('driverProfileId is required', HttpStatus.BAD_REQUEST);
        }
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
        }
    ) {
        if (!body.driverProfileId || !Array.isArray(body.allocations)) {
            throw new HttpException('driverProfileId and allocations array are required', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.financialPartnerService.updateDriverAllocations(
                body.driverProfileId,
                body.allocations
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
    async updateFinancialConfig(@Body() dto: SaccoFinancialConfigDto) {
        try {
            return await this.saccoService.updateFinancialConfig(dto);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Preview trip split breakdown for a given fare.
     * Supports voluntary deductions across Insurance, Investment, and SACCO
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
    ) {
        if (!driverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        return this.saccoService.evaluateStackableIncentives(driverId, {
            completedTrips: completedTrips ? parseInt(completedTrips) : undefined
        });
    }

    // ─── Driver: Consent & SMS OTP Flow ────────────────────────────────────────

    /** Request an SMS OTP for consenting to a product deduction (enforces 15% cap) */
    @Post('consent/request-otp')
    async requestConsentOtp(@Body() dto: RequestOtpDto) {
        try {
            return await this.financialConsentService.requestEnrollmentOtp(dto);
        } catch (error: any) {
            throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.BAD_REQUEST);
        }
    }

    /** Verify SMS OTP and activate driver consent record */
    @Post('consent/verify-otp')
    async verifyConsentOtp(@Body() dto: VerifyOtpDto) {
        try {
            return await this.financialConsentService.verifyEnrollmentOtp(dto);
        } catch (error: any) {
            throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Driver requests opt-out of a financial product.
     * - Voluntary products take effect on the 1st day of the next calendar month cycle.
     * - SACCO and Insurance are exempt and reject instant cancellation.
     */
    @Post('consent/opt-out')
    async requestOptOut(@Body() body: { driverProfileId: string; partnerId: string }) {
        if (!body.driverProfileId || !body.partnerId) {
            throw new HttpException('driverProfileId and partnerId are required', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.financialConsentService.requestOptOut(body.driverProfileId, body.partnerId);
        } catch (error: any) {
            throw new HttpException(error.message, error.getStatus ? error.getStatus() : HttpStatus.BAD_REQUEST);
        }
    }

    /** Get active consented financial products for a driver */
    @Get('consent/active')
    async getActiveConsents(@Query('driverProfileId') driverProfileId: string) {
        if (!driverProfileId) {
            throw new HttpException('driverProfileId is required', HttpStatus.BAD_REQUEST);
        }
        return this.financialConsentService.getActiveConsents(driverProfileId);
    }

    // ─── Legacy Driver Enrollment (Backward Compatibility) ─────────────────────

    /** Opt a driver into the external Sacco */
    @Post('enroll')
    async enrollDriver(@Body() body: { driverId: string; partnerId: string }) {
        if (!body.driverId || !body.partnerId) {
            throw new HttpException('driverId and partnerId are required', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.saccoService.enrollDriver(body.driverId, body.partnerId);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /** Opt a driver out of the external Sacco */
    @Post('unenroll')
    async unenrollDriver(@Body() body: { driverId: string }) {
        if (!body.driverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.saccoService.unenrollDriver(body.driverId);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /** Get enrollment status for a driver */
    @Get('enrollment-status')
    async getEnrollmentStatus(@Query('driverId') driverId: string) {
        if (!driverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        return this.saccoService.getDriverEnrollmentStatus(driverId);
    }

    /** List all enrolled drivers (Admin) */
    @Get('enrolled-drivers')
    async getEnrolledDrivers() {
        return this.saccoService.getEnrolledDrivers();
    }

    // ─── Driver: Remittance / Balance ──────────────────────────────────────────

    /** Get total remitted by a driver to the Sacco */
    @Get('balance')
    async getBalance(@Query('driverId') driverId: string) {
        if (!driverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        return this.saccoService.getTotalRemitted(driverId);
    }

    /** Get remittance transaction history for a driver */
    @Get('transactions')
    async getTransactions(@Query('driverId') driverId: string) {
        if (!driverId) {
            throw new HttpException('driverId is required', HttpStatus.BAD_REQUEST);
        }
        return this.saccoService.getRemittanceHistory(driverId);
    }
}
