import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export type AuditSeverity = 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'ALERT';

export type AuditCategory =
  | 'SECURITY_EVENT'
  | 'AUTH_FAILURE'
  | 'AUTH_SUCCESS'
  | 'BREAK_GLASS'
  | 'DUAL_APPROVAL'
  | 'PRIVILEGE_ESCALATION'
  | 'PII_ACCESS'
  | 'ROLE_MANAGEMENT';

export interface AuditActor {
  userId?: string;
  email?: string;
  role?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditTargetResource {
  type: string;
  id?: string;
  name?: string;
}

export interface StructuredAuditEvent {
  id: string;
  timestamp: string;
  category: AuditCategory;
  severity: AuditSeverity;
  action: string;
  actor: AuditActor;
  resource: AuditTargetResource;
  details: Record<string, any>;
  integrity: {
    sequence: number;
    prevHash: string;
    hash: string;
  };
}

@Injectable()
export class AuditTelemetryService {
  private readonly logger = new Logger(AuditTelemetryService.name);
  private sequenceCounter = 0;
  private lastHash = '0000000000000000000000000000000000000000000000000000000000000000';
  private logFilePath: string;

  constructor() {
    const baseDir = process.env.AUDIT_LOG_DIR || path.join(process.cwd(), 'logs');
    try {
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }
      this.logFilePath = path.join(baseDir, 'audit-telemetry.jsonl');
    } catch {
      this.logFilePath = path.join('/tmp', 'cabi-audit-telemetry.jsonl');
    }
  }

  /**
   * Computes SHA-256 cryptographic chaining hash over event data and previous block hash
   */
  private computeHash(prevHash: string, seq: number, payload: string): string {
    return crypto
      .createHash('sha256')
      .update(`${prevHash}:${seq}:${payload}`)
      .digest('hex');
  }

  /**
   * Emits an immutable, structured audit event to stdout (GCP Cloud Logging) and persistent JSONL stream
   */
  public async logEvent(params: {
    category: AuditCategory;
    severity: AuditSeverity;
    action: string;
    actor: AuditActor;
    resource: AuditTargetResource;
    details?: Record<string, any>;
  }): Promise<StructuredAuditEvent> {
    const eventId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    this.sequenceCounter++;

    const payloadString = JSON.stringify({
      id: eventId,
      timestamp,
      category: params.category,
      severity: params.severity,
      action: params.action,
      actor: params.actor,
      resource: params.resource,
      details: params.details || {},
    });

    const currentHash = this.computeHash(this.lastHash, this.sequenceCounter, payloadString);

    const fullEvent: StructuredAuditEvent = {
      id: eventId,
      timestamp,
      category: params.category,
      severity: params.severity,
      action: params.action,
      actor: params.actor,
      resource: params.resource,
      details: params.details || {},
      integrity: {
        sequence: this.sequenceCounter,
        prevHash: this.lastHash,
        hash: currentHash,
      },
    };

    // Forward chain
    this.lastHash = currentHash;

    // 1. Google Cloud Logging Structured Log Output (stdout)
    const gcpStructuredLog = {
      severity: params.severity,
      message: `[AUDIT ${params.severity}] ${params.action} by ${params.actor.email || params.actor.userId || 'system'} on ${params.resource.type}`,
      'logging.googleapis.com/labels': {
        category: params.category,
        action: params.action,
        integrity_seq: String(this.sequenceCounter),
      },
      jsonPayload: fullEvent,
    };
    console.log(JSON.stringify(gcpStructuredLog));

    // 2. Append to Persistent Immutable Stream File
    try {
      fs.appendFileSync(this.logFilePath, JSON.stringify(fullEvent) + '\n', 'utf8');
    } catch (e: any) {
      this.logger.warn(`Could not append to local audit file ${this.logFilePath}: ${e.message}`);
    }

    // 3. For CRITICAL / ALERT events, trigger security alert warning
    if (params.severity === 'CRITICAL' || params.severity === 'ALERT') {
      this.logger.error(
        `🚨 HIGH SEVERITY SECURITY AUDIT EVENT [${params.severity}]: ${params.action} - Actor: ${JSON.stringify(params.actor)}`
      );
    }

    return fullEvent;
  }

  // --- Convenience Helpers for High-Risk Actions ---

  public async logBreakGlass(actor: AuditActor, justification: string, targetAction: string): Promise<StructuredAuditEvent> {
    return this.logEvent({
      category: 'BREAK_GLASS',
      severity: 'ALERT',
      action: 'BREAK_GLASS_SOLO_OVERRIDE',
      actor,
      resource: { type: 'APPROVAL_REQUEST', name: targetAction },
      details: {
        justification,
        targetAction,
        note: 'Break-glass emergency solo execution was triggered without secondary peer approval.',
      },
    });
  }

  public async logDualApproval(action: string, status: 'REQUESTED' | 'APPROVED' | 'REJECTED', actor: AuditActor, target: string, metadata?: any): Promise<StructuredAuditEvent> {
    return this.logEvent({
      category: 'DUAL_APPROVAL',
      severity: status === 'REJECTED' ? 'WARNING' : 'NOTICE',
      action: `DUAL_APPROVAL_${status}`,
      actor,
      resource: { type: 'DUAL_APPROVAL_FLOW', name: action },
      details: { target, status, ...metadata },
    });
  }

  public async logAuthFailure(identifier: string, reason: string, ipAddress?: string, userAgent?: string): Promise<StructuredAuditEvent> {
    return this.logEvent({
      category: 'AUTH_FAILURE',
      severity: 'WARNING',
      action: 'LOGIN_OR_2FA_FAILED',
      actor: { email: identifier, ipAddress, userAgent },
      resource: { type: 'AUTH_SESSION', id: identifier },
      details: { reason },
    });
  }

  public async logRoleChange(actor: AuditActor, targetUserId: string, targetUserEmail: string, oldRoles: string[], newRoles: string[]): Promise<StructuredAuditEvent> {
    const isEscalation = newRoles.includes('SUPER_ADMIN') && !oldRoles.includes('SUPER_ADMIN');
    return this.logEvent({
      category: isEscalation ? 'PRIVILEGE_ESCALATION' : 'ROLE_MANAGEMENT',
      severity: isEscalation ? 'CRITICAL' : 'NOTICE',
      action: isEscalation ? 'SUPER_ADMIN_ELEVATION' : 'USER_ROLES_MODIFIED',
      actor,
      resource: { type: 'USER_ACCOUNT', id: targetUserId, name: targetUserEmail },
      details: { oldRoles, newRoles, isEscalation },
    });
  }
}

// Global Singleton export for direct invocation without Nest DI where needed
export const globalAuditTelemetry = new AuditTelemetryService();
