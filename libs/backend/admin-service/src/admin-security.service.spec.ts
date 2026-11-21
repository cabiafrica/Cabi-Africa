import * as speakeasy from 'speakeasy';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminSecurityService } from './admin-security.service';

describe('AdminSecurityService', () => {
  let service: AdminSecurityService;

  beforeEach(() => {
    delete process.env.ADMIN_IP_ALLOWLIST;
    service = new AdminSecurityService();
  });

  it('enrolls 2FA, confirms with valid TOTP, and issues a verified step-up token', async () => {
    const setup = await service.setup2FA('admin-1', 'admin@cabi.africa');
    expect(setup.qrCodeDataUrl).toContain('data:image/png;base64');
    expect(setup.backupCodes).toHaveLength(8);

    const validTotp = speakeasy.totp({
      secret: setup.manualEntryKey,
      encoding: 'base32',
    });

    const confirmation = await service.confirm2FASetup('admin-1', validTotp, '196.201.214.10', 'Chrome');
    expect(confirmation.isTwoFactorEnabled).toBe(true);
    expect(confirmation.stepUpToken).toBeDefined();

    // Valid token bound to matching IP and User-Agent
    expect(service.verifyStepUpToken(confirmation.stepUpToken, 'admin-1', '196.201.214.10', 'Chrome')).toBe(true);

    // Rejected if replayed from different IP or User-Agent
    expect(service.verifyStepUpToken(confirmation.stepUpToken, 'admin-1', '10.0.0.99', 'Chrome')).toBe(false);
    expect(service.verifyStepUpToken(confirmation.stepUpToken, 'admin-1', '196.201.214.10', 'curl')).toBe(false);
  });

  it('consumes one-time backup recovery codes and locks out after 5 failed attempts', async () => {
    const setup = await service.setup2FA('admin-2', 'sec@cabi.africa');
    const validTotp = speakeasy.totp({ secret: setup.manualEntryKey, encoding: 'base32' });
    await service.confirm2FASetup('admin-2', validTotp, '127.0.0.1', 'TestAgent');

    // First use of backup code succeeds
    const backupRes = await service.verifyChallengeAndIssueStepUpToken(
      'admin-2',
      setup.backupCodes[0],
      '127.0.0.1',
      'TestAgent'
    );
    expect(backupRes.success).toBe(true);
    expect(backupRes.remainingBackupCodes).toBe(7);

    // Reusing the same backup code fails and increments failure counter
    for (let i = 0; i < 5; i++) {
      await expect(
        service.verifyChallengeAndIssueStepUpToken('admin-2', '000000', '127.0.0.1', 'TestAgent')
      ).rejects.toThrow(UnauthorizedException);
    }

    // 6th attempt is locked out
    await expect(
      service.verifyChallengeAndIssueStepUpToken('admin-2', setup.backupCodes[1], '127.0.0.1', 'TestAgent')
    ).rejects.toThrow(ForbiddenException);
  });

  it('enforces ADMIN_IP_ALLOWLIST when configured', () => {
    process.env.ADMIN_IP_ALLOWLIST = '196.201.214.10, 41.90.10.5';
    expect(service.isIpAllowed('196.201.214.10')).toBe(true);
    expect(service.isIpAllowed('::ffff:41.90.10.5')).toBe(true);
    expect(service.isIpAllowed('8.8.8.8')).toBe(false);
  });
});
