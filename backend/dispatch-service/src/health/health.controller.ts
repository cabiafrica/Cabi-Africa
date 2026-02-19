import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '@cabi/backend/database';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private prisma: PrismaService) { }

    @Get()
    @ApiOperation({ summary: 'Basic health check' })
    async check() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    @Get('db')
    @ApiOperation({ summary: 'Database health check' })
    async checkDb() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'ok', database: 'connected' };
        } catch (error) {
            return { status: 'error', database: 'disconnected', message: error.message };
        }
    }
}
