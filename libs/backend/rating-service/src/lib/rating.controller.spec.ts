import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { RatingController } from './rating.controller';

describe('RatingController AuthZ & Bounds Validation', () => {
  const secret = 'test-rating-secret';
  let controller: RatingController;
  let service: any;

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    service = {
      submitRating: jest.fn().mockResolvedValue({ id: 'rt-1' }),
      getAllRatings: jest.fn().mockResolvedValue([]),
      hideRating: jest.fn().mockResolvedValue({ hidden: true }),
    };
    controller = new RatingController(service);
  });

  const makeReq = (payload?: any) =>
    payload ? { headers: { authorization: `Bearer ${jwt.sign(payload, secret)}` } } : { headers: {} };

  it('blocks unauthenticated rating submission and admin moderation with 401', async () => {
    expect(() => controller.submitRating(makeReq(), { stars: 5 })).toThrow(UnauthorizedException);
    await expect(controller.getAll(makeReq())).rejects.toThrow(UnauthorizedException);
  });

  it('blocks non-admin rating moderation with 403', () => {
    const req = makeReq({ sub: 'pass-1', role: 'PASSENGER' });
    expect(() => controller.hideRating(req, 'rt-1')).toThrow(ForbiddenException);
  });

  it('rejects out-of-range stars and derives raterId from JWT', () => {
    const req = makeReq({ sub: 'pass-1', role: 'PASSENGER' });
    expect(() => controller.submitRating(req, { stars: 99, raterId: 'spoof' })).toThrow(BadRequestException);

    controller.submitRating(req, { rideId: 'r1', raterId: 'spoof', rateeId: 'drv-1', stars: 5 });
    expect(service.submitRating).toHaveBeenCalledWith(
      expect.objectContaining({ raterId: 'pass-1', stars: 5 })
    );
  });
});
