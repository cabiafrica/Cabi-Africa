import { Module } from '@nestjs/common';
import { WelfareService } from './welfare.service';
import { WelfareController } from './welfare.controller';

@Module({
    providers: [WelfareService],
    controllers: [WelfareController],
    exports: [WelfareService],
})
export class WelfareModule {}
