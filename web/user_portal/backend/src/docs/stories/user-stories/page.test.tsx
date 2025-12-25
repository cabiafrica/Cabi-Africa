import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadDocumentsPage from './page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('UploadDocumentsPage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockPush.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const fillOutForm = () => {
    fireEvent.change(screen.getByPlaceholderText(/national id number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByPlaceholderText(/driver's license number/i), { target: { value: 'DL123' } });
    
    const idFile = new File(['id'], 'national-id.png', { type: 'image/png' });
    const licenseFile = new File(['license'], 'drivers-license.png', { type: 'image/png' });
    const inspectionFile = new File(['inspection'], 'inspection.pdf', { type: 'application/pdf' });

    fireEvent.change(screen.getByLabelText(/national id/i), { target: { files: [idFile] } });
    fireEvent.change(screen.getByLabelText(/driver's license/i), { target: { files: [licenseFile] } });
    fireEvent.change(screen.getByLabelText(/vehicle inspection report/i), { target: { files: [inspectionFile] } });
  };

  it('renders the form correctly', () => {
    render(<UploadDocumentsPage />);
    expect(screen.getByRole('heading', { name: /complete your application/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/national id number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/national id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument();
  });

  it('shows an error if not all documents are uploaded', async () => {
    render(<UploadDocumentsPage />);
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));
    expect(await screen.findByText('Please upload all required documents.')).toBeInTheDocument();
  });

  it('handles the full successful submission flow', async () => {
    (fetch as jest.Mock)
      // 1. Mock get-upload-urls
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { file: 'national-id.png', key: 'key1', url: 'http://s3.mock/1' },
          { file: 'drivers-license.png', key: 'key2', url: 'http://s3.mock/2' },
          { file: 'inspection.pdf', key: 'key3', url: 'http://s3.mock/3' },
        ]),
      })
      // 2. Mock the three S3 uploads
      .mockResolvedValueOnce({ ok: true }) // s3 upload 1
      .mockResolvedValueOnce({ ok: true }) // s3 upload 2
      .mockResolvedValueOnce({ ok: true }) // s3 upload 3
      // 3. Mock the final submission
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Application submitted successfully.' }),
      });

    render(<UploadDocumentsPage />);
    fillOutForm();
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    // Check status messages
    expect(await screen.findByText('Preparing secure upload links...')).toBeInTheDocument();
    expect(await screen.findByText('Uploading documents...')).toBeInTheDocument();
    expect(await screen.findByText('Finalizing application...')).toBeInTheDocument();
    expect(await screen.findByText('Application submitted successfully! You will be notified once it has been reviewed.')).toBeInTheDocument();

    // Check that fetch was called correctly
    expect(fetch).toHaveBeenCalledWith('/api/get-upload-urls', expect.any(Object));
    expect(fetch).toHaveBeenCalledWith('http://s3.mock/1', expect.any(Object)); // S3 upload
    expect(fetch).toHaveBeenCalledWith('/api/submit-driver-documents', expect.any(Object));

    // Fast-forward timers to trigger the redirect
    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/drivers/dashboard');
    });
  });

  it('handles failure when getting pre-signed URLs', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to get URLs' }),
    });

    render(<UploadDocumentsPage />);
    fillOutForm();
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    expect(await screen.findByText('Could not prepare uploads.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit application/i })).not.toBeDisabled();
  });
});