'use client';

import { useState, FormEvent } from 'react';

// Mock driver type for now. In a real app, this would be imported.
interface Driver {
  id: string;
  name: string;
  email: string;
}

export function CommissionAdjustmentForm() {
  const [driverSearch, setDriverSearch] = useState('');
  const [foundDrivers, setFoundDrivers] = useState<Driver[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [reason, setReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ error?: string; success?: string } | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (driverSearch.length < 2) {
      setSearchError('Search term must be at least 2 characters.');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setFoundDrivers([]);
    try {
      const response = await fetch(`/api/drivers/search?q=${encodeURIComponent(driverSearch)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to search for drivers.');
      }
      const drivers: Driver[] = await response.json();
      setFoundDrivers(drivers);
      if (drivers.length === 0) {
        setSearchError('No drivers found.');
      }
    } catch (error: any) {
      setSearchError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const resetForm = () => {
    setDriverSearch('');
    setFoundDrivers([]);
    setSelectedDriver(null);
    setAmount('');
    setType('CREDIT');
    setReason('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const response = await fetch('/api/finance/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: selectedDriver.id, amount: parseFloat(amount), type, reason }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create adjustment.');
      setSubmitStatus({ success: 'Adjustment created successfully!' });
      resetForm();
    } catch (error: any) {
      setSubmitStatus({ error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "mt-1 block w-full rounded border border-white/10 bg-[#0a0a0a] text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2.5 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#131722] p-8 shadow-xl rounded border border-white/10 text-white">
      <div>
        <h3 className="text-lg font-bold leading-6 text-white">Driver Selection</h3>
        {!selectedDriver ? (
          <div className="mt-2">
            <div className="flex gap-2">
              <input type="text" value={driverSearch} onChange={(e) => { setDriverSearch(e.target.value); setSearchError(null); }} placeholder="Search by name, email, or ID" className={inputStyles} />
              <button type="button" onClick={handleSearch} disabled={isSearching} className="rounded bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50">
                {isSearching ? '...' : 'Search'}
              </button>
            </div>
            {searchError && <p className="mt-2 text-sm text-rose-400">{searchError}</p>}
            <ul className="mt-2 divide-y divide-white/5">
              {foundDrivers.map(driver => (
                <div key={driver.id} onClick={() => setSelectedDriver(driver)} className="cursor-pointer p-2 hover:bg-white/5 rounded transition-colors">
                  <p className="font-medium text-white">{driver.name}</p>
                  <p className="text-sm text-slate-400">{driver.email}</p>
                </div>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-2 p-3 bg-[#0a0a0a] rounded border border-white/10 flex justify-between items-center">
            <div>
              <p className="font-semibold text-white">{selectedDriver.name}</p>
              <p className="text-sm text-slate-400">{selectedDriver.email}</p>
            </div>
            <button onClick={() => setSelectedDriver(null)} className="text-sm text-amber-400 hover:text-amber-300 font-medium">Change driver</button>
          </div>
        )}
      </div>

      {submitStatus?.error && <div className="rounded bg-rose-500/10 border border-rose-500/20 p-4"><p className="text-sm text-rose-400">{submitStatus.error}</p></div>}
      {submitStatus?.success && <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-4"><p className="text-sm text-emerald-400">{submitStatus.success}</p></div>}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300">Amount</label>
          <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className={inputStyles} step="0.01" min="0" required />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-slate-300">Type</label>
          <div className="mt-3 flex gap-6 text-sm">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" value="CREDIT" checked={type === 'CREDIT'} onChange={() => setType('CREDIT')} className="accent-amber-500" /> Credit (Add to balance)</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" value="DEBIT" checked={type === 'DEBIT'} onChange={() => setType('DEBIT')} className="accent-amber-500" /> Debit (Subtract from balance)</label>
          </div>
        </div>
        <div className="sm:col-span-6">
          <label htmlFor="reason" className="block text-sm font-medium text-slate-300">Reason</label>
          <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={3} className={inputStyles} required />
        </div>
      </div>

      <div className="flex justify-end pt-5 border-t border-white/10">
        <button type="submit" disabled={!selectedDriver || isSubmitting} className="rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black py-2.5 px-6 text-sm font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all">
          {isSubmitting ? 'Creating...' : 'Create Adjustment'}
        </button>
      </div>
    </form>
  );
}