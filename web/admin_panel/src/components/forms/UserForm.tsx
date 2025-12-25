import React, { useState, useEffect, useMemo } from 'react';
import { adminService, AdminUser, Role, Permission } from '../../services/adminService';

interface Props {
  user?: AdminUser;
  onSave: () => void;
  onCancel: () => void;
}

export const UserForm: React.FC<Props> = ({ user, onSave, onCancel }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(user?.roles || []));
  const [directGrants, setDirectGrants] = useState<Set<string>>(new Set(user?.directGrants || []));
  const [directRevokes, setDirectRevokes] = useState<Set<string>>(new Set(user?.directRevokes || []));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      adminService.getRoles(),
      adminService.getPermissions(),
    ]).then(([roles, permissions]) => {
      setAvailableRoles(roles);
      setAvailablePermissions(permissions);
    });
  }, []);

  const inheritedPermissions = useMemo(() => {
    const inherited = new Set<string>();
    availableRoles.forEach(role => {
      if (selectedRoles.has(role.id)) {
        role.permissions.forEach(perm => inherited.add(perm));
      }
    });
    return inherited;
  }, [selectedRoles, availableRoles]);

  const handleRoleToggle = (roleId: string) => {
    const newSelection = new Set(selectedRoles);
    if (newSelection.has(roleId)) {
      newSelection.delete(roleId);
    } else {
      newSelection.add(roleId);
    }
    setSelectedRoles(newSelection);
  };

  const handleDirectPermissionChange = (permissionId: string, type: 'grant' | 'revoke' | 'default') => {
    const newGrants = new Set(directGrants);
    const newRevokes = new Set(directRevokes);

    // Clear existing direct assignments for this permission
    newGrants.delete(permissionId);
    newRevokes.delete(permissionId);

    if (type === 'grant') {
      newGrants.add(permissionId);
    } else if (type === 'revoke') {
      newRevokes.add(permissionId);
    }

    setDirectGrants(newGrants);
    setDirectRevokes(newRevokes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const roleIds = Array.from(selectedRoles);
    try {
      if (user) {
        // Update roles and direct permissions in parallel
        await Promise.all([
          adminService.updateUserRoles(user.id, roleIds),
          adminService.updateUserDirectPermissions(user.id, Array.from(directGrants), Array.from(directRevokes))
        ]);
      } else {
        await adminService.createAdminUser({ email, roles: roleIds, directGrants: [], directRevokes: [] });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save user', error);
      alert('Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">{user ? 'Edit' : 'Create'} Admin User</h3>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={!!user}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="admin@example.com"
          />
        </div>

        {/* Roles Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Assign Roles</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availableRoles.map(role => (
              <label key={role.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedRoles.has(role.id) ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                <input
                  type="checkbox"
                  checked={selectedRoles.has(role.id)}
                  onChange={() => handleRoleToggle(role.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-900">{role.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Granular Permissions Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Granular Permission Overrides</h4>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Permission</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Effective Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Override Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {availablePermissions.map(perm => {
                  let statusNode = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Not Granted</span>;
                  if (directGrants.has(perm.id)) {
                    statusNode = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Directly Granted</span>;
                  } else if (directRevokes.has(perm.id)) {
                    statusNode = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Directly Revoked</span>;
                  } else if (inheritedPermissions.has(perm.id)) {
                    statusNode = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Inherited</span>;
                  }

                  return (
                    <tr key={perm.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{perm.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{statusNode}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDirectPermissionChange(perm.id, 'grant')}
                          className={`px-2 py-1 text-xs rounded border ${directGrants.has(perm.id) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                          Grant
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectPermissionChange(perm.id, 'revoke')}
                          className={`px-2 py-1 text-xs rounded border ${directRevokes.has(perm.id) ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                          Revoke
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectPermissionChange(perm.id, 'default')}
                          className={`px-2 py-1 text-xs rounded border ${!directGrants.has(perm.id) && !directRevokes.has(perm.id) ? 'bg-gray-600 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                          Default
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </div>
  );
};