import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { FinanceController } from './finance.controller';

describe('FinanceController Cashout & Financial AuthZ', () => {
  const secret = 'test-finance-secret';
  let controller: FinanceController;
  let service: any;

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    service = {
      getFinanceSummary: jest.fn().mockResolvedValue({ balance: 1000 }),
      setEarningsGoal: jest.fn().mockResolvedValue({ ok: true }),
      cashOut: jest.fn().mockResolvedValue({ status: 'INITIATED' }),
    };
    controller = new FinanceController(service);
  });

  const makeReq = (payload?: any) =>
    payload ? { headers: { authorization: `Bearer ${jwt.sign(payload, secret)}` } } : { headers: {} };

  it('rejects unauthenticated cashout with 401', () => {
    expect(() => controller.cashOut(makeReq(), 'drv-1')).toThrow(UnauthorizedException);
    expect(service.cashOut).not.toHaveBeenCalled();
  });

  it('blocks driver A from cashing out driver B (IDOR -> 403)', () => {
    const req = makeReq({ sub: 'drv-A', driverProfileId: 'drv-A', role: 'DRIVER' });
    expect(() => controller.cashOut(req, 'drv-B')).toThrow(ForbiddenException);
    expect(service.cashOut).not.toHaveBeenCalled();
  });

  it('rejects negative or non-finite earnings goal amounts', () => {
    const req = makeReq({ sub: 'drv-A', driverProfileId: 'drv-A', role: 'DRIVER' });
    expect(() => controller.setGoal(req, 'drv-A', { amount: -500, period: 'WEEKLY' })).toThrow(BadRequestException);
    expect(() => controller.setGoal(req, 'drv-A', { amount: 'NaN', period: 'WEEKLY' })).toThrow(BadRequestException);
  });

  it('allows driver to cash out their own balance', () => {
    const req = makeReq({ sub: 'drv-A', driverProfileId: 'drv-A', role: 'DRIVER' });
    controller.cashOut(req, 'drv-A');
    expect(service.cashOut).toHaveBeenCalledWith('drv-A');
  });
});
