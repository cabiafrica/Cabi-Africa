import React, { useState, useEffect, useCallback } from 'react';
import { dispatchFetch } from '../../services/dispatchApiClient';

interface WelfareScheme {
  id: string;
  name: string;
  type: 'PENSION' | 'HOUSING';
  deductionMode: 'PER_TRIP' | 'PER_DAY';
  amount: number;
  minAmount: number | null;
  maxAmount: number | null;
  description: string | null;
  providerName: string | null;
  providerAccount: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { enrollments: number };
}

interface SchemeFormData {
  name: string;
  type: 'PENSION' | 'HOUSING';
  deductionMode: 'PER_TRIP' | 'PER_DAY';
  amount: string;
  minAmount: string;
  maxAmount: string;
  description: string;
  providerName: string;
  providerAccount: string;
}

const INITIAL_FORM: SchemeFormData = {
  name: '',
  type: 'PENSION',
  deductionMode: 'PER_TRIP',
  amount: '',
  minAmount: '',
  maxAmount: '',
  description: '',
  providerName: '',
  providerAccount: '',
};

export function WelfareSchemeManagement() {
  const [schemes, setSchemes] = useState<WelfareScheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState<WelfareScheme | null>(null);
  const [form, setForm] = useState<SchemeFormData>(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Report state
  const [reportSchemeId, setReportSchemeId] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const loadSchemes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dispatchFetch('/welfare/schemes');
      if (!res.ok) throw new Error(`Failed to load schemes: ${res.status}`);
      const data = await res.json();
      setSchemes(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchemes();
  }, [loadSchemes]);

  const openCreateModal = () => {
    setEditingScheme(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEditModal = (scheme: WelfareScheme) => {
    setEditingScheme(scheme);
    setForm({
      name: scheme.name,
      type: scheme.type,
      deductionMode: scheme.deductionMode,
      amount: String(scheme.amount),
      minAmount: scheme.minAmount ? String(scheme.minAmount) : '',
      maxAmount: scheme.maxAmount ? String(scheme.maxAmount) : '',
      description: scheme.description || '',
      providerName: scheme.providerName || '',
      providerAccount: scheme.providerAccount || '',
    });
    setShowModal(true);
  };

  const handleTypeChange = (type: 'PENSION' | 'HOUSING') => {
    setForm({
      ...form,
      type,
      deductionMode: type === 'PENSION' ? 'PER_TRIP' : 'PER_DAY',
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        deductionMode: form.deductionMode,
        amount: parseFloat(form.amount),
        minAmount: form.minAmount ? parseFloat(form.minAmount) : undefined,
        maxAmount: form.maxAmount ? parseFloat(form.maxAmount) : undefined,
        description: form.description || undefined,
        providerName: form.providerName || undefined,
        providerAccount: form.providerAccount || undefined,
      };

      const url = editingScheme
        ? `/welfare/schemes/${editingScheme.id}`
        : `/welfare/schemes`;

      const res = await dispatchFetch(url, {
        method: editingScheme ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to save scheme: ${res.status}`);

      setSuccessMsg(editingScheme ? 'Scheme updated!' : 'Scheme created!');
      setTimeout(() => setSuccessMsg(null), 4000);
      setShowModal(false);
      loadSchemes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (scheme: WelfareScheme) => {
    try {
      const res = await dispatchFetch(`/welfare/schemes/${scheme.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !scheme.isActive }),
      });
      if (!res.ok) throw new Error(`Failed to toggle scheme: ${res.status}`);
      loadSchemes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadReport = async (schemeId: string) => {
    setReportSchemeId(schemeId);
    setIsLoadingReport(true);
    try {
      const res = await dispatchFetch(`/welfare/report/${schemeId}`);
      if (!res.ok) throw new Error(`Failed to load report: ${res.status}`);
      const data = await res.json();
      setReport(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingReport(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welfare Schemes
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure Pension and Housing contribution schemes for drivers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded text-xs font-semibold transition-all shadow-sm shadow-amber-500/20 active:scale-95"
        >
          <span>＋</span> New Scheme
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
          ✅ {successMsg}
        </div>
      )}

      {/* Schemes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-white/10">
          <span className="text-5xl mb-4 block">🏦</span>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            No welfare schemes yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create a Pension or Housing scheme to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              <div className="p-6 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      scheme.type === 'PENSION'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-sky-100 dark:bg-sky-900/30'
                    }`}
                  >
                    {scheme.type === 'PENSION' ? '🏛️' : '🏠'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {scheme.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          scheme.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {scheme.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {scheme.type === 'PENSION' ? 'Pension' : 'Housing'} •{' '}
                      {scheme.deductionMode === 'PER_TRIP'
                        ? `KSH ${scheme.amount} per trip`
                        : `KSH ${scheme.amount}/day (driver adjustable)`}
                    </p>
                    {scheme.description && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {scheme.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                      {scheme.providerName && (
                        <span>📋 Provider: {scheme.providerName}</span>
                      )}
                      <span>
                        👥 {scheme._count?.enrollments ?? 0} enrolled drivers
                      </span>
                      {scheme.type === 'HOUSING' && scheme.minAmount && (
                        <span>
                          📊 Range: KSH {scheme.minAmount} – {scheme.maxAmount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadReport(scheme.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                  >
                    📊 Report
                  </button>
                  <button
                    onClick={() => openEditModal(scheme)}
                    className="px-3 py-1.5 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => toggleActive(scheme)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      scheme.isActive
                        ? 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 text-amber-700 dark:text-amber-400'
                        : 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-700 dark:text-green-400'
                    }`}
                  >
                    {scheme.isActive ? '⏸️ Disable' : '▶️ Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Panel */}
      {reportSchemeId && report && (
        <div className="mt-8 bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {report.scheme?.name} — Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total collected and enrolled drivers
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setReportSchemeId(null);
                setReport(null);
              }}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕ Close
            </button>
          </div>

          {isLoadingReport ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-surface-dark rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    KSH {(report.totalCollected ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                    Total Collected
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-surface-dark rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {report.enrolledDrivers?.length ?? 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                    Enrolled Drivers
                  </div>
                </div>
              </div>

              {report.enrolledDrivers?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Enrolled Drivers
                  </h4>
                  <div className="space-y-2">
                    {report.enrolledDrivers.map((d: any) => (
                      <div
                        key={d.driverProfileId}
                        className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-surface-dark rounded-lg"
                      >
                        <div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {d.driverName}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                            {d.phone}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {d.customAmount && `KSH ${d.customAmount}/day • `}
                          Since {new Date(d.enrolledAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingScheme ? 'Edit Scheme' : 'Create Welfare Scheme'}
              </h3>
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* Scheme Type Toggle */}
              {!editingScheme && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Scheme Type
                  </label>
                  <div className="flex gap-3">
                    {(['PENSION', 'HOUSING'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => handleTypeChange(t)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                          form.type === t
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl">
                          {t === 'PENSION' ? '🏛️' : '🏠'}
                        </span>
                        {t === 'PENSION' ? 'Pension' : 'Housing'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Scheme Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={form.type === 'PENSION' ? 'NSSF Pension Scheme' : 'Cabi Housing Fund'}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {form.type === 'PENSION'
                    ? 'Deduction per trip (KSH)'
                    : 'Default daily amount (KSH)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder={form.type === 'PENSION' ? '10' : '300'}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {form.type === 'PENSION'
                    ? 'Fixed amount deducted from each trip the driver completes.'
                    : 'Drivers can adjust their own daily target within min/max bounds.'}
                </p>
              </div>

              {/* Min/Max for Housing */}
              {form.type === 'HOUSING' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Min daily (KSH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.minAmount}
                      onChange={(e) =>
                        setForm({ ...form, minAmount: e.target.value })
                      }
                      placeholder="100"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Max daily (KSH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.maxAmount}
                      onChange={(e) =>
                        setForm({ ...form, maxAmount: e.target.value })
                      }
                      placeholder="1000"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  placeholder="Voluntary pension contribution deducted per trip..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                />
              </div>

              {/* Provider */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={form.providerName}
                    onChange={(e) =>
                      setForm({ ...form, providerName: e.target.value })
                    }
                    placeholder="NSSF"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Provider Account
                  </label>
                  <input
                    type="text"
                    value={form.providerAccount}
                    onChange={(e) =>
                      setForm({ ...form, providerAccount: e.target.value })
                    }
                    placeholder="ACC-001234"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2.5">
              <button
                onClick={() => setShowModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !form.name || !form.amount}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
                  !isSaving && form.name && form.amount
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-sm shadow-amber-500/20 active:scale-95'
                    : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSaving && (
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                )}
                {isSaving
                  ? 'Saving…'
                  : editingScheme
                  ? 'Update Scheme'
                  : 'Create Scheme'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
