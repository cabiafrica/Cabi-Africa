import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WhyDriveManagementPage from './page';

// Mock dependencies
global.fetch = jest.fn();

// Mock react-icons to avoid rendering complex SVGs
jest.mock('react-icons/fa', () => ({
  FaSave: () => 'Save',
}));

describe('WhyDriveManagementPage', () => {
  const pageSlug = 'why-drive-with-us';
  const mockContent = {
    slug: pageSlug,
    title: 'Why Drive With Us?',
    content: '## Drive on Your Own Schedule',
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('shows loading state initially and then displays content', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockContent,
    });

    render(<WhyDriveManagementPage />);

    expect(screen.getByText('Loading Content...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText('Page Content')).toHaveValue(mockContent.content);
    });
  });

  test('displays an error message on failed fetch', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    render(<WhyDriveManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch content.')).toBeInTheDocument();
    });
  });

  test('enables save button only when content is changed', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockContent,
    });

    render(<WhyDriveManagementPage />);
    await waitFor(() => expect(screen.getByLabelText('Page Content')).toBeInTheDocument());

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();

    const editor = screen.getByLabelText('Page Content');
    fireEvent.change(editor, { target: { value: 'New content' } });

    expect(saveButton).toBeEnabled();

    fireEvent.change(editor, { target: { value: mockContent.content } });
    expect(saveButton).toBeDisabled();
  });

  test('handles successful save and updates content state', async () => {
    // 1. Initial load
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockContent,
    });

    render(<WhyDriveManagementPage />);
    await waitFor(() => expect(screen.getByLabelText('Page Content')).toBeInTheDocument());

    // 2. User edits content
    const editor = screen.getByLabelText('Page Content');
    const newContent = '## Updated Content';
    fireEvent.change(editor, { target: { value: newContent } });

    // 3. Mock the successful PUT request
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockContent, content: newContent }),
    });

    // 4. User clicks save
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    // 5. Assert saving state and API call
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/content/page/${pageSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
    });

    // 6. Assert final state
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
    expect(editor).toHaveValue(newContent);
  });

  test('handles failed save and displays an error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockContent,
    });

    render(<WhyDriveManagementPage />);
    await waitFor(() => expect(screen.getByLabelText('Page Content')).toBeInTheDocument());

    const editor = screen.getByLabelText('Page Content');
    fireEvent.change(editor, { target: { value: 'This will fail' } });

    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to save content.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled();
  });
});