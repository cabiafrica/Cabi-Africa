import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { PrismaService } from '@cabi/backend/database';
import { GatewayModule } from '../gateway.module';

@Module({
    imports: [GatewayModule],
    providers: [MatchingService, PrismaService],
    exports: [MatchingService],
})
export class MatchingModule { }
