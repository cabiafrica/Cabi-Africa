import React, { useState, useEffect, useCallback } from 'react';

const DISPATCH_API_BASE =
  import.meta.env.VITE_DISPATCH_API_URL || 'http://localhost:3334/api';

const SETTING_KEY = 'tours_url';

async function fetchToursUrl(): Promise<string> {
  const res = await fetch(`${DISPATCH_API_BASE}/settings/system/${SETTING_KEY}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to load setting: ${res.status}`);
  const data = await res.json();
  // Backend returns { key: '...', value: '...' }
  return typeof data.value === 'string' ? data.value : '';
}

async function saveToursUrl(url: string): Promise<void> {
  const res = await fetch(`${DISPATCH_API_BASE}/settings/system/${SETTING_KEY}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: url }),
  });
  if (!res.ok) throw new Error(`Failed to save setting: ${res.status}`);
}

export function AppSettingsManagement() {
  const [toursUrl, setToursUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = await fetchToursUrl();
      setToursUrl(url);
      setSavedUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await saveToursUrl(toursUrl);
      setSavedUrl(toursUrl);
      setSuccessMsg('Tours URL saved successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = toursUrl !== savedUrl;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">App Settings</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure global settings that appear in the passenger mobile app.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <span className="text-2xl">🌍</span>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">External Tours Button</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The URL passengers are redirected to when they tap <strong>Tours</strong> in the app menu.
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-6 py-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* URL Field */}
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
                  value={toursUrl}
                  onChange={(e) => setToursUrl(e.target.value)}
                  placeholder="https://your-tours-partner.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  Leave empty to disable the Tours button in the passenger app.
                </p>
              </div>

              {/* Preview */}
              {toursUrl && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                  <span>🔗</span>
                  <span className="truncate font-mono">{toursUrl}</span>
                  <a
                    href={toursUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex-shrink-0 text-xs underline hover:no-underline"
                  >
                    Preview ↗
                  </a>
                </div>
              )}

              {/* Feedback Messages */}
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
            </>
          )}
        </div>

        {/* Card Footer / Actions */}
        {!isLoading && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <button
              onClick={loadSettings}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              ↺ Refresh
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isDirty && !isSaving
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSaving && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
