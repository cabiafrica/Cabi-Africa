import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrivacyController } from './privacy.controller';

describe('PrivacyController AuthZ & IDOR Protection', () => {
  let controller: PrivacyController;
  let mockService: any;
  const secret = 'test-privacy-secret';

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    mockService = {
      getPrivacySettings: jest.fn().mockResolvedValue({ shareLocation: false }),
      updatePrivacySettings: jest.fn().mockResolvedValue({ updated: true }),
      requestDataExport: jest.fn().mockResolvedValue({ jobId: 'exp-1' }),
      getDataExportStatus: jest.fn().mockResolvedValue({ status: 'PENDING' }),
      requestAccountDeletion: jest.fn().mockResolvedValue({ scheduled: true }),
      cancelAccountDeletion: jest.fn().mockResolvedValue({ cancelled: true }),
      canSendMarketingEmail: jest.fn().mockResolvedValue(false),
      canSendMarketingPush: jest.fn().mockResolvedValue(false),
    };
    controller = new PrivacyController(mockService);
  });

  const makeReq = (payload?: any) =>
    payload
      ? { headers: { authorization: `Bearer ${jwt.sign(payload, secret)}` } }
      : { headers: {} };

  it('rejects unauthenticated access to data export and account deletion with 401', () => {
    expect(() => controller.requestDataExport(makeReq(), 'user-1')).toThrow(UnauthorizedException);
    expect(() => controller.requestAccountDeletion(makeReq(), 'user-1', { password: 'x' })).toThrow(UnauthorizedException);
    expect(mockService.requestDataExport).not.toHaveBeenCalled();
  });

  it('blocks cross-user IDOR attempts with 403', () => {
    const req = makeReq({ sub: 'attacker-2', role: 'PASSENGER' });
    expect(() => controller.getPrivacySettings(req, 'victim-1')).toThrow(ForbiddenException);
    expect(() => controller.requestDataExport(req, 'victim-1')).toThrow(ForbiddenException);
    expect(() => controller.requestAccountDeletion(req, 'victim-1', { password: 'x' })).toThrow(ForbiddenException);
  });

  it('allows a user to access their own privacy settings', async () => {
    const req = makeReq({ sub: 'user-1', role: 'PASSENGER' });
    await controller.getPrivacySettings(req, 'user-1');
    expect(mockService.getPrivacySettings).toHaveBeenCalledWith('user-1');
  });

  it('allows ADMIN to access another user privacy status', async () => {
    const req = makeReq({ sub: 'admin-99', role: 'ADMIN' });
    await controller.getDataExportStatus(req, 'user-1');
    expect(mockService.getDataExportStatus).toHaveBeenCalledWith('user-1');
  });
});
