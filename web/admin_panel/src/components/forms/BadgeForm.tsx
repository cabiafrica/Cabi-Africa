import React, { useState } from 'react';
import { adminService, Badge, BadgeRule } from '../../services/adminService';

interface Props {
  badge?: Badge;
  onSave: () => void;
  onCancel: () => void;
}

export const BadgeForm: React.FC<Props> = ({ badge, onSave, onCancel }) => {
  const [name, setName] = useState(badge?.name || '');
  const [description, setDescription] = useState(badge?.description || '');
  const [value, setValue] = useState<number | undefined>(badge?.value);
  const [rules, setRules] = useState<BadgeRule[]>(badge?.rules || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleRuleChange = (index: number, field: keyof BadgeRule, value: any) => {
    const newRules = [...rules];
    (newRules[index] as any)[field] = field === 'value' ? parseFloat(value) : value;
    setRules(newRules);
  };

  const addRule = () => {
    setRules([...rules, { metric: 'averageRating', operator: 'GTE', value: 0 }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { name, description, icon: '', value, rules };
    try {
      if (badge) {
        await adminService.updateBadge(badge.id, payload);
      } else {
        await adminService.createBadge(payload);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save badge', error);
      alert('Failed to save badge');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">{badge ? 'Edit' : 'Create'} Badge</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Badge Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2.5 border text-gray-900"
            placeholder="e.g. Top Rated Driver"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2.5 border text-gray-900"
            placeholder="Describe the criteria and benefits..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Badge Value (Optional)</label>
          <input
            type="number"
            value={value || ''}
            onChange={e => setValue(parseFloat(e.target.value))}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2.5 border text-gray-900"
            placeholder="e.g. 100"
          />
          <p className="text-xs text-gray-500 mt-1">Numeric value associated with this badge (e.g., points, priority level).</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-gray-800">Qualification Rules</h4>
            <button
              type="button"
              onClick={addRule}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              + Add Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <select
                  value={rule.metric}
                  onChange={e => handleRuleChange(index, 'metric', e.target.value)}
                  className="flex-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2 border"
                >
                  <option value="averageRating">Average Rating</option>
                  <option value="completedTrips">Completed Trips</option>
                  <option value="totalEarnings">Total Earnings</option>
                </select>
                <select
                  value={rule.operator}
                  onChange={e => handleRuleChange(index, 'operator', e.target.value)}
                  className="w-24 text-sm border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2 border"
                >
                  <option value="GT">&gt;</option>
                  <option value="GTE">&ge;</option>
                  <option value="LT">&lt;</option>
                  <option value="LTE">&le;</option>
                  <option value="EQ">=</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={rule.value}
                  onChange={e => handleRuleChange(index, 'value', e.target.value)}
                  className="w-28 text-sm border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2 border"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Remove Rule"
                >
                  🗑️
                </button>
              </div>
            ))}
            {rules.length === 0 && <p className="text-sm text-gray-500 italic text-center py-2">No rules added. This badge will be manual assignment only?</p>}
          </div>
        </div>

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
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Badge'}
          </button>
        </div>
      </form>
    </div>
  );
};