import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  const port = process.env.ADMIN_SERVICE_PORT || 3334;
  app.setGlobalPrefix('api');
  await app.listen(port);
  Logger.log(`🚀 Admin service is running on: http://localhost:${port}/api`);
}
bootstrap();