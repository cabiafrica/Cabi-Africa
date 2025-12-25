import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DocumentHistoryModal } from './document_history_modal';

// Mock the global fetch API
global.fetch = jest.fn();

describe('DocumentHistoryModal', () => {
  const mockOnClose = jest.fn();
  const userId = 'driver-123';
  const docType = "Driver's License";

  const mockHistoryData = [
    {
      id: 'sub-2',
      submittedAt: '2024-08-20T11:00:00Z',
      status: 'Pending Review',
      rejectionReason: null,
    },
    {
      id: 'sub-1',
      submittedAt: '2024-08-19T10:00:00Z',
      status: 'Rejected',
      rejectionReason: 'Photo was blurry.',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  test('does not render when isOpen is false', () => {
    render(
      <DocumentHistoryModal
        isOpen={false}
        onClose={mockOnClose}
        userId={userId}
        docType={docType}
      />,
    );
    expect(screen.queryByText(`History for: ${docType}`)).not.toBeInTheDocument();
  });

  test('renders and shows loading state when isOpen is true', () => {
    // Arrange: Mock fetch to return a pending promise to keep it in loading state
    (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));

    render(
      <DocumentHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        userId={userId}
        docType={docType}
      />,
    );

    expect(screen.getByText(`History for: ${docType}`)).toBeInTheDocument();
    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  test('displays history data on successful fetch', async () => {
    // Arrange
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHistoryData,
    });

    // Act
    render(
      <DocumentHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        userId={userId}
        docType={docType}
      />,
    );

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('Loading history...')).not.toBeInTheDocument();
      expect(screen.getByText('Submission #2')).toBeInTheDocument(); // Most recent
      expect(screen.getByText('Status: Pending Review')).toBeInTheDocument();
      expect(screen.getByText('Submission #1')).toBeInTheDocument(); // Older
      expect(screen.getByText('Status: Rejected')).toBeInTheDocument();
      expect(screen.getByText('Rejection Reason:')).toBeInTheDocument();
      expect(screen.getByText('Photo was blurry.')).toBeInTheDocument();
    });

    // Verify fetch call
    expect(fetch).toHaveBeenCalledWith(
      `/api/admin/documents/${userId}/history?docType=${encodeURIComponent(docType)}`,
    );
  });

  test('displays "No submission history found" when data is empty', async () => {
    // Arrange
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // Act
    render(
      <DocumentHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        userId={userId}
        docType={docType}
      />,
    );

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('Loading history...')).not.toBeInTheDocument();
      expect(screen.getByText('No submission history found.')).toBeInTheDocument();
    });
  });

  test('displays error message on failed fetch', async () => {
    // Arrange
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    // Act
    render(
      <DocumentHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        userId={userId}
        docType={docType}
      />,
    );

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('Loading history...')).not.toBeInTheDocument();
      expect(screen.getByText('Error: Failed to fetch document history.')).toBeInTheDocument();
    });
  });

  test('calls onClose when close button is clicked', async () => {
    // Arrange: Mock a successful fetch so the modal content is rendered
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockHistoryData });

    render(
      <DocumentHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        userId={userId}
        docType={docType}
      />,
    );

    await waitFor(() => expect(screen.queryByText('Loading history...')).not.toBeInTheDocument());

    // Act: Click the 'x' button
    fireEvent.click(screen.getByRole('button', { name: /close/i })); // This targets the 'Close' button at the bottom
    fireEvent.click(screen.getByText('×')); // This targets the 'x' button in the header

    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(2); // Once for each close button
  });

  test('filters history by status when filter is applied', async () => {
    // Arrange: Mock fetch to return full history initially, then filtered history
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistoryData, // Initial fetch for 'All'
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockHistoryData[0]], // Filtered fetch for 'Pending Review'
      });

    render(
      <DocumentHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        userId={userId}
        docType={docType}
      />,
    );

    // Wait for initial fetch to complete and display all data
    await waitFor(() => {
      expect(screen.getByText('Submission #2')).toBeInTheDocument();
      expect(screen.getByText('Submission #1')).toBeInTheDocument();
    });

    // Act: Select 'Pending Review' from the filter dropdown
    fireEvent.change(screen.getByLabelText('Filter by Status'), {
      target: { value: 'Pending Review' },
    });

    // Assert: Wait for the new fetch with filter to complete and display filtered data
    await waitFor(() => {
      expect(screen.getByText('Submission #2')).toBeInTheDocument();
      expect(screen.queryByText('Submission #1')).not.toBeInTheDocument(); // Only Pending Review should be visible
    });

    // Verify fetch calls
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith(
      `/api/admin/documents/${userId}/history?docType=${encodeURIComponent(docType)}`,
    );
    expect(fetch).toHaveBeenCalledWith(
      `/api/admin/documents/${userId}/history?docType=${encodeURIComponent(docType)}&status=Pending%20Review`,
    );
  });
});