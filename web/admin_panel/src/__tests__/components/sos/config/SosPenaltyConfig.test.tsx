import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SosPenaltyConfig } from './SosPenaltyConfig';
import { adminService } from '../services/adminService';

jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const mockBadges = [
  { id: 'EARNING_BADGE', name: 'Earning Badge', description: '', icon: '', rules: [] },
  { id: 'TOP_DRIVER', name: 'Top Driver', description: '', icon: '', rules: [] },
];

const mockFeeConfig = {
  type: 'FEE' as const,
  value: 500,
};

const mockBadgeConfig = {
  type: 'REVOKE_BADGE' as const,
  value: 'EARNING_BADGE',
};

describe('SosPenaltyConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminService.getBadges.mockResolvedValue(mockBadges);
  });

  it('should render with FEE type selected and fetch badges', async () => {
    mockedAdminService.getSosPenaltyConfig.mockResolvedValue(mockFeeConfig);
    render(<SosPenaltyConfig />);

    await waitFor(() => {
      expect(screen.getByLabelText('Fee')).toBeChecked();
    });
    expect(screen.getByLabelText(/Penalty Amount/)).toHaveValue(500);
    expect(mockedAdminService.getBadges).toHaveBeenCalled();
  });

  it('should render with REVOKE_BADGE type selected and show badge dropdown', async () => {
    mockedAdminService.getSosPenaltyConfig.mockResolvedValue(mockBadgeConfig);
    render(<SosPenaltyConfig />);

    await waitFor(() => {
      expect(screen.getByLabelText('Revoke Badge')).toBeChecked();
    });
    expect(screen.getByLabelText(/Badge to Revoke/)).toHaveValue('EARNING_BADGE');
  });

  it('should switch UI when penalty type is changed', async () => {
    mockedAdminService.getSosPenaltyConfig.mockResolvedValue(mockFeeConfig);
    render(<SosPenaltyConfig />);
    await waitFor(() => expect(screen.getByLabelText('Fee')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Revoke Badge'));

    expect(screen.getByLabelText(/Badge to Revoke/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Penalty Amount/)).not.toBeInTheDocument();
  });

  it('should submit the updated configuration', async () => {
    mockedAdminService.getSosPenaltyConfig.mockResolvedValue(mockFeeConfig);
    render(<SosPenaltyConfig />);
    await waitFor(() => expect(screen.getByLabelText('Fee')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Revoke Badge'));
    fireEvent.change(screen.getByLabelText(/Badge to Revoke/), { target: { value: 'TOP_DRIVER' } });

    fireEvent.click(screen.getByText('Save Configuration'));

    await waitFor(() => {
      expect(mockedAdminService.updateSosPenaltyConfig).toHaveBeenCalledWith({
        type: 'REVOKE_BADGE',
        value: 'TOP_DRIVER',
      });
    });
  });
});