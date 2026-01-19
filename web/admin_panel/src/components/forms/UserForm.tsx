import React, { useState, useEffect, useMemo } from 'react';
import { adminService, AdminUser } from '../../services/adminService';
import { roleService, Role } from '../../services/roleService';
import { PERMISSIONS_LIST } from '../../constants/permissions';

interface Props {
  user?: AdminUser;
  onSave: () => void;
  onCancel: () => void;
}

export const UserForm: React.FC<Props> = ({ user, onSave, onCancel }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  // Use PERMISSIONS_LIST directly
  const availablePermissions = PERMISSIONS_LIST;

  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(user?.roles || []));
  const [directGrants, setDirectGrants] = useState<Set<string>>(new Set(user?.directGrants || []));
  const [directRevokes, setDirectRevokes] = useState<Set<string>>(new Set(user?.directRevokes || []));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch real roles from backend via roleService
    const loadRoles = async () => {
      try {
        const roles = await roleService.getAllRoles();
        setAvailableRoles(roles);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    };
    loadRoles();
  }, []);

  const inheritedPermissions = useMemo(() => {
    const inherited = new Set<string>();
    availableRoles.forEach(role => {
      // roleService keys internal name as 'name' (e.g. SUPER_ADMIN) vs 'id' in local AdminUser?
      // AdminUser.roles usually stores role IDs (names).
      // Let's assume user.roles contains the 'name' (unique ID) of the role.
      if (selectedRoles.has(role.name)) {
        role.permissions.forEach(perm => inherited.add(perm));
      }
    });
    return inherited;
  }, [selectedRoles, availableRoles]);

  const handleRoleToggle = (roleName: string) => {
    const newSelection = new Set(selectedRoles);
    if (newSelection.has(roleName)) {
      newSelection.delete(roleName);
    } else {
      newSelection.add(roleName);
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
    <div className="card max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-200 dark:border-slate-700 pb-2">{user ? 'Edit' : 'Create'} Admin User</h3>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email Section */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={!!user}
            className="w-full border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 disabled:bg-slate-100 dark:disabled:bg-slate-700"
            placeholder="admin@example.com"
          />
        </div>

        {/* Roles Section */}
        <div>
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Assign Roles</h4>
          {availableRoles.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No roles found.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableRoles.map(role => (
                <label key={role.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedRoles.has(role.name) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/50 ring-1 ring-blue-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.has(role.name)}
                    onChange={() => handleRoleToggle(role.name)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <div className="ml-2">
                    <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">{role.displayName}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{role.description}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Granular Permissions Section */}
        <div>
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Granular Permission Overrides</h4>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-300 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Permission</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Effective Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Override Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {availablePermissions.map(perm => {
                  let statusNode = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Not Granted</span>;
                  if (directGrants.has(perm)) {
                    statusNode = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Directly Granted</span>;
                  } else if (directRevokes.has(perm)) {
                    statusNode = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Directly Revoked</span>;
                  } else if (inheritedPermissions.has(perm)) {
                    statusNode = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Inherited</span>;
                  }

                  return (
                    <tr key={perm} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-slate-100">{perm}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{statusNode}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDirectPermissionChange(perm, 'grant')}
                          className={`px-2 py-1 text-xs rounded border ${directGrants.has(perm) ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                        >
                          Grant
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectPermissionChange(perm, 'revoke')}
                          className={`px-2 py-1 text-xs rounded border ${directRevokes.has(perm) ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                        >
                          Revoke
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectPermissionChange(perm, 'default')}
                          className={`px-2 py-1 text-xs rounded border ${!directGrants.has(perm) && !directRevokes.has(perm) ? 'bg-slate-600 text-white border-slate-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
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
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 px-6 py-2.5 rounded-lg font-medium transition-colors"
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
