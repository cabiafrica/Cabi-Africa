import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RateLimitMiddleware } from '@cabi/backend/common';

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
import { RbacModule, JwtAuthGuard } from '@cabi/backend/rbac';
import { NotificationModule } from '@cabi/backend/notification-service';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { SOSController } from './sos.controller';
import { SOSService } from './sos.service';
import { DriverGroupController } from './driver-group.controller';
import { DriverGroupService } from './driver-group.service';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { DriverApprovalController } from './driver-approval.controller';
import { DriverApprovalService } from './driver-approval.service';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { AdminSecurityController } from './admin-security.controller';
import { AdminSecurityService } from './admin-security.service';
import { AdminSecurityGuard } from './admin-security.guard';
import { DualApprovalController } from './dual-approval.controller';
import { DualApprovalService } from './dual-approval.service';

@Module({
  imports: [
    RbacModule,
    NotificationModule,
  ],
  controllers: [
    AdminController, 
    AdminRolesController, 
    AdminUsersController, 
    SOSController, 
    DriverGroupController, 
    ReferralController, 
    DriverApprovalController,
    BlogController,
    OrganizationController,
    AdminSecurityController,
    DualApprovalController
  ],
  providers: [
    AdminService,
    AdminRolesService,
    AdminUsersService,
    DualApprovalService,
    Admin2FAService,
    AdminSecurityService,
    AdminSecurityGuard,
    SOSService,
    DriverGroupService,
    ReferralService,
    DriverApprovalService,
    BlogService,
    OrganizationService,
    AdminReadOnlyGuard,
    AdminPermissionGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminActionAuditInterceptor,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: AdminActionAuditGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: AdminReadOnlyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // We can keep AdminPermissionGuard if it's used elsewhere, otherwise we might remove it
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
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}