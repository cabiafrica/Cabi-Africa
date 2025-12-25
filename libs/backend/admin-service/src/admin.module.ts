import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminActionAuditInterceptor } from './admin-action-audit.interceptor';
import { AdminActionAuditGuard } from './admin-action-audit.guard';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AdminReadOnlyGuard } from './admin-read-only.guard';
import { AdminPermissionGuard } from './admin-permission.guard';
import { AdminRolesController } from './admin-roles.controller';
import { AdminRolesService } from './admin-roles.service';
import { Admin2FAService } from './admin-2fa.service';
import { AdminGeofenceInterceptor } from './admin-geofence.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available throughout the app
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true, // Automatically load entities defined in the project
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Auto-create schema in dev. DO NOT use in prod.
      }),
    }),
  ],
  controllers: [AdminController, AdminRolesController],
  providers: [
    AdminService,
    AdminRolesService,
    Admin2FAService,
    AdminReadOnlyGuard,
    AdminPermissionGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminActionAuditInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AdminActionAuditGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminReadOnlyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminPermissionGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminGeofenceInterceptor,
    },
  ],
})
export class AdminModule { }