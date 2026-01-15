// admin-action-audit.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logAuditEvent } from './auditService';

/**
 * Interceptor that logs admin state‑changing actions.
 * It extracts the admin user id from the request (assumes request.user.id) and the
 * action name from the handler method name. The payload is sent to the audit service.
 */
@Injectable()
export class AdminActionAuditInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user || {};
        const adminId = user.id ?? 'unknown';
        const adminName = user.fullName ?? '';
        const method = request.method;
        const url = request.originalUrl;
        const action = `${method} ${url}`;
        const details = {
            body: request.body,
            params: request.params,
            query: request.query,
        };
        return next.handle().pipe(
            tap(async () => {
                // Log after the request succeeds
                await logAuditEvent({
                    action: action as any,
                    userId: adminId,
                    details,
                });
            }),
        );
    }
}
