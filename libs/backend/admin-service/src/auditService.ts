import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { globalAuditTelemetry } from '@cabi/backend/common';

export interface AuditEvent {
  id: string;
  userId: string;
  userFullName?: string;
  action: AuditEventAction | string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'INFO' | 'WARN' | 'CRITICAL';
  details?: Record<string, any>;
  prevHash?: string;
  entryHash?: string;
}

export type AuditEventAction =
  | 'PASSWORD_CHANGED'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | '2FA_VERIFIED'
  | '2FA_FAILED'
  | 'ADMIN_LOCKED_OUT'
  | 'ADMIN_IP_BLOCKED'
  | 'ADMIN_STEP_UP_ISSUED'
  | 'ACCOUNT_DELETED'
  | 'ROLES_UPDATED'
  | 'PERMISSIONS_UPDATED'
  | 'PASSKEY_REGISTERED'
  | 'BREAK_GLASS_TRIGGERED';

export interface AuditEventPayload {
  action: string;
  userId: string;
  userFullName?: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'INFO' | 'WARN' | 'CRITICAL';
  details?: Record<string, any>;
}

const AUDIT_LOG_DIR = path.join(process.cwd(), 'logs');
const AUDIT_LOG_FILE = path.join(AUDIT_LOG_DIR, 'admin-security-audit.jsonl');

const recentAuditEvents: AuditEvent[] = [];
let lastHash = 'GENESIS';

function computeEntryHash(event: Omit<AuditEvent, 'entryHash'>): string {
  const payload = JSON.stringify({
    id: event.id,
    userId: event.userId,
    action: event.action,
    timestamp: event.timestamp,
    ipAddress: event.ipAddress,
    severity: event.severity,
    details: event.details,
    prevHash: event.prevHash,
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function redactSensitiveFields(details?: Record<string, any>): Record<string, any> | undefined {
  if (!details) return undefined;
  const sensitiveKeys = ['password', 'token', 'secret', 'totp', 'otp', 'backupCode', 'authorization'];
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(details)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = redactSensitiveFields(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logAuditEvent = async (
  payload: AuditEventPayload
): Promise<{ success: boolean; eventId: string; entryHash: string }> => {
  const sanitizedDetails = redactSensitiveFields(payload.details);
  const baseEvent: Omit<AuditEvent, 'entryHash'> = {
    id: crypto.randomUUID(),
    userId: payload.userId,
    userFullName: payload.userFullName,
    action: payload.action,
    timestamp: new Date().toISOString(),
    ipAddress: payload.ipAddress,
    userAgent: payload.userAgent,
    severity: payload.severity ?? 'INFO',
    details: sanitizedDetails,
    prevHash: lastHash,
  };

  const entryHash = computeEntryHash(baseEvent);
  const event: AuditEvent = { ...baseEvent, entryHash };
  lastHash = entryHash;

  recentAuditEvents.unshift(event);
  if (recentAuditEvents.length > 500) {
    recentAuditEvents.pop();
  }

  try {
    await fs.promises.mkdir(AUDIT_LOG_DIR, { recursive: true });
    await fs.promises.appendFile(AUDIT_LOG_FILE, JSON.stringify(event) + '\n', 'utf8');
  } catch {
    // Silently continue
  }

  // Also emit to cryptographic structured audit telemetry stream
  globalAuditTelemetry.logEvent({
    category: 'SECURITY_EVENT',
    severity: payload.action.includes('DELETED') || payload.action.includes('BREAK_GLASS') ? 'CRITICAL' : 'NOTICE',
    action: payload.action,
    actor: { userId: payload.userId, ipAddress: payload.ipAddress, userAgent: payload.userAgent },
    resource: { type: 'ADMIN_PANEL_SYSTEM', id: payload.userId },
    details: sanitizedDetails,
  }).catch(() => {});

  return { success: true, eventId: event.id, entryHash };
};

export const fetchUserAuditEvents = async (
  userId?: string,
  limit = 50
): Promise<AuditEvent[]> => {
  const filtered = userId
    ? recentAuditEvents.filter((e) => e.userId === userId)
    : recentAuditEvents;
  return filtered.slice(0, limit);
};
