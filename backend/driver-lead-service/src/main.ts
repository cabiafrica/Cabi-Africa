import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    // Global Validation Pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // Dynamic CORS for Cloud Run
    const isProd = process.env.NODE_ENV === 'production';
    app.enableCors({
        origin: isProd 
            ? [/https:\/\/.*\.cabi-africa\.com$/, /https:\/\/.*\.run\.app$/] 
            : true,
        credentials: true,
    });

    // Swagger Setup
    const config = new DocumentBuilder()
        .setTitle('CABI Africa - Driver Lead API')
        .setDescription('Service managing driver onboarding, leads, and professional profiles.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3010;
    await app.listen(port, '0.0.0.0');
    
    Logger.log(`🏎️ Driver Lead Service live at: http://localhost:${port}/${globalPrefix}`);
    Logger.log(`📚 API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();