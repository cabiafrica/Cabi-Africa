import React, { useState, useEffect, useMemo } from 'react';
import { adminService, AdminUser } from '../../services/adminService';
import { roleService, Role } from '../../services/roleService';
import {
  PERMISSIONS_LIST,
  PERMISSION_CATEGORIES,
  getPermissionCategory,
  getPermissionLabel,
  getPermissionDescription
} from '../../constants/permissions';
import { Search, Shield, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface Props {
  user?: AdminUser;
  onSave: () => void;
  onCancel: () => void;
}

export const UserForm: React.FC<Props> = ({ user, onSave, onCancel }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const availablePermissions = PERMISSIONS_LIST;

  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(user?.roles || []));
  const [directGrants, setDirectGrants] = useState<Set<string>>(new Set(user?.directGrants || []));
  const [directRevokes, setDirectRevokes] = useState<Set<string>>(new Set(user?.directRevokes || []));
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Search states for permissions
  const [permSearch, setPermSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
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

  const inheritedPermissionsMap = useMemo(() => {
    const map = new Map<string, string[]>(); // permission -> list of role names granting it
    availableRoles.forEach(role => {
      if (selectedRoles.has(role.name)) {
        role.permissions.forEach(perm => {
          const existing = map.get(perm) || [];
          existing.push(role.displayName || role.name);
          map.set(perm, existing);
        });
      }
    });
    return map;
  }, [selectedRoles, availableRoles]);

  const categoriesList = useMemo(() => ['All', ...Object.keys(PERMISSION_CATEGORIES)], []);

  const filteredPermissions = useMemo(() => {
    return availablePermissions.filter(perm => {
      const category = getPermissionCategory(perm);
      const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
      const label = getPermissionLabel(perm);
      const desc = getPermissionDescription(perm);
      const matchesSearch = !permSearch.trim() ||
        perm.toLowerCase().includes(permSearch.toLowerCase()) ||
        label.toLowerCase().includes(permSearch.toLowerCase()) ||
        desc.toLowerCase().includes(permSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [availablePermissions, selectedCategory, permSearch]);

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

  const handleBulkCategoryAction = (action: 'grant' | 'revoke' | 'default') => {
    const newGrants = new Set(directGrants);
    const newRevokes = new Set(directRevokes);

    filteredPermissions.forEach(perm => {
      newGrants.delete(perm);
      newRevokes.delete(perm);
      if (action === 'grant') newGrants.add(perm);
      if (action === 'revoke') newRevokes.add(perm);
    });

    setDirectGrants(newGrants);
    setDirectRevokes(newRevokes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const roleIds = Array.from(selectedRoles);
    try {
      if (user) {
        await Promise.all([
          adminService.updateUserRoles(user.id, roleIds),
          adminService.updateUserDirectPermissions(user.id, Array.from(directGrants), Array.from(directRevokes))
        ]);
      } else {
        await adminService.createAdminUser({ email, roles: roleIds, directGrants: Array.from(directGrants), directRevokes: Array.from(directRevokes) });
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
    <div className="card max-w-5xl mx-auto bg-white dark:bg-[#131722] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {user ? 'Edit Administrator Privileges' : 'Provision New Administrator'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Assign security roles and customize granular operational permissions.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>Role-Based Access Control</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email Section */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-gray-300 mb-1.5">
            Work Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={!!user}
            className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            placeholder="admin@cabi.africa"
          />
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
            {user ? 'Email identifier is locked.' : 'A secure onboarding link and temporary credentials will be sent to this email.'}
          </p>
        </div>

        {/* Roles Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-yellow" />
              <span>Assigned Security Roles</span>
            </h4>
            <span className="text-xs text-slate-500 dark:text-gray-400">
              {selectedRoles.size} role(s) selected
            </span>
          </div>

          {availableRoles.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-gray-400 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 text-center">
              No custom roles created yet. Create roles under Growth & Platform → Roles.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableRoles.map(role => {
                const isSelected = selectedRoles.has(role.name);
                return (
                  <label
                    key={role.id || role.name}
                    className={`flex items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/50'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRoleToggle(role.name)}
                      className="h-4 w-4 mt-0.5 text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                    />
                    <div className="ml-3">
                      <span className={`block text-xs font-bold ${isSelected ? 'text-amber-500 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                        {role.displayName || role.name}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {role.description || `Grants ${role.permissions?.length || 0} baseline permissions`}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Granular Permissions Section */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-brand-yellow" />
                <span>Granular Permission Customization</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Override individual permissions for this specific administrator beyond their assigned role(s).
              </p>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkCategoryAction('grant')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                title="Grant all permissions currently visible"
              >
                + Grant All Visible
              </button>
              <button
                type="button"
                onClick={() => handleBulkCategoryAction('revoke')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                title="Revoke all permissions currently visible"
              >
                - Revoke All Visible
              </button>
              <button
                type="button"
                onClick={() => handleBulkCategoryAction('default')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center gap-1"
                title="Reset overrides to role defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="space-y-3 mb-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={permSearch}
                onChange={e => setPermSearch(e.target.value)}
                placeholder="Search permissions by keyword or action (e.g. cancel, payout, verify, trip)..."
                className="w-full !pl-11 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar text-xs">
              {categoriesList.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold text-[11px] transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow-sm font-black'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions List / Table */}
          <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-xs max-h-[420px] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
              <thead className="bg-slate-50 dark:bg-black/60 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-400">
                    Operational Capability & Scope
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-400">
                    Category
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-400">
                    Effective State
                  </th>
                  <th scope="col" className="px-3 py-3 text-right text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-400 pr-4">
                    Individual Override
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#131722]">
                {filteredPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                      No permissions match your search or selected category filter.
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map(perm => {
                    const label = getPermissionLabel(perm);
                    const desc = getPermissionDescription(perm);
                    const cat = getPermissionCategory(perm);
                    const isDirectGrant = directGrants.has(perm);
                    const isDirectRevoke = directRevokes.has(perm);
                    const grantingRoles = inheritedPermissionsMap.get(perm);
                    const isInherited = !!grantingRoles && grantingRoles.length > 0;

                    let statusBadge;
                    if (isDirectGrant) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Directly Granted</span>
                        </span>
                      );
                    } else if (isDirectRevoke) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                          <XCircle className="w-3 h-3" />
                          <span>Directly Revoked</span>
                        </span>
                      );
                    } else if (isInherited) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30" title={`Granted by: ${grantingRoles.join(', ')}`}>
                          <ShieldCheck className="w-3 h-3" />
                          <span>Inherited ({grantingRoles[0]})</span>
                        </span>
                      );
                    } else {
                      statusBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400">
                          Not Granted
                        </span>
                      );
                    }

                    return (
                      <tr key={perm} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pl-4 pr-3 max-w-md">
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                            {desc}
                          </div>
                          <code className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mt-0.5 block">
                            {perm}
                          </code>
                        </td>
                        <td className="px-3 py-3 text-[11px] font-semibold text-slate-500 dark:text-gray-400 whitespace-nowrap">
                          {cat}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {statusBadge}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right pr-4">
                          <div className="inline-flex rounded-lg shadow-2xs border border-slate-200 dark:border-white/10 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleDirectPermissionChange(perm, 'grant')}
                              className={`px-2.5 py-1 text-[11px] font-bold transition-colors ${
                                isDirectGrant
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white dark:bg-black/40 text-slate-700 dark:text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-500'
                              }`}
                            >
                              Grant
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDirectPermissionChange(perm, 'revoke')}
                              className={`px-2.5 py-1 text-[11px] font-bold border-x border-slate-200 dark:border-white/10 transition-colors ${
                                isDirectRevoke
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white dark:bg-black/40 text-slate-700 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500'
                              }`}
                            >
                              Revoke
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDirectPermissionChange(perm, 'default')}
                              className={`px-2.5 py-1 text-[11px] font-bold transition-colors ${
                                !isDirectGrant && !isDirectRevoke
                                  ? 'bg-slate-300 dark:bg-white/20 text-slate-900 dark:text-white'
                                  : 'bg-white dark:bg-black/40 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                              }`}
                              title="Reset to role inheritance"
                            >
                              Default
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-6 py-2.5 rounded-xl font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-brand-yellow hover:bg-brand-yellowHover text-black px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-brand-yellow/20 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Saving Changes...' : user ? 'Save Changes' : 'Create & Invite Admin'}
          </button>
        </div>
      </form>
    </div>
  );
};
