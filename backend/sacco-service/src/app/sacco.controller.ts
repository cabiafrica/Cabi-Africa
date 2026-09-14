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
    CreatePartnerDto,
    UpdatePartnerDto,
    EnrollDriverDto,
    UpdateFinancialConfigDto,
} from './sacco.service';
import { SaccoIntegrationService } from './sacco-integration.service';

@Controller('sacco')
export class SaccoController {
    private readonly logger = new Logger(SaccoController.name);

    constructor(
        private readonly saccoService: SaccoService,
        private readonly saccoIntegrationService: SaccoIntegrationService,
    ) {}

    // ─── Health ────────────────────────────────────────────────────────────────

    @Get('health')
    getHealth() {
        return this.saccoService.getHealth();
    }

    // ─── Admin: Partner Management ─────────────────────────────────────────────

    /** List all configured Sacco partners */
    @Get('admin/partners')
    async listPartners() {
        return this.saccoService.listPartners();
    }

    /** Get a single partner by ID */
    @Get('admin/partners/:id')
    async getPartner(@Param('id') id: string) {
        try {
            return await this.saccoService.getPartnerById(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    /** Create / register a new external Sacco partner */
    @Post('admin/partners')
    async createPartner(@Body() dto: CreatePartnerDto) {
        try {
            return await this.saccoService.createPartner(dto);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /** Update an existing Sacco partner */
    @Put('admin/partners/:id')
    async updatePartner(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
        try {
            return await this.saccoService.updatePartner(id, dto);
        } catch (error) {
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
            const partner = await this.saccoService.getPartnerById(id);
            return await this.saccoIntegrationService.testConnection(partner);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /** Get the currently active partner (visible to all authenticated users) */
    @Get('active-partner')
    async getActivePartner() {
        return this.saccoService.getActivePartner();
    }

    // ─── Admin: Financial Configuration ───────────────────────────────────────

    /** Retrieve current financial split configuration */
    @Get('config')
    async getFinancialConfig() {
        return this.saccoService.getFinancialConfig();
    }

    /** Update financial split configuration (Super Admin only) */
    @Put('config')
    async updateFinancialConfig(@Body() dto: UpdateFinancialConfigDto) {
        try {
            return await this.saccoService.updateFinancialConfig(dto);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Preview trip split breakdown for a given fare.
     * Body: { fare: number, enrolled?: boolean, incentiveOverride?: boolean }
     * Returns KES amounts for all scenarios.
     */
    @Post('split-preview')
    async previewSplit(
        @Body()
        body: {
            fare: number;
            enrolled?: boolean;
            incentiveOverride?: boolean;
        },
    ) {
        try {
            return await this.saccoService.previewSplit(body.fare, body.enrolled, body.incentiveOverride);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    // ─── Driver: Enrollment ────────────────────────────────────────────────────

    /** Opt a driver into the external Sacco (voluntary) */
    @Post('enroll')
    async enrollDriver(@Body() dto: EnrollDriverDto) {
        try {
            return await this.saccoService.enrollDriver(dto);
        } catch (error) {
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
        } catch (error) {
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
