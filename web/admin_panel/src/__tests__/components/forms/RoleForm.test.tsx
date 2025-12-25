import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoleForm } from './RoleForm';
import { adminService } from '../services/adminService';

jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const mockPermissions = [
  { id: 'blog.manage', description: 'Can manage blog posts' },
  { id: 'users.approve', description: 'Can approve drivers' },
];

describe('RoleForm', () => {
  const onSave = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminService.getPermissions.mockResolvedValue(mockPermissions);
  });

  it('renders correctly and fetches permissions', async () => {
    render(<RoleForm onSave={onSave} onCancel={onCancel} />);
    
    expect(screen.getByLabelText(/Role Name/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText('blog.manage')).toBeInTheDocument();
      expect(screen.getByLabelText('users.approve')).toBeInTheDocument();
    });
  });

  it('pre-populates form for an existing role', async () => {
    const existingRole = {
      id: 'support-1',
      name: 'Support Level 1',
      permissions: ['blog.manage'],
    };
    render(<RoleForm role={existingRole} onSave={onSave} onCancel={onCancel} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Role Name/)).toHaveValue('Support Level 1');
      expect(screen.getByLabelText('blog.manage')).toBeChecked();
      expect(screen.getByLabelText('users.approve')).not.toBeChecked();
    });
  });

  it('submits the form data correctly for a new role', async () => {
    render(<RoleForm onSave={onSave} onCancel={onCancel} />);
    await waitFor(() => expect(mockedAdminService.getPermissions).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/Role Name/), { target: { value: 'New Role' } });
    fireEvent.click(screen.getByLabelText('users.approve'));

    fireEvent.click(screen.getByText('Save Role'));

    await waitFor(() => {
      expect(mockedAdminService.createRole).toHaveBeenCalledWith({
        name: 'New Role',
        permissions: ['users.approve'],
      });
    });

    expect(onSave).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<RoleForm onSave={onSave} onCancel={onCancel} />);
    await waitFor(() => expect(mockedAdminService.getPermissions).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});