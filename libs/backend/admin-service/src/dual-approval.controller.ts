import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { DualApprovalService, HighRiskActionType } from './dual-approval.service';
import { RequirePermissions, PermissionsGuard, JwtAuthGuard } from '@cabi/backend/rbac';
import { Permission } from '@prisma/client';
import { AdminPermissionGuard } from './admin-permission.guard';

@Controller('admin/dual-approvals')
@UseGuards(JwtAuthGuard, AdminPermissionGuard, PermissionsGuard)
export class DualApprovalController {
    constructor(private readonly approvalService: DualApprovalService) { }

    @Get()
    @RequirePermissions(Permission.GROUPS_ROLES_VIEW)
    listApprovals(@Query('status') status?: string) {
        return this.approvalService.listRequests(status);
    }

    @Get(':id')
    @RequirePermissions(Permission.GROUPS_ROLES_VIEW)
    getApproval(@Param('id') id: string) {
        return this.approvalService.getRequest(id);
    }

    @Post()
    @RequirePermissions(Permission.GROUPS_ROLES_EDIT)
    createApprovalRequest(
        @Body() body: { actionType: HighRiskActionType; targetId: string; payload: any; targetDescription?: string },
        @Req() req: any
    ) {
        return this.approvalService.createRequest(
            req.user,
            body.actionType,
            body.targetId,
            body.payload,
            body.targetDescription
        );
    }

    @Post(':id/approve')
    @RequirePermissions(Permission.GROUPS_ROLES_EDIT)
    approveRequest(@Param('id') id: string, @Req() req: any) {
        return this.approvalService.approve(id, req.user);
    }

    @Post(':id/reject')
    @RequirePermissions(Permission.GROUPS_ROLES_EDIT)
    rejectRequest(@Param('id') id: string, @Body() body: { reason: string }, @Req() req: any) {
        return this.approvalService.reject(id, req.user, body.reason);
    }

    @Post(':id/break-glass')
    @RequirePermissions(Permission.GROUPS_ROLES_EDIT)
    breakGlassEmergencyExecute(
        @Param('id') id: string,
        @Body() body: { justification: string; otpCode: string },
        @Req() req: any
    ) {
        return this.approvalService.executeBreakGlass(id, req.user, body.justification, body.otpCode);
    }
}
