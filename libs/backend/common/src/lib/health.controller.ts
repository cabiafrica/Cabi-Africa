import { Controller, Get, Optional, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * Shared Health Controller — dependency-free.
 * Works in every service regardless of which PrismaService token is provided.
 * For DB connectivity tests, use the service-specific /health/db endpoint
 * implemented locally in each service if needed.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: process.memoryUsage().heapUsed,
        rss: process.memoryUsage().rss,
      },
    };
  }
}
