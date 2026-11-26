import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Building2,
  Wifi,
  WifiOff,
  Edit3,
  Save,
  X,
  Plus,
  RefreshCw,
  Users,
  ToggleLeft,
  ToggleRight,
  Download,
  Calculator,
  CheckCircle,
  AlertCircle,
  Link,
  Settings,
  Clock,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SaccoPartner {
  id: string;
  name: string;
  contactEmail: string;
  serviceCategory?: 'Sacco' | 'INSURANCE_HEALTH' | 'INSURANCE_VEHICLE' | 'INVESTMENT_MMF' | 'PENSION' | string;
  apiBaseUrl?: string;
  apiKey?: string;
  connectorType: 'REST_API' | 'WEBHOOK' | 'LEDGER_EXPORT';
  isActive: boolean;
  testMode: boolean;
  logoUrl?: string;
  description?: string;
  website?: string;
  createdAt: string;
}

interface FinancialConfig {
  mandatoryRemittancePct: number;
  cabiCommissionPct: number;
  joiningIncentiveEnabled: boolean;
  joiningIncentivePct: number;
  joiningIncentiveDurationDays: number;
  maxVoluntaryDeductionPct?: number;
  minDriverTakeHomePct?: number;
}


interface SplitPreview {
  fare: number;
  notEnrolled: { driver: number; cabi: number; sacco: number };
  enrolled: { driver: number; cabi: number; sacco: number };
  enrolledWithIncentive: { driver: number; cabi: number; sacco: number };
}

interface EnrolledDriver {
  id: string;
  fullName: string;
  phoneNumber: string;
  saccoEnrolledAt: string;
  totalRemitted: number;
}

// ─── Utility ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json() as Promise<T>;
}

function kes(amount: number) {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin" />
  </div>
);

