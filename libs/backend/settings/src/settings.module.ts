import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaModule } from '@cabi/backend/database';
// import { AuthModule } from '@cabi/backend/auth'; // Uncomment if AuthModule is available and needed

@Module({
    imports: [
        PrismaModule,
        // AuthModule 
    ],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
