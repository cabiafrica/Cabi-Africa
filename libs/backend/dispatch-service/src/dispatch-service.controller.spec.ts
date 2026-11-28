import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

jest.mock('./dispatch-service.service', () => ({
  DispatchService: jest.fn(),
}));

import { DispatchController } from './dispatch-service.controller';

describe('DispatchController AuthZ & Driver Ownership', () => {
  const secret = 'test-dispatch-ctrl-secret';
  let controller: DispatchController;
  let service: any;

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    service = {
      getDashboardMetrics: jest.fn().mockResolvedValue({ activeRides: 3 }),
      assignDriver: jest.fn().mockResolvedValue({ assigned: true }),
      updateDriverLocation: jest.fn().mockResolvedValue({ ok: true }),
      getCurrentRide: jest.fn().mockResolvedValue(null),
    };
    controller = new DispatchController(service);
  });

  const makeReq = (payload?: any) =>
    payload ? { headers: { authorization: `Bearer ${jwt.sign(payload, secret)}` } } : { headers: {} };

  it('keeps /dispatch/health public', () => {
    expect(controller.healthCheck().status).toBe('OK');
  });

  it('rejects unauthenticated dashboard metrics and driver assignment with 401', async () => {
    await expect(controller.getMetrics(makeReq())).rejects.toThrow(UnauthorizedException);
    await expect(controller.assignDriver(makeReq(), 'r1', 'd1')).rejects.toThrow(UnauthorizedException);
  });

  it('blocks passengers/drivers from dispatcher-only assignment with 403', async () => {
    const req = makeReq({ sub: 'drv-1', role: 'DRIVER' });
    await expect(controller.assignDriver(req, 'r1', 'drv-1')).rejects.toThrow(ForbiddenException);
  });

  it('blocks driver A from spoofing driver B location and validates coordinates', async () => {
    const req = makeReq({ sub: 'drv-A', driverProfileId: 'drv-A', role: 'DRIVER' });
    await expect(controller.updateDriverLocation(req, 'drv-B', { lat: -1.29, lng: 36.82 })).rejects.toThrow(ForbiddenException);
    await expect(controller.updateDriverLocation(req, 'drv-A', { lat: Number.NaN, lng: 36.82 })).rejects.toThrow(BadRequestException);
  });

  it('binds getCurrentRide userId to caller JWT for non-dispatchers', async () => {
    const req = makeReq({ sub: 'pass-1', role: 'PASSENGER' });
    await controller.getCurrentRide(req, 'victim-99', 'PASSENGER');
    expect(service.getCurrentRide).toHaveBeenCalledWith('pass-1', 'PASSENGER');
  });
});
