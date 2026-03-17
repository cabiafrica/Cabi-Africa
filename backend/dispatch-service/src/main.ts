import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from '@cabi/backend/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global Validation Pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // Enable CORS for admin panel access
    app.enableCors({
        origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'],
        credentials: true,
    });

    app.useGlobalInterceptors(new LoggingInterceptor());

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    // Swagger Setup
    const config = new DocumentBuilder()
        .setTitle('CABI Africa Dispatch API')
        .setDescription('API documentation for CABI Africa backend services including Dispatch, Driver Leads, and Settings.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3334;
    await app.listen(port);
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
    );
    Logger.log(
        `📚 Swagger documentation available at: http://localhost:${port}/api/docs`
    );
}

bootstrap();
