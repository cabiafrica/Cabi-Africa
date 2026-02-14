import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { PrismaService } from '@cabi/backend/database';

@Module({
    providers: [BadgeService, PrismaService],
    exports: [BadgeService],
})
export class BadgeModule { }
