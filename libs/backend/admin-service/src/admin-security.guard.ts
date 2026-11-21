import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminSecurityService } from './admin-security.service';
import { logAuditEvent } from './auditService';

export const REQUIRE_ADMIN_STEP_UP_KEY = 'requireAdminStepUp';
export const SKIP_ADMIN_STEP_UP_KEY = 'skipAdminStepUp';

export const RequireAdminStepUp = () => SetMetadata(REQUIRE_ADMIN_STEP_UP_KEY, true);
export const SkipAdminStepUp = () => SetMetadata(SKIP_ADMIN_STEP_UP_KEY, true);

const ALLOWED_ADMIN_ROLES = new Set([
  'ADMIN',
  'SUPER_ADMIN',
  'SYSTEM_ADMIN',
  'OPS_ADMIN',
  'STAFF',
  'READ_ONLY_ADMIN',
  'admin',
  'read-only-admin',
]);

@Injectable()
export class AdminSecurityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly adminSecurityService: AdminSecurityService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url: string = request.originalUrl || request.url || '';
    const method: string = (request.method || 'GET').toUpperCase();

    // Allow health check endpoints without admin MFA
    if (url.endsWith('/health') || url === '/health') {
      return true;
    }

    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.ip ||
      request.socket?.remoteAddress ||
      '';
    const userAgent = (request.headers['user-agent'] as string) || '';

    // 1. IP Allowlist Check
    if (!this.adminSecurityService.isIpAllowed(ipAddress)) {
      await logAuditEvent({
        action: 'ADMIN_IP_BLOCKED',
        userId: request.user?.id || 'anonymous',
        ipAddress,
        userAgent,
        severity: 'CRITICAL',
        details: { method, url },
      });
      throw new ForbiddenException('Access denied: IP address is not authorized for System Admin access.');
    }

    // 2. Verify Authenticated Admin User
    const user = request.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('Admin authentication required.');
    }

    const roleName = String(user.role || '');
    const hasAdminRole =
      ALLOWED_ADMIN_ROLES.has(roleName) ||
      (Array.isArray(user.userRoles) &&
        user.userRoles.some((ur: any) => ALLOWED_ADMIN_ROLES.has(String(ur?.role?.name || ''))));

    if (!hasAdminRole) {
      throw new ForbiddenException('System Admin privileges are required to access this resource.');
    }

    // 3. Check Lockout State
    const lock = this.adminSecurityService.isLockedOut(user.id);
    if (lock.locked) {
      throw new ForbiddenException(
        `Admin account is temporarily locked. Retry in ${lock.retryAfterSeconds} seconds.`
      );
    }

    // 4. Step-Up MFA Verification on sensitive / mutating requests
    const skipStepUp = this.reflector.getAllAndOverride<boolean>(SKIP_ADMIN_STEP_UP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipStepUp) {
      return true;
    }

    const explicitStepUp = this.reflector.getAllAndOverride<boolean>(REQUIRE_ADMIN_STEP_UP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const enforceMfa =
      process.env.ADMIN_ENFORCE_STRICT_MFA !== 'false' && (explicitStepUp || isMutating);

    if (enforceMfa) {
      const mfaToken = request.headers['x-admin-mfa-token'] as string;
      const isValidStepUp = this.adminSecurityService.verifyStepUpToken(
        mfaToken,
        user.id,
        ipAddress,
        userAgent
      );

      if (!isValidStepUp) {
        throw new ForbiddenException(
          'Step-up 2FA verification required. Provide a valid X-Admin-MFA-Token obtained from POST /admin/security/2fa/challenge.'
        );
      }
    }

    return true;
  }
}
