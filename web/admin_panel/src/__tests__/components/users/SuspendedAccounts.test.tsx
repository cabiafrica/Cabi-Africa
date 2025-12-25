import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SuspendedAccounts } from './SuspendedAccounts';
import { adminService } from '../services/adminService';

jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const mockSuspendedUsers = [
  {
    id: 'user-3',
    email: 'suspended@cabi.com',
    roles: [],
    directGrants: [],
    directRevokes: [],
    suspensionReason: 'BIOMETRIC_FAILURE',
    suspensionDate: '2024-05-22T14:00:00Z',
  },
];

describe('SuspendedAccounts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminService.getSuspendedUsers.mockResolvedValue(JSON.parse(JSON.stringify(mockSuspendedUsers)));
    window.confirm = jest.fn(() => true); // Auto-confirm actions
    window.alert = jest.fn();
  });

  it('should render a list of suspended users', async () => {
    render(<SuspendedAccounts />);
    await waitFor(() => {
      expect(screen.getByText('suspended@cabi.com')).toBeInTheDocument();
    });
    expect(screen.getByText('BIOMETRIC_FAILURE')).toBeInTheDocument();
  });

  it('should call unsuspendUser and refetch when "Reactivate" is clicked', async () => {
    render(<SuspendedAccounts />);
    await waitFor(() => expect(mockedAdminService.getSuspendedUsers).toHaveBeenCalledTimes(1));

    const reactivateButton = screen.getByText('Reactivate');
    fireEvent.click(reactivateButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to reactivate this user?');

    await waitFor(() => {
      expect(mockedAdminService.unsuspendUser).toHaveBeenCalledWith('user-3');
    });

    // Check if it refetches the list
    await waitFor(() => {
      expect(mockedAdminService.getSuspendedUsers).toHaveBeenCalledTimes(2);
    });

    expect(window.alert).toHaveBeenCalledWith('User reactivated successfully.');
  });
});