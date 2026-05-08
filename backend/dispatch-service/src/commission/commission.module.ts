import { Module } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';
import { WelfareModule } from '../welfare/welfare.module';

@Module({
    imports: [WelfareModule],
    providers: [CommissionService],
    controllers: [CommissionController],
    exports: [CommissionService],
})
export class CommissionModule {}
