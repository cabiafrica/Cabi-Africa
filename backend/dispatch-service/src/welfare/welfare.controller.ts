import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    WelfareService,
    CreateSchemeDto,
    UpdateSchemeDto,
    EnrollDriverDto,
} from './welfare.service';

@Controller('welfare')
export class WelfareController {
    constructor(private welfareService: WelfareService) {}

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
    async createScheme(@Body() dto: CreateSchemeDto) {
        const scheme = await this.welfareService.createScheme(dto);
        return { success: true, message: 'Welfare scheme created', data: scheme };
    }

    @Put('schemes/:id')
    async updateScheme(@Param('id') id: string, @Body() dto: UpdateSchemeDto) {
        const scheme = await this.welfareService.updateScheme(id, dto);
        return { success: true, message: 'Welfare scheme updated', data: scheme };
    }

    // ─── Driver Enrollment ─────────────────────────────────────────

    @Post('enroll')
    async enrollDriver(@Body() dto: EnrollDriverDto) {
        const enrollment = await this.welfareService.enrollDriver(dto);
        return { success: true, message: 'Driver enrolled successfully', data: enrollment };
    }

    @Delete('enroll/:driverProfileId/:schemeId')
    @HttpCode(HttpStatus.OK)
    async unenrollDriver(
        @Param('driverProfileId') driverProfileId: string,
        @Param('schemeId') schemeId: string,
    ) {
        const result = await this.welfareService.unenrollDriver(driverProfileId, schemeId);
        return { success: true, message: 'Driver unenrolled successfully', data: result };
    }

    @Get('enrollments/:driverProfileId')
    async getDriverEnrollments(@Param('driverProfileId') driverProfileId: string) {
        const enrollments = await this.welfareService.getDriverEnrollments(driverProfileId);
        return { success: true, message: 'Driver enrollments retrieved', data: enrollments };
    }

    // ─── Summary & Reports ─────────────────────────────────────────

    @Get('summary/:driverProfileId')
    async getDriverWelfareSummary(@Param('driverProfileId') driverProfileId: string) {
        const summary = await this.welfareService.getDriverWelfareSummary(driverProfileId);
        return { success: true, message: 'Driver welfare summary retrieved', data: summary };
    }

    @Get('report/:schemeId')
    async getSchemeReport(@Param('schemeId') schemeId: string) {
        const report = await this.welfareService.getSchemeReport(schemeId);
        return { success: true, message: 'Scheme report retrieved', data: report };
    }
}
