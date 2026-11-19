import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Edit3,
  Landmark,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { dispatchFetch } from '../services/dispatchApiClient';

type WealthCategory =
  | 'Sacco'
  | 'INVESTMENT_MMF'
  | 'PENSION'
  | 'INSURANCE_HEALTH'
  | 'ASSET_FINANCING';

type IncentiveMode =
  | 'UNLOCK_ACCESS'
  | 'AUTO_ENROLL'
  | 'PLATFORM_MATCH'
  | 'UNLOCK_AND_MATCH';

interface BadgeRef {
  id: string;
  code: string;
  name: string;
  tier: string;
  category?: string;
}

interface BadgeIncentive {
  id: string;
  badgeId: string;
  programId: string;
  incentiveMode: IncentiveMode;
  bonusMatchPct: number;
  autoEnrollPct: number;
  isActive: boolean;
  badge: BadgeRef;
}

interface WealthProgram {
  id: string;
  code: string;
  name: string;
  description: string;
  category: WealthCategory;
  providerName?: string | null;
  logoUrl?: string | null;
  minPct: number;
  maxPct: number;
  defaultPct: number;
  dividendOrYield: string;
  isDriverSelectable: boolean;
  requiredBadgeId?: string | null;
  requiredBadge?: BadgeRef | null;
  platformBonusPct: number;
  isActive: boolean;
  badgeIncentives: BadgeIncentive[];
  _count?: { enrollments: number };
}

interface ProgramFormState {
  name: string;
  code: string;
  providerName: string;
  category: WealthCategory;
  dividendOrYield: string;
  description: string;
  minPct: string;
  maxPct: string;
  defaultPct: string;
  platformBonusPct: string;
  isDriverSelectable: boolean;
  requiredBadgeId: string;
  initialBadgeId: string;
  initialIncentiveMode: IncentiveMode;
  initialBonusMatchPct: string;
  initialAutoEnrollPct: string;
}

const INITIAL_FORM: ProgramFormState = {
  name: '',
  code: '',
  providerName: '',
  category: 'Sacco',
  dividendOrYield: '',
  description: '',
  minPct: '2',
  maxPct: '20',
  defaultPct: '5',
  platformBonusPct: '0',
  isDriverSelectable: true,
  requiredBadgeId: '',
  initialBadgeId: '',
  initialIncentiveMode: 'UNLOCK_AND_MATCH',
  initialBonusMatchPct: '2',
  initialAutoEnrollPct: '5',
};

const CATEGORY_LABELS: Record<WealthCategory, string> = {
  Sacco: 'Sacco Shares / Capital',
  INVESTMENT_MMF: 'Money Market Fund (MMF)',
  PENSION: 'Pension & Retirement',
  INSURANCE_HEALTH: 'Health & Life Cover',
  ASSET_FINANCING: 'Asset / EV Financing',
};

const INCENTIVE_MODE_LABELS: Record<IncentiveMode, string> = {
  UNLOCK_AND_MATCH: 'Unlock Access + Platform Match',
  AUTO_ENROLL: 'Auto-Enroll on Badge Earned',
  PLATFORM_MATCH: 'Platform Bonus Match Only',
  UNLOCK_ACCESS: 'Unlock Program Access Only',
};

