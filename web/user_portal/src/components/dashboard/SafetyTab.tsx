import React from 'react';
import {
  AlertTriangle, Shield, CheckCircle2, Clock, Search, ChevronRight,
  User, MapPin, Star, RefreshCw, FileText, Gavel, MessageSquare, Send, Building
} from 'lucide-react';
import { safetyService, UserIncident, UserStatement, OccurrenceSeverity, OccurrenceStatus } from '@/services/safetyService';

// ── helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_META: Record<OccurrenceSeverity, { label: string; color: string; bg: string; dot: string }> = {
  LOW:      { label: 'Low',      color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-500/10',   dot: 'bg-green-500'  },
  MEDIUM:   { label: 'Medium',   color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/10',   dot: 'bg-amber-500'  },
  HIGH:     { label: 'High',     color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', dot: 'bg-orange-500' },
  CRITICAL: { label: 'Critical', color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-500/10',       dot: 'bg-red-500'    },
};

const STATUS_META: Record<OccurrenceStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  OPEN:                { label: 'Open',               icon: <Clock className="w-3.5 h-3.5" />,         color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-500/10'   },
  UNDER_INVESTIGATION: { label: 'Under Investigation',icon: <Search className="w-3.5 h-3.5" />,        color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  RESOLVED:            { label: 'Resolved',           icon: <CheckCircle2 className="w-3.5 h-3.5" />,  color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
  DISPUTED:            { label: 'Disputed',           icon: <Gavel className="w-3.5 h-3.5" />,         color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-500/10'     },
};

const CATEGORY_LABELS: Record<string, string> = {
  CRIME: 'Crime', TRAFFIC_OFFENSE: 'Traffic Offense', SAFETY_VIOLATION: 'Safety Violation',
  POLICY_VIOLATION: 'Policy Violation', HARASSMENT: 'Harassment', FRAUD: 'Fraud',
  PROPERTY_DAMAGE: 'Property Damage', MEDICAL_EMERGENCY: 'Medical Emergency',
  DISPUTE: 'Dispute', SUSPICIOUS_ACTIVITY: 'Suspicious Activity', VEHICLE_ISSUE: 'Vehicle Issue',
  ENVIRONMENTAL: 'Environmental',
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── sub-components ────────────────────────────────────────────────────────────

function IncidentCard({ incident, onOpen }: { incident: UserIncident; onOpen: (i: UserIncident) => void }) {
  const sev = SEVERITY_META[incident.severity];
  const sta = STATUS_META[incident.status];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(incident)}
      onKeyDown={e => e.key === 'Enter' && onOpen(incident)}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/8 bg-white/60 dark:bg-white/4 backdrop-blur-sm
                 hover:border-brand-yellow/40 hover:shadow-lg hover:shadow-brand-yellow/5 transition-all duration-300 cursor-pointer p-6 flex gap-5"
    >
      {/* Severity stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${sev.dot}`} />

      {/* Icon */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${sev.bg}`}>
        <AlertTriangle className={`w-5 h-5 ${sev.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-black text-slate-900 dark:text-white text-sm leading-tight truncate">{incident.title}</p>
            <p className="text-[11px] font-mono text-slate-400 dark:text-gray-500 mt-0.5">OB: {incident.obNumber}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${sev.bg} ${sev.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
              {sev.label}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${sta.bg} ${sta.color}`}>
              {sta.icon}
              {sta.label}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">{incident.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {fmt(incident.occurredAt)}
          </span>
          {incident.locationCity && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {incident.locationCity}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-bold capitalize">
            As {incident.myRole}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400">
            {CATEGORY_LABELS[incident.category] || incident.category}
          </span>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-gray-600 self-center flex-shrink-0 group-hover:text-brand-yellow group-hover:translate-x-1 transition-all" />
    </div>
  );
}

const STATEMENT_STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:      { label: 'Pending Review',  color: 'text-slate-600 dark:text-gray-300',   bg: 'bg-slate-100 dark:bg-white/5'    },
  UNDER_REVIEW: { label: 'Under Review',    color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ACCEPTED:     { label: 'Accepted',        color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-500/10' },
  REJECTED:     { label: 'Rejected',        color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-500/10'    },
};

function IncidentDetail({
  incident,
  userId,
  onClose,
}: {
  incident: UserIncident;
  userId: string;
  onClose: () => void;
}) {
  const sev = SEVERITY_META[incident.severity];
  const sta = STATUS_META[incident.status];

  // Statement state
  const [myStatement, setMyStatement] = React.useState<UserStatement | null>(incident.myStatement ?? null);
  const [statementText, setStatementText] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const canSubmit = incident.status === 'OPEN' || incident.status === 'UNDER_INVESTIGATION';

  const handleSubmitStatement = async () => {
    if (!statementText.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await safetyService.submitStatement(incident.id, userId, statementText.trim());
      setMyStatement(result);
      setStatementText('');
    } catch (e: any) {
      setSubmitError(e?.response?.data?.message || 'Failed to submit statement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative p-8 rounded-t-3xl overflow-hidden ${sev.bg}`}>
          <div className="absolute right-8 top-8 opacity-10">
            <AlertTriangle className="w-24 h-24" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-sm font-black transition-colors"
          >
            ✕
          </button>
          <div className="relative z-10">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${sev.bg} ${sev.color} border border-current/20`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
              {sev.label} Severity
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{incident.title}</h2>
            <p className="text-sm text-slate-500 mt-1 font-mono">OB# {incident.obNumber}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">

          {/* Status + Meta row */}
          <div className="flex flex-wrap gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${sta.bg} ${sta.color}`}>
              {sta.icon} {sta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 capitalize">
              You were the {incident.myRole}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300">
              {CATEGORY_LABELS[incident.category] || incident.category}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</h3>
            <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed bg-slate-50 dark:bg-white/4 p-4 rounded-xl">{incident.description}</p>
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-white/4 rounded-xl p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Date
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">{fmt(incident.occurredAt)}</div>
              {incident.resolvedAt && (
                <div className="text-[11px] text-slate-500 mt-0.5">Resolved: {fmt(incident.resolvedAt)}</div>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-white/4 rounded-xl p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {incident.locationCity || incident.locationAddress || 'Not recorded'}
              </div>
              {incident.locationAddress && incident.locationCity && (
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">{incident.locationAddress}</div>
              )}
            </div>
          </div>

          {/* Counterparty */}
          {incident.counterparty && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                {incident.myRole === 'passenger' ? 'Driver Involved' : 'Passenger Involved'}
              </h3>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/4 rounded-xl p-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  {incident.counterparty.photoUrl
                    ? <img src={incident.counterparty.photoUrl} alt={`${incident.counterparty.name} verified profile photo`} width={48} height={48} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    : <User className="w-5 h-5 text-slate-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">{incident.counterparty.name}</div>
                  {incident.counterparty.rating != null && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
                      <span className="text-sm font-black text-slate-700 dark:text-gray-300">
                        {incident.counterparty.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resolution notes */}
          {incident.resolutionNotes && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Resolution Notes
              </h3>
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4 text-sm text-green-800 dark:text-green-300 leading-relaxed">
                {incident.resolutionNotes}
              </div>
            </div>
          )}

          {/* Latest audit log */}
          {incident.latestLog && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Latest Update</h3>
              <div className="flex gap-3 bg-slate-50 dark:bg-white/4 rounded-xl p-4">
                <div className="w-2 h-2 rounded-full bg-brand-yellow mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-700 dark:text-gray-300">{incident.latestLog.notes}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{new Date(incident.latestLog.timestamp).toLocaleString('en-KE')}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── My Statement ─────────────────────────────── */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> My Statement
            </h3>

            {myStatement ? (
              /* Already submitted — show read-only card */
              <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-white/4 border-b border-slate-200 dark:border-white/8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submitted {fmt(myStatement.submittedAt)}</span>
                  {(() => {
                    const s = STATEMENT_STATUS_STYLES[myStatement.status] ?? STATEMENT_STATUS_STYLES.PENDING;
                    return (
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${s.bg} ${s.color}`}>
                        {s.label}
                      </span>
                    );
                  })()}
                </div>
                <blockquote className="px-5 py-4 text-sm text-slate-700 dark:text-gray-300 italic leading-relaxed whitespace-pre-wrap">
                  "{myStatement.text}"
                </blockquote>
                {myStatement.reviewNotes && (
                  <div className="px-5 py-3 bg-green-50 dark:bg-green-500/10 border-t border-green-200 dark:border-green-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 mb-1">Admin Note</p>
                    <p className="text-xs text-green-800 dark:text-green-300">{myStatement.reviewNotes}</p>
                  </div>
                )}
              </div>
            ) : canSubmit ? (
              /* Not yet submitted — show form */
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                  You may submit your account of what happened. This will be reviewed by our team and may influence the outcome of the investigation.
                </p>
                <textarea
                  rows={4}
                  maxLength={1500}
                  placeholder="Describe your experience and perspective on this incident…"
                  value={statementText}
                  onChange={e => setStatementText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5
                             text-sm text-slate-900 dark:text-white placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{statementText.length}/1500</span>
                  <button
                    onClick={handleSubmitStatement}
                    disabled={submitting || statementText.trim().length < 10}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-yellow text-black font-black text-sm
                               hover:bg-brand-yellow/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                    {submitting ? 'Submitting…' : 'Submit Statement'}
                  </button>
                </div>
                {submitError && (
                  <p className="text-xs text-red-500 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> {submitError}
                  </p>
                )}
              </div>
            ) : (
              /* Incident resolved/disputed — too late to submit */
              <p className="text-xs text-slate-400 italic">
                This incident has been {incident.status.toLowerCase().replace('_', ' ')} — the statement window is closed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Organization Delegation Component ────────────────────────────────────────

function OrganizationDelegation({ userId }: { userId: string }) {
  const [responders, setResponders] = React.useState([
    { id: '1', name: 'John Doe', position: 'Chairman', isDistressResponder: true },
    { id: '2', name: 'Jane Smith', position: 'Secretary', isDistressResponder: false },
    { id: '3', name: 'Mike Johnson', position: 'Treasurer', isDistressResponder: true }
  ]);
  const [subgroups, setSubgroups] = React.useState([
    { id: 's1', name: 'Welfare Fund', features: ['WELFARE', 'EMERGENCY'] }
  ]);

  const distressCount = responders.filter(r => r.isDistressResponder).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {distressCount < 3 && (
         <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-start gap-3">
           <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
           <div>
             <p className="font-bold">Compliance Warning: Insufficient Distress Responders</p>
             <p className="text-sm text-red-400/80 mt-1">Your organization requires a minimum of 3 Distress Responders to handle SOS alerts. You currently have {distressCount} active responder(s). Please delegate more members.</p>
           </div>
         </div>
      )}

      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Distress Responders Delegation</h3>
        <p className="text-sm text-gray-400 mb-6">Select members who will instantly receive high-priority SOS notifications when a driver triggers a distress alert.</p>
        <div className="grid gap-4">
          {responders.map(r => (
            <div key={r.id} className="flex items-center justify-between p-4 bg-brand-black/50 rounded-xl border border-white/5">
              <div>
                <p className="font-bold text-white">{r.name}</p>
                <p className="text-sm text-gray-400">{r.position}</p>
              </div>
              <label className="flex items-center cursor-pointer" htmlFor={`responder-toggle-${r.id}`}>
                <div className="relative">
                  <input
                    id={`responder-toggle-${r.id}`}
                    aria-label={`Toggle distress responder for ${r.name}`}
                    type="checkbox"
                    className="sr-only"
                    checked={r.isDistressResponder}
                    onChange={() => {
                      setResponders(responders.map(x => x.id === r.id ? { ...x, isDistressResponder: !x.isDistressResponder } : x));
                    }}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${r.isDistressResponder ? 'bg-brand-yellow' : 'bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${r.isDistressResponder ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-300 min-w-[120px]">
                  {r.isDistressResponder ? 'Active Responder' : 'Delegate'}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Subgroup Management</h3>
        <p className="text-sm text-gray-400 mb-6">View and configure feature flags for your organization's subgroups.</p>
        <div className="grid gap-4">
          {subgroups.map(sg => (
            <div key={sg.id} className="p-4 bg-brand-black/50 rounded-xl border border-white/5">
              <p className="font-bold text-white mb-2">{sg.name}</p>
              <div className="flex gap-2">
                {sg.features.map(f => (
                  <span key={f} className="px-2 py-1 bg-brand-yellow/20 border border-brand-yellow/30 text-brand-yellow text-[10px] font-bold rounded uppercase tracking-wider">{f}</span>
                ))}
                {sg.features.length === 0 && <span className="text-xs text-gray-500 italic">No features enabled</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── main SafetyTab export ────────────────────────────────────────────────────

interface SafetyTabProps {
  userId: string;
}

type FilterStatus = 'ALL' | OccurrenceStatus;

export default function SafetyTab({ userId }: SafetyTabProps) {
  const [incidents, setIncidents] = React.useState<UserIncident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>('ALL');
  const [selected, setSelected] = React.useState<UserIncident | null>(null);
  const [activeTab, setActiveTab] = React.useState<'INCIDENTS' | 'ORGANIZATION'>('INCIDENTS');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await safetyService.getUserIncidents(userId);
      setIncidents(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not load your incidents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = incidents.filter(i => {
    const matchesStatus = filterStatus === 'ALL' || i.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch = !q || i.title.toLowerCase().includes(q) || i.obNumber.toLowerCase().includes(q)
      || i.description.toLowerCase().includes(q) || (i.locationCity || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Stats
  const open        = incidents.filter(i => i.status === 'OPEN').length;
  const investigating = incidents.filter(i => i.status === 'UNDER_INVESTIGATION').length;
  const resolved    = incidents.filter(i => i.status === 'RESOLVED').length;
  const disputed    = incidents.filter(i => i.status === 'DISPUTED').length;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <Shield className="w-8 h-8 text-brand-yellow" />
            Safety &amp; Incidents
          </h2>
          <p className="text-slate-500 dark:text-gray-400 mt-1 text-sm">
            Manage your SOS alerts, occurrences, and organization delegations.
          </p>
        </div>
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('INCIDENTS')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'INCIDENTS' ? 'bg-brand-yellow text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Incidents
          </button>
          <button
            onClick={() => setActiveTab('ORGANIZATION')}
            className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ORGANIZATION' ? 'bg-brand-yellow text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <Building className="w-4 h-4" />
            Organization
          </button>
        </div>
      </div>

      {activeTab === 'ORGANIZATION' ? (
        <OrganizationDelegation userId={userId} />
      ) : (
        <>
          {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open',       count: open,          bg: 'bg-blue-50 dark:bg-blue-500/10',   text: 'text-blue-600 dark:text-blue-400'   },
          { label: 'Investigating', count: investigating, bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
          { label: 'Resolved',   count: resolved,      bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
          { label: 'Disputed',   count: disputed,      bg: 'bg-red-50 dark:bg-red-500/10',     text: 'text-red-600 dark:text-red-400'     },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-current/10`}>
            <div className={`text-3xl font-black ${s.text}`}>{s.count}</div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${s.text} opacity-70 mt-1`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="safety-search"
            type="text"
            placeholder="Search by title, OB number, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10
                       bg-white/60 dark:bg-white/5 text-sm text-slate-900 dark:text-white
                       placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISPUTED'] as FilterStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
                filterStatus === s
                  ? 'bg-brand-yellow text-black shadow shadow-brand-yellow/20'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {s === 'UNDER_INVESTIGATION' ? 'Investigating' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
          <div className="w-10 h-10 rounded-full border-2 border-brand-yellow/30 border-t-brand-yellow animate-spin" />
          <p className="text-sm font-bold">Loading your incidents…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-sm text-red-500 font-bold text-center max-w-sm">{error}</p>
          <button onClick={load} className="px-4 py-2 bg-brand-yellow text-black font-black rounded-lg text-sm">Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <Shield className="w-10 h-10 text-slate-300 dark:text-white/20" />
          </div>
          <div className="text-center">
            <p className="font-black text-slate-900 dark:text-white text-lg">
              {incidents.length === 0 ? 'No Incidents Recorded' : 'No matching incidents'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {incidents.length === 0
                ? 'You have a clean safety record. Keep it up!'
                : 'Try adjusting your search or filters.'}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map(incident => (
            <IncidentCard key={incident.id} incident={incident} onOpen={setSelected} />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && <IncidentDetail incident={selected} userId={userId} onClose={() => setSelected(null)} />}
        </>
      )}
    </div>
  );
}
