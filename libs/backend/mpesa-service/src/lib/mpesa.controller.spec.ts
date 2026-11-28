import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { MpesaController } from './mpesa.controller';

describe('MpesaController Security & Webhook Verification', () => {
  let controller: MpesaController;
  let mockService: any;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.MOBILE_MONEY_WEBHOOK_SECRET;
    delete process.env.MPESA_WEBHOOK_SECRET;
    mockService = {
      handleStkCallback: jest.fn().mockReturnValue({ id: 'tx-1', status: 'COMPLETED' }),
      handleC2BConfirmation: jest.fn().mockReturnValue({ id: 'tx-2', amount: 500 }),
      registerC2BUrls: jest.fn().mockResolvedValue({ ok: true }),
      initiateB2C: jest.fn().mockResolvedValue({ ok: true }),
    };
    controller = new MpesaController(mockService);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('verifyWebhookOrigin', () => {
    it('rejects missing secret header when MOBILE_MONEY_WEBHOOK_SECRET is configured', async () => {
      process.env.MOBILE_MONEY_WEBHOOK_SECRET = 'super-strong-webhook-secret';
      await expect(
        controller.handleStkCallback({ query: { secret: 'super-strong-webhook-secret' } }, {}, {} as any)
      ).rejects.toThrow(UnauthorizedException);
      expect(mockService.handleStkCallback).not.toHaveBeenCalled();
    });

    it('rejects invalid secret header', async () => {
      process.env.MOBILE_MONEY_WEBHOOK_SECRET = 'super-strong-webhook-secret';
      await expect(
        controller.handleStkCallback({}, { 'x-mobile-money-webhook-secret': 'wrong-secret' }, {} as any)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('accepts valid x-mobile-money-webhook-secret header', async () => {
      process.env.MOBILE_MONEY_WEBHOOK_SECRET = 'super-strong-webhook-secret';
      const res = await controller.handleStkCallback(
        {},
        { 'x-mobile-money-webhook-secret': 'super-strong-webhook-secret' },
        {} as any
      );
      expect(res).toEqual({ success: true });
      expect(mockService.handleStkCallback).toHaveBeenCalledTimes(1);
    });

    it('blocks spoofed X-Forwarded-For IP in production when req.ip is untrusted', async () => {
      process.env.NODE_ENV = 'production';
      await expect(
        controller.handleStkCallback(
          { ip: '203.0.113.99' },
          { 'x-forwarded-for': '196.201.214.200' },
          {} as any
        )
      ).rejects.toThrow(ForbiddenException);
      expect(mockService.handleStkCallback).not.toHaveBeenCalled();
    });

    it('blocks untrusted IP in staging environment as well', async () => {
      process.env.NODE_ENV = 'staging';
      await expect(
        controller.handleStkCallback({ ip: '198.51.100.10' }, {}, {} as any)
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows allowlisted req.ip in production when secret is not set', async () => {
      process.env.NODE_ENV = 'production';
      const res = await controller.handleStkCallback({ ip: '::ffff:196.201.214.200' }, {}, {} as any);
      expect(res).toEqual({ success: true });
    });
  });

  describe('assertFinanceAdmin', () => {
    it('rejects unauthenticated B2C requests', async () => {
      await expect(
        controller.initiateB2C({}, { phoneNumber: '254712345678', amount: 100, occasion: 'payout' } as any)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects non-admin users calling B2C', async () => {
      await expect(
        controller.initiateB2C(
          { user: { id: 'u1', role: 'PASSENGER', permissions: [] } },
          { phoneNumber: '254712345678', amount: 100, occasion: 'payout' } as any
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
