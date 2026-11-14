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

  // Security: Standard OWASP Headers
  const isProd = process.env.NODE_ENV === 'production';
  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    if (isProd) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    if (res.removeHeader) {
      res.removeHeader('X-Powered-By');
    }
    next();
  });

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
        'https://cabi-user-portal.vercel.app',
        'https://cabi-dispatch-panel.vercel.app',
      ];

      // Regex patterns for owned subdomains (and local dev only when not in production)
      const allowedPatterns = [
        /^https:\/\/([^/]+\.)?cabi\.africa$/,
        /^https:\/\/([^/]+\.)?cabi-africa\.com$/,
        ...(!isProd
          ? [
              /^https?:\/\/localhost(:\d+)?$/,
              /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
              /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/,
            ]
          : []),
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

  // API Documentation (Non-Production Only)
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('CABI Africa - Auth Gateway')
      .setDescription('Unified Security & Authentication Gateway')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3333;
  await app.listen(port, '0.0.0.0');
  
  Logger.log(`🚀 Security Gateway live at: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();