const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'default';
}) => {
  const styles = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    default: 'bg-white/10 text-gray-300 border-white/20',
  };
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${styles[variant]}`}>
      {children}
    </span>
  );
};

// ─── Tab 1: Connected Partner ──────────────────────────────────────────────────

function PartnerTab() {
  const [partners, setPartners] = useState<SaccoPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<SaccoPartner> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; latencyMs?: number; message?: string } | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<SaccoPartner[]>('/api/sacco/admin/partners');
      setPartners(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setIsNew(true);
    setEditing({
      name: '',
      contactEmail: '',
      connectorType: 'REST_API',
      isActive: false,
      testMode: true,
      apiBaseUrl: '',
      apiKey: '',
      description: '',
      website: '',
    });
    setTestResult(null);
  };

  const openEdit = (p: SaccoPartner) => {
    setIsNew(false);
    setEditing({ ...p });
    setTestResult(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) {
        await apiFetch('/api/sacco/admin/partners', {
          method: 'POST',
          body: JSON.stringify(editing),
        });
      } else {
        await apiFetch(`/api/sacco/admin/partners/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(editing),
        });
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!editing?.id) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await apiFetch<{ ok: boolean; latencyMs: number; message: string }>(
        `/api/sacco/admin/partners/${editing.id}/test-connection`,
        { method: 'POST' },
      );
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ ok: false, message: e.message });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Configure the external Sacco your drivers will remit to. Only one partner can be <span className="text-brand-yellow font-bold">Active</span> at a time.
        </p>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-black font-bold rounded-xl hover:bg-yellow-400 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Partner Cards */}
      {partners.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No Sacco partners configured yet.</p>
          <p className="text-sm mt-1">Click "Add Partner" to connect your first external Sacco.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.map(partner => (
            <div
              key={partner.id}
              className={`p-6 rounded-2xl border transition-all ${
                partner.isActive
                  ? 'border-brand-yellow/40 bg-brand-yellow/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-brand-yellow" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{partner.name}</h3>
                    <p className="text-xs text-gray-400">{partner.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {partner.isActive ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400 font-bold">ACTIVE</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      <span className="text-xs text-gray-500 font-bold">INACTIVE</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Link className="w-3.5 h-3.5" />
                  <span className="truncate">{partner.apiBaseUrl || 'No API URL set'}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={partner.connectorType === 'REST_API' ? 'success' : 'default'}>
                    {partner.connectorType}
                  </Badge>
                  {partner.testMode && <Badge variant="warning">TEST MODE</Badge>}
                </div>
              </div>

              {partner.description && (
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">{partner.description}</p>
              )}

              <button
                onClick={() => openEdit(partner)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm font-bold hover:text-brand-yellow hover:border-brand-yellow/30 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {isNew ? 'Add Sacco Partner' : `Edit: ${editing.name}`}
              </h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sacco Name *</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50"
                  value={editing.name || ''}
                  onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Umoja Sacco"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Email *</label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50"
                  value={editing.contactEmail || ''}
                  onChange={e => setEditing(p => ({ ...p, contactEmail: e.target.value }))}
                  placeholder="sacco@example.co.ke"
                />
              </div>

              {/* Service Category */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Service Category</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50"
                  value={editing.serviceCategory || 'Sacco'}
                  onChange={e => setEditing(p => ({ ...p, serviceCategory: e.target.value }))}
                >
                  <option value="Sacco">Sacco (Savings & Credit Cooperative)</option>
                  <option value="INSURANCE_HEALTH">Health & Medical Insurance</option>
                  <option value="INSURANCE_VEHICLE">Vehicle & PSV Insurance</option>
                  <option value="INVESTMENT_MMF">Investment / Money Market Fund (MMF)</option>
                  <option value="PENSION">Micro-Pension Scheme</option>
                </select>
              </div>

              {/* Connector Type */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Connection Method</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50"
                  value={editing.connectorType || 'REST_API'}
                  onChange={e => setEditing(p => ({ ...p, connectorType: e.target.value as SaccoPartner['connectorType'] }))}
                >
                  <option value="REST_API">REST API (Automatic remittance)</option>
                  <option value="WEBHOOK">Webhook (Push notifications)</option>
                  <option value="LEDGER_EXPORT">Ledger Export (Manual CSV)</option>
                </select>
              </div>

              {/* Opt-Out Notice Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Earnings Opt-Out Notice Period
                </label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50"
                  value={editing.optOutNoticeMonths ?? 1}
                  onChange={e => setEditing(p => ({ ...p, optOutNoticeMonths: parseInt(e.target.value) }))}
                >
                  <option value={1}>1 Month (Next Month Cycle)</option>
                  <option value={3}>3 Months Notice</option>
                  <option value={6}>6 Months Notice</option>
                  <option value={12}>1 Year Notice (12 Months)</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  How long driver deductions continue before ceasing after an opt-out request.
                </p>
              </div>



              {/* API Base URL */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">API Base URL</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 font-mono text-sm"
                  value={editing.apiBaseUrl || ''}
                  onChange={e => setEditing(p => ({ ...p, apiBaseUrl: e.target.value }))}
                  placeholder="https://api.umojasacco.co.ke"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">API Key / Secret</label>
                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 font-mono text-sm"
                  value={editing.apiKey || ''}
                  onChange={e => setEditing(p => ({ ...p, apiKey: e.target.value }))}
                  placeholder="••••••••••••••••"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 resize-none"
                  value={editing.description || ''}
                  onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the Sacco and its benefits..."
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Website</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50"
                  value={editing.website || ''}
                  onChange={e => setEditing(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://umojasacco.co.ke"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer">
                  <span className="text-sm text-gray-300">Set as Active</span>
                  <button
                    onClick={() => setEditing(p => ({ ...p, isActive: !p?.isActive }))}
                    className={`transition-colors ${editing.isActive ? 'text-green-400' : 'text-gray-500'}`}
                  >
                    {editing.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </label>
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer">
                  <span className="text-sm text-gray-300">Test Mode</span>
                  <button
                    onClick={() => setEditing(p => ({ ...p, testMode: !p?.testMode }))}
                    className={`transition-colors ${editing.testMode ? 'text-yellow-400' : 'text-gray-500'}`}
                  >
                    {editing.testMode ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </label>
              </div>

              {/* Test Connection */}
              {!isNew && editing.connectorType === 'REST_API' && (
                <div>
                  <button
                    onClick={handleTestConnection}
                    disabled={testLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white font-bold transition-all disabled:opacity-50"
                  >
                    <Wifi className="w-4 h-4" />
                    {testLoading ? 'Testing...' : 'Test Connection'}
                  </button>
                  {testResult && (
                    <div className={`mt-2 flex items-center gap-2 text-sm ${testResult.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {testResult.ok ? <CheckCircle className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                      {testResult.ok
                        ? `Connected — ${testResult.latencyMs}ms latency`
                        : `Failed: ${testResult.message}`}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-white/10">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border border-white/10 rounded-xl text-gray-400 hover:text-white font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-brand-yellow text-black font-bold rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Partner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Financial Rules ────────────────────────────────────────────────────

function FinancialTab() {
  const [config, setConfig] = useState<FinancialConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculator
  const [fare, setFare] = useState<number>(500);
  const [preview, setPreview] = useState<SplitPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<FinancialConfig>('/api/sacco/config');
        setConfig(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSuccess(false);
    try {
      await apiFetch('/api/sacco/config', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCalculate = async () => {
    setPreviewLoading(true);
    try {
      const data = await apiFetch<SplitPreview>('/api/sacco/split-preview', {
        method: 'POST',
        body: JSON.stringify({ fare }),
      });
      setPreview(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!config) return null;

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />Configuration saved successfully.
        </div>
      )}

      {/* Financial Rules Card */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-5 h-5 text-brand-yellow" />
          <h3 className="font-bold text-white">Trip Revenue Split Rules</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mandatory Rate */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Mandatory Sacco Remittance %
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 text-xl font-bold"
                value={config.mandatoryRemittancePct}
                onChange={e => setConfig(c => c && { ...c, mandatoryRemittancePct: parseFloat(e.target.value) })}
              />
              <span className="text-2xl font-black text-brand-yellow">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Deducted from driver's 82% share when enrolled. Driver receives (82 − {config.mandatoryRemittancePct})% = {(82 - config.mandatoryRemittancePct)}%.
            </p>
          </div>

          {/* Cabi Commission */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Cabi Commission %
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={30}
                step={0.5}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 text-xl font-bold"
                value={config.cabiCommissionPct}
                onChange={e => setConfig(c => c && { ...c, cabiCommissionPct: parseFloat(e.target.value) })}
              />
              <span className="text-2xl font-black text-brand-yellow">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Platform's base commission on every trip.</p>
          </div>
        </div>

        {/* Joining Incentive Section */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-yellow" />
                Joining Incentive
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                When active, Cabi contributes an extra % from its own commission to the Sacco for new enrollees.
                <br/>
                <span className="text-yellow-400">
                  The 3% incentive comes FROM Cabi's {config.cabiCommissionPct}% — the driver always keeps 80%.
                </span>
              </p>
            </div>
            <button
              onClick={() => setConfig(c => c && { ...c, joiningIncentiveEnabled: !c.joiningIncentiveEnabled })}
              className={`transition-colors ${config.joiningIncentiveEnabled ? 'text-green-400' : 'text-gray-500'}`}
            >
              {config.joiningIncentiveEnabled
                ? <ToggleRight className="w-10 h-10" />
                : <ToggleLeft className="w-10 h-10" />}
            </button>
          </div>

          {config.joiningIncentiveEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Incentive % (from Cabi share)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={config.cabiCommissionPct}
                    step={0.5}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 text-xl font-bold"
                    value={config.joiningIncentivePct}
                    onChange={e => setConfig(c => c && { ...c, joiningIncentivePct: parseFloat(e.target.value) })}
                  />
                  <span className="text-2xl font-black text-brand-yellow">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Incentive Duration (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 text-xl font-bold"
                  value={config.joiningIncentiveDurationDays}
                  onChange={e => setConfig(c => c && { ...c, joiningIncentiveDurationDays: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  After {config.joiningIncentiveDurationDays} days from enrollment, incentive stops automatically.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Opt-Out Notice & Exit Lock-In Rules */}
        <div className="border-t border-white/10 pt-6">
          <div className="mb-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-yellow" />
              Driver Opt-Out Notice Period (Earnings Lock-in Duration)
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              Determine how long driver deductions continue before ceasing after an opt-out request is submitted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 border border-white/10 rounded-xl">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Default Opt-Out Duration
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-brand-yellow/50"
                value={config.optOutNoticeMonths ?? 1}
                onChange={e => setConfig(c => c && { ...c, optOutNoticeMonths: parseInt(e.target.value) })}
              >
                <option value={1}>1 Month (Next Month Cycle)</option>
                <option value={3}>3 Months Notice (Quarterly)</option>
                <option value={6}>6 Months Notice (Half-Year)</option>
                <option value={12}>1 Year Notice (12 Months / Annual)</option>
              </select>
            </div>
            <div className="flex flex-col justify-center text-xs text-gray-400">
              <p className="font-semibold text-white mb-1">Impact on Driver Earnings:</p>
              <p>
                When set to <span className="text-brand-yellow font-bold">
                  {config.optOutNoticeMonths === 12 ? '1 Year' : config.optOutNoticeMonths === 6 ? '6 Months' : config.optOutNoticeMonths === 3 ? '3 Months' : '1 Month'}
                </span>, deductions will continue during this active notice window to satisfy policy/fund commitments and cease on the 1st of the effective month.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Box */}

        <div className="p-4 bg-brand-yellow/5 border border-brand-yellow/20 rounded-xl">
          <p className="text-xs font-bold text-brand-yellow uppercase tracking-wider mb-3">Current Split Summary</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Not Enrolled</p>
              <p className="font-bold text-white">Driver 82% · Cabi {config.cabiCommissionPct}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Enrolled</p>
              <p className="font-bold text-white">
                Driver {82 - config.mandatoryRemittancePct}% · Sacco {config.mandatoryRemittancePct}% · Cabi {config.cabiCommissionPct}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Enrolled + Incentive</p>
              <p className="font-bold text-white">
                Driver {82 - config.mandatoryRemittancePct}% · Sacco {config.mandatoryRemittancePct + (config.joiningIncentiveEnabled ? config.joiningIncentivePct : 0)}%
                · Cabi {config.cabiCommissionPct - (config.joiningIncentiveEnabled ? config.joiningIncentivePct : 0)}%
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Live Calculator */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-5 h-5 text-brand-yellow" />
          <h3 className="font-bold text-white">Live Split Calculator</h3>
        </div>
        <p className="text-sm text-gray-400">Enter a trip fare to preview exact KES amounts across all scenarios.</p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-gray-400 font-bold">KES</span>
            <input
              type="number"
              min={0}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 text-xl font-bold"
              value={fare}
              onChange={e => setFare(parseFloat(e.target.value) || 0)}
              placeholder="500"
            />
          </div>
          <button
            onClick={handleCalculate}
            disabled={previewLoading}
            className="flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
          >
            {previewLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
            Calculate
          </button>
        </div>

        {preview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {[
              { label: 'Not Enrolled', data: preview.notEnrolled, color: 'border-gray-500/30' },
              { label: 'Enrolled (no incentive)', data: preview.enrolled, color: 'border-amber-500/30' },
              { label: 'Enrolled + Incentive', data: preview.enrolledWithIncentive, color: 'border-green-500/30' },
            ].map(({ label, data, color }) => (
              <div key={label} className={`p-4 rounded-xl border ${color} bg-white/5`}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Driver</span>
                    <span className="font-bold text-white">{kes(data.driver)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Sacco</span>
                    <span className="font-bold text-brand-yellow">{kes(data.sacco)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                    <span className="text-gray-400">Cabi</span>
                    <span className="font-bold text-white">{kes(data.cabi)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-white/5 pt-2">
                    <span className="text-gray-500">Total</span>
                    <span className="text-gray-400">{kes(data.driver + data.sacco + data.cabi)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab 3: Enrolled Drivers ───────────────────────────────────────────────────

function DriversTab() {
  const [drivers, setDrivers] = useState<EnrolledDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<EnrolledDriver[]>('/api/sacco/enrolled-drivers');
        setDrivers(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = drivers.filter(d =>
    d.fullName.toLowerCase().includes(search.toLowerCase()) ||
    d.phoneNumber.includes(search),
  );

  const exportCsv = () => {
    const rows = [
      ['Name', 'Phone', 'Enrolled Date', 'Total Remitted (KES)'],
      ...filtered.map(d => [
        d.fullName,
        d.phoneNumber,
        new Date(d.saccoEnrolledAt).toLocaleDateString('en-KE'),
        d.totalRemitted.toFixed(2),
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sacco-enrolled-drivers-${Date.now()}.csv`;
    a.click();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow/50 text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            <span className="font-bold text-white">{filtered.length}</span> enrolled drivers
          </span>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm font-bold hover:text-brand-yellow hover:border-brand-yellow/30 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>{drivers.length === 0 ? 'No drivers enrolled yet.' : 'No results match your search.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                {['Driver', 'Phone', 'Enrolled Date', 'Total Remitted', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr
                  key={d.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                >
                  <td className="px-5 py-4 font-bold text-white">{d.fullName}</td>
                  <td className="px-5 py-4 text-gray-400 font-mono">{d.phoneNumber}</td>
                  <td className="px-5 py-4 text-gray-400">
                    {new Date(d.saccoEnrolledAt).toLocaleDateString('en-KE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 font-bold text-brand-yellow">
                    {kes(d.totalRemitted)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="success">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'partner', label: 'Connected Partner', icon: Building2 },
  { key: 'financial', label: 'Financial Rules', icon: Settings },
  { key: 'drivers', label: 'Enrolled Drivers', icon: Users },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function SaccoIntegrationHub() {
  const [tab, setTab] = useState<TabKey>('partner');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-white font-sans">
      <PageHeader
        category="Growth & Platform"
        title="Financial Services & Sacco Integration Hub"
        subtitle="Connect Cabi Africa to independent external Saccos, Insurance carriers, and Investment funds with guaranteed driver earnings protections."
        icon={<Building2 className="w-6 h-6 text-amber-500" />}
      />

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-[#131722] rounded-[3px] border border-white/10 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-[3px] text-xs font-semibold transition-all ${
              tab === key
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {tab === 'partner' && <PartnerTab />}
        {tab === 'financial' && <FinancialTab />}
        {tab === 'drivers' && <DriversTab />}
      </div>
    </div>
  );
}
