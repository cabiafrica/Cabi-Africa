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

  const inputStyles = "mt-1 block w-full rounded border border-white/10 bg-[#0a0a0a] text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2.5 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#131722] p-8 shadow-xl rounded border border-white/10 text-white">
      <div>
        <h3 className="text-lg font-bold leading-6 text-white">Fee Distribution</h3>
        <p className="mt-1 text-sm text-slate-400">
          Set the percentage of the fee that goes to each referral level. The total should not exceed 100%.
        </p>
      </div>

      {isLoading && <p className="text-slate-400">Loading...</p>}

      {error && <div className="rounded bg-rose-500/10 border border-rose-500/20 p-4"><p className="text-sm text-rose-400">{error}</p></div>}

      {success && <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-4"><p className="text-sm text-emerald-400">{success}</p></div>}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {levels.map((value, index) => (
          <div key={index} className="sm:col-span-2">
            <label htmlFor={`level-${index}`} className="block text-sm font-medium text-slate-300">
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

      <div className="flex justify-between items-center pt-5 border-t border-white/10">
        <p className={`text-sm font-medium ${total > 100 ? 'text-rose-400' : 'text-slate-300'}`}>Total: {total.toFixed(2)}%</p>
        <button type="submit" disabled={isLoading || total > 100} className="rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black py-2.5 px-6 text-sm font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all">
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
}