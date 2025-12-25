import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DriverApplicationsList } from './DriverApplicationsList';
import { adminService } from '../services/adminService';

// Mock the service
jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

// Mock the detail component to isolate the list component's logic
jest.mock('./DriverApplicationDetail', () => ({
  DriverApplicationDetail: ({ applicationId, onBack }: { applicationId: string, onBack: () => void }) => (
    <div>
      <h2>Detail for {applicationId}</h2>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

describe('DriverApplicationsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a list of pending applications', async () => {
    mockedAdminService.getPendingApplications.mockResolvedValue([
      { id: 'driver-123', fullName: 'John Doe', phone: '0712345678', applicationDate: '2024-05-21T10:00:00Z', status: 'PENDING_APPROVAL' },
    ]);

    render(<DriverApplicationsList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Pending Driver Applications (1)')).toBeInTheDocument();
    expect(screen.getByText('0712345678')).toBeInTheDocument();
  });

  it('should switch to the detail view when "Review" is clicked', async () => {
    mockedAdminService.getPendingApplications.mockResolvedValue([
      { id: 'driver-123', fullName: 'John Doe', phone: '0712345678', applicationDate: '2024-05-21T10:00:00Z', status: 'PENDING_APPROVAL' },
    ]);

    render(<DriverApplicationsList />);

    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('Detail for driver-123')).toBeInTheDocument();
    });
  });
});