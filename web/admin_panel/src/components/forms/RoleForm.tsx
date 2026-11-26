import React, { useState, useEffect } from 'react';
import { adminService, Role, Permission } from '../../services/adminService';

interface Props {
  role?: Role;
  onSave: () => void;
  onCancel: () => void;
}

export const RoleForm: React.FC<Props> = ({ role, onSave, onCancel }) => {
  const [name, setName] = useState(role?.name || '');
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set(role?.permissions || []));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    adminService.getPermissions().then(setAvailablePermissions);
  }, []);

  const handlePermissionToggle = (permissionId: string) => {
    const newSelection = new Set(selectedPermissions);
    if (newSelection.has(permissionId)) {
      newSelection.delete(permissionId);
    } else {
      newSelection.add(permissionId);
    }
    setSelectedPermissions(newSelection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { name, permissions: Array.from(selectedPermissions) };
    try {
      if (role) {
        await adminService.updateRole(role.id, payload);
      } else {
        await adminService.createRole(payload);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save role', error);
      alert('Failed to save role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-current mb-6 border-b border-slate-200 dark:border-white/10 pb-2">{role ? 'Edit' : 'Create'} Role</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full text-current"
            placeholder="e.g. Moderator"
          />
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Permissions</h4>
          <div className="bg-[#0a0a0a] border border-white/10 rounded p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePermissions.map(perm => (
                <label key={perm.id} className={`flex items-start p-3 rounded border cursor-pointer transition-colors ${selectedPermissions.has(perm.id) ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/50' : 'bg-[#131722] border-white/10 hover:bg-white/5'}`}>
                  <input
                    type="checkbox"
                    checked={selectedPermissions.has(perm.id)}
                    onChange={() => handlePermissionToggle(perm.id)}
                    className="mt-0.5 h-4 w-4 text-amber-500 focus:ring-amber-500 border-white/20 rounded accent-amber-500 bg-[#0a0a0a]"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-white font-mono">{perm.id}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{perm.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Select the permissions that users with this role should have by default.</p>
        </div>

        <div className="flex justify-end gap-2.5 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 px-3.5 py-1.5 rounded font-medium transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-3.5 py-1.5 rounded font-semibold transition-all shadow-sm shadow-amber-500/20 disabled:opacity-50 text-xs active:scale-95"
          >
            {isLoading ? 'Saving...' : 'Save Role'}
          </button>
        </div>
      </form>
    </div>
  );
};