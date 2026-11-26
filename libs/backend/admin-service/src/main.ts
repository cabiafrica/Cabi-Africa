/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';

async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  // Secured CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [
        'https://admin.cabi.africa',
        'https://dispatch.cabi.africa',
        'https://cabi.africa',
        'https://www.cabi.africa',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:3333',
        'http://localhost:3334',
        'http://localhost:3335',
        'http://localhost:3336',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.cabi.africa')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS origin not allowed: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3336;
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Admin Service is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
