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

  const handleRuleChange = (index: number, field: keyof BadgeRule, val: any) => {
    const newRules = [...rules];
    (newRules[index] as any)[field] = field === 'value' ? parseFloat(val) : val;
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
    <div className="bg-[#131722] p-6 rounded border border-white/10 shadow-2xl max-w-2xl mx-auto text-white">
      <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-3">{badge ? 'Edit' : 'Create'} Badge</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Badge Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full bg-[#0a0a0a] border border-white/10 rounded text-white p-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm placeholder-slate-500"
            placeholder="e.g. Top Rated Driver"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded text-white p-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm placeholder-slate-500"
            placeholder="Describe the criteria and benefits..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Badge Value (Optional)</label>
          <input
            type="number"
            value={value || ''}
            onChange={e => setValue(parseFloat(e.target.value))}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded text-white p-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm placeholder-slate-500"
            placeholder="e.g. 100"
          />
          <p className="text-xs text-slate-400 mt-1">Numeric value associated with this badge (e.g., points, priority level).</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-white">Qualification Rules</h4>
            <button
              type="button"
              onClick={addRule}
              className="text-sm text-amber-400 hover:text-amber-300 font-medium"
            >
              + Add Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={index} className="flex gap-3 items-center bg-[#0a0a0a] p-3 rounded border border-white/10">
                <select
                  value={rule.metric}
                  onChange={e => handleRuleChange(index, 'metric', e.target.value)}
                  className="flex-1 text-sm bg-[#131722] border border-white/10 rounded text-white p-2 focus:border-amber-500 outline-none"
                >
                  <option value="averageRating">Average Rating</option>
                  <option value="totalTrips">Total Trips</option>
                  <option value="acceptanceRate">Acceptance Rate</option>
                  <option value="cancellationRate">Cancellation Rate</option>
                </select>

                <select
                  value={rule.operator}
                  onChange={e => handleRuleChange(index, 'operator', e.target.value)}
                  className="w-24 text-sm bg-[#131722] border border-white/10 rounded text-white p-2 focus:border-amber-500 outline-none"
                >
                  <option value="GTE">&gt;=</option>
                  <option value="LTE">&lt;=</option>
                  <option value="EQ">==</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  value={rule.value}
                  onChange={e => handleRuleChange(index, 'value', e.target.value)}
                  className="w-28 text-sm bg-[#131722] border border-white/10 rounded text-white p-2 focus:border-amber-500 outline-none"
                  placeholder="Value"
                />

                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
            {rules.length === 0 && (
              <p className="text-sm text-slate-500 italic">No rules specified. Badge will be manual assignment only.</p>
            )}
          </div>
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
            {isLoading ? 'Saving...' : 'Save Badge'}
          </button>
        </div>
      </form>
    </div>
  );
};
