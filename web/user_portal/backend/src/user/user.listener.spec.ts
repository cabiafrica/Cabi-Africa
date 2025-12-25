import { Test, TestingModule } from '@nestjs/testing';
import { UserListener } from './user.listener';
import { NotificationService } from '../notification.service';

describe('UserListener', () => {
  let listener: UserListener;
  let notificationService: NotificationService;

  // Mock NotificationService
  const mockNotificationService = {
    sendPushNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserListener,
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    listener = module.get<UserListener>(UserListener);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should handle account.activated event and send a notification', () => {
    const payload = { userId: 'driver-123', email: 'test@test.com' };
    listener.handleAccountActivated(payload);

    expect(notificationService.sendPushNotification).toHaveBeenCalledWith(
      payload.userId,
      expect.any(Object),
    );
  });
});