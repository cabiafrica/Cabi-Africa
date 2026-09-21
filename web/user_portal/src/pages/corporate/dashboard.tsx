import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
    Briefcase, 
    Users, 
    ShieldCheck, 
    CreditCard, 
    TrendingUp, 
    Clock, 
    AlertTriangle, 
    CheckCircle2, 
    Plus, 
    Search, 
    Filter, 
    Copy, 
    Check, 
    ExternalLink, 
    ChevronRight, 
    ArrowUpRight, 
    Calendar, 
    MapPin, 
    Car, 
    FileText, 
    Download, 
    RefreshCw, 
    X, 
    DollarSign,
    Phone,
    Mail,
    Send,
    UserCheck,
    Sliders
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
    CorporateAccount, 
    CorporateWallet, 
    CorporateRidePolicy, 
    CorporateMember, 
    CorporateTrip, 
    CorporateTransaction 
} from '@/lib/corporateService';

export default function CorporateDashboardPage() {
    const router = useRouter();
    const { orgId } = router.query;
    const targetOrgId = (typeof orgId === 'string' && orgId) ? orgId : 'corp-nexus-tech-01';

    const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'policies' | 'billing' | 'trips'>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data state
    const [account, setAccount] = useState<CorporateAccount | null>(null);
    const [wallet, setWallet] = useState<CorporateWallet | null>(null);
    const [policy, setPolicy] = useState<CorporateRidePolicy | null>(null);
    const [members, setMembers] = useState<CorporateMember[]>([]);
    const [trips, setTrips] = useState<CorporateTrip[]>([]);
    const [transactions, setTransactions] = useState<CorporateTransaction[]>([]);
    const [metrics, setMetrics] = useState<any>({});

    // Modals
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [copiedToken, setCopiedToken] = useState(false);
    const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

    // Invite form
    const [inviteForm, setInviteForm] = useState({
        fullName: '',
        email: '',
        phone: '+254',
        role: 'EMPLOYEE' as 'EMPLOYEE' | 'BILLING_LEAD' | 'ADMIN',
        department: 'Engineering'
    });
    const [inviteSubmitting, setInviteSubmitting] = useState(false);

    // Top-up form
    const [topUpAmount, setTopUpAmount] = useState<number>(25000);
    const [topUpMethod, setTopUpMethod] = useState<'MPESA' | 'CARD' | 'BANK_TRANSFER'>('MPESA');
    const [topUpPhone, setTopUpPhone] = useState('+254712345678');
    const [topUpSubmitting, setTopUpSubmitting] = useState(false);
    const [topUpSuccessMsg, setTopUpSuccessMsg] = useState<string | null>(null);

    // Policy Edit state
    const [policyForm, setPolicyForm] = useState<Partial<CorporateRidePolicy>>({});
    const [policySaving, setPolicySaving] = useState(false);
    const [policySuccessMsg, setPolicySuccessMsg] = useState<string | null>(null);

    // Filters
    const [memberSearch, setMemberSearch] = useState('');
    const [tripFilter, setTripFilter] = useState<'ALL' | 'FLAGGED' | 'APPROVED'>('ALL');

    const fetchDashboardData = async () => {
        try {
            const res = await fetch(`/api/corporate/overview?orgId=${targetOrgId}`);
            const json = await res.json();
            if (json.success) {
                setAccount(json.data.account);
                setWallet(json.data.wallet);
                setPolicy(json.data.policy);
                setPolicyForm(json.data.policy);
                setMetrics(json.data.metrics);
                setTrips(json.data.recentTrips || []);
            }

            // Fetch full members
            const memRes = await fetch(`/api/corporate/members?orgId=${targetOrgId}`);
            const memJson = await memRes.json();
            if (memJson.success) {
                setMembers(memJson.data);
            }

            // Fetch full trips
            const tripRes = await fetch(`/api/corporate/rides?orgId=${targetOrgId}`);
            const tripJson = await tripRes.json();
            if (tripJson.success) {
                setTrips(tripJson.data);
            }

            // Fetch transactions
            const walRes = await fetch(`/api/corporate/wallet?orgId=${targetOrgId}`);
            const walJson = await walRes.json();
            if (walJson.success) {
                setTransactions(walJson.data.transactions);
            }
        } catch (err) {
            console.error('Failed to load corporate dashboard:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [targetOrgId]);

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteSubmitting(true);
        try {
            const res = await fetch(`/api/corporate/members?orgId=${targetOrgId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inviteForm)
            });
            const data = await res.json();
            if (data.success) {
                setLastInviteUrl(data.data.inviteUrl);
                setMembers(prev => [data.data.member, ...prev]);
                setInviteForm({
                    fullName: '',
                    email: '',
                    phone: '+254',
                    role: 'EMPLOYEE',
                    department: 'Engineering'
                });
            } else {
                alert(data.message || 'Failed to send invite');
            }
        } catch (err) {
            alert('Error sending invitation');
        } finally {
            setInviteSubmitting(false);
        }
    };

    const handleTopUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTopUpSubmitting(true);
        setTopUpSuccessMsg(null);
        try {
            const res = await fetch(`/api/corporate/wallet?orgId=${targetOrgId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: topUpAmount,
                    paymentMethod: topUpMethod,
                    phone: topUpPhone
                })
            });
            const data = await res.json();
            if (data.success) {
                setWallet(data.data.wallet);
                setTopUpSuccessMsg(data.message);
                setTimeout(() => {
                    setShowTopUpModal(false);
                    setTopUpSuccessMsg(null);
                    fetchDashboardData();
                }, 1800);
            }
        } catch (err) {
            alert('Error completing top-up');
        } finally {
            setTopUpSubmitting(false);
        }
    };

    const handlePolicySave = async (e: React.FormEvent) => {
        e.preventDefault();
        setPolicySaving(true);
        setPolicySuccessMsg(null);
        try {
            const res = await fetch(`/api/corporate/policy?orgId=${targetOrgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(policyForm)
            });
            const data = await res.json();
            if (data.success) {
                setPolicy(data.data);
                setPolicySuccessMsg('Ride policies and overdraft limits updated successfully.');
                setTimeout(() => setPolicySuccessMsg(null), 3000);
            }
        } catch (err) {
            alert('Failed to save policy');
        } finally {
            setPolicySaving(false);
        }
    };

    const handleTripReview = async (tripId: string, status: 'APPROVED' | 'FLAGGED') => {
        try {
            const res = await fetch(`/api/corporate/rides?orgId=${targetOrgId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId, status, reviewedBy: account?.companyName || 'Admin' })
            });
            const data = await res.json();
            if (data.success) {
                setTrips(prev => prev.map(t => t.id === tripId ? data.data : t));
            }
        } catch (err) {
            alert('Failed to update trip status');
        }
    };

    const copyInviteToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
    };

    const filteredMembers = members.filter(m => 
        m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.department.toLowerCase().includes(memberSearch.toLowerCase())
    );

    const filteredTrips = trips.filter(t => {
        if (tripFilter === 'FLAGGED') return t.isOutOfPolicy && t.reviewStatus === 'PENDING_REVIEW';
        if (tripFilter === 'APPROVED') return t.reviewStatus === 'APPROVED';
        return true;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-brand-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-brand-yellow animate-spin" />
                    <span className="text-sm font-semibold tracking-wide text-gray-400">Loading Cabi for Business Portal...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-black text-white selection:bg-brand-yellow selection:text-black">
            <Head>
                <title>{account?.companyName || 'Corporate'} | Cabi for Business Portal</title>
                <meta name="description" content="Manage corporate travel, employee allowances, travel policies, and unified billing." />
            </Head>

            <Header />

            <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Top Enterprise Banner */}
                <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/30 flex items-center justify-center text-brand-yellow flex-shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                                <Briefcase className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{account?.companyName}</h1>
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                                        Active Enterprise
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5 text-gray-500" /> {account?.businessEmail}
                                    </span>
                                    <span>•</span>
                                    <span>Reg: <strong className="text-gray-300">{account?.regNumber}</strong></span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-gray-500" /> {account?.city}, {account?.country}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={() => { setRefreshing(true); fetchDashboardData(); }}
                                title="Refresh data"
                                className="p-2.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-yellow' : ''}`} />
                            </button>

                            <button
                                onClick={() => setShowTopUpModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs tracking-wider uppercase transition-all"
                            >
                                <CreditCard className="w-4 h-4 text-brand-yellow" />
                                Top Up Wallet
                            </button>

                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs tracking-wider uppercase transition-all transform active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                            >
                                <Plus className="w-4 h-4" />
                                Invite Member
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* KPI 1: Prepaid Balance */}
                    <div className="bg-surface-dark/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prepaid Wallet</span>
                            <div className="p-2 rounded-xl bg-brand-yellow/10 text-brand-yellow">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                            KES {wallet?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-white/5">
                            <span className="text-gray-400">Status</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Funded & Ready
                            </span>
                        </div>
                    </div>

                    {/* KPI 2: Safety Overdraft Buffer (Option B) */}
                    <div className="bg-surface-dark/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Safety Overdraft (Opt B)</span>
                            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                            KES {(wallet ? wallet.overdraftLimit - wallet.overdraftUsed : 0).toLocaleString()}
                        </div>
                        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-white/5">
                            <span className="text-gray-400">Buffer Limit: KES {wallet?.overdraftLimit.toLocaleString()}</span>
                            <span className="text-cyan-400 font-semibold">
                                {wallet?.overdraftUsed === 0 ? '0% Used' : `KES ${wallet?.overdraftUsed} Used`}
                            </span>
                        </div>
                    </div>

                    {/* KPI 3: Total Spend This Month */}
                    <div className="bg-surface-dark/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Month-to-Date Spend</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                            KES {metrics.totalSpendMonth?.toLocaleString() || 0}
                        </div>
                        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-white/5">
                            <span className="text-gray-400">{metrics.totalTripsMonth || trips.length} business rides completed</span>
                            <span className="text-brand-yellow font-semibold">Active</span>
                        </div>
                    </div>

                    {/* KPI 4: Grace Justification Reviews (Option C) */}
                    <div className="bg-surface-dark/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Grace Reviews (Opt C)</span>
                            <div className={`p-2 rounded-xl ${metrics.pendingJustifications > 0 ? 'bg-amber-500/20 text-brand-yellow' : 'bg-white/10 text-gray-400'}`}>
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                            {metrics.pendingJustifications || 0} Flagged
                        </div>
                        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-white/5">
                            <span className="text-gray-400">Team Size: {members.length} Members</span>
                            <button 
                                onClick={() => setActiveTab('policies')}
                                className="text-brand-yellow hover:underline font-semibold"
                            >
                                View Review Queue
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'overview'
                                ? 'bg-brand-yellow text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Overview
                    </button>

                    <button
                        onClick={() => setActiveTab('team')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'team'
                                ? 'bg-brand-yellow text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Team & Invites ({members.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('policies')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'policies'
                                ? 'bg-brand-yellow text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Sliders className="w-4 h-4" />
                        Ride Policies & Audit
                        {metrics.pendingJustifications > 0 && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'billing'
                                ? 'bg-brand-yellow text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        Wallet & Statements
                    </button>

                    <button
                        onClick={() => setActiveTab('trips')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'trips'
                                ? 'bg-brand-yellow text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Car className="w-4 h-4" />
                        Live Trips ({trips.length})
                    </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Quick Action Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: Team Invitation */}
                            <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-brand-yellow font-bold text-xs uppercase tracking-wider mb-2">
                                        <UserCheck className="w-4 h-4" /> Team Growth
                                    </div>
                                    <h3 className="text-lg font-extrabold mb-1">Add Team Members</h3>
                                    <p className="text-xs text-gray-400 mb-4">
                                        Distribute instant Email and SMS invite links to employees so they can hail business rides billed to your corporate wallet.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4 text-brand-yellow" /> Create New Invite
                                </button>
                            </div>

                            {/* Card 2: Policy Status */}
                            <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
                                        <Sliders className="w-4 h-4" /> Active Guardrails
                                    </div>
                                    <h3 className="text-lg font-extrabold mb-1">Ride Policy Rules</h3>
                                    <div className="text-xs text-gray-400 space-y-1.5 mb-4">
                                        <div className="flex justify-between">
                                            <span>Trip Cap:</span>
                                            <strong className="text-white">KES {policy?.maxFarePerTrip.toLocaleString()}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Daily Limit:</span>
                                            <strong className="text-white">KES {policy?.dailyLimitPerEmployee.toLocaleString()}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Allowed Hours:</span>
                                            <strong className="text-white">{policy?.allowedHoursStart} – {policy?.allowedHoursEnd}</strong>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('policies')}
                                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Configure Policies <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Card 3: Instant M-Pesa Top Up */}
                            <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                                        <CreditCard className="w-4 h-4" /> Corporate Treasury
                                    </div>
                                    <h3 className="text-lg font-extrabold mb-1">M-Pesa & Card Funding</h3>
                                    <p className="text-xs text-gray-400 mb-4">
                                        Immediate wallet top-up via M-Pesa Express STK push or corporate credit cards. Zero settlement delay.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowTopUpModal(true)}
                                    className="w-full py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                >
                                    <CreditCard className="w-4 h-4" /> Top Up Balance
                                </button>
                            </div>
                        </div>

                        {/* Recent Corporate Trips Table */}
                        <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Recent Corporate Travel Activity</h3>
                                    <p className="text-xs text-gray-400">Real-time log of team employee rides</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('trips')}
                                    className="text-xs font-bold text-brand-yellow hover:underline flex items-center gap-1"
                                >
                                    View all rides <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-gray-300">
                                    <thead className="bg-white/5 uppercase text-[10px] tracking-wider text-gray-400 border-b border-white/10">
                                        <tr>
                                            <th className="py-3 px-4">Employee</th>
                                            <th className="py-3 px-4">Route</th>
                                            <th className="py-3 px-4">Vehicle</th>
                                            <th className="py-3 px-4">Fare</th>
                                            <th className="py-3 px-4">Policy Status</th>
                                            <th className="py-3 px-4">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-medium">
                                        {trips.slice(0, 4).map((t) => (
                                            <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-white">{t.memberName}</div>
                                                    <div className="text-[11px] text-gray-500">{t.department}</div>
                                                </td>
                                                <td className="py-3 px-4 max-w-xs truncate">
                                                    <div className="text-white truncate">{t.pickupLocation}</div>
                                                    <div className="text-[11px] text-gray-500 truncate">→ {t.dropoffLocation}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-300 font-mono text-[10px]">
                                                        {t.vehicleType}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-bold text-white">
                                                    KES {t.fare.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {t.isOutOfPolicy ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-brand-yellow text-[10px] font-bold inline-flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" /> Grace (Justified)
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold inline-flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> In Policy
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[11px] text-gray-400">
                                                    {t.receiptNumber}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: TEAM & INVITES */}
                {activeTab === 'team' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Team Members & Access</h3>
                                    <p className="text-xs text-gray-400">Manage employee accounts, assign administrative roles, and send invitations</p>
                                </div>
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                >
                                    <Plus className="w-4 h-4" /> Invite Employee via Email/SMS
                                </button>
                            </div>

                            {/* Search bar */}
                            <div className="relative mb-6">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    placeholder="Search team members by name, email, or department..."
                                    className="w-full bg-brand-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-gray-300">
                                    <thead className="bg-white/5 uppercase text-[10px] tracking-wider text-gray-400 border-b border-white/10">
                                        <tr>
                                            <th className="py-3 px-4">Member Name</th>
                                            <th className="py-3 px-4">Contact</th>
                                            <th className="py-3 px-4">Role</th>
                                            <th className="py-3 px-4">Department</th>
                                            <th className="py-3 px-4">Spend This Month</th>
                                            <th className="py-3 px-4">Trips</th>
                                            <th className="py-3 px-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-medium">
                                        {filteredMembers.map((m) => (
                                            <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-white">{m.fullName}</div>
                                                    <div className="text-[10px] text-gray-500">{m.employeeNumber || 'ID: ' + m.id}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>{m.email}</div>
                                                    <div className="text-[11px] text-gray-500">{m.phone}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                                                        m.role === 'ADMIN' ? 'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/40' :
                                                        m.role === 'BILLING_LEAD' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                                                        'bg-white/10 text-gray-300'
                                                    }`}>
                                                        {m.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{m.department}</td>
                                                <td className="py-3 px-4 font-bold text-white">
                                                    KES {m.spendThisMonth.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4">{m.tripsThisMonth}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                        m.status === 'INVITED' ? 'bg-amber-500/10 text-brand-yellow border border-amber-500/30 animate-pulse' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>
                                                        {m.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: RIDE POLICIES & AUDIT */}
                {activeTab === 'policies' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Policy Settings Form */}
                        <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6 sm:p-8">
                            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <Sliders className="w-5 h-5 text-brand-yellow" />
                                        Travel Spending Policies & Guardrails
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Define automatic limits, allowed travel hours, and safety overdraft buffers
                                    </p>
                                </div>
                                {policySuccessMsg && (
                                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
                                        <CheckCircle2 className="w-4 h-4" /> {policySuccessMsg}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handlePolicySave} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                                            Max Fare Per Single Ride (KES)
                                        </label>
                                        <input
                                            type="number"
                                            value={policyForm.maxFarePerTrip || 2500}
                                            onChange={(e) => setPolicyForm({ ...policyForm, maxFarePerTrip: Number(e.target.value) })}
                                            className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                        <span className="text-[11px] text-gray-500 mt-1 block">Default cap per individual trip</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                                            Daily Allowance per Employee (KES)
                                        </label>
                                        <input
                                            type="number"
                                            value={policyForm.dailyLimitPerEmployee || 6000}
                                            onChange={(e) => setPolicyForm({ ...policyForm, dailyLimitPerEmployee: Number(e.target.value) })}
                                            className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                        <span className="text-[11px] text-gray-500 mt-1 block">Max combined spend in 24 hours</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                                            Monthly Limit per Employee (KES)
                                        </label>
                                        <input
                                            type="number"
                                            value={policyForm.monthlyLimitPerEmployee || 45000}
                                            onChange={(e) => setPolicyForm({ ...policyForm, monthlyLimitPerEmployee: Number(e.target.value) })}
                                            className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                        <span className="text-[11px] text-gray-500 mt-1 block">Individual monthly travel budget</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                                            Permitted Travel Time Window
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="time"
                                                value={policyForm.allowedHoursStart || '06:00'}
                                                onChange={(e) => setPolicyForm({ ...policyForm, allowedHoursStart: e.target.value })}
                                                className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-yellow"
                                            />
                                            <span className="text-gray-400 font-bold">to</span>
                                            <input
                                                type="time"
                                                value={policyForm.allowedHoursEnd || '21:30'}
                                                onChange={(e) => setPolicyForm({ ...policyForm, allowedHoursEnd: e.target.value })}
                                                className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-yellow"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                                            Safety Overdraft Buffer Limit (Option B)
                                        </label>
                                        <input
                                            type="number"
                                            value={policyForm.safetyOverdraftBuffer || 25000}
                                            onChange={(e) => setPolicyForm({ ...policyForm, safetyOverdraftBuffer: Number(e.target.value) })}
                                            className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                        <span className="text-[11px] text-gray-500 mt-1 block">Emergency credit allowed when prepaid balance is 0</span>
                                    </div>
                                </div>

                                {/* Option C: Grace with Justification Toggle */}
                                <div className="p-5 rounded-2xl bg-white/5 border border-brand-yellow/30 relative">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="w-4 h-4 text-brand-yellow" />
                                                <h4 className="text-sm font-extrabold text-white">
                                                    Grace with Business Justification (Option C)
                                                </h4>
                                            </div>
                                            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                                                When enabled, if an employee's requested ride exceeds the fare cap or is taken after hours, the corporate card is NOT blocked. Instead, the rider must input an official <strong>Business Justification Note</strong> in their Cabi Go app. The trip proceeds immediately under grace and is flagged in your review queue below for admin sign-off.
                                            </p>
                                        </div>

                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={policyForm.graceWithJustification !== false}
                                                onChange={(e) => setPolicyForm({ ...policyForm, graceWithJustification: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-yellow"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={policySaving}
                                        className="px-6 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
                                    >
                                        {policySaving ? 'Saving Changes...' : 'Save Policy Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Grace Justifications Review Queue */}
                        <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-brand-yellow" />
                                        Out-of-Policy Audit & Justification Queue
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Review business rationale submitted by employees for rides approved under the Grace rule
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {trips.filter(t => t.isOutOfPolicy).map((t) => (
                                    <div 
                                        key={t.id}
                                        className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-sm">{t.memberName}</span>
                                                <span className="text-xs text-gray-500">({t.department})</span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-brand-yellow border border-amber-500/30">
                                                    {t.outOfPolicyReason || 'Exceeded Policy Cap'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                                <span>{t.pickupLocation} → {t.dropoffLocation}</span>
                                                <span>•</span>
                                                <span>Fare: <strong className="text-white font-mono">KES {t.fare.toLocaleString()}</strong></span>
                                            </div>
                                            <div className="mt-2 p-3 rounded-lg bg-brand-black/60 border border-white/10 text-xs text-gray-300 italic">
                                                "{t.justificationNote || 'Emergency business requirement'}"
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 flex-shrink-0">
                                            {t.reviewStatus === 'APPROVED' ? (
                                                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-4 h-4" /> Approved
                                                </span>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleTripReview(t.id, 'APPROVED')}
                                                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs tracking-wider transition-all"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleTripReview(t.id, 'FLAGGED')}
                                                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-semibold transition-all"
                                                    >
                                                        Query
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {trips.filter(t => t.isOutOfPolicy).length === 0 && (
                                    <div className="text-center py-10 text-gray-500 text-xs">
                                        No out-of-policy exceptions recorded this period. All employee travel is compliant.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: BILLING & STATEMENTS */}
                {activeTab === 'billing' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Wallet Balance & Overdraft Card */}
                        <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6 sm:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Account Balance</span>
                                    <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                                        KES {wallet?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Prepaid funds automatically deducted as team members complete rides.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowTopUpModal(true)}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                    >
                                        <CreditCard className="w-4 h-4" /> Top Up Balance
                                    </button>
                                </div>
                            </div>

                            {/* Overdraft Buffer Monitor */}
                            <div className="pt-6">
                                <div className="flex justify-between items-center text-xs mb-2">
                                    <span className="font-semibold text-gray-300">Safety Overdraft Credit Buffer</span>
                                    <span className="text-cyan-400 font-mono font-bold">
                                        KES {(wallet?.overdraftLimit || 25000).toLocaleString()} Available
                                    </span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                                    <div 
                                        className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, ((wallet?.overdraftUsed || 0) / (wallet?.overdraftLimit || 25000)) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-[11px] text-gray-500 mt-2 block">
                                    Guarantees that active business rides are not halted mid-route if the prepaid balance reaches zero.
                                </span>
                            </div>
                        </div>

                        {/* Statements & Ledger */}
                        <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Financial Ledger & Top-Up History</h3>
                                    <p className="text-xs text-gray-400">Detailed transaction history for accounting and reconciliation</p>
                                </div>
                                <button
                                    onClick={() => alert('Exporting monthly statement to CSV...')}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-gray-300 hover:text-white transition-all"
                                >
                                    <Download className="w-4 h-4" /> Download Statement (CSV)
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-gray-300">
                                    <thead className="bg-white/5 uppercase text-[10px] tracking-wider text-gray-400 border-b border-white/10">
                                        <tr>
                                            <th className="py-3 px-4">Date & Time</th>
                                            <th className="py-3 px-4">Transaction Type</th>
                                            <th className="py-3 px-4">Reference</th>
                                            <th className="py-3 px-4">Method</th>
                                            <th className="py-3 px-4">Amount</th>
                                            <th className="py-3 px-4">Balance After</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-medium">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-gray-400">
                                                    {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        tx.type === 'TOP_UP' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-gray-300'
                                                    }`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[11px] text-gray-300">{tx.reference}</td>
                                                <td className="py-3 px-4">{tx.paymentMethod}</td>
                                                <td className={`py-3 px-4 font-bold ${tx.type === 'TOP_UP' ? 'text-emerald-400' : 'text-white'}`}>
                                                    {tx.type === 'TOP_UP' ? '+' : '-'}KES {tx.amount.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-gray-400">
                                                    KES {tx.balanceAfter.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: LIVE TRIPS */}
                {activeTab === 'trips' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-surface-dark/90 border border-white/10 rounded-2xl p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Corporate Ride Activity Log</h3>
                                    <p className="text-xs text-gray-400">Complete record of business travel trips taken by team members</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setTripFilter('ALL')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tripFilter === 'ALL' ? 'bg-brand-yellow text-black' : 'bg-white/5 text-gray-400'}`}
                                    >
                                        All ({trips.length})
                                    </button>
                                    <button
                                        onClick={() => setTripFilter('FLAGGED')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tripFilter === 'FLAGGED' ? 'bg-brand-yellow text-black' : 'bg-white/5 text-gray-400'}`}
                                    >
                                        Grace Out-of-Policy
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-gray-300">
                                    <thead className="bg-white/5 uppercase text-[10px] tracking-wider text-gray-400 border-b border-white/10">
                                        <tr>
                                            <th className="py-3 px-4">Employee</th>
                                            <th className="py-3 px-4">Origin & Destination</th>
                                            <th className="py-3 px-4">Date & Time</th>
                                            <th className="py-3 px-4">Vehicle</th>
                                            <th className="py-3 px-4">Fare</th>
                                            <th className="py-3 px-4">Policy Status</th>
                                            <th className="py-3 px-4">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-medium">
                                        {filteredTrips.map((t) => (
                                            <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-white">{t.memberName}</div>
                                                    <div className="text-[10px] text-gray-500">{t.department}</div>
                                                </td>
                                                <td className="py-3 px-4 max-w-sm">
                                                    <div className="text-white truncate">{t.pickupLocation}</div>
                                                    <div className="text-[11px] text-gray-500 truncate">→ {t.dropoffLocation}</div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-400">
                                                    {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-[10px] text-gray-300">
                                                        {t.vehicleType}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-bold text-white">
                                                    KES {t.fare.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {t.isOutOfPolicy ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-brand-yellow text-[10px] font-bold">
                                                            Grace: Justified
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                                            In Policy
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[11px] text-gray-400">
                                                    {t.receiptNumber}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 1: INVITE TEAM MEMBER */}
                {showInviteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-surface-dark border border-white/15 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                            <button
                                onClick={() => { setShowInviteModal(false); setLastInviteUrl(null); }}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-brand-yellow/10 text-brand-yellow">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Invite Team Member</h3>
                                    <p className="text-xs text-gray-400">Dispatch invite via Email and SMS</p>
                                </div>
                            </div>

                            {lastInviteUrl ? (
                                <div className="space-y-4 py-3">
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                                        <div className="font-bold mb-1 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" /> Invitation Created!
                                        </div>
                                        An SMS & Email dispatch has been scheduled for the recipient. You can also share the direct link below:
                                    </div>

                                    <div className="p-3 rounded-xl bg-brand-black border border-white/10 flex items-center justify-between gap-2">
                                        <span className="text-xs font-mono text-gray-300 truncate">{lastInviteUrl}</span>
                                        <button
                                            onClick={() => copyInviteToClipboard(lastInviteUrl)}
                                            className="px-3 py-1.5 rounded-lg bg-brand-yellow text-black font-bold text-xs flex items-center gap-1 flex-shrink-0"
                                        >
                                            {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copiedToken ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => setLastInviteUrl(null)}
                                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                                        >
                                            Invite Another
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleInviteSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                                            Employee Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={inviteForm.fullName}
                                            onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                                            placeholder="e.g. Sarah Mwangi"
                                            className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                                                Work Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={inviteForm.email}
                                                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                                placeholder="sarah@company.com"
                                                className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                                                Phone (for SMS Link) *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={inviteForm.phone}
                                                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                                                placeholder="+254712345678"
                                                className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                                                Role
                                            </label>
                                            <select
                                                value={inviteForm.role}
                                                onChange={(e: any) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                                className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                                            >
                                                <option value="EMPLOYEE">Employee / Rider</option>
                                                <option value="BILLING_LEAD">Billing Lead</option>
                                                <option value="ADMIN">Corporate Admin</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                                                Department
                                            </label>
                                            <input
                                                type="text"
                                                value={inviteForm.department}
                                                onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                                                placeholder="e.g. Sales, IT, Ops"
                                                className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-3">
                                        <button
                                            type="submit"
                                            disabled={inviteSubmitting}
                                            className="w-full py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {inviteSubmitting ? 'Generating Invitation...' : 'Send Invite via Email & SMS'}
                                            <Send className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL 2: TOP UP WALLET */}
                {showTopUpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-surface-dark border border-white/15 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                            <button
                                onClick={() => setShowTopUpModal(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Top Up Corporate Wallet</h3>
                                    <p className="text-xs text-gray-400">Preload balance for team business rides</p>
                                </div>
                            </div>

                            {topUpSuccessMsg ? (
                                <div className="p-6 text-center space-y-3 animate-fade-in">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-base font-bold text-white">{topUpSuccessMsg}</h4>
                                    <p className="text-xs text-gray-400">Your corporate balance has been immediately credited.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleTopUpSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                                            Select Top-Up Amount (KES)
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            {[10000, 25000, 50000].map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setTopUpAmount(amt)}
                                                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                                        topUpAmount === amt
                                                            ? 'bg-brand-yellow text-black border-brand-yellow'
                                                            : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                                                    }`}
                                                >
                                                    KES {amt.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="number"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(Number(e.target.value))}
                                            placeholder="Custom amount in KES"
                                            className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                                            Payment Method
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setTopUpMethod('MPESA')}
                                                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                                                    topUpMethod === 'MPESA'
                                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                                        : 'border-white/10 bg-white/5 text-gray-400'
                                                }`}
                                            >
                                                M-Pesa STK Push
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTopUpMethod('CARD')}
                                                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                                                    topUpMethod === 'CARD'
                                                        ? 'border-brand-yellow bg-brand-yellow/10 text-brand-yellow'
                                                        : 'border-white/10 bg-white/5 text-gray-400'
                                                }`}
                                            >
                                                Corporate Card
                                            </button>
                                        </div>
                                    </div>

                                    {topUpMethod === 'MPESA' && (
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                                                M-Pesa Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={topUpPhone}
                                                onChange={(e) => setTopUpPhone(e.target.value)}
                                                placeholder="+254712345678"
                                                className="w-full bg-brand-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                                            />
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={topUpSubmitting}
                                            className="w-full py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
                                        >
                                            {topUpSubmitting ? 'Authorizing Payment...' : `Confirm KES ${topUpAmount.toLocaleString()} Top Up`}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
