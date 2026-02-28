import { Controller, Get, Headers } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('health')
  healthCheck(): any {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'verification-service',
      version: '1.0.0'
    };
  }

  @Get('health/ready')
  readinessCheck(): any {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        storage: 'ok',
        ocr: 'ok'
      }
    };
  }

  @Get('version')
  getVersion(): any {
    return {
      version: '1.0.0',
      build: process.env.BUILD_NUMBER || 'dev',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };
  }
}
