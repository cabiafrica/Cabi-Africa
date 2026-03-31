import { Module } from '@nestjs/common';

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
import { RbacModule } from '@cabi/backend/rbac';

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

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [AdminController, AdminRolesController, AdminUsersController, SOSController, DriverGroupController, ReferralController, DriverApprovalController],
  providers: [
    AdminService,
    AdminRolesService,
    AdminUsersService,
    Admin2FAService,
    SOSService,
    DriverGroupService,
    ReferralService,
    DriverApprovalService,
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
export class AdminModule { }