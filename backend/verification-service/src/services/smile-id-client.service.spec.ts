import { SmileIdClientService } from './smile-id-client.service';
import { ConfigService } from '@nestjs/config';

describe('SmileIdClientService', () => {
  let service: SmileIdClientService;
  let mockConfigService: Partial<ConfigService>;

  describe('Sandbox / Development Mode', () => {
    beforeEach(() => {
      delete process.env.NODE_ENV;
      delete process.env.ALLOW_KYC_SANDBOX;

      mockConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'SMILE_ID_PARTNER_ID') return '';
          if (key === 'SMILE_ID_API_KEY') return '';
          if (key === 'SMILE_ID_BASE_URL') return 'https://testapi.smileidentity.com/v1';
          return null;
        }),
      };

      service = new SmileIdClientService(mockConfigService as ConfigService);
    });

    it('should successfully validate valid Kenyan National ID in sandbox mode', async () => {
      const res = await service.verifyNationalId('12345678', 'JOHN KAMAU MWANGI', '1992-06-15');
      expect(res.success).toBe(true);
      expect(res.source).toBe('SANDBOX_SIMULATOR');
      expect(res.resultCode).toBe('1012');
      expect(res.confidenceValue).toBeGreaterThanOrEqual(0.95);
    });

    it('should reject invalid National ID number format in sandbox mode', async () => {
      const res = await service.verifyNationalId('12', 'INVALID USER');
      expect(res.success).toBe(false);
      expect(res.resultCode).toBe('1013');
    });

    it('should successfully validate Kenyan Smart DL in sandbox mode with Class D1', async () => {
      const res = await service.verifyDrivingLicense('DL-A1234567', 'JOHN KAMAU MWANGI');
      expect(res.success).toBe(true);
      expect(res.source).toBe('SANDBOX_SIMULATOR');
      expect(res.licenseClass).toContain('Class D1');
    });
  });

  describe('Production Mode Fail-Secure Guards', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_KYC_SANDBOX;

      mockConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'ALLOW_KYC_SANDBOX') return 'false';
          return null;
        }),
      };

      service = new SmileIdClientService(mockConfigService as ConfigService);
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should reject auto-approval in production when credentials missing', async () => {
      const res = await service.verifyNationalId('12345678', 'SUSPICIOUS DRIVER');
      expect(res.success).toBe(false);
      expect(res.jobComplete).toBe(false);
      expect(res.resultCode).toBe('5003');
      expect(res.resultText).toContain('manual compliance review');
    });

    it('should reject DL auto-approval in production when registry unavailable', async () => {
      const res = await service.verifyDrivingLicense('DL-99999999', 'SUSPICIOUS DRIVER');
      expect(res.success).toBe(false);
      expect(res.jobComplete).toBe(false);
      expect(res.resultCode).toBe('5003');
      expect(res.resultText).toContain('manual compliance review');
    });
  });
});
