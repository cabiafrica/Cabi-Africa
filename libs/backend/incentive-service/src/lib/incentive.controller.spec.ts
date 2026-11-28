import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { IncentiveController } from './incentive.controller';

describe('IncentiveController Anti-Fraud & RBAC Protection', () => {
  const secret = 'test-incentive-secret';
  let controller: IncentiveController;
  let service: any;

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    service = {
      completeReferral: jest.fn().mockResolvedValue({ completed: true }),
      incrementStreak: jest.fn().mockResolvedValue({ count: 1 }),
      createRule: jest.fn().mockResolvedValue({ id: 'r1' }),
      getStreak: jest.fn().mockResolvedValue({ count: 3 }),
    };
    controller = new IncentiveController(service);
  });

  const makeReq = (payload?: any) =>
    payload ? { headers: { authorization: `Bearer ${jwt.sign(payload, secret)}` } } : { headers: {} };

  it('blocks unauthenticated referral completion and streak farming with 401', () => {
    expect(() => controller.completeReferral(makeReq(), 'ref-1')).toThrow(UnauthorizedException);
    expect(() => controller.incrementStreak(makeReq(), 'drv-1')).toThrow(UnauthorizedException);
  });

  it('blocks drivers from incrementing their own streak or creating incentive rules (403)', () => {
    const req = makeReq({ sub: 'drv-1', role: 'DRIVER' });
    expect(() => controller.incrementStreak(req, 'drv-1')).toThrow(ForbiddenException);
    expect(() => controller.createRule(req, { bonus: 99999 })).toThrow(ForbiddenException);
    expect(service.incrementStreak).not.toHaveBeenCalled();
  });

  it('blocks driver A from reading driver B streak (IDOR)', () => {
    const req = makeReq({ sub: 'drv-A', role: 'DRIVER' });
    expect(() => controller.getStreak(req, 'drv-B')).toThrow(ForbiddenException);
  });

  it('allows ADMIN to create incentive rules', () => {
    const req = makeReq({ sub: 'admin-1', role: 'ADMIN' });
    controller.createRule(req, { bonus: 500 });
    expect(service.createRule).toHaveBeenCalledWith({ bonus: 500 });
  });
});
