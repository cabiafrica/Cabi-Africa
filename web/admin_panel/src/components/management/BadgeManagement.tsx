import React, { useState, useEffect, useCallback } from 'react';
import { adminService, Badge } from '../../services/adminService';
import { BadgeForm } from '../forms/BadgeForm';
import { PageHeader } from '../common/PageHeader';
import {
  MilitaryTech,
  Add,
  Edit,
  Delete,
  Rule,
  Star
} from '@mui/icons-material';

export const BadgeManagement: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [editingBadge, setEditingBadge] = useState<Badge | 'new' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    const data = await adminService.getBadges();
    setBadges(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const handleSave = () => {
    setEditingBadge(null);
    fetchBadges();
  };

  const handleDelete = async (badgeId: string) => {
    if (window.confirm('Are you sure you want to delete this badge?')) {
      await adminService.deleteBadge(badgeId);
      fetchBadges();
    }
  };

  if (editingBadge) {
    return <BadgeForm badge={editingBadge === 'new' ? undefined : editingBadge} onSave={handleSave} onCancel={() => setEditingBadge(null)} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        category="Growth & Platform"
        title="Driver Badge Management"
        subtitle="Configure gamification badges, legacy tiers, and qualification rules"
        icon={<MilitaryTech className="w-5 h-5 text-amber-500" />}
        action={
          <button
            onClick={() => setEditingBadge('new')}
            className="btn-primary flex items-center gap-1.5"
          >
            <Add fontSize="small" />
            <span>Create New Badge</span>
          </button>
        }
      />

      <div className="bg-[#131722] shadow-sm rounded-[3px] border border-white/10 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10 bg-[#0a0a0a] flex justify-between items-center">
          <h3 className="font-semibold text-white text-xs">All Badges</h3>
          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-[3px]">
            {badges.length} Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5 text-xs">
            <thead className="bg-[#0a0a0a]">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rules</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#131722] divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading badges...</td></tr>
              ) : badges.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center">
                      <MilitaryTech className="text-slate-300 dark:text-slate-600 text-5xl mb-2" />
                      <p>No badges found.</p>
                      <button onClick={() => setEditingBadge('new')} className="mt-2 text-amber-600 hover:underline text-sm">Create your first badge</button>
                    </div>
                  </td>
                </tr>
              ) : badges.map(badge => (
                <tr key={badge.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mr-3 border border-yellow-200 dark:border-yellow-700">
                        <Star fontSize="small" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white block">{badge.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {badge.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">{badge.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Rule fontSize="small" className="text-slate-400" />
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-semibold text-slate-700 dark:text-slate-200">{badge.rules.length} Rules</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingBadge(badge)}
                        className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </button>
                      <button
                        onClick={() => handleDelete(badge.id)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Delete fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};