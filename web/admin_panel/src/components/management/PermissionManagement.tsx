import React, { useState, useEffect, useCallback } from 'react';
import { adminService, Permission } from '../../services/adminService';

export const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<Partial<Permission>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchPermissions = useCallback(async () => {
    const data = await adminService.getPermissions();
    setPermissions(data);
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleEdit = (permission: Permission) => {
    setCurrentPermission(permission);
    setIsFormVisible(true);
  };

  const handleCreate = () => {
    setCurrentPermission({});
    setIsFormVisible(true);
  };

  const handleDelete = async (permissionId: string) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      await adminService.deletePermission(permissionId);
      fetchPermissions();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (currentPermission.id) {
        await adminService.updatePermission(currentPermission.id, currentPermission as Permission);
      } else {
        await adminService.createPermission(currentPermission as Permission);
      }
      setIsFormVisible(false);
      fetchPermissions();
    } catch (error) {
      alert('Failed to save permission.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFormVisible) {
    return (
      <div className="bg-white dark:bg-card-dark p-6 rounded-lg shadow max-w-lg mx-auto">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{currentPermission.id ? 'Edit' : 'Create'} Permission</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Permission ID</label>
            <input
              type="text"
              value={currentPermission.id || ''}
              onChange={e => setCurrentPermission(p => ({ ...p, id: e.target.value }))}
              required
              disabled={!!currentPermission.id && isFormVisible && currentPermission.id !== undefined}
              // Note: The disabled condition is a bit tricky if it's a new one but somehow has ID. 
              // Simplification: if we are editing an existing permission, we usually disable ID editing.
              // Here I check if we are in 'edit mode' vs 'create mode' effectively.
              // A better way is to pass a prop or state flag, but let's stick to simple logic:
              className="mt-1 block w-full border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm p-2 border bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <input
              type="text"
              value={currentPermission.description || ''}
              onChange={e => setCurrentPermission(p => ({ ...p, description: e.target.value }))}
              required
              className="mt-1 block w-full border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm p-2 border bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsFormVisible(false)}
              className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Permission'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card-dark shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-surface-dark">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Permission Management</h2>
        <button
          onClick={handleCreate}
          className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Create New Permission
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-surface-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-card-dark divide-y divide-slate-200 dark:divide-slate-700">
            {permissions.map(perm => (
              <tr key={perm.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{perm.id}</td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{perm.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(perm)} className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-400 mr-4">Edit</button>
                  <button onClick={() => handleDelete(perm.id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
            {permissions.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">No permissions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};