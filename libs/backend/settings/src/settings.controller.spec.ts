import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SettingsController } from './settings.controller';

describe('SettingsController AuthZ & Admin Protection', () => {
  const secret = 'test-settings-secret';
  let controller: SettingsController;
  let service: any;

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    service = {
      getUserSettings: jest.fn().mockResolvedValue({}),
      updateUserSettings: jest.fn().mockResolvedValue({}),
      getAllSystemSettings: jest.fn().mockResolvedValue([]),
      updateSystemSetting: jest.fn().mockResolvedValue({}),
    };
    controller = new SettingsController(service);
  });

  const makeReq = (payload?: any) =>
    payload ? { headers: { authorization: `Bearer ${jwt.sign(payload, secret)}` } } : { headers: {} };

  it('rejects unauthenticated access to system settings with 401', async () => {
    await expect(controller.getAllSystemSettings(makeReq())).rejects.toThrow(UnauthorizedException);
    await expect(controller.updateSystemSetting(makeReq(), 'commission', { value: '0' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects non-admin updates to global system settings with 403', async () => {
    const req = makeReq({ sub: 'drv-1', role: 'DRIVER' });
    await expect(controller.updateSystemSetting(req, 'commission', { value: '0' } as any)).rejects.toThrow(ForbiddenException);
    expect(service.updateSystemSetting).not.toHaveBeenCalled();
  });

  it('blocks cross-user IDOR on user settings', async () => {
    const req = makeReq({ sub: 'user-A', role: 'PASSENGER' });
    await expect(controller.getUserSettings(req, 'user-B')).rejects.toThrow(ForbiddenException);
  });

  it('allows ADMIN to update system settings', async () => {
    const req = makeReq({ sub: 'admin-1', role: 'ADMIN' });
    await controller.updateSystemSetting(req, 'commission', { value: '15' } as any);
    expect(service.updateSystemSetting).toHaveBeenCalledWith('commission', '15');
  });
});
