import { Test, TestingModule } from '@nestjs/testing';
// The service and log are in the same file for this mock setup
import { AdminUserService, mockUserAuditLog } from './document.service';

describe('AdminUserService', () => {
  let service: AdminUserService;

  beforeEach(async () => {
    // Clear the mock log before each test to ensure isolation
    mockUserAuditLog.length = 0;

    // In a real app, you might mock dependent services here.
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminUserService],
    }).compile();

    service = module.get<AdminUserService>(AdminUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserStatus', () => {
    it('should log a suspension with a reason', async () => {
      const userId = 'user-to-suspend';
      const adminId = 'test-admin';
      const reason = 'Repeated policy violations.';
      const result = await service.updateUserStatus(userId, 'Suspended', adminId, reason);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.accountStatus).toBe('Suspended');

      // Verify the audit log entry
      expect(mockUserAuditLog).toHaveLength(1);
      const logEntry = mockUserAuditLog[0];
      expect(logEntry.action).toBe('Suspended');
      expect(logEntry.targetUserId).toBe(userId);
      expect(logEntry.adminId).toBe(adminId);
      expect(logEntry.reason).toBe(reason);
    });

    it('should log an activation without a reason', async () => {
      const userId = 'user-to-activate';
      const adminId = 'test-admin';
      const result = await service.updateUserStatus(userId, 'Active', adminId);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.accountStatus).toBe('Active');

      // Verify the audit log entry
      expect(mockUserAuditLog).toHaveLength(1);
      expect(mockUserAuditLog[0].action).toBe('Activated');
      expect(mockUserAuditLog[0].reason).toBeUndefined();
    });
  });

  describe('getAuditLogs', () => {
    beforeEach(() => {
      // Populate the log with test data
      mockUserAuditLog.push(
        { timestamp: '2024-08-01T10:00:00Z', adminId: 'admin-1', targetUserId: 'user-1', action: 'Suspended', reason: 'Reason 1' },
        { timestamp: '2024-08-15T12:00:00Z', adminId: 'admin-2', targetUserId: 'user-2', action: 'Activated' },
        { timestamp: '2024-08-30T14:00:00Z', adminId: 'admin-1', targetUserId: 'user-3', action: 'Suspended', reason: 'Reason 2' }
      );
    });

    it('should filter logs by start date', async () => {
      const result = await service.getAuditLogs(1, 10, undefined, undefined, '2024-08-15');
      expect(result.data).toHaveLength(2);
      expect(result.data.some(log => log.targetUserId === 'user-1')).toBe(false);
    });

    it('should filter logs by end date', async () => {
      const result = await service.getAuditLogs(1, 10, undefined, undefined, undefined, '2024-08-15');
      expect(result.data).toHaveLength(2);
      expect(result.data.some(log => log.targetUserId === 'user-3')).toBe(false);
    });

    it('should filter logs by both start and end date', async () => {
      const result = await service.getAuditLogs(1, 10, undefined, undefined, '2024-08-10', '2024-08-20');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].targetUserId).toBe('user-2');
    });

    it('should return no results for a date range with no logs', async () => {
      const result = await service.getAuditLogs(1, 10, undefined, undefined, '2024-09-01', '2024-09-30');
      expect(result.data).toHaveLength(0);
    });

    it('should combine date filters with other filters', async () => {
      const result = await service.getAuditLogs(1, 10, 'admin-1', 'Suspended', '2024-08-20', '2024-08-31');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].targetUserId).toBe('user-3');
    });

    it('should handle date strings correctly at boundaries', async () => {
      // Test start date boundary
      let result = await service.getAuditLogs(1, 10, undefined, undefined, '2024-08-15');
      expect(result.data.find(log => log.targetUserId === 'user-2')).toBeDefined();

      // Test end date boundary
      result = await service.getAuditLogs(1, 10, undefined, undefined, undefined, '2024-08-15');
      expect(result.data.find(log => log.targetUserId === 'user-2')).toBeDefined();
    });
  });
});