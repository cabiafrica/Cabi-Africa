import { globalAuditTelemetry } from '@cabi/backend/common';

export interface AuditEvent {
  id: string;
  userId: string;
  userFullName?: string;
  action: AuditEventAction;
  timestamp: string;
  details?: Record<string, any>;
}

export type AuditEventAction =
  | 'PASSWORD_CHANGED'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | 'ACCOUNT_DELETED'
  | 'ROLES_UPDATED' // Added for our tests
  | 'PERMISSIONS_UPDATED' // Added for our tests
  | 'PASSKEY_REGISTERED'
  | 'BREAK_GLASS_TRIGGERED';

interface AuditEventPayload {
  action: string;
  userId: string;
  details?: Record<string, any>;
}

export const logAuditEvent = async (payload: AuditEventPayload): Promise<{ success: boolean }> => {
  await globalAuditTelemetry.logEvent({
    category: 'SECURITY_EVENT',
    severity: payload.action.includes('DELETED') || payload.action.includes('BREAK_GLASS') ? 'CRITICAL' : 'NOTICE',
    action: payload.action,
    actor: { userId: payload.userId },
    resource: { type: 'ADMIN_PANEL_SYSTEM', id: payload.userId },
    details: payload.details,
  });
  return { success: true };
};

export const fetchUserAuditEvents = async (
  userId: string,
  limit = 5
): Promise<AuditEvent[]> => {
  console.log(`[Audit Service Mock] Fetching events for user ${userId}`);
  return [];
};
