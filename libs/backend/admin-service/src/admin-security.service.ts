import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { logAuditEvent } from './auditService';

export interface AdminMfaRecord {
  adminId: string;
  encryptedSecret: string;
  iv: string;
  authTag: string;
  isEnabled: boolean;
  backupCodeHashes: string[];
  enrolledAt?: Date;
  lastVerifiedAt?: Date;
}

interface LockoutState {
  failedAttempts: number;
  lockedUntil?: number;
}

interface StepUpTokenPayload {
  sub: string;
  ipHash: string;
  uaHash: string;
  iat: number;
  exp: number;
  purpose: 'admin_step_up_mfa';
}

@Injectable()
export class AdminSecurityService {
  private readonly logger = new Logger(AdminSecurityService.name);

  // In-memory store backed by encrypted secrets; replace with Prisma/Redis table in clustered production
  private readonly mfaStore = new Map<string, AdminMfaRecord>();
  private readonly lockoutStore = new Map<string, LockoutState>();

  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
  private readonly STEP_UP_TTL_SECONDS = 15 * 60; // 15 minutes

  private getSigningKey(): Buffer {
    const raw = process.env.ADMIN_SECURITY_SIGNING_KEY || 'cabi-admin-stepup-dev-key-change-in-prod';
    return crypto.createHash('sha256').update(raw).digest();
  }

  private getEncryptionKey(): Buffer {
    const raw = process.env.ADMIN_MFA_ENCRYPTION_KEY || 'cabi-admin-mfa-aes256-dev-key-change-in-prod';
    return crypto.createHash('sha256').update(raw).digest();
  }

