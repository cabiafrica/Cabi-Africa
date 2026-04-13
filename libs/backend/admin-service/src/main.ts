/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';

async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  // Enable CORS
  app.enableCors();
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3336;
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Admin Service is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
