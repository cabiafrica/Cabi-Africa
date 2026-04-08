/**
 * Audit Service API - client-side service for audit log operations
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

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  try {
    const response = await fetch(`${API_BASE}/api/admin/audit-events`);
    if (!response.ok) throw new Error('Failed to fetch audit events');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch audit events:', error);
    return [];
  }
}
