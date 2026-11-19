import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor, RateLimitMiddleware } from '@cabi/backend/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Global Rate Limiting
  const rateLimiter = new RateLimitMiddleware();
  app.use((req: any, res: any, next: any) => rateLimiter.use(req, res, next));

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Production-ready CORS configuration
  const isProduction = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProduction
      ? [
          /^https:\/\/([^/]+\.)?cabi\.africa$/,
          /^https:\/\/([^/]+\.)?cabi-africa\.com$/,
          'https://cabi-admin-panel.vercel.app',
          'https://cabi-user-portal.vercel.app',
          'https://cabi-dispatch-panel.vercel.app',
        ]
      : true,
    credentials: true,
  });

  // Security: Standard OWASP Headers (CSP, HSTS, Frameguard, Permissions-Policy)
  app.use((req: any, res: any, next: any) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(self), camera=()');
    if (isProduction) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
    }
    if (res.removeHeader) {
      res.removeHeader('X-Powered-By');
    }
    next();
  });

  app.useGlobalInterceptors(new LoggingInterceptor());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Swagger Setup (Non-Production Only)
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('CABI Africa Dispatch API')
      .setDescription(
        'API documentation for CABI Africa backend services including Dispatch, Driver Leads, and Settings.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3334;
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
