import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PromoConfig } from './PromoConfig';
import { adminService, PromoConfig as PromoConfigType } from '../services/adminService';

// Mock the service
jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const mockConfig: PromoConfigType = {
  isActive: true,
  upline1Cut: 0.02,
  upline2Cut: 0.01,
  requiredBadge: 'EARNING_BADGE',
};

describe('PromoConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminService.getPromoConfig.mockResolvedValue(JSON.parse(JSON.stringify(mockConfig)));
  });

  it('should render the form with initial values', async () => {
    render(<PromoConfig />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Enable Promotion/)).toBeChecked();
    });
    expect(screen.getByLabelText(/Upline 1 Cut/)).toHaveValue(0.02);
    expect(screen.getByLabelText(/Upline 2 Cut/)).toHaveValue(0.01);
    expect(screen.getByLabelText(/Required Badge ID/)).toHaveValue('EARNING_BADGE');
  });

  it('should show an error if percentages are invalid', async () => {
    render(<PromoConfig />);
    await waitFor(() => expect(mockedAdminService.getPromoConfig).toHaveBeenCalled());

    const upline1Input = screen.getByLabelText(/Upline 1 Cut/);
    fireEvent.change(upline1Input, { target: { value: '-0.1' } });

    fireEvent.click(screen.getByText('Save Configuration'));

    expect(screen.getByText('Percentages must be positive values.')).toBeInTheDocument();
    expect(mockedAdminService.updatePromoConfig).not.toHaveBeenCalled();
  });

  it('should call updatePromoConfig on successful submission', async () => {
    window.alert = jest.fn(); // Mock alert
    render(<PromoConfig />);
    await waitFor(() => expect(mockedAdminService.getPromoConfig).toHaveBeenCalled());

    const enableToggle = screen.getByLabelText(/Enable Promotion/);
    fireEvent.click(enableToggle); // Set to false

    const upline1Input = screen.getByLabelText(/Upline 1 Cut/);
    fireEvent.change(upline1Input, { target: { value: '0.03' } });

    fireEvent.click(screen.getByText('Save Configuration'));

    await waitFor(() => {
      expect(mockedAdminService.updatePromoConfig).toHaveBeenCalledTimes(1);
      expect(mockedAdminService.updatePromoConfig).toHaveBeenCalledWith(expect.objectContaining({
        isActive: false,
        upline1Cut: 0.03,
      }));
    });

    expect(window.alert).toHaveBeenCalledWith('Promotional configuration updated successfully!');
  });
});