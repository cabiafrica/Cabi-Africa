import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { dispatchFetch } from '../../services/dispatchApiClient';
import {
  Compass,
  Clock,
  Shield,
  Ban,
  Settings,
  Globe,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Radio,
  Percent,
  TrendingUp,
  PhoneCall,
  Smartphone,
  ExternalLink,
  MessageSquare,
  Lock,
} from 'lucide-react';

interface SettingField {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'url' | 'select';
  tab: 'dispatch' | 'pricing' | 'cancellation' | 'safety' | 'platform';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

const SETTING_DEFINITIONS: SettingField[] = [
  // ─── Tab 1: Dispatch & Search Matching ─────────────────────────────────────
  {
    key: 'DISPATCH_SEARCH_RADIUS_KM',
    label: 'Driver Search Radius',
    description: 'Initial radial distance to query available drivers in real-time.',
    type: 'number',
    tab: 'dispatch',
    unit: 'km',
    min: 1,
    max: 20,
    step: 0.5,
    placeholder: '3.5',
  },
  {
    key: 'DISPATCH_OFFER_TIMEOUT_SEC',
    label: 'Driver Offer Acceptance Timer',
    description: 'Countdown time drivers have to accept a ride offer before it cascades to the next driver.',
    type: 'number',
    tab: 'dispatch',
    unit: 'seconds',
    min: 10,
    max: 60,
    step: 1,
    placeholder: '20',
  },
  {
    key: 'DISPATCH_MAX_REASSIGNS',
    label: 'Maximum Cascade Attempts',
    description: 'Maximum number of drivers to offer the ride to before notifying passenger no driver is available.',
    type: 'number',
    tab: 'dispatch',
    unit: 'drivers',
    min: 1,
    max: 10,
    step: 1,
    placeholder: '3',
  },
  {
    key: 'RIDE_VERIFICATION_ENABLED',
    label: 'Strict Passenger Verification Gate',
    description: 'Require passengers to pass phone/identity verification before booking. When disabled, guests can request rides.',
    type: 'boolean',
    tab: 'dispatch',
  },

  // ─── Tab 2: Pricing, Wait Fees & Caps ───────────────────────────────────────
  {
    key: 'WAIT_TIME_GRACE_PERIOD_MIN',
    label: 'Wait Time Free Grace Period',
    description: 'Number of minutes a driver waits at the pickup spot for free before wait fees begin accruing.',
    type: 'number',
    tab: 'pricing',
    unit: 'minutes',
    min: 0,
    max: 15,
    step: 1,
    placeholder: '3',
  },
  {
    key: 'WAIT_TIME_FEE_PER_MIN_KES',
    label: 'Wait Time Fee Rate',
    description: 'Fee per minute charged to the passenger after the grace period ends.',
    type: 'number',
    tab: 'pricing',
    unit: 'KES / min',
    min: 0,
    max: 100,
    step: 0.5,
    placeholder: '10',
  },
  {
    key: 'PLATFORM_COMMISSION_PERCENT',
    label: 'Default Platform Commission Rate',
    description: 'Global commission percentage retained by the platform from completed trips.',
    type: 'number',
    tab: 'pricing',
    unit: '%',
    min: 0,
    max: 50,
    step: 0.5,
    placeholder: '15',
  },
  {
    key: 'MAX_SURGE_MULTIPLIER',
    label: 'Maximum Dynamic Surge Cap',
    description: 'Absolute upper limit multiplier dynamic surge pricing can reach, preventing predatory pricing during emergencies.',
    type: 'number',
    tab: 'pricing',
    unit: 'x',
    min: 1.0,
    max: 5.0,
    step: 0.1,
    placeholder: '2.5',
  },
  {
    key: 'MINIMUM_FARE_THRESHOLD_KES',
    label: 'Minimum Trip Fare Floor',
    description: 'Lowest possible fare for any standard trip regardless of calculated distance.',
    type: 'number',
    tab: 'pricing',
    unit: 'KES',
    min: 50,
    max: 500,
    step: 10,
    placeholder: '100',
  },

  // ─── Tab 3: Cancellation & Penalties ────────────────────────────────────────
  {
    key: 'PASSENGER_CANCEL_GRACE_MIN',
    label: 'Passenger Free Cancellation Window',
    description: 'Minutes after ride acceptance during which a passenger can cancel without penalty.',
    type: 'number',
    tab: 'cancellation',
    unit: 'minutes',
    min: 1,
    max: 10,
    step: 1,
    placeholder: '2',
  },
  {
    key: 'PASSENGER_CANCEL_FEE_KES',
    label: 'Passenger Late Cancellation Fee',
    description: 'Fee billed to passenger for cancelling after the free grace window has elapsed.',
    type: 'number',
    tab: 'cancellation',
    unit: 'KES',
    min: 0,
    max: 1000,
    step: 25,
    placeholder: '150',
  },
  {
    key: 'DRIVER_CANCEL_PENALTY_KES',
    label: 'Driver Unwarranted Cancellation Penalty',
    description: 'Deduction applied to driver ledger for cancelling an accepted ride without legitimate cause.',
    type: 'number',
    tab: 'cancellation',
    unit: 'KES',
    min: 0,
    max: 1000,
    step: 25,
    placeholder: '200',
  },

  // ─── Tab 4: Safety & Emergency Hotlines ─────────────────────────────────────
  {
    key: 'SOS_POLICE_HOTLINE',
    label: 'National Emergency / Police Hotline',
    description: 'Direct dispatch telephone number called during critical SOS events.',
    type: 'text',
    tab: 'safety',
    placeholder: '999',
  },
  {
    key: 'CABI_SAFETY_CONTROL_PHONE',
    label: 'Cabi 24/7 Security Control Desk',
    description: 'Direct phone number for Cabi rapid response safety incident controllers.',
    type: 'text',
    tab: 'safety',
    placeholder: '+254 700 000 000',
  },
  {
    key: 'CABI_SAFETY_WHATSAPP',
    label: 'Incident Support WhatsApp Desk',
    description: 'WhatsApp number or link for priority driver and passenger emergency communication.',
    type: 'text',
    tab: 'safety',
    placeholder: '+254 700 000 001',
  },
  {
    key: 'SOS_AUTO_AUDIO_RECORD_ENABLED',
    label: 'Auto-Record In-Cabin Audio on SOS',
    description: 'When enabled, the driver and passenger apps automatically begin an encrypted safety audio log upon SOS panic activation.',
    type: 'boolean',
    tab: 'safety',
  },

  // ─── Tab 5: Platform & Versioning ──────────────────────────────────────────
  {
    key: 'PLATFORM_MAINTENANCE_MODE',
    label: 'Maintenance Mode (Kill Switch)',
    description: 'Temporarily pause new trip bookings across the platform. Existing active rides will be allowed to complete.',
    type: 'boolean',
    tab: 'platform',
  },
  {
    key: 'PLATFORM_MAINTENANCE_MESSAGE',
    label: 'Maintenance Notice Banner',
    description: 'Custom advisory displayed to passengers and drivers while maintenance mode is active.',
    type: 'text',
    tab: 'platform',
    placeholder: 'System is undergoing scheduled optimization. Services will resume shortly.',
  },
  {
    key: 'MIN_SUPPORTED_APP_VERSION',
    label: 'Minimum Supported App Version',
    description: 'Forces users on legacy mobile versions below this build to update before accessing the platform.',
    type: 'text',
    tab: 'platform',
    placeholder: '1.1.0',
  },
  {
    key: 'DEFAULT_CURRENCY_CODE',
    label: 'Primary Operating Currency',
    description: 'Base platform currency code for financial ledgers and receipt generation.',
    type: 'select',
    tab: 'platform',
    options: [
      { label: 'Kenyan Shilling (KES)', value: 'KES' },
      { label: 'Ugandan Shilling (UGX)', value: 'UGX' },
      { label: 'Tanzanian Shilling (TZS)', value: 'TZS' },
      { label: 'US Dollar (USD)', value: 'USD' },
    ],
  },
  {
    key: 'tours_url',
    label: 'External Tours Partner URL',
    description: 'External portal destination opened when passengers select Tours in the navigation menu.',
    type: 'url',
    tab: 'platform',
    placeholder: 'https://partners.cabi.africa/tours',
  },
  {
    key: 'PASSENGER_LEGACY_IMPACT_MESSAGE',
    label: 'Passenger Cabi Legacy Impact Message',
    description: 'The social impact message displayed to passengers on post-trip receipts and rating screens.',
    type: 'text',
    tab: 'platform',
    placeholder: '🌱 Cabi Legacy Impact: Your trip helped fund this driver\'s Sacco savings and vehicle equity through our ethical reusable commission.',
  },
  {
    key: 'PASSENGER_LEGACY_IMPACT_ENABLED',
    label: 'Enable Passenger Cabi Legacy Impact Badge',
    description: 'Toggle display of the Cabi Legacy social impact card on passenger receipts and rating screens.',
    type: 'boolean',
    tab: 'platform',
  },
];

const DEFAULT_SETTINGS_MAP: Record<string, string> = {
  DISPATCH_SEARCH_RADIUS_KM: '3.5',
  DISPATCH_OFFER_TIMEOUT_SEC: '20',
  DISPATCH_MAX_REASSIGNS: '3',
  RIDE_VERIFICATION_ENABLED: 'false',
  WAIT_TIME_GRACE_PERIOD_MIN: '3',
  WAIT_TIME_FEE_PER_MIN_KES: '10',
  PLATFORM_COMMISSION_PERCENT: '15',
  MAX_SURGE_MULTIPLIER: '2.5',
  MINIMUM_FARE_THRESHOLD_KES: '100',
  PASSENGER_CANCEL_GRACE_MIN: '2',
  PASSENGER_CANCEL_FEE_KES: '150',
  DRIVER_CANCEL_PENALTY_KES: '200',
  SOS_POLICE_HOTLINE: '999',
  CABI_SAFETY_CONTROL_PHONE: '+254 700 000 000',
  CABI_SAFETY_WHATSAPP: '+254 700 000 001',
  SOS_AUTO_AUDIO_RECORD_ENABLED: 'true',
  PLATFORM_MAINTENANCE_MODE: 'false',
  PLATFORM_MAINTENANCE_MESSAGE: 'System is undergoing scheduled optimization. Services will resume shortly.',
  MIN_SUPPORTED_APP_VERSION: '1.1.0',
  DEFAULT_CURRENCY_CODE: 'KES',
  tours_url: '',
  PASSENGER_LEGACY_IMPACT_MESSAGE: '🌱 Cabi Legacy Impact: Your trip helped fund this driver\'s Sacco savings and vehicle equity through our ethical reusable commission.',
  PASSENGER_LEGACY_IMPACT_ENABLED: 'true',
};

type TabType = 'dispatch' | 'pricing' | 'cancellation' | 'safety' | 'platform';

export function AppSettingsManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('dispatch');
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS_MAP);
  const [savedSettings, setSavedSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS_MAP);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load all system settings and sync with wait-time-config
  const loadAllSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const mergedSettings: Record<string, string> = { ...DEFAULT_SETTINGS_MAP };

    try {
      // 1. Try fetching all system settings in batch
      try {
        const res = await dispatchFetch('/settings/system');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            list.forEach((item: { key: string; value: any }) => {
              if (item?.key) {
                mergedSettings[item.key] = typeof item.value === 'string' ? item.value : String(item.value);
              }
            });
          }
        }
      } catch (e) {
        console.warn('Batch /settings/system not available, falling back to individual fetches', e);
      }

      // 2. Fetch specific critical keys if not in batch
      const individualKeys = ['tours_url', 'RIDE_VERIFICATION_ENABLED'];
      await Promise.allSettled(
        individualKeys.map(async (key) => {
          try {
            const res = await dispatchFetch(`/settings/system/${key}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.value !== undefined && data.value !== null) {
                mergedSettings[key] = typeof data.value === 'string' ? data.value : String(data.value);
              }
            }
          } catch {
            // Silently fallback to default
          }
        })
      );

      // 3. Load wait-time config from dedicated ride controller
      try {
        const waitRes = await dispatchFetch('/rides/admin/wait-time-config');
        if (waitRes.ok) {
          const waitData = await waitRes.json();
          if (waitData?.feePerMinute !== undefined) {
            mergedSettings['WAIT_TIME_FEE_PER_MIN_KES'] = String(waitData.feePerMinute);
          }
          if (waitData?.gracePeriodMinutes !== undefined) {
            mergedSettings['WAIT_TIME_GRACE_PERIOD_MIN'] = String(waitData.gracePeriodMinutes);
          }
        }
      } catch {
        // Keep defaults if wait-time config is not yet initialized
      }

      setSettings(mergedSettings);
      setSavedSettings(mergedSettings);
    } catch (err: any) {
      setError(err.message || 'Failed to load system settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  // Compute modified fields
  const dirtyKeys = useMemo(() => {
    return Object.keys(settings).filter((k) => settings[k] !== savedSettings[k]);
  }, [settings, savedSettings]);

  const isDirty = dirtyKeys.length > 0;

  const handleFieldChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Save modified system settings
      for (const key of dirtyKeys) {
        const value = settings[key];
        const res = await dispatchFetch(`/settings/system/${key}`, {
          method: 'PUT',
          body: JSON.stringify({ value }),
        });
        if (!res.ok) {
          throw new Error(`Failed to save ${key}: status ${res.status}`);
        }
      }

      // 2. If wait-time settings were changed, also sync with ride controller
      if (
        dirtyKeys.includes('WAIT_TIME_FEE_PER_MIN_KES') ||
        dirtyKeys.includes('WAIT_TIME_GRACE_PERIOD_MIN')
      ) {
        try {
          await dispatchFetch('/rides/admin/wait-time-config', {
            method: 'PUT',
            body: JSON.stringify({
              feePerMinute: Number(settings['WAIT_TIME_FEE_PER_MIN_KES'] || 10),
              gracePeriodMinutes: Number(settings['WAIT_TIME_GRACE_PERIOD_MIN'] || 3),
            }),
          });
        } catch (e) {
          console.warn('Wait-time config sync error:', e);
        }
      }

      setSavedSettings(settings);
      setSuccessMsg(`Successfully saved ${dirtyKeys.length} updated setting${dirtyKeys.length === 1 ? '' : 's'}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving configurations.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentTabFields = useMemo(() => {
    return SETTING_DEFINITIONS.filter((f) => f.tab === activeTab);
  }, [activeTab]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-amber-500" />
            Global Platform Settings & Configurations
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Control real-time dispatch parameters, safety safeguards, fee formulas, and operational policies.
          </p>
        </div>

        {/* Global Save Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadAllSettings}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
            title="Reload settings from database"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isDirty && !isSaving
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving…' : isDirty ? `Save (${dirtyKeys.length}) Changes` : 'All Saved'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-700 dark:text-red-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'dispatch'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Dispatch & Search</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Pricing & Wait Fees</span>
        </button>

        <button
          onClick={() => setActiveTab('cancellation')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'cancellation'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Ban className="w-4 h-4" />
          <span>Cancellations</span>
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'safety'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Safety & SOS</span>
        </button>

        <button
          onClick={() => setActiveTab('platform')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'platform'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Platform & Versioning</span>
        </button>
      </div>

      {/* Settings Grid Panel */}
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-6 md:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-slate-400">Loading configurations…</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info banner for the active tab */}
            {activeTab === 'dispatch' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/5 flex items-start gap-3">
                <Radio className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Dispatch Engine Control:</strong> Changes here adjust Redis geo-spatial lookup radius and matching queues in the <code>dispatch-service</code> microservice.
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/5 flex items-start gap-3">
                <Percent className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Fair Pricing & Wait Safeguards:</strong> Wait time fees apply automatically to passenger ledgers after the driver arrives and the free grace interval expires.
                </div>
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 flex items-start gap-3">
                <PhoneCall className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Emergency Response Routing:</strong> These contacts are dialled immediately when a passenger or driver activates the physical SOS panic action in either app.
                </div>
              </div>
            )}

            {activeTab === 'platform' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/5 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">System Lifecycle & App Guard:</strong> Maintenance mode safely disables dispatching while notifying riders. Minimum App Version enforces Flutter client updates.
                </div>
              </div>
            )}

            {/* Field list */}
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {currentTabFields.map((field) => {
                const currentValue = settings[field.key] ?? DEFAULT_SETTINGS_MAP[field.key] ?? '';
                const isModified = currentValue !== savedSettings[field.key];

                return (
                  <div
                    key={field.key}
                    className={`py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                      isModified ? 'bg-amber-500/5 -mx-4 px-4 rounded-xl' : ''
                    }`}
                  >
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-slate-900 dark:text-white">
                          {field.label}
                        </label>
                        {isModified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                            Modified
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {field.description}
                      </p>
                      <code className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {field.key}
                      </code>
                    </div>

                    <div className="w-full md:w-72 flex-shrink-0">
                      {field.type === 'boolean' ? (
                        <div className="flex items-center justify-end">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={currentValue === 'true'}
                              onChange={(e) =>
                                handleFieldChange(field.key, e.target.checked ? 'true' : 'false')
                              }
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                          </label>
                        </div>
                      ) : field.type === 'select' ? (
                        <select
                          value={currentValue}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="relative">
                          <input
                            type={field.type}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            placeholder={field.placeholder}
                            value={currentValue}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className="w-full px-3.5 py-2 pr-12 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                          />
                          {field.unit && (
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                              {field.unit}
                            </span>
                          )}
                          {field.type === 'url' && currentValue && (
                            <a
                              href={currentValue}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-3 top-2.5 text-amber-500 hover:text-amber-400"
                              title="Preview link in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Bar when dirty */}
      {isDirty && (
        <div className="sticky bottom-6 z-40 bg-slate-900/95 dark:bg-surface-dark/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-medium">
              You have <strong>{dirtyKeys.length}</strong> unsaved configuration change{dirtyKeys.length === 1 ? '' : 's'}.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSettings(savedSettings)}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md transition-all active:scale-95"
            >
              {isSaving && <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />}
              <span>{isSaving ? 'Saving…' : 'Save Changes Now'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppSettingsManagement;
