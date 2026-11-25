import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReferralConfiguration } from '../../../components/ReferralConfiguration';
import { adminService, ReferralConfig as ReferralConfigType } from '../../../services/adminService';

// Mock the service
jest.mock('../../../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const mockConfig: ReferralConfigType = {
  registrationFee: {
    total: 2000,
    systemCut: 0.5,
    upline1Cut: 0.3,
    upline2Cut: 0.2,
  },
  fareCommission: {
    totalCommission: 0.18,
    systemCut: 0.5,
    upline1Cut: 0.3,
    upline2Cut: 0.2,
  },
  sacco: {
    rate: 0.05,
  },
  qualification: {
    requiredBadge: 'EARNING_BADGE',
  },
};

describe('ReferralConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Use a deep copy to prevent tests from interfering with each other
    mockedAdminService.getReferralConfig.mockResolvedValue(JSON.parse(JSON.stringify(mockConfig)));
  });

  it('should render the configuration form with initial values', async () => {
    render(<ReferralConfiguration />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Total Fee/)).toHaveValue(2000);
    });
    expect(screen.getAllByLabelText(/System Cut/)[0]).toHaveValue(0.5);
    expect(screen.getByLabelText(/Required Badge ID/)).toHaveValue('EARNING_BADGE');
  });

  it('should show an error if registration fee splits do not sum to 100%', async () => {
    render(<ReferralConfiguration />);
    await waitFor(() => expect(mockedAdminService.getReferralConfig).toHaveBeenCalled());

    const systemCutInput = screen.getAllByLabelText(/System Cut/)[0]; // Reg fee system cut
    fireEvent.change(systemCutInput, { target: { value: '0.6' } }); // 0.6 + 0.3 + 0.2 = 1.1

    fireEvent.click(screen.getByText('Save Configuration'));

    expect(screen.getByText('Registration Fee splits must add up to 100%.')).toBeInTheDocument();
    expect(mockedAdminService.updateReferralConfig).not.toHaveBeenCalled();
  });

  it('should show an error if fare commission splits do not sum to 100%', async () => {
    render(<ReferralConfiguration />);
    await waitFor(() => expect(mockedAdminService.getReferralConfig).toHaveBeenCalled());

    const fareSystemCutInput = screen.getAllByLabelText(/System Cut/)[1]; // Fare commission system cut
    fireEvent.change(fareSystemCutInput, { target: { value: '0.4' } }); // 0.4 + 0.3 + 0.2 = 0.9

    fireEvent.click(screen.getByText('Save Configuration'));

    expect(screen.getByText('Fare Commission splits must add up to 100%.')).toBeInTheDocument();
    expect(mockedAdminService.updateReferralConfig).not.toHaveBeenCalled();
  });

  it('should call updateReferralConfig on successful submission', async () => {
    window.alert = jest.fn(); // Mock alert
    render(<ReferralConfiguration />);
    await waitFor(() => expect(mockedAdminService.getReferralConfig).toHaveBeenCalled());

    const saccoRateInput = screen.getByLabelText(/Savings Rate/);
    fireEvent.change(saccoRateInput, { target: { value: '0.06' } });

    fireEvent.click(screen.getByText('Save Configuration'));

    await waitFor(() => {
      expect(mockedAdminService.updateReferralConfig).toHaveBeenCalledTimes(1);
      expect(mockedAdminService.updateReferralConfig).toHaveBeenCalledWith(expect.objectContaining({
        sacco: { rate: 0.06 },
      }));
    });
  });
});