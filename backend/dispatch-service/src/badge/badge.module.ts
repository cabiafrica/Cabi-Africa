import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { PrismaService } from '@cabi/backend/database';
import { WealthModule } from '../wealth/wealth.module';

@Module({
    imports: [WealthModule],
    providers: [BadgeService, PrismaService],
    exports: [BadgeService],
})
export class BadgeModule { }
