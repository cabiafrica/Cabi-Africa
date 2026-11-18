import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  CheckCircle,
  Clock,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  ChevronRight,
  Globe,
  Mail,
  Loader2,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SaccoPartner {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  contactEmail: string;
}

interface EnrollmentStatus {
  enrolled: boolean;
  saccoEnrolledAt?: string;
  incentiveActive?: boolean;
  incentiveExpiresAt?: string;
  totalRemitted?: number;
  mandatoryPct?: number;
  cabiPct?: number;
  partner?: SaccoPartner;
}

interface Transaction {
  id: string;
  amount: number;
  tripId: string;
  createdAt: string;
}

// ─── Utility ────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || localStorage.getItem('token') : null;
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

function kes(n: number) {
  return `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function daysRemaining(date: string): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function DriverSaccoManage() {
  const { user } = useAuth();
  const driverId = user?.driverProfile?.id || user?.id;

  const [status, setStatus] = useState<EnrollmentStatus | null>(null);
  const [partner, setPartner] = useState<SaccoPartner | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!driverId) return;
    setLoading(true);
    try {
      const [enrollStatus, activePartner] = await Promise.all([
        apiFetch<EnrollmentStatus>(`/api/sacco/enrollment-status?driverId=${driverId}`),
        apiFetch<SaccoPartner | null>('/api/sacco/active-partner').catch(() => null),
      ]);
      setStatus(enrollStatus);
      setPartner(enrollStatus.partner || activePartner);

      if (enrollStatus.enrolled) {
        const txns = await apiFetch<Transaction[]>(`/api/sacco/transactions?driverId=${driverId}`);
        setTransactions(txns.slice(0, 10));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEnroll = async () => {
    if (!driverId || !partner) return;
    setEnrolling(true);
    setError(null);
    try {
      await apiFetch('/api/sacco/enroll', {
        method: 'POST',
        body: JSON.stringify({ driverId, partnerId: partner.id }),
      });
      setSuccessMsg(`You have successfully enrolled in ${partner.name}. Remittances will begin from your next trip.`);
      await loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!driverId) return;
    setEnrolling(true);
    setError(null);
    try {
      await apiFetch('/api/sacco/unenroll', {
        method: 'POST',
        body: JSON.stringify({ driverId }),
      });
      setConfirmUnenroll(false);
      setSuccessMsg('You have unenrolled from the Wealth Creation program. No further remittances will be deducted.');
      await loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-yellow-400" />
            Wealth Creation &amp; Equity Services
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Opt into our wealth creation and asset ownership programs to grow your financial security — voluntary, transparent, yours.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* No active partner */}
        {!partner && (
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-500 opacity-50" />
            <p className="text-gray-400 text-sm">
              No wealth creation partner is currently active. Check back soon.
            </p>
          </div>
        )}

        {/* Partner Card */}
        {partner && (
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-white text-lg">{partner.name}</h2>
                {partner.description && (
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">{partner.description}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-3">
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                  {partner.contactEmail && (
                    <a
                      href={`mailto:${partner.contactEmail}`}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {partner.contactEmail}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Enrollment split info */}
            {status && (
              <div className="p-3 bg-black/20 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">How your earnings split</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">You keep</p>
                    <p className="font-black text-white text-lg">
                      {status.enrolled ? `${80}%` : '82%'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">To Wealth Fund</p>
                    <p className={`font-black text-lg ${status.enrolled ? 'text-yellow-400' : 'text-gray-600'}`}>
                      {status.enrolled
                        ? `${status.incentiveActive ? (status.mandatoryPct ?? 2) + 3 : status.mandatoryPct ?? 2}%`
                        : '0%'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cabi</p>
                    <p className="font-black text-white text-lg">
                      {status.enrolled && status.incentiveActive
                        ? `${(status.cabiPct ?? 18) - 3}%`
                        : `${status.cabiPct ?? 18}%`}
                    </p>
                  </div>
                </div>
                {status.enrolled && status.incentiveActive && (
                  <p className="text-xs text-green-400 text-center mt-2">
                    ✨ Joining incentive active — Cabi is contributing an extra 3% to your Wealth Creation Fund
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Enrollment Toggle */}
        {partner && status && (
          <div className={`p-5 rounded-2xl border transition-all ${
            status.enrolled
              ? 'border-green-500/30 bg-green-500/5'
              : 'border-white/10 bg-white/5'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">
                  {status.enrolled ? 'Enrolled in Wealth Creation Fund' : 'Not enrolled'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {status.enrolled
                    ? `Joined ${new Date(status.saccoEnrolledAt!).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}`
                    : 'Enroll to start building your financial safety net and asset equity'}
                </p>
              </div>
              {status.enrolled ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-50 text-sm"
                >
                  {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ToggleRight className="w-4 h-4" />}
                  Enroll Now
                </button>
              )}
            </div>

            {status.enrolled && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  You can opt out at any time. Existing remittances remain in your wealth creation account.
                </p>
                <button
                  onClick={() => setConfirmUnenroll(true)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <ToggleLeft className="w-3.5 h-3.5" />
                  Opt out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Incentive Countdown */}
        {status?.enrolled && status.incentiveActive && status.incentiveExpiresAt && (
          <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-400 text-sm">Joining Incentive Active</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Cabi is adding an extra 3% to your Wealth Creation Fund for{' '}
                <span className="text-white font-bold">{daysRemaining(status.incentiveExpiresAt)} more days</span>.
                Expires{' '}
                {new Date(status.incentiveExpiresAt).toLocaleDateString('en-KE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}.
              </p>
            </div>
          </div>
        )}

        {/* Total Remitted */}
        {status?.enrolled && typeof status.totalRemitted === 'number' && (
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Total Remitted to Wealth Fund</p>
                <p className="text-2xl font-black text-white">{kes(status.totalRemitted)}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        )}

        {/* Recent Transactions */}
        {status?.enrolled && transactions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recent Remittances</h3>
            <div className="space-y-2">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/5 rounded-xl"
                >
                  <div>
                    <p className="text-sm text-white font-medium">Trip #{tx.tripId.slice(-6)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-KE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <p className="font-bold text-yellow-400 text-sm">{kes(tx.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unenroll Confirm Modal */}
        {confirmUnenroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4">
              <h3 className="font-bold text-white text-lg">Opt out of Wealth Creation Program?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                You will stop making remittances after your next trip. Funds already remitted to the wealth fund remain in your account with {partner?.name}.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmUnenroll(false)}
                  className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnenroll}
                  disabled={enrolling}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 text-sm"
                >
                  {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Yes, Opt Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
