/**
 * Features Audit Service API - client-side service for audit log operations
 * Used by ProfilePage and other feature pages
 */

export interface AuditEvent {
  id: string;
  userId: string;
  userFullName?: string;
  action: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function logAuditEvent(event: { action: string; userId: string; details?: Record<string, unknown> }): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/admin/audit-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

export async function fetchUserAuditEvents(userId: string, limit = 10): Promise<AuditEvent[]> {
  try {
    const response = await fetch(`${API_BASE}/api/admin/audit-events?userId=${userId}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch user audit events');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch user audit events:', error);
    return [];
  }
}
