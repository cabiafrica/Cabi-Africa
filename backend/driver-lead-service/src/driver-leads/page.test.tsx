import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserDetailPage from './page';

// Mock the global fetch function
global.fetch = jest.fn();

const mockUserWithProfile = {
  id: 'user-123',
  email: 'driver@example.com',
  createdAt: '2023-08-24T10:00:00.000Z',
  lastActiveAt: '2023-08-24T12:00:00.000Z',
  isTwoFactorEnabled: true,
  driverProfile: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+15551234567',
    city: 'Nairobi',
    applicationStatus: 'ACTIVE',
  },
};

const mockUserWithoutProfile = {
  ...mockUserWithProfile,
  driverProfile: null,
};

describe('UserDetailPage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should render loading state initially and then display user details', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserWithProfile,
    });

    render(<UserDetailPage params={{ userId: 'user-123' }} />);

    expect(screen.getByText('Loading user details...')).toBeInTheDocument();

    await waitFor(() => {
      // Check for user's name in the header
      expect(screen.getByRole('heading', { name: /John Doe/i })).toBeInTheDocument();
    });

    // Check for specific details
    expect(screen.getByText('driver@example.com')).toBeInTheDocument();
    expect(screen.getByText('+15551234567')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument(); // 2FA Enabled
    expect(screen.getByText(new Date(mockUserWithProfile.lastActiveAt).toLocaleString())).toBeInTheDocument();
  });

  it('should handle users without a driver profile gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserWithoutProfile,
    });

    render(<UserDetailPage params={{ userId: 'user-123' }} />);

    await waitFor(() => {
      // Header should fall back to email
      expect(screen.getByRole('heading', { name: /driver@example.com/i })).toBeInTheDocument();
    });

    // Check that profile-specific fields show 'N/A'
    expect(screen.getAllByText('N/A')).toHaveLength(3);
  });

  it('should display an error message if fetching fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<UserDetailPage params={{ userId: 'user-123' }} />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch user details.')).toBeInTheDocument();
    });
  });
});