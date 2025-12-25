"use client";

import { useState, useEffect } from 'react';
import { produce } from 'immer';

interface MlmFeeRule {
  recipient: 'system' | 'referrer' | 'upline';
  value: number;
  ruleType: 'fixed' | 'percentage';
  uplineLevel: number;
}

interface MlmFormulaEditorProps {
  initialRules: MlmFeeRule[];
}

export function MlmFormulaEditor({ initialRules }: MlmFormulaEditorProps) {
  const [rules, setRules] = useState<MlmFeeRule[]>(initialRules);
  const [originalRules, setOriginalRules] = useState<MlmFeeRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch('/api/v1/admin/mlm/formula');
        if (!response.ok) throw new Error('Failed to fetch rules.');
        const data = await response.json();
        setRules(data);
        setOriginalRules(JSON.parse(JSON.stringify(data))); // Deep copy for change detection
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRules();
  }, []);

  const handleRuleChange = (index: number, field: keyof MlmFeeRule, value: any) => {
    setRules(produce(draft => {
      const parsedValue = (field === 'value' || field === 'uplineLevel') ? parseFloat(value) : value;
      (draft[index] as any)[field] = parsedValue;
    }));
  };

  const handleAddRule = () => {
    const newRule: MlmFeeRule = {
      recipient: 'referrer',
      value: 0,
      ruleType: 'fixed',
      uplineLevel: 0,
    };
    setRules([...rules, newRule]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/v1/admin/mlm/formula', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save changes.');
      }
      const updatedRules = await response.json();
      setRules(updatedRules);
      setOriginalRules(JSON.parse(JSON.stringify(updatedRules)));
      setSuccess('Formula updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(rules) !== JSON.stringify(originalRules);

  if (isLoading) return <div>Loading formula...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  const inputStyle = "border p-2 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500 block w-full";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">{success}</div>}
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border rounded-lg bg-gray-50">
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-gray-700">Recipient</label>
              <select value={rule.recipient} onChange={(e) => handleRuleChange(index, 'recipient', e.target.value)} className={inputStyle}>
                <option value="system">System</option>
                <option value="referrer">Referrer</option>
                <option value="upline">Upline</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Rule Type</label>
              <select value={rule.ruleType} onChange={(e) => handleRuleChange(index, 'ruleType', e.target.value)} className={inputStyle}>
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Value</label>
              <input type="number" value={rule.value} onChange={(e) => handleRuleChange(index, 'value', e.target.value)} className={inputStyle} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Upline Level</label>
              <input type="number" value={rule.uplineLevel} disabled={rule.recipient !== 'upline'} onChange={(e) => handleRuleChange(index, 'uplineLevel', e.target.value)} className={`${inputStyle} disabled:bg-gray-200`} />
            </div>
            <div className="md:col-span-3 flex items-end justify-end">
              <button onClick={() => handleRemoveRule(index)} className="text-red-600 hover:text-red-800 font-medium">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <button onClick={handleAddRule} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Add Rule
        </button>
        <button 
          onClick={handleSaveChanges} 
          disabled={!hasChanges || isSaving} 
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}