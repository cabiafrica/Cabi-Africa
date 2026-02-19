import { Module } from '@nestjs/common';
import { SaccoController } from './app/sacco.controller';
import { SaccoService } from './app/sacco.service';

@Module({
    imports: [],
    controllers: [SaccoController],
    providers: [SaccoService],
})
export class AppModule { }
