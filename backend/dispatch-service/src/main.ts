import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for admin panel access
    app.enableCors({
        origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'],
        credentials: true,
    });

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3334;
    await app.listen(port);
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
    );
}

bootstrap();
