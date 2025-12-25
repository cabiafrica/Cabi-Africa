import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboardPage from './page';

// Mock the global fetch function
global.fetch = jest.fn();

describe('AdminDashboardPage and ExpiringDocumentsWidget', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (fetch as jest.Mock).mockClear();
  });

  it('should display a loading state initially', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('Loading expiring documents...')).toBeInTheDocument();
  });

  it('should display documents on a successful fetch', async () => {
    const mockDocuments = [
      { id: 'doc-1', driverId: 'd-101', driverName: 'John Doe', documentType: 'license', expiryDate: new Date().toISOString() },
      { id: 'doc-2', driverId: 'd-102', driverName: 'Jane Smith', documentType: 'insurance', expiryDate: new Date().toISOString() },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocuments,
    });

    render(<AdminDashboardPage />);

    // Wait for the loading state to disappear and content to be rendered
    await waitFor(() => {
      expect(screen.queryByText('Loading expiring documents...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
  });

  it('should display an empty state message when no documents are expiring', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No documents are expiring soon.')).toBeInTheDocument();
    });
  });

  it('should display an error message on a failed fetch', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch data')).toBeInTheDocument();
    });
  });

  it('should display an error message when fetch throws an exception', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });
});