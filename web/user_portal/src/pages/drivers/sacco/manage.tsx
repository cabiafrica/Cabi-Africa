import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

interface Member {
    id: string;
    user: { fullName: string; phone: string };
    isOnline: boolean;
    totalRidesCompleted: number;
    averageRating: number;
}

interface OrgDetails {
    id: string;
    name: string;
    registrationNumber: string;
    status: string;
    bio?: string;
    features?: string[];
    driver_profiles: Member[];
}

const SERVICE_META: Record<string, { icon: string; label: string; color: string; desc: string; balanceLabel: string }> = {
    pension:   { icon: '🏦', label: 'Pension & Retirement Fund', color: 'text-blue-400',   desc: 'Pooled retirement savings for members', balanceLabel: 'Pension Balance' },
    insurance: { icon: '🛡️', label: 'Personal Insurance Pool',  color: 'text-green-400',  desc: 'Cooperative health, life & collision cover', balanceLabel: 'Cover Value' },
    housing:   { icon: '🏠', label: 'Housing & Land Pools',     color: 'text-orange-400', desc: 'Collective real estate investments', balanceLabel: 'Portfolio Value' },
    savings:   { icon: '💰', label: 'Savings & Dividends',      color: 'text-yellow-400', desc: 'High-yield group savings cycles', balanceLabel: 'Savings Pool' },
    loans:     { icon: '⚡', label: 'Emergency Credit',         color: 'text-red-400',    desc: 'Fast micro-loans for vehicles & emergencies', balanceLabel: 'Credit Limit' },
};

