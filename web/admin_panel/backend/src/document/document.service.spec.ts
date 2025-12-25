import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { NotificationService } from '@cabi/backend/notification-service';
import { UserService } from '@cabi/backend/user-service';

// Mock the dependent services
class MockNotificationService {}
class MockUserService {}

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: UserService, useClass: MockUserService },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findForUser', () => {
    it('should return only the latest submission for each document type', async () => {
      const userId = 'driver-123'; // This user has multiple submissions for one doc type
      const documents = await service.findForUser(userId);

      // Expected: 2 documents, because there are 2 unique doc types for this user.
      expect(documents).toHaveLength(2);

      // Find the Driver's License submission
      const driversLicense = documents.find(d => d.docType === "Driver's License");
      expect(driversLicense).toBeDefined();

      // It should be the latest one (sub-2), which is 'Pending Review', not the older 'Rejected' one (sub-1).
      expect(driversLicense.id).toBe('sub-2');
      expect(driversLicense.status).toBe('Pending Review');
    });

    it('should return an empty array for a user with no documents', async () => {
      const userId = 'new-driver-789';
      const documents = await service.findForUser(userId);
      expect(documents).toHaveLength(0);
    });
  });

  describe('findHistoryForUser', () => {
    const userId = 'driver-123';

    it('should return all submissions for a specific user and docType, sorted by date', async () => {
      const docType = "Driver's License";
      const history = await service.findHistoryForUser(userId, docType);

      // driver-123 has 2 submissions for Driver's License
      expect(history).toHaveLength(2);

      // Verify they are sorted with the newest first
      expect(history[0].id).toBe('sub-2'); // submitted 2024-08-20
      expect(history[1].id).toBe('sub-1'); // submitted 2024-08-19
    });

    it('should return all submissions for a user if no docType is provided', async () => {
      const history = await service.findHistoryForUser(userId);

      // driver-123 has 3 total submissions across all doc types
      expect(history).toHaveLength(3);
      expect(history[0].id).toBe('sub-3'); // Most recent submission overall
    });

    it('should return an empty array for a docType with no history', async () => {
      const docType = 'Profile Photo'; // This user has no submissions for this type
      const history = await service.findHistoryForUser(userId, docType);

      expect(history).toHaveLength(0);
    });
  });
});