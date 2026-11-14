import React, { useState, useEffect } from 'react';
import {
  Block,
  Search,
  FilterList,
  CheckCircle,
  Warning,
  History,
  PersonOff
} from '@mui/icons-material';
import { adminService } from '../services/adminService';

interface SuspendedUser {
  id: string;
  name: string;
  phoneNumber: string;
  reason: string;
  suspendedAt: string;
}

export const SuspendedAccountManagement: React.FC = () => {
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUser[]>([]);
  const [userToReactivate, setUserToReactivate] = useState<SuspendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSuspendedUsers();
      setSuspendedUsers(data);
    } catch (error) {
      console.error('Failed to load suspended users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReactivateClick = (user: SuspendedUser) => {
    setUserToReactivate(user);
  };

  const confirmReactivation = async () => {
    if (!userToReactivate) return;

    try {
      await adminService.reactivateUser(userToReactivate.id);
      // Refresh list
      await loadData();
      setUserToReactivate(null);
    } catch (error) {
      console.error('Failed to reactivate user', error);
      alert('Failed to reactivate user');
    }
  };

  const filteredUsers = suspendedUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PersonOff className="text-red-600 dark:text-red-400" />
            Suspended Accounts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage account suspensions and bans.</p>
        </div>
        <div className="flex bg-white dark:bg-card-dark rounded-lg shadow-sm border border-slate-200 dark:border-white/10 p-1">
          <div className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
            Total Suspended
          </div>
          <div className="px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400">
            {suspendedUsers.length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark shadow-sm rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-dark flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <FilterList fontSize="small" />
            Filter Reason
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-surface-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date Suspended</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-card-dark divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading suspended users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No suspended accounts found.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{user.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.reason === 'PAYMENT_FRAUD'
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50'
                      : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50'
                      }`}>
                      <Warning style={{ fontSize: 12 }} />
                      {user.reason?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <History fontSize="small" className="text-slate-400" />
                      {user.suspendedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleReactivateClick(user)}
                      className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-bold flex items-center justify-end gap-1 w-full"
                    >
                      <CheckCircle fontSize="small" />
                      Reactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {userToReactivate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10 scale-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="text-green-600 dark:text-green-400" />
              Confirm Reactivation
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
              Are you sure you want to reactivate <strong>{userToReactivate.name}</strong>?
              This will restore their access to the platform immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToReactivate(null)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReactivation}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors"
              >
                Confirm Reactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};