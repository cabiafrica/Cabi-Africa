import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserManagement } from './UserManagement';
import { AdminRole } from '@prisma/client';

global.fetch = jest.fn();

const mockUsers = [
  { id: '1', email: 'admin@test.com', role: 'ADMIN' as AdminRole },
  { id: '2', email: 'readonly@test.com', role: 'READ_ONLY' as AdminRole },
];

describe('UserManagement', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: jest.fn() },
    });
    // Mock window.alert
    window.alert = jest.fn();
  });

  it('should show loading state and then render users', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    render(<UserManagement />);
    expect(screen.getByText('Loading users...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('readonly@test.com')).toBeInTheDocument();
    });
  });

  it('should display an error message if fetching users fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch users.')).toBeInTheDocument();
    });
  });

  it('should optimistically update role and call the API on change', async () => {
    // Initial fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });
    // Update fetch
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<UserManagement />);
    const select = await screen.findByDisplayValue('Read-Only') as HTMLSelectElement;

    fireEvent.change(select, { target: { value: 'ADMIN' } });

    // Check optimistic update
    expect(select.value).toBe('ADMIN');

    // Check API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/users/2/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN' }),
      });
    });
  });
});