import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OccurrenceModule } from './modules/occurrence.module';
import { PrismaModule } from './modules/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../../.env',
        }),
        PrismaModule,
        OccurrenceModule,
    ],
})
export class AppModule { }
