/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Security: Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Security: Cloud Run Dynamic CORS
  const isProd = process.env.NODE_ENV === 'production';

  // Enhanced CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-side calls)
      if (!origin) {
        return callback(null, true);
      }

      // Normalize origin: remove trailing slash and convert to lowercase for comparison
      const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();

      // Explicitly allowed origins (normalized)
      const allowedOrigins = [
        'https://cabi.africa',
        'https://admin.cabi.africa',
        'https://user.cabi.africa',
        'https://dispatch.cabi.africa',
        'https://cabi-africa.com',
        'https://www.cabi-africa.com',
        'https://cabi-admin-panel.vercel.app',
      ];

      // Regex patterns for subdomains and local dev
      const allowedPatterns = [
        /^https?:\/\/([^/]+\.)?cabi\.africa$/,
        /^https?:\/\/([^/]+\.)?cabi-africa\.com$/,
        /^https?:\/\/localhost(:\d+)?$/,
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
        /^https?:\/\/([^/]+\.)?run\.app$/,
        /^https?:\/\/([^/]+\.)?vercel\.app$/,
      ];

      const isAllowed = allowedOrigins.includes(normalizedOrigin) || 
                        allowedPatterns.some(pattern => pattern.test(normalizedOrigin));

      if (isAllowed) {
        callback(null, true);
      } else {
        Logger.warn(`[CORS] Request blocked from unauthorized origin: ${origin} (Normalized: ${normalizedOrigin})`, 'SecurityGateway');
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin, Access-Control-Allow-Origin',
    exposedHeaders: 'Authorization',
  });

  // API Documentation
  const config = new DocumentBuilder()
    .setTitle('CABI Africa - Auth Gateway')
    .setDescription('Unified Security & Authentication Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port, '0.0.0.0');
  
  Logger.log(`🚀 Security Gateway live at: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();