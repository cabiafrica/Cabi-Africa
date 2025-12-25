import React, { useState, useEffect, useCallback } from 'react';
import { adminService, Badge } from '../../services/adminService';
import { BadgeForm } from '../forms/BadgeForm';

export const BadgeManagement: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [editingBadge, setEditingBadge] = useState<Badge | 'new' | null>(null);

  const fetchBadges = useCallback(async () => {
    const data = await adminService.getBadges();
    setBadges(data);
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800">Badge Management</h2>
        <button
          onClick={() => setEditingBadge('new')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Create New Badge
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rules</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {badges.map(badge => (
              <tr key={badge.id} className="hover:bg-purple-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                      ★
                    </div>
                    <span className="text-sm font-medium text-gray-900">{badge.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{badge.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{badge.rules.length} Rules</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => setEditingBadge(badge)} className="text-purple-600 hover:text-purple-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(badge.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {badges.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">No badges found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};