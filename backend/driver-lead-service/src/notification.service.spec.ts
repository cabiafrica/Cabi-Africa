import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { Logger } from '@nestjs/common';

// Mock external libraries
jest.mock('nodemailer');
jest.mock('fs/promises');
jest.mock('handlebars');

// Suppress console logs from the service during tests
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { /* no-op */ });
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { /* no-op */ });

describe('NotificationService', () => {
  let service: NotificationService;
  let mockTransporter;

  const mockTemplateSource = '<html><body>{{loginTime}}</body></html>';
  const mockCompiledTemplate = jest.fn();

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    };

    (nodemailer.createTestAccount as jest.Mock).mockResolvedValue({
      user: 'test-user',
      pass: 'test-pass',
    });
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    (nodemailer.getTestMessageUrl as jest.Mock).mockReturnValue('http://preview.url');

    (fs.readFile as jest.Mock).mockResolvedValue(mockTemplateSource);
    (handlebars.compile as jest.Mock).mockReturnValue(mockCompiledTemplate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('onModuleInit', () => {
    it('should initialize transporter and compile template', async () => {
      await service.onModuleInit();

      expect(nodemailer.createTestAccount).toHaveBeenCalled();
      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalledWith(expect.any(String), 'utf8');
      expect(handlebars.compile).toHaveBeenCalledWith(mockTemplateSource);
      expect(handlebars.registerHelper).toHaveBeenCalledWith('currentYear', expect.any(Function));
    });
  });

  describe('sendRecoveryCodeLoginAlert', () => {
    beforeEach(async () => {
      // Ensure service is initialized for these tests
      await service.onModuleInit();
    });

    it('should render the template and send an email', async () => {
      const renderedHtml = '<html><body>Test Render</body></html>';
      mockCompiledTemplate.mockReturnValue(renderedHtml);

      const testEmail = 'test@example.com';
      await service.sendRecoveryCodeLoginAlert(testEmail);

      // Verify template was called with data
      expect(mockCompiledTemplate).toHaveBeenCalledWith({
        loginTime: expect.any(String),
      });

      // Verify email was sent with correct details
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Cabi Security" <no-reply@cabi.example.com>',
        to: testEmail,
        subject: 'Security Alert: A Recovery Code Was Used for Your Cabi Account',
        html: renderedHtml,
      });

      // Verify preview URL was logged
      expect(nodemailer.getTestMessageUrl).toHaveBeenCalled();
    });

    it('should log an error if the transporter is not initialized', async () => {
      (service as any).transporter = null; // Force uninitialized state
      await service.sendRecoveryCodeLoginAlert('test@example.com');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });
  });
});