import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export enum AuditAction {
  DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
  DOCUMENT_VALIDATION = 'DOCUMENT_VALIDATION',
  BIOMETRIC_UPLOAD = 'BIOMETRIC_UPLOAD',
  AI_ANALYSIS = 'AI_ANALYSIS',
  ADMIN_APPROVAL = 'ADMIN_APPROVAL',
  ADMIN_REJECTION = 'ADMIN_REJECTION',
}

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  metadata: any;
  timestamp: Date;
}

@Injectable()
export class VerificationAuditService {
  private readonly logger = new Logger(VerificationAuditService.name);
  private readonly auditFile = path.join(process.cwd(), 'uploads', 'verification_audit.log');

  constructor() {
    this.ensureAuditFile();
  }

  private async ensureAuditFile() {
    try {
      const dir = path.dirname(this.auditFile);
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      this.logger.error('Error creating audit directory:', error);
    }
  }

  async log(userId: string, action: AuditAction, metadata: any): Promise<void> {
    const logEntry: AuditLog = {
      id: Math.random().toString(36).substring(7),
      userId,
      action,
      metadata,
      timestamp: new Date(),
    };

    this.logger.log(`Audit Log: [${action}] for user ${userId}`);
    
    // Append to file (in production use a database)
    try {
      await fs.appendFile(this.auditFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      this.logger.error('Error writing audit log:', error);
    }
  }

  async getLogsByUserId(userId: string): Promise<AuditLog[]> {
    try {
      const content = await fs.readFile(this.auditFile, 'utf8');
      return content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => JSON.parse(line))
        .filter(log => log.userId === userId);
    } catch (error) {
      return [];
    }
  }
}
