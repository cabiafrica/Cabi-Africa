import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SosIncidentDashboard } from './SosIncidentDashboard';
import { adminService } from '../services/adminService';

jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

// Mock the resolution modal to isolate the dashboard's logic
jest.mock('./SosResolutionModal', () => ({
  SosResolutionModal: ({ onResolve, onCancel }: { onResolve: (outcome: 'LEGITIMATE' | 'MISUSE') => void, onCancel: () => void }) => (
    <div>
      <button onClick={() => onResolve('LEGITIMATE')}>Legitimate</button>
      <button onClick={() => onResolve('MISUSE')}>Misuse</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

const mockIncident = {
  id: 'sos-123',
  driver: { id: 'driver-1', name: 'John Doe', phone: '0712345678' },
  passenger: { id: 'pass-1', name: 'Jane Smith', phone: '0787654321' },
  upline1: { id: 'upline-1', name: 'Upline One', phone: '0722000001' },
  upline2: { id: 'upline-2', name: 'Upline Two', phone: '0722000002' },
  liveLocation: { lat: -1.28, lon: 36.81 },
  logs: [{ timestamp: '2024-05-22T12:00:00Z', notes: 'Initial alert received.' }],
};

describe('SosIncidentDashboard', () => {
  const onBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminService.getSosIncidentDetails.mockResolvedValue(mockIncident);
  });

  it('should render incident details after loading', async () => {
    render(<SosIncidentDashboard incidentId="sos-123" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('SOS Incident: sos-123')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Upline One')).toBeInTheDocument();
    expect(screen.getByText('Initial alert received.')).toBeInTheDocument();
  });

  it('should call logSosIncidentAction when adding a log', async () => {
    render(<SosIncidentDashboard incidentId="sos-123" onBack={onBack} />);
    await waitFor(() => expect(mockedAdminService.getSosIncidentDetails).toHaveBeenCalled());

    const textarea = screen.getByPlaceholderText('Log action taken...');
    fireEvent.change(textarea, { target: { value: 'Called the driver.' } });

    const logButton = screen.getByText('Log Action');
    fireEvent.click(logButton);

    await waitFor(() => {
      expect(mockedAdminService.logSosIncidentAction).toHaveBeenCalledWith('sos-123', 'Called the driver.');
    });

    // It should also refetch the details to show the new log
    expect(mockedAdminService.getSosIncidentDetails).toHaveBeenCalledTimes(2);
  });

  it('should log to console when "Listen In" is clicked', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<SosIncidentDashboard incidentId="sos-123" onBack={onBack} />);
    await waitFor(() => expect(mockedAdminService.getSosIncidentDetails).toHaveBeenCalled());

    const listenButton = screen.getByText('Listen In');
    fireEvent.click(listenButton);

    expect(consoleSpy).toHaveBeenCalledWith('Attempting to connect to audio stream for incident sos-123...');

    consoleSpy.mockRestore();
  });

  it('should open resolution modal and call resolve service on selection', async () => {
    render(<SosIncidentDashboard incidentId="sos-123" onBack={onBack} />);
    await waitFor(() => expect(mockedAdminService.getSosIncidentDetails).toHaveBeenCalled());

    // Click the main resolve button on the dashboard
    fireEvent.click(screen.getByText('Resolve Incident'));

    // The mocked modal is now visible, click the "Misuse" button inside it
    fireEvent.click(screen.getByText('Misuse'));

    await waitFor(() => {
      expect(mockedAdminService.resolveSosIncident).toHaveBeenCalledWith('sos-123', 'MISUSE');
    });
  });
});