import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuditLogViewer } from './AuditLogViewer';
import { adminService } from '../services/adminService';

jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const mockLogs = [
  {
    id: 'log-1',
    adminUserId: 'user-1',
    adminUserEmail: 'super@cabi.com',
    action: 'UPDATE_REFERRAL_CONFIG',
    details: { change: 'sacco.rate from 0.05 to 0.06' },
    ipAddress: '127.0.0.1',
    timestamp: '2024-05-22T10:00:00Z',
  },
  {
    id: 'log-2',
    adminUserId: 'user-2',
    adminUserEmail: 'content@cabi.com',
    action: 'CREATE_BLOG_POST',
    details: { postId: 'post-123' },
    ipAddress: '192.168.1.1',
    timestamp: '2024-05-22T11:00:00Z',
  },
];

describe('AuditLogViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminService.getAuditLogs.mockResolvedValue(mockLogs);
  });

  it('should render a list of audit logs', async () => {
    render(<AuditLogViewer />);
    await waitFor(() => {
      expect(screen.getByText('super@cabi.com')).toBeInTheDocument();
    });
    expect(screen.getByText('content@cabi.com')).toBeInTheDocument();
    expect(screen.getByText('UPDATE_REFERRAL_CONFIG')).toBeInTheDocument();
  });

  it('should refetch logs when a filter is applied', async () => {
    render(<AuditLogViewer />);
    await waitFor(() => expect(mockedAdminService.getAuditLogs).toHaveBeenCalledTimes(1));

    const userFilterInput = screen.getByLabelText(/Filter by User Email/);
    fireEvent.change(userFilterInput, { target: { value: 'super@cabi.com' } });

    const filterButton = screen.getByText('Apply Filters');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(mockedAdminService.getAuditLogs).toHaveBeenCalledTimes(2);
      expect(mockedAdminService.getAuditLogs).toHaveBeenCalledWith({
        userEmail: 'super@cabi.com',
        action: '',
        startDate: '',
        endDate: '',
      });
    });
  });
});