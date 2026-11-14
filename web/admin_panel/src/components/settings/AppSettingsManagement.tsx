import React, { useState, useEffect, useCallback } from 'react';

const DISPATCH_API_BASE =
  import.meta.env.VITE_DISPATCH_API_URL || 'http://localhost:3334/api';

async function fetchSetting(key: string): Promise<string> {
  const res = await fetch(`${DISPATCH_API_BASE}/settings/system/${key}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 404) return ''; // Return empty string if setting not found
    throw new Error(`Failed to load setting ${key}: ${res.status}`);
  }
  const data = await res.json();
  return typeof data.value === 'string' ? data.value : '';
}

async function saveSetting(key: string, value: string): Promise<void> {
  const res = await fetch(`${DISPATCH_API_BASE}/settings/system/${key}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(`Failed to save setting ${key}: ${res.status}`);
}

export function AppSettingsManagement() {
  const [settings, setSettings] = useState({
    tours_url: '',
    RIDE_VERIFICATION_ENABLED: 'false',
  });
  const [savedSettings, setSavedSettings] = useState({
    tours_url: '',
    RIDE_VERIFICATION_ENABLED: 'false',
  });

  // Wait Time Fee configuration
  const [waitConfig, setWaitConfig] = useState({ feePerMinute: 10, gracePeriodMinutes: 3 });
  const [savedWaitConfig, setSavedWaitConfig] = useState({ feePerMinute: 10, gracePeriodMinutes: 3 });
  const [waitConfigLoading, setWaitConfigLoading] = useState(true);
  const [waitConfigSaving, setWaitConfigSaving] = useState(false);
  const [waitConfigMsg, setWaitConfigMsg] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadWaitConfig = useCallback(async () => {
    setWaitConfigLoading(true);
    try {
      const res = await fetch(`${DISPATCH_API_BASE}/rides/admin/wait-time-config`);
      if (res.ok) {
        const data = await res.json();
        setWaitConfig({ feePerMinute: data.feePerMinute ?? 10, gracePeriodMinutes: data.gracePeriodMinutes ?? 3 });
        setSavedWaitConfig({ feePerMinute: data.feePerMinute ?? 10, gracePeriodMinutes: data.gracePeriodMinutes ?? 3 });
      }
    } catch { /* silent */ } finally {
      setWaitConfigLoading(false);
    }
  }, []);

  const handleSaveWaitConfig = async () => {
    setWaitConfigSaving(true);
    setWaitConfigMsg(null);
    try {
      const res = await fetch(`${DISPATCH_API_BASE}/rides/admin/wait-time-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waitConfig),
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setSavedWaitConfig(waitConfig);
      setWaitConfigMsg('✅ Wait fee config saved!');
      setTimeout(() => setWaitConfigMsg(null), 4000);
    } catch (err: any) {
      setWaitConfigMsg(`⚠️ ${err.message}`);
    } finally {
      setWaitConfigSaving(false);
    }
  };

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [toursUrl, rideVerification] = await Promise.all([
        fetchSetting('tours_url'),
        fetchSetting('RIDE_VERIFICATION_ENABLED'),
      ]);
      const newSettings = {
        tours_url: toursUrl,
        RIDE_VERIFICATION_ENABLED: rideVerification || 'false',
      };
      setSettings(newSettings);
      setSavedSettings(newSettings);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadWaitConfig();
  }, [loadSettings, loadWaitConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      if (settings.tours_url !== savedSettings.tours_url) {
        await saveSetting('tours_url', settings.tours_url);
      }
      if (settings.RIDE_VERIFICATION_ENABLED !== savedSettings.RIDE_VERIFICATION_ENABLED) {
        await saveSetting('RIDE_VERIFICATION_ENABLED', settings.RIDE_VERIFICATION_ENABLED);
      }
      setSavedSettings(settings);
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const isWaitDirty =
    waitConfig.feePerMinute !== savedWaitConfig.feePerMinute ||
    waitConfig.gracePeriodMinutes !== savedWaitConfig.gracePeriodMinutes;

  const isDirty = 
    settings.tours_url !== savedSettings.tours_url || 
    settings.RIDE_VERIFICATION_ENABLED !== savedSettings.RIDE_VERIFICATION_ENABLED;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">App Settings</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure global system settings for the entire platform.
        </p>
      </div>

      <div className="space-y-6">
        {/* Ride Verification Settings Card */}
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Ride Verification Gate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Controls whether passengers must complete OTP/Face verification before booking a ride.
              </p>
            </div>
          </div>
          
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">Enable Security Verification</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                    If turned off, users can book rides as "guests" without verification. Turn on for strict passenger identification.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.RIDE_VERIFICATION_ENABLED === 'true'}
                    onChange={(e) => setSettings({ ...settings, RIDE_VERIFICATION_ENABLED: e.target.checked ? 'true' : 'false' })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-600"></div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Tours URL Settings Card */}
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">External Tours Button</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                The URL passengers are redirected to when they tap <strong>Tours</strong> in the app menu.
              </p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="tours-url"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Tours Website URL
                  </label>
                  <input
                    id="tours-url"
                    type="url"
                    value={settings.tours_url}
                    onChange={(e) => setSettings({ ...settings, tours_url: e.target.value })}
                    placeholder="https://your-tours-partner.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    Leave empty to disable the Tours button in the passenger app.
                  </p>
                </div>

                {settings.tours_url && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                    <span>🔗</span>
                    <span className="truncate font-mono">{settings.tours_url}</span>
                    <a
                      href={settings.tours_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex-shrink-0 text-xs underline hover:no-underline"
                    >
                      Preview ↗
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Wait Time Fee Configuration Card */}
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Wait Time Fee</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure the grace period and fee charged to passengers who keep the driver waiting.
              </p>
            </div>
          </div>
          <div className="px-6 py-6 space-y-5">
            {waitConfigLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Grace Period (minutes)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={waitConfig.gracePeriodMinutes}
                      onChange={(e) => setWaitConfig({ ...waitConfig, gracePeriodMinutes: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Free waiting before fee applies</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Fee per Minute (KES)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={waitConfig.feePerMinute}
                      onChange={(e) => setWaitConfig({ ...waitConfig, feePerMinute: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Charged after grace period ends</p>
                  </div>
                </div>
                <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                  📋 Policy: Passengers get <strong>{waitConfig.gracePeriodMinutes} min</strong> free wait. After that, <strong>KES {waitConfig.feePerMinute}/min</strong> is added as a pending fee on their next ride. Drivers are compensated from the system wallet.
                </div>
                {waitConfigMsg && (
                  <div className={`text-sm ${waitConfigMsg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{waitConfigMsg}</div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveWaitConfig}
                    disabled={waitConfigSaving || !isWaitDirty}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isWaitDirty && !waitConfigSaving
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {waitConfigSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {waitConfigSaving ? 'Saving…' : 'Save Wait Fee Config'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Global Feedback and Save Actions */}
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                ⚠️ {error}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
                ✅ {successMsg}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button
                onClick={loadSettings}
                disabled={isLoading || isSaving}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                ↺ Refresh Settings
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isDirty && !isSaving
                    ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-sm hover:shadow-md'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isSaving ? 'Saving…' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
