import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

interface MlmRule {
  id: string;
  recipient: 'SPONSOR' | 'UPLINE' | 'COMPANY';
  type: 'FIXED' | 'PERCENTAGE';
  value: number;
  level?: number; // Only for UPLINE
}

export const MlmConfiguration: React.FC = () => {
  const [rules, setRules] = useState<MlmRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Using getMlmRules mock from Story 79.8
    adminService.getMlmRules().then(data => {
      setRules(data);
      setLoading(false);
    });
  }, []);

  const handleAddRule = () => {
    setRules([...rules, { id: `new-${Date.now()}`, recipient: 'COMPANY', type: 'PERCENTAGE', value: 0 }]);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleUpdateRule = (id: string, updates: Partial<MlmRule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleSave = async () => {
    const totalPercentage = rules.filter(r => r.type === 'PERCENTAGE').reduce((sum, r) => sum + r.value, 0);
    if (totalPercentage > 100) {
      alert(`Total percentage allocation (${totalPercentage}%) exceeds 100%!`);
      return;
    }
    await adminService.updateMlmRules(rules);
    alert('MLM Rules Saved Successfully!');
  };

  if (loading) return <div>Loading Configuration...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MLM Fee Distribution Configuration (Story 79.8)</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Distribution Rules</h2>
          <button onClick={handleAddRule} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Add Rule</button>
        </div>

        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div key={rule.id} className="flex flex-wrap gap-4 items-center p-4 border rounded-lg bg-gray-50">
              <span className="font-mono text-gray-400 w-8">#{index + 1}</span>

              <div>
                <label className="block text-xs font-medium text-gray-500">Recipient</label>
                <select
                  className="border rounded p-1"
                  value={rule.recipient}
                  onChange={(e) => handleUpdateRule(rule.id, { recipient: e.target.value as any })}
                >
                  <option value="COMPANY">Company</option>
                  <option value="SPONSOR">Direct Sponsor</option>
                  <option value="UPLINE">Upline (Level N)</option>
                </select>
              </div>

              {rule.recipient === 'UPLINE' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500">Level</label>
                  <input
                    type="number" min="1" max="10"
                    className="border rounded p-1 w-16"
                    value={rule.level || 1}
                    onChange={(e) => handleUpdateRule(rule.id, { level: parseInt(e.target.value) })}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500">Type</label>
                <select
                  className="border rounded p-1"
                  value={rule.type}
                  onChange={(e) => handleUpdateRule(rule.id, { type: e.target.value as any })}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (KES)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500">Value</label>
                <input
                  type="number"
                  className="border rounded p-1 w-24"
                  value={rule.value}
                  onChange={(e) => handleUpdateRule(rule.id, { value: parseFloat(e.target.value) })}
                />
              </div>

              <button onClick={() => handleDeleteRule(rule.id)} className="ml-auto text-red-600 hover:text-red-900">Delete</button>
            </div>
          ))}
          {rules.length === 0 && <div className="text-gray-500 text-center py-4">No rules defined.</div>}
        </div>

        <div className="mt-8 pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total Percentage: <span className="font-bold">{rules.filter(r => r.type === 'PERCENTAGE').reduce((sum, r) => sum + r.value, 0)}%</span>
          </div>
          <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold">Save Changes</button>
        </div>
      </div>
    </div>
  );
};