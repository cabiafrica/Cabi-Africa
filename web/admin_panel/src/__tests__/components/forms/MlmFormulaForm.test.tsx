import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MlmFormulaForm } from './MlmFormulaForm';

// Mock global fetch
global.fetch = jest.fn();

describe('MlmFormulaForm', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should show loading state, fetch data, and render the form', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ levels: [10, 5, 2.5, 1, 0.5] }),
    });

    render(<MlmFormulaForm />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByLabelText('Level 1 (%)')).toHaveValue(10);
    expect(screen.getByLabelText('Level 2 (%)')).toHaveValue(5);
    expect(screen.getByText(/Total: 19.00%/i)).toBeInTheDocument();
  });

  it('should display an error message if fetching data fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Failed to fetch settings.' }),
    });

    render(<MlmFormulaForm />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch settings.')).toBeInTheDocument();
    });
  });

  it('should update the total when a level value changes', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ levels: [10, 5, 0, 0, 0] }),
    });

    render(<MlmFormulaForm />);

    await waitFor(() => {
      expect(screen.getByLabelText('Level 1 (%)')).toBeInTheDocument();
    });

    const level3Input = screen.getByLabelText('Level 3 (%)');
    fireEvent.change(level3Input, { target: { value: '5' } });

    expect(screen.getByText(/Total: 20.00%/i)).toBeInTheDocument();
  });

  it('should submit the form and show a success message', async () => {
    // Initial fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ levels: [10, 5, 0, 0, 0] }),
    });
    // Submission fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ levels: [10, 5, 5, 0, 0] }),
    });

    render(<MlmFormulaForm />);
    await waitFor(() => expect(screen.getByLabelText('Level 1 (%)')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Level 3 (%)'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /save configuration/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/settings/mlm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levels: [10, 5, 5, 0, 0] }),
      });
      expect(screen.getByText('Configuration saved successfully!')).toBeInTheDocument();
    });
  });

  it('should disable the save button if the total exceeds 100', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ levels: [50, 50, 0, 0, 0] }),
    });

    render(<MlmFormulaForm />);
    await waitFor(() => expect(screen.getByLabelText('Level 1 (%)')).toBeInTheDocument());

    const level3Input = screen.getByLabelText('Level 3 (%)');
    fireEvent.change(level3Input, { target: { value: '1' } });

    expect(screen.getByText(/Total: 101.00%/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save configuration/i })).toBeDisabled();
  });

  it('should display an error message if submission fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ levels: [10, 0, 0, 0, 0] }),
    });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'The sum cannot exceed 100.' }),
    });

    render(<MlmFormulaForm />);
    await waitFor(() => expect(screen.getByLabelText('Level 1 (%)')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /save configuration/i }));

    await waitFor(() => expect(screen.getByText('The sum cannot exceed 100.')).toBeInTheDocument());
  });
});