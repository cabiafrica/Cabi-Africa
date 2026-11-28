import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { VerificationWebhookService } from './verification-webhook.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VerificationWebhookService SSRF & HMAC Signing', () => {
  let service: VerificationWebhookService;
  let configService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'VERIFICATION_WEBHOOK_URL') return '';
        if (key === 'VERIFICATION_WEBHOOK_SECRET') return 'whsec_test_123';
        return undefined;
      }),
    };
    service = new VerificationWebhookService(configService);
  });

  it('blocks SSRF attempts targeting cloud metadata and loopback addresses', async () => {
    await expect(service.setWebhookUrl('http://169.254.169.254/latest/meta-data/')).rejects.toThrow(BadRequestException);
    await expect(service.setWebhookUrl('http://127.0.0.1:8080/internal')).rejects.toThrow(BadRequestException);
    await expect(service.setWebhookUrl('http://10.0.0.5/admin')).rejects.toThrow(BadRequestException);
    await expect(service.setWebhookUrl('http://localhost:3000/hook')).rejects.toThrow(BadRequestException);
  });

  it('signs outbound webhooks with HMAC-SHA256 and disables redirects', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200, data: {} } as any);
    await service.setWebhookUrl('https://partner.example.com/webhooks/kyc');
    await service.notifyPassengerVerified('user-1', 'LEVEL_2', { id: true });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://partner.example.com/webhooks/kyc',
      expect.any(String),
      expect.objectContaining({
        maxRedirects: 0,
        headers: expect.objectContaining({
          'X-Webhook-Signature': expect.stringMatching(/^sha256=[a-f0-9]{64}$/),
        }),
      })
    );
  });
});