export function WealthCreationProgramsPage() {
  const [programs, setPrograms] = useState<WealthProgram[]>([]);
  const [badges, setBadges] = useState<BadgeRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WealthProgram | null>(null);
  const [form, setForm] = useState<ProgramFormState>(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const [incentiveTargetProgram, setIncentiveTargetProgram] = useState<WealthProgram | null>(null);
  const [incentiveBadgeId, setIncentiveBadgeId] = useState('');
  const [incentiveMode, setIncentiveMode] = useState<IncentiveMode>('UNLOCK_AND_MATCH');
  const [incentiveBonusPct, setIncentiveBonusPct] = useState('2');
  const [incentiveAutoPct, setIncentiveAutoPct] = useState('5');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [programsRes, badgesRes] = await Promise.all([
        dispatchFetch('/wealth-programs'),
        dispatchFetch('/admin/badges'),
      ]);
      if (!programsRes.ok) {
        throw new Error(`Failed to load wealth programs (${programsRes.status})`);
      }
      const programsJson = await programsRes.json();
      setPrograms(programsJson.data || []);

      if (badgesRes.ok) {
        const badgesJson = await badgesRes.json();
        setBadges(badgesJson.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load wealth creation programs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const openCreateModal = () => {
    setEditingProgram(null);
    setForm(INITIAL_FORM);
    setShowProgramModal(true);
  };

  const openEditModal = (p: WealthProgram) => {
    setEditingProgram(p);
    setForm({
      name: p.name,
      code: p.code,
      providerName: p.providerName || '',
      category: p.category,
      dividendOrYield: p.dividendOrYield,
      description: p.description,
      minPct: String(Math.round(p.minPct * 1000) / 10),
      maxPct: String(Math.round(p.maxPct * 1000) / 10),
      defaultPct: String(Math.round(p.defaultPct * 1000) / 10),
      platformBonusPct: String(Math.round((p.platformBonusPct || 0) * 1000) / 10),
      isDriverSelectable: p.isDriverSelectable,
      requiredBadgeId: p.requiredBadgeId || '',
      initialBadgeId: '',
      initialIncentiveMode: 'UNLOCK_AND_MATCH',
      initialBonusMatchPct: '2',
      initialAutoEnrollPct: '5',
    });
    setShowProgramModal(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const payload: any = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        providerName: form.providerName.trim() || undefined,
        category: form.category,
        dividendOrYield: form.dividendOrYield.trim(),
        description: form.description.trim(),
        minPct: (parseFloat(form.minPct) || 2) / 100,
        maxPct: (parseFloat(form.maxPct) || 20) / 100,
        defaultPct: (parseFloat(form.defaultPct) || 5) / 100,
        platformBonusPct: (parseFloat(form.platformBonusPct) || 0) / 100,
        isDriverSelectable: form.isDriverSelectable,
        requiredBadgeId: form.requiredBadgeId || null,
      };

      if (!editingProgram && form.initialBadgeId) {
        payload.badgeIncentives = [
          {
            badgeId: form.initialBadgeId,
            incentiveMode: form.initialIncentiveMode,
            bonusMatchPct: (parseFloat(form.initialBonusMatchPct) || 0) / 100,
            autoEnrollPct: (parseFloat(form.initialAutoEnrollPct) || 5) / 100,
          },
        ];
      }

      const url = editingProgram
        ? `/wealth-programs/${editingProgram.id}`
        : `/wealth-programs`;

      const res = await dispatchFetch(url, {
        method: editingProgram ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Save failed (${res.status})`);
      }

      setShowProgramModal(false);
      showToast(editingProgram ? 'Wealth program updated.' : 'Wealth program created.');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save wealth program');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (p: WealthProgram) => {
    try {
      const res = await dispatchFetch(`/wealth-programs/${p.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      if (!res.ok) throw new Error('Failed to update program status');
      showToast(`${p.name} ${!p.isActive ? 'activated' : 'paused'}.`);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteProgram = async (p: WealthProgram) => {
    if (!window.confirm(`Delete "${p.name}"? Existing enrollments will be removed.`)) return;
    try {
      const res = await dispatchFetch(`/wealth-programs/${p.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete program');
      showToast(`${p.name} deleted.`);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openIncentiveModal = (p: WealthProgram) => {
    setIncentiveTargetProgram(p);
    setIncentiveBadgeId(badges[0]?.id || '');
    setIncentiveMode('UNLOCK_AND_MATCH');
    setIncentiveBonusPct('2');
    setIncentiveAutoPct(String(Math.round(p.defaultPct * 100)));
  };

  const handleAttachIncentive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incentiveTargetProgram || !incentiveBadgeId) return;
    setIsSaving(true);
    try {
      const res = await dispatchFetch(
        `/wealth-programs/${incentiveTargetProgram.id}/badge-incentives`,
        {
          method: 'POST',
          body: JSON.stringify({
            badgeId: incentiveBadgeId,
            incentiveMode,
            bonusMatchPct: (parseFloat(incentiveBonusPct) || 0) / 100,
            autoEnrollPct: (parseFloat(incentiveAutoPct) || 5) / 100,
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to attach badge incentive');
      setIncentiveTargetProgram(null);
      showToast('Badge incentive linked to wealth program.');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveIncentive = async (programId: string, incentiveId: string) => {
    try {
      const res = await dispatchFetch(
        `/wealth-programs/${programId}/badge-incentives/${incentiveId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to remove badge incentive');
      showToast('Badge incentive removed.');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.providerName || '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [programs, categoryFilter, search]);

  const stats = useMemo(() => {
    const active = programs.filter((p) => p.isActive).length;
    const selectable = programs.filter((p) => p.isDriverSelectable).length;
    const badgeLinked = programs.reduce((sum, p) => sum + p.badgeIncentives.length, 0);
    const enrolledDrivers = programs.reduce((sum, p) => sum + (p._count?.enrollments || 0), 0);
    return { active, selectable, badgeLinked, enrolledDrivers };
  }, [programs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-yellow mb-1">
            <Landmark className="w-4 h-4" />
            <span>Finance &amp; Sacco Wealth Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Wealth Creation Programs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure driver-selectable Sacco, MMF, and pension programs or attach them as badge incentives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-card-dark text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-brand-yellow/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-semibold text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Wealth Program
          </button>
        </div>
      </div>

      {/* Notices */}
      {notice && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Active Programs</span>
            <Landmark className="w-4 h-4 text-brand-yellow" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Driver-Selectable</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.selectable}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Badge Incentives Linked</span>
            <Award className="w-4 h-4 text-executive-gold" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.badgeLinked}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Active Enrollments</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.enrolledDrivers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programs by name, provider, or benefit..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-yellow"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-yellow"
        >
          <option value="ALL">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Programs List */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading wealth creation programs...</div>
      ) : filteredPrograms.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-card-dark border border-dashed border-gray-300 dark:border-white/15 text-center">
          <Landmark className="w-10 h-10 text-brand-yellow mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            No wealth creation programs yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
            Create your first Sacco, MMF, or retirement program for drivers to choose or earn via driver badges.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-yellow text-black font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Wealth Program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredPrograms.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl p-5 bg-white dark:bg-card-dark border transition-colors ${
                p.isActive
                  ? 'border-gray-200 dark:border-white/10 hover:border-brand-yellow/40'
                  : 'border-gray-200/60 dark:border-white/5 opacity-65'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30">
                      {CATEGORY_LABELS[p.category] || p.category}
                    </span>
                    {p.isDriverSelectable ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Driver Selectable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Award className="w-3 h-3" />
                        Badge-Only Incentive
                      </span>
                    )}
                    {p.requiredBadge && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-gray-300 border border-white/10">
                        <Lock className="w-3 h-3 text-executive-gold" />
                        Requires {p.requiredBadge.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.name}</h3>
                  {p.providerName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Provider: {p.providerName}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleActive(p)}
                    title={p.isActive ? 'Pause Program' : 'Activate Program'}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400"
                  >
                    {p.isActive ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(p)}
                    title="Edit Program"
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProgram(p)}
                    title="Delete Program"
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2.5 line-clamp-2">
                {p.description || 'No description provided.'}
              </p>

              {/* Yield & Percentage Metrics */}
              <div className="grid grid-cols-3 gap-2.5 mt-4 p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-white/5 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">Yield / Benefit</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{p.dividendOrYield}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">Deduction Range</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round(p.minPct * 100)}% – {Math.round(p.maxPct * 100)}% (def {Math.round(p.defaultPct * 100)}%)
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">Platform Match</span>
                  <span className="font-semibold text-executive-gold">
                    +{Math.round((p.platformBonusPct || 0) * 100)}% bonus
                  </span>
                </div>
              </div>

              {/* Attached Badge Incentives */}
              <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-executive-gold" />
                    Driver Badge Incentives ({p.badgeIncentives.length})
                  </span>
                  <button
                    onClick={() => openIncentiveModal(p)}
                    className="text-xs font-semibold text-brand-yellow hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Attach to Badge
                  </button>
                </div>

                {p.badgeIncentives.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    Not attached to any badge yet. Attach to a badge to unlock or auto-match for badge holders.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {p.badgeIncentives.map((inc) => (
                      <div
                        key={inc.id}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200"
                      >
                        <Award className="w-3.5 h-3.5 text-executive-gold" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {inc.badge.name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-amber-600 dark:text-brand-yellow">
                          {INCENTIVE_MODE_LABELS[inc.incentiveMode]}
                          {inc.bonusMatchPct > 0 ? ` (+${Math.round(inc.bonusMatchPct * 100)}%)` : ''}
                        </span>
                        <button
                          onClick={() => handleRemoveIncentive(p.id, inc.id)}
                          className="text-gray-400 hover:text-red-400 ml-0.5"
                          title="Remove badge link"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingProgram ? 'Edit Wealth Creation Program' : 'Create Wealth Creation Program'}
              </h2>
              <button
                onClick={() => setShowProgramModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Program Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Cabi Gold Drivers Sacco"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as WealthCategory })}
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Partner / Provider Name
                  </label>
                  <input
                    value={form.providerName}
                    onChange={(e) => setForm({ ...form, providerName: e.target.value })}
                    placeholder="e.g. Stima DT Sacco"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Yield / Dividend Highlight *
                  </label>
                  <input
                    required
                    value={form.dividendOrYield}
                    onChange={(e) => setForm({ ...form, dividendOrYield: e.target.value })}
                    placeholder="e.g. 12.5% Annual Dividend + 3x Loan"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe how drivers build wealth and qualify for payouts..."
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Min %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={form.minPct}
                    onChange={(e) => setForm({ ...form, minPct: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Max %
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.5"
                    value={form.maxPct}
                    onChange={(e) => setForm({ ...form, maxPct: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Default %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={form.defaultPct}
                    onChange={(e) => setForm({ ...form, defaultPct: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Platform Match %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={form.platformBonusPct}
                    onChange={(e) => setForm({ ...form, platformBonusPct: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/25 border border-gray-200 dark:border-white/10 space-y-3">
                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDriverSelectable}
                    onChange={(e) => setForm({ ...form, isDriverSelectable: e.target.checked })}
                    className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                  />
                  Allow drivers to voluntarily choose this program in the Driver App
                </label>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Require Driver Badge to Unlock (Optional)
                  </label>
                  <select
                    value={form.requiredBadgeId}
                    onChange={(e) => setForm({ ...form, requiredBadgeId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">Open to all drivers (No badge required)</option>
                    {badges.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.tier})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingProgram && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-yellow flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Attach as Badge Incentive (Optional)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={form.initialBadgeId}
                      onChange={(e) => setForm({ ...form, initialBadgeId: e.target.value })}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                    >
                      <option value="">-- Do not attach to a badge now --</option>
                      {badges.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.tier})
                        </option>
                      ))}
                    </select>
                    {form.initialBadgeId && (
                      <select
                        value={form.initialIncentiveMode}
                        onChange={(e) =>
                          setForm({ ...form, initialIncentiveMode: e.target.value as IncentiveMode })
                        }
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                      >
                        {Object.entries(INCENTIVE_MODE_LABELS).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {form.initialBadgeId && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Badge Bonus Match %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={form.initialBonusMatchPct}
                          onChange={(e) =>
                            setForm({ ...form, initialBonusMatchPct: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Auto-Enroll % (if Auto-Enroll)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          step="0.5"
                          value={form.initialAutoEnrollPct}
                          onChange={(e) =>
                            setForm({ ...form, initialAutoEnrollPct: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProgramModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-semibold text-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingProgram ? 'Save Changes' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Badge Incentive Modal */}
      {incentiveTargetProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Attach Badge Incentive
              </h2>
              <button
                onClick={() => setIncentiveTargetProgram(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAttachIncentive} className="p-6 space-y-4">
              <p className="text-xs text-gray-400">
                Program: <strong className="text-white">{incentiveTargetProgram.name}</strong>
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Driver Badge
                </label>
                <select
                  required
                  value={incentiveBadgeId}
                  onChange={(e) => setIncentiveBadgeId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                >
                  <option value="" disabled>
                    Select a badge...
                  </option>
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.tier})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Incentive Behavior
                </label>
                <select
                  value={incentiveMode}
                  onChange={(e) => setIncentiveMode(e.target.value as IncentiveMode)}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                >
                  {Object.entries(INCENTIVE_MODE_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Platform Bonus Match %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={incentiveBonusPct}
                    onChange={(e) => setIncentiveBonusPct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Auto-Enroll %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={incentiveAutoPct}
                    onChange={(e) => setIncentiveAutoPct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIncentiveTargetProgram(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !incentiveBadgeId}
                  className="px-4 py-2 rounded-xl bg-brand-yellow text-black font-semibold text-sm disabled:opacity-50"
                >
                  {isSaving ? 'Attaching...' : 'Attach Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

