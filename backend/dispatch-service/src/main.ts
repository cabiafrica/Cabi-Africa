import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from '@cabi/backend/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
          /https?:\/\/([^/]+\.)?cabi\.africa$/,
          /https?:\/\/([^/]+\.)?cabi-africa\.com$/,
          /https?:\/\/([^/]+\.)?run\.app$/,
          /https?:\/\/([^/]+\.)?vercel\.app$/,
        ]
      : true,
    credentials: true,
  });

  app.useGlobalInterceptors(new LoggingInterceptor());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Swagger Setup
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
