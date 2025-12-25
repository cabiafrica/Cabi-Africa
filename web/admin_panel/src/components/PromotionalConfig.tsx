import React, { useState, useEffect } from 'react';

interface PromoConfig {
  isActive: boolean;
  startDate: string;
  endDate: string;
  splits: {
    system: number;
    driver: number;
    upline1: number;
    upline2: number;
  };
  requiredBadgeId: string;
}

interface Badge {
  id: string;
  name: string;
}

export const PromotionalConfig: React.FC = () => {
  const [config, setConfig] = useState<PromoConfig>({
    isActive: false,
    startDate: '',
    endDate: '',
    splits: { system: 0, driver: 0, upline1: 0, upline2: 0 },
    requiredBadgeId: '',
  });
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    // Mock fetch config
    setConfig({
      isActive: true,
      startDate: '2024-06-01T00:00',
      endDate: '2024-06-30T23:59',
      splits: { system: 10, driver: 80, upline1: 5, upline2: 5 },
      requiredBadgeId: 'b1',
    });
    // Mock fetch badges
    setBadges([
      { id: 'b1', name: 'Promo Qualified' },
      { id: 'b2', name: 'Super Driver' },
    ]);
  }, []);

  const validateSplits = () => {
    const total =
      config.splits.system +
      config.splits.driver +
      config.splits.upline1 +
      config.splits.upline2;
    return total === 100;
  };

  const handleSave = () => {
    if (!validateSplits()) {
      alert('Fare splits must sum to exactly 100%');
      return;
    }
    console.log('Saving promo config:', config);
    // API Call: PUT /admin/config/promotions
    alert('Promotional configuration saved.');
  };

  const updateSplit = (key: keyof typeof config.splits, value: string) => {
    const numVal = parseFloat(value) || 0;
    setConfig((prev) => ({
      ...prev,
      splits: { ...prev.splits, [key]: numVal },
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Promotional Campaigns</h1>

      <div className="bg-white shadow rounded p-6 space-y-6">
        {/* Activation & Scheduling */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">Campaign Status</h2>
            <p className="text-sm text-gray-500">Enable or disable the current promotion.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={config.isActive}
              onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="datetime-local"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={config.startDate}
              onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="datetime-local"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={config.endDate}
              onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Fare Splits */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Promotional Fare Splits (%)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(config.splits).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 capitalize">{key}</label>
                <input
                  type="number"
                  className="mt-1 block w-full border rounded px-3 py-2"
                  value={config.splits[key as keyof typeof config.splits]}
                  onChange={(e) => updateSplit(key as any, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Qualification */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Earning Qualification</h2>
          <label className="block text-sm font-medium text-gray-700">Required Badge for Upline</label>
          <select
            className="mt-1 block w-full border rounded px-3 py-2"
            value={config.requiredBadgeId}
            onChange={(e) => setConfig({ ...config, requiredBadgeId: e.target.value })}
          >
            <option value="">-- Select Badge --</option>
            {badges.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Save Campaign
          </button>
        </div>
      </div>
    </div>
  );
};