  private encryptSecret(plaintext: string): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { encrypted, iv: iv.toString('hex'), authTag };
  }

  private decryptSecret(encrypted: string, ivHex: string, authTagHex: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private hashValue(value: string): string {
    return crypto.createHash('sha256').update(value || '').digest('hex');
  }

  /**
   * Check whether an IP address is permitted by ADMIN_IP_ALLOWLIST (if configured).
   */
  isIpAllowed(ipAddress?: string): boolean {
    const allowlistEnv = process.env.ADMIN_IP_ALLOWLIST;
    if (!allowlistEnv || allowlistEnv.trim() === '') {
      return true; // Open unless explicitly restricted in environment
    }
    const allowedIps = allowlistEnv
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);
    if (allowedIps.length === 0) return true;
    const normalizedIp = (ipAddress || '').replace(/^::ffff:/, '');
    return allowedIps.includes(normalizedIp) || allowedIps.includes('*');
  }

  /**
   * Check if an admin is currently locked out due to repeated failed MFA/security challenges.
   */
  isLockedOut(adminId: string): { locked: boolean; retryAfterSeconds?: number } {
    const state = this.lockoutStore.get(adminId);
    if (!state || !state.lockedUntil) return { locked: false };
    const now = Date.now();
    if (now < state.lockedUntil) {
      return {
        locked: true,
        retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000),
      };
    }
    this.lockoutStore.delete(adminId);
    return { locked: false };
  }

  private async recordFailedAttempt(adminId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const current = this.lockoutStore.get(adminId) || { failedAttempts: 0 };
    current.failedAttempts += 1;

    if (current.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      current.lockedUntil = Date.now() + this.LOCKOUT_DURATION_MS;
      this.lockoutStore.set(adminId, current);
      this.logger.warn(`Admin ${adminId} locked out after ${current.failedAttempts} failed 2FA attempts`);
      await logAuditEvent({
        action: 'ADMIN_LOCKED_OUT',
        userId: adminId,
        ipAddress,
        userAgent,
        severity: 'CRITICAL',
        details: { failedAttempts: current.failedAttempts, lockoutMinutes: 15 },
      });
    } else {
      this.lockoutStore.set(adminId, current);
      await logAuditEvent({
        action: '2FA_FAILED',
        userId: adminId,
        ipAddress,
        userAgent,
        severity: 'WARN',
        details: { failedAttempts: current.failedAttempts, remaining: this.MAX_FAILED_ATTEMPTS - current.failedAttempts },
      });
    }
  }

  private clearFailedAttempts(adminId: string): void {
    this.lockoutStore.delete(adminId);
  }

  /**
   * Step 1: Begin 2FA enrollment for an admin user.
   */
  async setup2FA(adminId: string, adminEmail?: string) {
    const secret = speakeasy.generateSecret({
      name: `Cabi Africa Admin (${adminEmail || adminId})`,
      issuer: 'Cabi Africa Limited',
      length: 32,
    });

    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
    const backupCodeHashes = backupCodes.map((code) => this.hashValue(code));

    const { encrypted, iv, authTag } = this.encryptSecret(secret.base32);

    this.mfaStore.set(adminId, {
      adminId,
      encryptedSecret: encrypted,
      iv,
      authTag,
      isEnabled: false,
      backupCodeHashes,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      qrCodeDataUrl,
      manualEntryKey: secret.base32,
      backupCodes, // Shown once to admin during enrollment
      message: 'Scan the QR code with your authenticator app and confirm with a 6-digit code.',
    };
  }

  /**
   * Step 2: Verify initial TOTP code to activate mandatory 2FA for the admin.
   */
  async confirm2FASetup(
    adminId: string,
    totpCode: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const record = this.mfaStore.get(adminId);
    if (!record) {
      throw new ForbiddenException('2FA setup has not been initiated for this admin.');
    }

    const secretBase32 = this.decryptSecret(record.encryptedSecret, record.iv, record.authTag);
    const isValid = speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: totpCode,
      window: 1,
    });

    if (!isValid) {
      await this.recordFailedAttempt(adminId, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid 2FA verification code.');
    }

    record.isEnabled = true;
    record.enrolledAt = new Date();
    record.lastVerifiedAt = new Date();
    this.mfaStore.set(adminId, record);
    this.clearFailedAttempts(adminId);

    await logAuditEvent({
      action: '2FA_ENABLED',
      userId: adminId,
      ipAddress,
      userAgent,
      severity: 'INFO',
    });

    const stepUpToken = this.issueStepUpToken(adminId, ipAddress, userAgent);
    return {
      success: true,
      isTwoFactorEnabled: true,
      stepUpToken,
      expiresInSeconds: this.STEP_UP_TTL_SECONDS,
    };
  }

  /**
   * Step 3: Verify TOTP or single-use backup code and issue a signed Step-Up MFA token.
   */
  async verifyChallengeAndIssueStepUpToken(
    adminId: string,
    code: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const lock = this.isLockedOut(adminId);
    if (lock.locked) {
      throw new ForbiddenException(
        `Admin account temporarily locked due to failed security checks. Try again in ${lock.retryAfterSeconds} seconds.`
      );
    }

    const record = this.mfaStore.get(adminId);
    if (!record || !record.isEnabled) {
      throw new ForbiddenException('2FA is not enabled for this admin. Complete /admin/security/2fa/setup first.');
    }

    const secretBase32 = this.decryptSecret(record.encryptedSecret, record.iv, record.authTag);
    let verified = speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    let method: 'TOTP' | 'BACKUP_CODE' = 'TOTP';

    if (!verified) {
      // Check one-time backup codes
      const codeHash = this.hashValue(code.trim().toUpperCase());
      const idx = record.backupCodeHashes.indexOf(codeHash);
      if (idx !== -1) {
        record.backupCodeHashes.splice(idx, 1); // Consume one-time code
        verified = true;
        method = 'BACKUP_CODE';
      }
    }

    if (!verified) {
      await this.recordFailedAttempt(adminId, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid 2FA or recovery code.');
    }

    record.lastVerifiedAt = new Date();
    this.mfaStore.set(adminId, record);
    this.clearFailedAttempts(adminId);

    const stepUpToken = this.issueStepUpToken(adminId, ipAddress, userAgent);

    await logAuditEvent({
      action: 'ADMIN_STEP_UP_ISSUED',
      userId: adminId,
      ipAddress,
      userAgent,
      severity: 'INFO',
      details: { method, remainingBackupCodes: record.backupCodeHashes.length },
    });

    return {
      success: true,
      stepUpToken,
      expiresInSeconds: this.STEP_UP_TTL_SECONDS,
      remainingBackupCodes: record.backupCodeHashes.length,
    };
  }

  /**
   * Issue HMAC-SHA256 signed Step-Up MFA token bound to adminId, IP, and User-Agent.
   */
  issueStepUpToken(adminId: string, ipAddress?: string, userAgent?: string): string {
    const nowSec = Math.floor(Date.now() / 1000);
    const payload: StepUpTokenPayload = {
      sub: adminId,
      ipHash: this.hashValue((ipAddress || '').replace(/^::ffff:/, '')),
      uaHash: this.hashValue(userAgent || ''),
      iat: nowSec,
      exp: nowSec + this.STEP_UP_TTL_SECONDS,
      purpose: 'admin_step_up_mfa',
    };
    const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    const sig = crypto
      .createHmac('sha256', this.getSigningKey())
      .update(encoded)
      .digest('base64url');
    return `${encoded}.${sig}`;
  }

  /**
   * Validate a Step-Up MFA token against the current request context.
   */
  verifyStepUpToken(
    token: string,
    expectedAdminId: string,
    ipAddress?: string,
    userAgent?: string
  ): boolean {
    if (!token || !token.includes('.')) return false;
    const [encoded, providedSig] = token.split('.');
    if (!encoded || !providedSig) return false;

    const expectedSig = crypto
      .createHmac('sha256', this.getSigningKey())
      .update(encoded)
      .digest('base64url');

    const providedBuf = Buffer.from(providedSig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (providedBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return false;

    try {
      const payload = JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8')
      ) as StepUpTokenPayload;

      if (payload.purpose !== 'admin_step_up_mfa') return false;
      if (payload.sub !== expectedAdminId) return false;
      if (Math.floor(Date.now() / 1000) > payload.exp) return false;

      const currentIpHash = this.hashValue((ipAddress || '').replace(/^::ffff:/, ''));
      const currentUaHash = this.hashValue(userAgent || '');
      if (payload.ipHash !== currentIpHash || payload.uaHash !== currentUaHash) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  getSecurityStatus(adminId: string) {
    const record = this.mfaStore.get(adminId);
    const lock = this.isLockedOut(adminId);
    return {
      adminId,
      isTwoFactorEnabled: Boolean(record?.isEnabled),
      enrolledAt: record?.enrolledAt || null,
      lastVerifiedAt: record?.lastVerifiedAt || null,
      remainingBackupCodes: record?.backupCodeHashes.length ?? 0,
      lockedOut: lock.locked,
      retryAfterSeconds: lock.retryAfterSeconds ?? 0,
      ipAllowlistActive: Boolean(process.env.ADMIN_IP_ALLOWLIST?.trim()),
    };
  }
}
