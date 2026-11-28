import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PromotionController } from './promotion.controller';

describe('PromotionController AuthZ & Input Validation', () => {
  const secret = 'test-promo-secret';
  let controller: PromotionController;
  let service: any;

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    service = {
      getAllPromoCodes: jest.fn().mockResolvedValue([]),
      validateAndApplyPromo: jest.fn().mockResolvedValue({ valid: true, discount: 100 }),
      createPromoCode: jest.fn().mockResolvedValue({ id: 'p1' }),
      updatePromoCode: jest.fn().mockResolvedValue({ id: 'p1' }),
      deletePromoCode: jest.fn().mockResolvedValue({ deleted: true }),
    };
    controller = new PromotionController(service);
  });

  const makeReq = (payload?: any) =>
    payload ? { headers: { authorization: `Bearer ${jwt.sign(payload, secret)}` } } : { headers: {} };

  it('blocks unauthenticated promo creation with 401', () => {
    expect(() => controller.createPromoCode(makeReq(), { code: 'FREE100' })).toThrow(UnauthorizedException);
  });

  it('blocks non-admin promo creation/deletion with 403', () => {
    const req = makeReq({ sub: 'pass-1', role: 'PASSENGER' });
    expect(() => controller.createPromoCode(req, { code: 'FREE100' })).toThrow(ForbiddenException);
    expect(() => controller.deletePromoCode(req, 'p1')).toThrow(ForbiddenException);
  });

  it('rejects negative amount and enforces caller userId on validatePromo', () => {
    const req = makeReq({ sub: 'pass-1', role: 'PASSENGER' });
    expect(() => controller.validatePromo(req, 'SAVE10', 'victim-99', '-50')).toThrow(BadRequestException);

    controller.validatePromo(req, 'SAVE10', 'victim-99', '500');
    expect(service.validateAndApplyPromo).toHaveBeenCalledWith('SAVE10', 'pass-1', 500);
  });
});
