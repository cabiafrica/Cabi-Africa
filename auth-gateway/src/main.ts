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
  app.enableCors({
    origin: isProd 
      ? [/https:\/\/.*\.cabi-africa\.com$/, /https:\/\/.*\.run\.app$/] 
      : true,
    credentials: true,
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