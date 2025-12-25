import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DriverApplicationDetail } from './DriverApplicationDetail';
import { adminService } from '../services/adminService';

// Mock the service
jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const mockDetails = {
  id: 'driver-123',
  fullName: 'John Doe',
  phone: '0712345678',
  applicationDate: '2024-05-21T10:00:00Z',
  status: 'PENDING_APPROVAL' as const,
  vehicleDetails: { make: 'Toyota', model: 'Vitz', year: 2018, licensePlate: 'KDA 123B' },
  documents: [
    { id: 'doc-1', type: 'DRIVERS_LICENSE' as const, url: '#' },
    { id: 'doc-2', type: 'NATIONAL_ID' as const, url: '#' },
  ],
};

describe('DriverApplicationDetail', () => {
  const onBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminService.getApplicationDetails.mockResolvedValue(mockDetails);
  });

  it('should render application details after loading', async () => {
    render(<DriverApplicationDetail applicationId="driver-123" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('Reviewing Application for John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('DRIVERS_LICENSE')).toBeInTheDocument();
    expect(screen.getByText('NATIONAL_ID')).toBeInTheDocument();
  });

  it('should show "Approve Application" button when all documents are approved', async () => {
    render(<DriverApplicationDetail applicationId="driver-123" onBack={onBack} />);
    await waitFor(() => expect(mockedAdminService.getApplicationDetails).toHaveBeenCalled());

    expect(screen.getByText('Approve Application')).toBeInTheDocument();
  });

  it('should switch to correction flow when a document is rejected', async () => {
    render(<DriverApplicationDetail applicationId="driver-123" onBack={onBack} />);
    await waitFor(() => expect(mockedAdminService.getApplicationDetails).toHaveBeenCalled());

    // Find the reject button for the first document
    const rejectButtons = screen.getAllByText('Reject');
    fireEvent.click(rejectButtons[0]);

    // Now the main action button should change
    expect(screen.getByText('Submit Correction Request')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Reason for rejection...')).toBeInTheDocument();
  });

  it('should call approveApplication and onBack when "Approve Application" is clicked', async () => {
    render(<DriverApplicationDetail applicationId="driver-123" onBack={onBack} />);
    await waitFor(() => expect(mockedAdminService.getApplicationDetails).toHaveBeenCalled());

    const approveButton = screen.getByText('Approve Application');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockedAdminService.approveApplication).toHaveBeenCalledWith('driver-123');
      expect(onBack).toHaveBeenCalled();
    });
  });

  it('should call requestCorrection with reasons when submitted', async () => {
    render(<DriverApplicationDetail applicationId="driver-123" onBack={onBack} />);
    await waitFor(() => expect(mockedAdminService.getApplicationDetails).toHaveBeenCalled());

    fireEvent.click(screen.getAllByText('Reject')[0]); // Reject first doc
    fireEvent.change(screen.getByPlaceholderText('Reason for rejection...'), {
      target: { value: 'Photo is blurry' },
    });

    fireEvent.click(screen.getByText('Submit Correction Request'));

    await waitFor(() => {
      expect(mockedAdminService.requestCorrection).toHaveBeenCalledWith('driver-123', ['Photo is blurry']);
      expect(onBack).toHaveBeenCalled();
    });
  });
});