import React, { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
}

interface PenaltyConfig {
  type: 'FEE' | 'REVOKE_BADGE';
  feeAmount?: number;
  badgeId?: string;
}

export const SosPenaltyConfig: React.FC = () => {
  const [config, setConfig] = useState<PenaltyConfig>({
    type: 'FEE',
    feeAmount: 500,
  });
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    // Mock fetch current config
    // setConfig({ type: 'FEE', feeAmount: 1000 });

    // Mock fetch available badges (from Story 4.4)
    setBadges([
      { id: 'b1', name: 'Promo Qualified' },
      { id: 'b2', name: 'Super Driver' },
      { id: 'b3', name: 'Safe Driver' },
    ]);
  }, []);

  const handleSave = () => {
    if (config.type === 'FEE' && (config.feeAmount === undefined || config.feeAmount <= 0)) {
      alert('Please enter a valid fee amount.');
      return;
    }
    if (config.type === 'REVOKE_BADGE' && !config.badgeId) {
      alert('Please select a badge to revoke.');
      return;
    }

    console.log('Saving SOS Penalty Config:', config);
    // API Call: PUT /admin/config/sos-penalty
    alert('Configuration saved successfully.');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SOS Misuse Penalty Configuration</h1>

      <div className="bg-white shadow rounded p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Penalty Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="penaltyType"
                checked={config.type === 'FEE'}
                onChange={() => setConfig({ ...config, type: 'FEE' })}
              />
              <span>Monetary Fee</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="penaltyType"
                checked={config.type === 'REVOKE_BADGE'}
                onChange={() => setConfig({ ...config, type: 'REVOKE_BADGE' })}
              />
              <span>Revoke Badge</span>
            </label>
          </div>
        </div>

        {config.type === 'FEE' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">Fee Amount (KES)</label>
            <input
              type="number"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={config.feeAmount || ''}
              onChange={(e) => setConfig({ ...config, feeAmount: parseFloat(e.target.value) })}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Badge to Revoke</label>
            <select
              className="mt-1 block w-full border rounded px-3 py-2"
              value={config.badgeId || ''}
              onChange={(e) => setConfig({ ...config, badgeId: e.target.value })}
            >
              <option value="">-- Select Badge --</option>
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Drivers found misusing the SOS feature will lose this badge and its associated benefits.
            </p>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Save Penalty Rule
          </button>
        </div>
      </div>
    </div>
  );
};