import apiClient from '@/shared/utils/apiClient';

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
  | 'ACCOUNT_DELETED';

interface AuditEventPayload {
  action: AuditEventAction;
  userId: string;
  details?: Record<string, any>;
}

export const logAuditEvent = async (payload: AuditEventPayload): Promise<{ success: boolean }> => {
  console.log(`[Mock] Logging audit event:`, payload);
  const { data } = await apiClient.post<{ success: boolean }>('/audit-events', payload);
  return data;
};

export const fetchUserAuditEvents = async (
  userId: string,
  limit: number = 5
): Promise<AuditEvent[]> => {
  const { data } = await apiClient.get<AuditEvent[]>(`/audit-events/user/${userId}`, {
    params: { limit },
  });
  return data;
};