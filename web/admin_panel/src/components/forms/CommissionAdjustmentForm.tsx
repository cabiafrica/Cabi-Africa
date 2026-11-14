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

  const inputStyles = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow rounded-lg">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Driver Selection</h3>
        {!selectedDriver ? (
          <div className="mt-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input type="text" value={driverSearch} onChange={(e) => { setDriverSearch(e.target.value); setSearchError(null); }} placeholder="Search by name, email, or ID" className={inputStyles} />
              <button type="submit" disabled={isSearching} className="rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
                {isSearching ? '...' : 'Search'}
              </button>
            </form>
            {searchError && <p className="mt-2 text-sm text-red-600">{searchError}</p>}
            <ul className="mt-2">
              {foundDrivers.map(driver => (
                <div key={driver.id} onClick={() => setSelectedDriver(driver)} className="cursor-pointer p-2 hover:bg-gray-100 rounded-md">
                  <p className="font-medium">{driver.name}</p>
                  <p className="text-sm text-gray-500">{driver.email}</p>
                </div>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="font-semibold">{selectedDriver.name}</p>
            <p className="text-sm text-gray-600">{selectedDriver.email}</p>
            <button onClick={() => setSelectedDriver(null)} className="text-sm text-cyan-600 hover:underline mt-1">Change driver</button>
          </div>
        )}
      </div>

      {submitStatus?.error && <div className="rounded-md bg-red-50 p-4"><p className="text-sm text-red-700">{submitStatus.error}</p></div>}
      {submitStatus?.success && <div className="rounded-md bg-green-50 p-4"><p className="text-sm text-green-700">{submitStatus.success}</p></div>}


      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className={inputStyles} step="0.01" min="0" required />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <div className="mt-2 flex gap-4">
            <label><input type="radio" name="type" value="CREDIT" checked={type === 'CREDIT'} onChange={() => setType('CREDIT')} /> Credit (Add to balance)</label>
            <label><input type="radio" name="type" value="DEBIT" checked={type === 'DEBIT'} onChange={() => setType('DEBIT')} /> Debit (Subtract from balance)</label>
          </div>
        </div>
        <div className="sm:col-span-6">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
          <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={3} className={inputStyles} required />
        </div>
      </div>

      <div className="flex justify-end pt-5 border-t border-gray-200">
        <button type="submit" disabled={!selectedDriver || isSubmitting} className="rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50">
          {isSubmitting ? 'Creating...' : 'Create Adjustment'}
        </button>
      </div>
    </form>
  );
}