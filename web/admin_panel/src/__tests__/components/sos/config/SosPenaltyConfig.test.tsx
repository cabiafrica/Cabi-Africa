import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SosPenaltyConfig } from '../../../components/SosPenaltyConfig';
import { adminService } from '../../../services/adminService';

jest.mock('../../../services/adminService', () => ({
  adminService: {
    getBadges: jest.fn(),
    getSosPenaltyConfig: jest.fn(),
    updateSosPenaltyConfig: jest.fn(),
  },
}));

const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const mockBadges = [
  { id: 'EARNING_BADGE', name: 'Earning Badge', description: '', icon: '', rules: [] },
  { id: 'TOP_DRIVER', name: 'Top Driver', description: '', icon: '', rules: [] },
];

const mockFeeConfig = {
  type: 'FEE' as const,
  feeAmount: 500,
};

const mockBadgeConfig = {
  type: 'REVOKE_BADGE' as const,
  badgeId: 'EARNING_BADGE',
};

describe('SosPenaltyConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminService.getBadges.mockResolvedValue(mockBadges);
  });

  it('should render and load configuration', async () => {
    mockedAdminService.getSosPenaltyConfig.mockResolvedValue(mockFeeConfig);
    render(<SosPenaltyConfig />);

    await waitFor(() => {
      expect(screen.getByText('SOS Misuse Penalty')).toBeInTheDocument();
    });

    expect(mockedAdminService.getSosPenaltyConfig).toHaveBeenCalled();
    expect(mockedAdminService.getBadges).toHaveBeenCalled();
  });

  it('should switch between Fee and Revoke Badge', async () => {
    mockedAdminService.getSosPenaltyConfig.mockResolvedValue(mockFeeConfig);
    render(<SosPenaltyConfig />);

    await waitFor(() => expect(screen.getByText('Monetary Fine')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Revoke Privilege'));
    expect(screen.getByText('Select Badge to Revoke')).toBeInTheDocument();
  });

  it('should submit the updated configuration', async () => {
    mockedAdminService.getSosPenaltyConfig.mockResolvedValue(mockFeeConfig);
    render(<SosPenaltyConfig />);

    await waitFor(() => expect(screen.getByText('Save Configuration')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Revoke Privilege'));

    // Select a badge
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'TOP_DRIVER' } });

    fireEvent.click(screen.getByText('Save Configuration'));

    await waitFor(() => {
      expect(mockedAdminService.updateSosPenaltyConfig).toHaveBeenCalledWith({
        type: 'REVOKE_BADGE',
        badgeId: 'TOP_DRIVER',
      });
    });
  });
});