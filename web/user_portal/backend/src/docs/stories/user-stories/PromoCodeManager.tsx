import React, { useState } from 'react';

interface PromoCode {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  expiry: string;
  maxUses: number;
  usedCount: number;
}

export const PromoCodeManager: React.FC = () => {
  const [promos, setPromos] = useState<PromoCode[]>([
    { id: 1, code: 'WELCOME50', type: 'PERCENTAGE', value: 50, expiry: '2024-12-31', maxUses: 1000, usedCount: 450 },
    { id: 2, code: 'RIDE100', type: 'FIXED', value: 100, expiry: '2024-06-30', maxUses: 500, usedCount: 500 },
  ]);

  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    expiry: '',
    maxUses: 100
  });

  const handleCreate = () => {
    const promo: PromoCode = {
      id: Date.now(),
      code: newPromo.code.toUpperCase(),
      type: newPromo.type as 'PERCENTAGE' | 'FIXED',
      value: newPromo.value,
      expiry: newPromo.expiry,
      maxUses: newPromo.maxUses,
      usedCount: 0
    };
    setPromos([...promos, promo]);
    setNewPromo({ code: '', type: 'PERCENTAGE', value: 0, expiry: '', maxUses: 100 });
    alert('Promo code created successfully!');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Promotion Management</h1>

      {/* Create Form */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New Code</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="border p-2 rounded" 
            placeholder="Code (e.g. SAVE20)" 
            value={newPromo.code}
            onChange={e => setNewPromo({...newPromo, code: e.target.value})}
          />
          <select 
            className="border p-2 rounded"
            value={newPromo.type}
            onChange={e => setNewPromo({...newPromo, type: e.target.value})}
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (KES)</option>
          </select>
          <input 
            type="number" 
            className="border p-2 rounded" 
            placeholder="Value" 
            value={newPromo.value}
            onChange={e => setNewPromo({...newPromo, value: parseInt(e.target.value)})}
          />
          <input 
            type="date" 
            className="border p-2 rounded" 
            value={newPromo.expiry}
            onChange={e => setNewPromo({...newPromo, expiry: e.target.value})}
          />
          <input 
            type="number" 
            className="border p-2 rounded" 
            placeholder="Max Uses" 
            value={newPromo.maxUses}
            onChange={e => setNewPromo({...newPromo, maxUses: parseInt(e.target.value)})}
          />
        </div>
        <button onClick={handleCreate} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Promotion
        </button>
      </div>

      {/* List */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promos.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 font-bold text-gray-900">{p.code}</td>
                <td className="px-6 py-4">{p.type === 'PERCENTAGE' ? `${p.value}%` : `KES ${p.value}`}</td>
                <td className="px-6 py-4">{p.usedCount} / {p.maxUses}</td>
                <td className="px-6 py-4 text-gray-500">{p.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};