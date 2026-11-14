'use client';

import { useState, useEffect } from 'react';

const MAX_LEVELS = 5;

interface ReferralFormula {
  levels: number[];
}

export function ReferralFormulaForm() {
  const [levels, setLevels] = useState<number[]>(Array(MAX_LEVELS).fill(0));
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormula = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/admin/referral/formula');
        if (!response.ok) throw new Error('Failed to fetch settings.');
        const data: ReferralFormula = await response.json();
        setLevels(data.levels);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFormula();
  }, []);

  useEffect(() => {
    const sum = levels.reduce((acc, val) => acc + (Number(val) || 0), 0);
    setTotal(sum);
  }, [levels]);

  const handleLevelChange = (index: number, value: string) => {
    setSuccess(null); // Clear success message on edit
    const newLevels = [...levels];
    newLevels[index] = parseFloat(value) || 0;
    setLevels(newLevels);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/admin/referral/formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levels }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to save settings.');
      setSuccess('Configuration saved successfully!');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow rounded-lg">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Fee Distribution</h3>
        <p className="mt-1 text-sm text-gray-500">
          Set the percentage of the fee that goes to each referral level. The total should not exceed 100%.
        </p>
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}

      {error && <div className="rounded-md bg-red-50 p-4"><p className="text-sm text-red-700">{error}</p></div>}

      {success && <div className="rounded-md bg-green-50 p-4"><p className="text-sm text-green-700">{success}</p></div>}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {levels.map((value, index) => (
          <div key={index} className="sm:col-span-2">
            <label htmlFor={`level-${index}`} className="block text-sm font-medium text-gray-700">
              Level {index + 1} (%)
            </label>
            <input
              type="number"
              id={`level-${index}`}
              value={value}
              onChange={(e) => handleLevelChange(index, e.target.value)}
              className={inputStyles}
              step="0.1"
              min="0"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-5 border-t border-gray-200">
        <p className={`text-sm font-medium ${total > 100 ? 'text-red-600' : 'text-gray-700'}`}>Total: {total.toFixed(2)}%</p>
        <button type="submit" disabled={isLoading || total > 100} className="rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Saving...' : 'Save Configuration'}</button>
      </div>
    </form>
  );
}