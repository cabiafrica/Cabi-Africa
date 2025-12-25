import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BadgeForm } from './BadgeForm';
import { adminService } from '../services/adminService';

jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

describe('BadgeForm', () => {
  const onSave = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for creating a new badge', () => {
    render(<BadgeForm onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByLabelText(/Badge Name/)).toBeInTheDocument();
    expect(screen.getByText('Add Rule')).toBeInTheDocument();
  });

  it('allows adding and removing rules', () => {
    render(<BadgeForm onSave={onSave} onCancel={onCancel} />);
    
    // Add a rule
    fireEvent.click(screen.getByText('Add Rule'));
    expect(screen.getByDisplayValue('averageRating')).toBeInTheDocument();
    expect(screen.getByDisplayValue('GTE')).toBeInTheDocument();

    // Add another rule
    fireEvent.click(screen.getByText('Add Rule'));
    expect(screen.getAllByDisplayValue('averageRating').length).toBe(2);

    // Remove a rule
    fireEvent.click(screen.getAllByText('Remove')[0]);
    expect(screen.getAllByDisplayValue('averageRating').length).toBe(1);
  });

  it('submits the form data correctly for a new badge', async () => {
    render(<BadgeForm onSave={onSave} onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText(/Badge Name/), { target: { value: 'Top Driver' } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'For the best drivers' } });
    fireEvent.click(screen.getByText('Add Rule'));
    fireEvent.change(screen.getByTestId('rule-metric-0'), { target: { value: 'averageRating' } });
    fireEvent.change(screen.getByTestId('rule-operator-0'), { target: { value: 'GTE' } });
    fireEvent.change(screen.getByTestId('rule-value-0'), { target: { value: '4.8' } });

    fireEvent.click(screen.getByText('Save Badge'));

    await waitFor(() => {
      expect(mockedAdminService.createBadge).toHaveBeenCalledWith({
        name: 'Top Driver',
        description: 'For the best drivers',
        icon: '', // Assuming icon is not implemented yet
        rules: [
          { metric: 'averageRating', operator: 'GTE', value: 4.8 }
        ]
      });
    });

    expect(onSave).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<BadgeForm onSave={onSave} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});