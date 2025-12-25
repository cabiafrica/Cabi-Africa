import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BlogPostForm } from './BlogPostForm';
import { adminService } from '../services/adminService';

jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

// Mock ReactQuill as it's a complex component not needed for this logic test
jest.mock('react-quill', () => {
  const ReactQuill = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    return <textarea data-testid="react-quill" value={value} onChange={e => onChange(e.target.value)} />;
  };
  return { __esModule: true, default: ReactQuill };
});


describe('BlogPostForm', () => {
  const onSave = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for creating a new post', () => {
    render(<BlogPostForm onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
    expect(screen.getByTestId('react-quill')).toBeInTheDocument();
  });

  it('submits the form data correctly for a new post', async () => {
    render(<BlogPostForm onSave={onSave} onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'New Post Title' } });
    fireEvent.change(screen.getByLabelText(/Author Name/), { target: { value: 'Admin User' } });
    fireEvent.change(screen.getByTestId('react-quill'), { target: { value: '<p>Hello World</p>' } });
    fireEvent.change(screen.getByLabelText(/Status/), { target: { value: 'PUBLISHED' } });

    fireEvent.click(screen.getByText('Save Post'));

    await waitFor(() => {
      expect(mockedAdminService.createPost).toHaveBeenCalledWith({
        title: 'New Post Title',
        authorName: 'Admin User',
        content: '<p>Hello World</p>',
        status: 'PUBLISHED',
        summary: '', // Not implemented in form
        imageUrl: '', // Not implemented in form
      });
    });

    expect(onSave).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<BlogPostForm onSave={onSave} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});