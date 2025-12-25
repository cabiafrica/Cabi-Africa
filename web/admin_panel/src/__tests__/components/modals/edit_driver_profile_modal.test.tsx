import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditDriverProfileModal from './edit_driver_profile_modal';

// Mock the global fetch API
global.fetch = jest.fn();

describe('EditDriverProfileModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const initialProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
  };
  const userId = 'driver-123';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  test('renders with initial profile data', () => {
    render(
      <EditDriverProfileModal
        userId={userId}
        initialProfile={initialProfile}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByLabelText(/full name/i)).toHaveValue(initialProfile.name);
    expect(screen.getByLabelText(/email address/i)).toHaveValue(initialProfile.email);
    expect(screen.getByLabelText(/phone number/i)).toHaveValue(initialProfile.phone);
    expect(screen.getByText(`Edit Profile for ${initialProfile.name}`)).toBeInTheDocument();
  });

  test('allows user to change input values', () => {
    render(
      <EditDriverProfileModal
        userId={userId}
        initialProfile={initialProfile}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    expect(nameInput).toHaveValue('Jane Doe');
  });

  test('calls onClose when cancel button is clicked', () => {
    render(
      <EditDriverProfileModal
        userId={userId}
        initialProfile={initialProfile}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('handles successful form submission', async () => {
    const updatedProfile = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '555-765-4321',
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => updatedProfile,
    });

    render(
      <EditDriverProfileModal
        userId={userId}
        initialProfile={initialProfile}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: updatedProfile.name } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/admin/users/${userId}`, expect.any(Object));
      expect(mockOnSave).toHaveBeenCalledWith(updatedProfile);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('handles failed form submission and displays an error', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    render(
      <EditDriverProfileModal
        userId={userId}
        initialProfile={initialProfile}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save profile.')).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});