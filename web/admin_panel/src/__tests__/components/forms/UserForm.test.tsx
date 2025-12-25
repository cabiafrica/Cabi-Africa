import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserForm } from './UserForm';
import { adminService } from '../services/adminService';

jest.mock('../services/adminService');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

const mockRoles = [
  { id: 'content-manager', name: 'Content Manager', permissions: ['blog.manage', 'blog.publish'] },
  { id: 'support-l1', name: 'Support Level 1', permissions: ['users.view'] },
];

const mockPermissions = [
    { id: 'blog.manage', description: 'Can manage blog posts' },
    { id: 'blog.publish', description: 'Can publish blog posts' },
    { id: 'users.view', description: 'Can view users' },
    { id: 'users.approve', description: 'Can approve drivers' },
];

describe('UserForm', () => {
  const onSave = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminService.getRoles.mockResolvedValue(mockRoles);
    mockedAdminService.getPermissions.mockResolvedValue(mockPermissions);
  });

  it('renders correctly for creating a new user', async () => {
    render(<UserForm onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Content Manager')).toBeInTheDocument();
    });
  });

  it('pre-populates form for an existing user with direct permissions', async () => {
    const existingUser = {
      id: 'user-1',
      email: 'test@example.com',
      roles: ['content-manager'],
      directGrants: ['users.approve'],
      directRevokes: ['blog.publish'],
    };
    render(<UserForm user={existingUser} onSave={onSave} onCancel={onCancel} />);

    await waitFor(() => {
        expect(screen.getByLabelText(/Email/)).toHaveValue('test@example.com');
        // Role is checked
        expect(screen.getByLabelText('Content Manager')).toBeChecked();
        
        // Direct grant is selected
        const approvePermissionRow = screen.getByText('users.approve').closest('tr');
        expect(approvePermissionRow).toHaveTextContent('Directly Granted');

        // Direct revoke is selected
        const publishPermissionRow = screen.getByText('blog.publish').closest('tr');
        expect(publishPermissionRow).toHaveTextContent('Directly Revoked');

        // Inherited permission is shown
        const managePermissionRow = screen.getByText('blog.manage').closest('tr');
        expect(managePermissionRow).toHaveTextContent('Inherited');
    });
  });

  it('submits the form data correctly for a new user', async () => {
    render(<UserForm onSave={onSave} onCancel={onCancel} />);
    await waitFor(() => expect(mockedAdminService.getRoles).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByLabelText('Content Manager'));

    fireEvent.click(screen.getByText('Save User'));

    await waitFor(() => {
      expect(mockedAdminService.createAdminUser).toHaveBeenCalledWith({
        email: 'new@example.com',
        roles: ['content-manager'],
      });
    });
    expect(onSave).toHaveBeenCalled();
  });

  it('submits direct permission changes for an existing user', async () => {
    const existingUser = {
        id: 'user-1',
        email: 'test@example.com',
        roles: ['content-manager'],
        directGrants: [],
        directRevokes: [],
      };
    render(<UserForm user={existingUser} onSave={onSave} onCancel={onCancel} />);
    await waitFor(() => expect(mockedAdminService.getPermissions).toHaveBeenCalled());

    // Grant a permission
    const approveGrantButton = screen.getByTestId('grant-users.approve');
    fireEvent.click(approveGrantButton);

    // Revoke a permission
    const publishRevokeButton = screen.getByTestId('revoke-blog.publish');
    fireEvent.click(publishRevokeButton);

    fireEvent.click(screen.getByText('Save User'));

    await waitFor(() => {
        expect(mockedAdminService.updateUserDirectPermissions).toHaveBeenCalledWith('user-1', ['users.approve'], ['blog.publish']);
    });
    expect(onSave).toHaveBeenCalled();
  });
});