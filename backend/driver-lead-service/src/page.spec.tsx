import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportedLoginsPage from './page';

// Mock the global fetch API
global.fetch = jest.fn();

const mockLogins = [
  {
    id: 'login-1',
    userEmail: 'test1@example.com',
    createdAt: new Date('2023-10-26T10:00:00Z').toISOString(),
    reportedAt: new Date('2023-10-26T11:00:00Z').toISOString(),
    ipAddress: '1.1.1.1',
    location: 'Location 1',
    userAgent: 'Browser 1',
  },
  {
    id: 'login-2',
    userEmail: 'test2@example.com',
    createdAt: new Date('2023-10-25T10:00:00Z').toISOString(),
    reportedAt: new Date('2023-10-25T11:00:00Z').toISOString(),
    ipAddress: '2.2.2.2',
    location: 'Location 2',
    userAgent: 'Browser 2',
  },
];

describe('ReportedLoginsPage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should display a loading state initially and then render reported logins', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLogins, total: 2, page: 1, hasMore: false }),
    });

    render(<ReportedLoginsPage />);

    expect(screen.getByText('Loading reports...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('test1@example.com')).toBeInTheDocument();
      expect(screen.getByText('IP: 2.2.2.2')).toBeInTheDocument();
    });
  });

  it('should display an error message if fetching data fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API is down'));

    render(<ReportedLoginsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch reported logins.')).toBeInTheDocument();
    });
  });

  it('should display a message when no reports are found', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], total: 0, page: 1, hasMore: false }),
    });

    render(<ReportedLoginsPage />);

    await waitFor(() => {
      expect(screen.getByText('No pending reports found.')).toBeInTheDocument();
    });
  });

  it('should refetch data when a filter is applied', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], total: 0, page: 1, hasMore: false }),
    });

    render(<ReportedLoginsPage />);

    const emailFilterInput = screen.getByLabelText('Filter by Email');
    fireEvent.change(emailFilterInput, { target: { value: 'test1@example.com' } });

    // Fast-forward timers to trigger the debounced fetch
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      // The first call is on initial render, the second is from the filter change
      expect(fetch).toHaveBeenCalledTimes(2);
      const url = (fetch as jest.Mock).mock.calls[1][0];
      expect(url).toContain('userEmail=test1%40example.com');
    });
  });

  it('should call the dismiss endpoint and refetch data on success', async () => {
    // Initial fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLogins, total: 2, page: 1, hasMore: false }),
    });

    render(<ReportedLoginsPage />);

    await waitFor(() => expect(screen.getByText('test1@example.com')).toBeInTheDocument());

    // Mock for the dismiss action
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    // Mock for the refetch after dismiss
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockLogins[1]], total: 1, page: 1, hasMore: false }),
    });

    const dismissButtons = screen.getAllByRole('button', { name: 'Dismiss' });
    fireEvent.click(dismissButtons[0]);

    await waitFor(() => {
      // The first login should be gone
      expect(screen.queryByText('test1@example.com')).not.toBeInTheDocument();
      // The second should remain
      expect(screen.getByText('test2@example.com')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/v1/admin/security/reported-logins/login-1/dismiss', expect.any(Object));
    expect(fetch).toHaveBeenCalledTimes(3); // Initial, dismiss, refetch
  });

  it('should call the force-password-reset endpoint', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLogins, total: 2, page: 1, hasMore: false }),
    });

    render(<ReportedLoginsPage />);

    await waitFor(() => expect(screen.getByText('test1@example.com')).toBeInTheDocument());

    // Mock for the reset action
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const resetButtons = screen.getAllByRole('button', { name: 'Force Reset' });
    fireEvent.click(resetButtons[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/admin/security/reported-logins/login-1/force-password-reset', expect.any(Object));
    });
    // Should not refetch on password reset
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});