import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PermissionManagement } from './PermissionManagement';
import { adminService } from '../services/adminService';

jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const mockPermissions = [
  { id: 'blog.manage', description: 'Can create, edit, and delete blog posts' },
  { id: 'users.approve', description: 'Can approve new driver applications' },
];

describe('PermissionManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminService.getPermissions.mockResolvedValue(JSON.parse(JSON.stringify(mockPermissions)));
    window.confirm = jest.fn(() => true); // Auto-confirm deletes
    window.alert = jest.fn();
  });

  it('should render a list of permissions', async () => {
    render(<PermissionManagement />);
    await waitFor(() => {
      expect(screen.getByText('blog.manage')).toBeInTheDocument();
    });
    expect(screen.getByText('users.approve')).toBeInTheDocument();
  });

  it('should open a form to create a new permission', async () => {
    render(<PermissionManagement />);
    await waitFor(() => expect(mockedAdminService.getPermissions).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Create New Permission'));

    expect(screen.getByLabelText(/Permission ID/)).toBeInTheDocument();
    expect(screen.getByText('Save Permission')).toBeInTheDocument();
  });

  it('should submit the form to create a new permission', async () => {
    render(<PermissionManagement />);
    await waitFor(() => expect(mockedAdminService.getPermissions).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Create New Permission'));

    fireEvent.change(screen.getByLabelText(/Permission ID/), { target: { value: 'config.edit' } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'Can edit system config' } });

    fireEvent.click(screen.getByText('Save Permission'));

    await waitFor(() => {
      expect(mockedAdminService.createPermission).toHaveBeenCalledWith({
        id: 'config.edit',
        description: 'Can edit system config',
      });
    });
  });

  it('should call delete when delete button is clicked', async () => {
    render(<PermissionManagement />);
    await waitFor(() => expect(mockedAdminService.getPermissions).toHaveBeenCalled());

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this permission?');

    await waitFor(() => {
      expect(mockedAdminService.deletePermission).toHaveBeenCalledWith('blog.manage');
    });
  });
});