export default function ManageOrgPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [org, setOrg] = useState<OrgDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [memberFilter, setMemberFilter] = useState('');

    const organizationId = user?.driverProfile?.organizationId || user?.organizationId || user?.driver?.organizationId;

    useEffect(() => {
        if (authLoading) return;
        if (!organizationId) { setLoading(false); return; }
        fetchDetails(organizationId);
    }, [organizationId, authLoading]);

    const fetchDetails = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/sacco/details/${id}`);
            if (res.ok) setOrg(await res.json());
            else setOrg(null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ── Derive category & services from features[] ──────────────────────────
    const features = org?.features || [];
    const category = features.find(f => f.startsWith('category:'))?.replace('category:', '') ?? 'organization';
    const services = features.filter(f => f.startsWith('service:')).map(f => f.replace('service:', ''));
    const isSacco = category === 'sacco';

    // ── Filtered member list ─────────────────────────────────────────────────
    const members = (org?.driver_profiles ?? []).filter(m =>
        m.user.fullName.toLowerCase().includes(memberFilter.toLowerCase()) ||
        m.user.phone.includes(memberFilter)
    );
    const onlineCount = members.filter(m => m.isOnline).length;
    const totalRides  = members.reduce((acc, m) => acc + m.totalRidesCompleted, 0);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (authLoading || loading) return (
        <MainLayout title="Manage Organization">
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
            </div>
        </MainLayout>
    );

    // ── No org ───────────────────────────────────────────────────────────────
    if (!org) return (
        <MainLayout title="No Organization Found">
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white gap-6">
                <div className="text-6xl">🏢</div>
                <h1 className="text-2xl font-bold">You don't manage any organization yet.</h1>
                <p className="text-gray-500 max-w-md text-center">
                    Register a <strong className="text-yellow-500">Driver Organisation</strong> to unite drivers,
                    or a <strong className="text-yellow-500">SACCO</strong> to pool financial services like pension,
                    insurance, and housing investments.
                </p>
                <Link
                    href="/drivers/sacco/create"
                    className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                >
                    Register Your Organization
                </Link>
            </div>
        </MainLayout>
    );

    return (
        <MainLayout title={`Manage ${org.name} | CABI Africa`}>
            <div className="min-h-screen bg-[#0A0A0A] text-white py-20 px-4">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* ── Header ─────────────────────────────────────────────── */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className="text-2xl">{isSacco ? '🏦' : '🤝'}</span>
                                <h1 className="text-4xl font-bold text-white">{org.name}</h1>
                                {/* Category badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    isSacco
                                        ? 'border-blue-500/30 text-blue-400 bg-blue-500/5'
                                        : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
                                }`}>
                                    {isSacco ? 'SACCO' : 'Driver Organisation'}
                                </span>
                                {/* Verification status badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    org.status === 'VERIFIED'   ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                                    org.status === 'PENDING'    ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' :
                                                                  'border-red-500/30 text-red-500 bg-red-500/5'
                                }`}>
                                    {org.status}
                                </span>
                            </div>
                            <p className="text-gray-500 font-mono text-sm">{org.registrationNumber}</p>
                            {org.bio && <p className="text-gray-400 text-sm mt-1 max-w-xl">{org.bio}</p>}
                        </div>
                        <div className="flex gap-4 shrink-0">
                            <button
                                onClick={() => router.push('/drivers/sacco/edit')}
                                className="bg-white/5 border border-white/10 hover:border-yellow-500/50 text-white px-6 py-3 rounded-xl transition-all font-medium"
                            >
                                ⚙️ Settings
                            </button>
                            <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl transition-all font-bold">
                                + Invite Driver
                            </button>
                        </div>
                    </div>

                    {/* ── Stats Row ───────────────────────────────────────────── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard label="Total Members"  value={org.driver_profiles.length} color="text-yellow-500" />
                        <StatCard label="Active Now"     value={onlineCount}  color="text-green-500" />
                        <StatCard label="Group Rides"    value={totalRides}   color="text-blue-500" />
                        <StatCard label="Avg. Rating"    value="4.8 ★"        color="text-purple-400" />
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        BRANCH A: SACCO — Financial Services Suite
                    ══════════════════════════════════════════════════════════════ */}
                    {isSacco && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    💼 Financial Services Suite
                                </h2>
                                <span className="text-xs text-gray-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                    {services.length} active service{services.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {services.length === 0 ? (
                                <div className="bg-[#121212] border border-white/10 rounded-2xl p-10 text-center">
                                    <p className="text-gray-500">No financial services selected.</p>
                                    <button
                                        onClick={() => router.push('/drivers/sacco/edit')}
                                        className="mt-4 text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                                    >
                                        → Configure services in Settings
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {services.map(svcId => {
                                        const meta = SERVICE_META[svcId];
                                        if (!meta) return null;
                                        return (
                                            <div key={svcId} className="bg-[#121212] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all group">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-3xl">{meta.icon}</span>
                                                        <div>
                                                            <h3 className={`font-bold text-sm ${meta.color}`}>{meta.label}</h3>
                                                            <p className="text-xs text-gray-500 mt-0.5">{meta.desc}</p>
                                                        </div>
                                                    </div>
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-1.5" />
                                                </div>
                                                <div className="border-t border-white/5 pt-4">
                                                    <p className="text-xs text-gray-500 mb-1">{meta.balanceLabel}</p>
                                                    <p className={`text-2xl font-bold ${meta.color}`}>
                                                        KSh 0.00
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">Awaiting member contributions</p>
                                                </div>
                                                <button className="mt-4 w-full py-2 text-xs font-bold border border-white/10 hover:border-yellow-500/50 rounded-xl text-gray-400 hover:text-white transition-all">
                                                    View Ledger →
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* SACCO Quick Actions */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <QuickActionCard icon="📊" title="Run Deductions" desc="Process monthly savings from member rides" action="Coming Soon" />
                                <QuickActionCard icon="📄" title="Generate Report" desc="Download monthly SACCO financial statements" action="Coming Soon" />
                                <QuickActionCard icon="🔔" title="Announce to Members" desc="Send a group notification to all members" action="Coming Soon" />
                            </div>
                        </section>
                    )}

                    {/* ═══════════════════════════════════════════════════════════
                        BRANCH B: DRIVER ORGANISATION — Unity & General Affairs
                    ══════════════════════════════════════════════════════════════ */}
                    {!isSacco && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <h2 className="text-2xl font-bold text-white">🤝 Driver Unity & General Affairs</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Upcoming Meetings */}
                                <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:col-span-2">
                                    <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                                        📅 Upcoming Meetings
                                    </h3>
                                    <div className="space-y-3">
                                        <MeetingRow date="No meetings scheduled" desc="Post a notice to invite members for discussions" placeholder />
                                    </div>
                                    <button className="mt-4 w-full py-2.5 text-sm font-bold border border-white/10 hover:border-yellow-500/50 rounded-xl text-gray-400 hover:text-white transition-all">
                                        + Schedule Meeting
                                    </button>
                                </div>

                                {/* Organisation Health */}
                                <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                                    <h3 className="font-bold text-lg mb-4 text-white">📈 Org Health</h3>
                                    <div className="space-y-4">
                                        <HealthRow label="Member Growth" pct={org.driver_profiles.length > 0 ? 60 : 0} />
                                        <HealthRow label="Activity Rate" pct={org.driver_profiles.length > 0 ? Math.round((onlineCount / org.driver_profiles.length) * 100) : 0} />
                                        <HealthRow label="Profile Score" pct={org.bio ? 80 : 30} />
                                    </div>
                                </div>
                            </div>

                            {/* Announcements Board */}
                            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 mb-8">
                                <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                                    📢 Announcements Board
                                </h3>
                                <div className="border border-dashed border-white/10 rounded-xl p-8 text-center text-gray-500">
                                    <p className="text-4xl mb-2">📋</p>
                                    <p className="font-medium">No announcements yet</p>
                                    <p className="text-xs mt-1">Post updates, notices, or policy changes for your driver community.</p>
                                    <button className="mt-4 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-6 py-2 rounded-xl text-sm font-bold transition-all">
                                        + Post Announcement
                                    </button>
                                </div>
                            </div>

                            {/* Quick Actions for Org */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <QuickActionCard icon="🗳️" title="Run a Poll" desc="Get your members' opinion on group decisions" action="Coming Soon" />
                                <QuickActionCard icon="🏅" title="Award Driver" desc="Recognize top-performing members in your org" action="Coming Soon" />
                                <QuickActionCard icon="📨" title="Group Broadcast" desc="Send a message to all organization members" action="Coming Soon" />
                            </div>
                        </section>
                    )}

                    {/* ── Member Directory (shared by both categories) ─────────── */}
                    <section>
                        <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap">
                                <h3 className="font-bold text-xl">
                                    {isSacco ? '💼 SACCO Member Directory' : '🤝 Driver Directory'}
                                </h3>
                                <input
                                    type="text"
                                    value={memberFilter}
                                    onChange={e => setMemberFilter(e.target.value)}
                                    placeholder="Filter by name or phone..."
                                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-500 w-64"
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-gray-400 text-sm uppercase font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Driver Name</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Total Rides</th>
                                            <th className="px-6 py-4">Rating</th>
                                            {isSacco && <th className="px-6 py-4">Contributions</th>}
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {members.length === 0 ? (
                                            <tr>
                                                <td colSpan={isSacco ? 6 : 5} className="px-6 py-10 text-center text-gray-600">
                                                    {memberFilter ? 'No members match your filter.' : 'No members yet. Invite drivers to join!'}
                                                </td>
                                            </tr>
                                        ) : members.map(member => (
                                            <tr key={member.id} className="hover:bg-white/[0.02] transition-all">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-white">{member.user.fullName}</div>
                                                    <div className="text-xs text-gray-500">{member.user.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {member.isOnline ? (
                                                        <span className="flex items-center gap-2 text-green-500 text-sm">
                                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />Online
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2 text-gray-500 text-sm">
                                                            <span className="w-2 h-2 rounded-full bg-gray-600" />Offline
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 font-mono">{member.totalRidesCompleted}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-yellow-500">
                                                        <span className="mr-1">{member.averageRating || '5.0'}</span>
                                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                                        </svg>
                                                    </div>
                                                </td>
                                                {isSacco && (
                                                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">KSh 0.00</td>
                                                )}
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-gray-500 hover:text-white transition-all">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </MainLayout>
    );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
    return (
        <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
            <p className="text-gray-500 text-sm mb-1">{label}</p>
            <h2 className={`text-3xl font-bold ${color}`}>{value}</h2>
        </div>
    );
}

function QuickActionCard({ icon, title, desc, action }: { icon: string; title: string; desc: string; action: string }) {
    return (
        <div className="bg-[#121212] border border-white/10 hover:border-white/20 rounded-2xl p-5 flex items-start gap-4 transition-all cursor-pointer group">
            <span className="text-2xl mt-0.5">{icon}</span>
            <div className="flex-1">
                <h4 className="font-bold text-white text-sm">{title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                <span className="text-xs text-yellow-500/60 group-hover:text-yellow-500 transition-all mt-2 inline-block">{action}</span>
            </div>
        </div>
    );
}

function MeetingRow({ date, desc, placeholder }: { date: string; desc: string; placeholder?: boolean }) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl ${placeholder ? 'border border-dashed border-white/10 text-gray-600' : 'bg-white/5'}`}>
            <span className="text-lg">📅</span>
            <div>
                <p className={`font-medium text-sm ${placeholder ? 'text-gray-600' : 'text-white'}`}>{date}</p>
                <p className="text-xs text-gray-600">{desc}</p>
            </div>
        </div>
    );
}

function HealthRow({ label, pct }: { label: string; pct: number }) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-mono">{pct}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
