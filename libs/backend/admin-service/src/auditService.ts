// import apiClient from '@/shared/utils/apiClient';

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
  | 'PERMISSIONS_UPDATED'; // Added for our tests

interface AuditEventPayload {
  action: string; // Changed to string to be more flexible
  userId: string;
  details?: Record<string, any>;
}

export const logAuditEvent = async (payload: AuditEventPayload): Promise<{ success: boolean }> => {
  console.log(`[Audit Service Mock] Logged event:`, JSON.stringify(payload, null, 2));
  // In a real microservice architecture, this would emit an event to a message queue
  // or call a dedicated audit service. For now, we just log it.
  return { success: true };
};

export const fetchUserAuditEvents = async (
  userId: string,
  limit = 5
): Promise<AuditEvent[]> => {
  console.log(`[Audit Service Mock] Fetching events for user ${userId}`);
  return [];
};
