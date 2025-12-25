import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RejectionReasonModal from './rejection_reason_modal';

describe('RejectionReasonModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const documentType = "Driver's License";

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders correctly with title and disabled submit button', () => {
    render(
      <RejectionReasonModal
        documentType={documentType}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(`Reject ${documentType}`)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason for rejection/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm rejection/i })).toBeDisabled();
  });

  test('enables submit button when a reason is entered', () => {
    render(
      <RejectionReasonModal
        documentType={documentType}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const textarea = screen.getByLabelText(/reason for rejection/i);
    fireEvent.change(textarea, { target: { value: 'Image is blurry' } });

    expect(screen.getByRole('button', { name: /confirm rejection/i })).toBeEnabled();
  });

  test('calls onClose when cancel button is clicked', () => {
    render(
      <RejectionReasonModal
        documentType={documentType}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('handles successful form submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined); // Simulate a successful async submission

    render(
      <RejectionReasonModal
        documentType={documentType}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const reason = 'The document is expired.';
    fireEvent.change(screen.getByLabelText(/reason for rejection/i), { target: { value: reason } });
    fireEvent.click(screen.getByRole('button', { name: /confirm rejection/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(reason);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('handles failed form submission and displays an error', async () => {
    const errorMessage = 'API Error: Submission failed.';
    mockOnSubmit.mockRejectedValue(new Error(errorMessage)); // Simulate a failed submission

    render(
      <RejectionReasonModal
        documentType={documentType}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const reason = 'This will fail.';
    fireEvent.change(screen.getByLabelText(/reason for rejection/i), { target: { value: reason } });
    fireEvent.click(screen.getByRole('button', { name: /confirm rejection/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Ensure onClose was not called on failure
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});