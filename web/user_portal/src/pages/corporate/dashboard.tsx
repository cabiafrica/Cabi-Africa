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
    Sliders,
    UploadCloud,
    FileSpreadsheet,
    Layers,
    Sparkles,
    Settings,
    Building2,
    HelpCircle,
    ArrowRight,
    AlertCircle,
    FileCheck
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
import { 
    parseMigrationCsv, 
    generateSampleCsv, 
    ParsedEmployeeRow, 
    ParseResult 
} from '@/lib/csvMigrationParser';

export default function CorporateDashboardPage() {
    const router = useRouter();
    const { orgId } = router.query;
    const targetOrgId = (typeof orgId === 'string' && orgId) ? orgId : 'corp-nexus-tech-01';

    const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'policies' | 'billing' | 'trips' | 'settings'>('overview');
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
    const [showMigrationModal, setShowMigrationModal] = useState(false);
    const [copiedToken, setCopiedToken] = useState(false);
    const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

    // Bulk Migration & CSV state
    const [migrationPlatform, setMigrationPlatform] = useState<'AUTO' | 'CABI' | 'UBER_BUSINESS' | 'BOLT_BUSINESS' | 'LITTLE_CAB'>('AUTO');
    const [csvFileContent, setCsvFileContent] = useState<string>('');
    const [csvFileName, setCsvFileName] = useState<string>('');
    const [parsedData, setParsedData] = useState<ParseResult | null>(null);
    const [defaultDepartment, setDefaultDepartment] = useState('Operations');
    const [defaultLimit, setDefaultLimit] = useState(35000);
    const [isImporting, setIsImporting] = useState(false);
    const [importSummary, setImportSummary] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);

    // Organization Settings state
    const [settingsForm, setSettingsForm] = useState({
        companyName: '',
        businessEmail: '',
        phone: '',
        regNumber: '',
        kraPin: '',
        industry: '',
        city: '',
        country: '',
        billingEmail: '',
        costCenterCode: 'CC-NAIROBI-HQ'
    });
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

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

                if (json.data.account) {
                    setSettingsForm({
                        companyName: json.data.account.companyName || '',
                        businessEmail: json.data.account.businessEmail || '',
                        phone: json.data.account.phone || '',
                        regNumber: json.data.account.regNumber || '',
                        kraPin: json.data.account.kraPin || '',
                        industry: json.data.account.industry || 'Technology & Consulting',
                        city: json.data.account.city || 'Nairobi',
                        country: json.data.account.country || 'Kenya',
                        billingEmail: json.data.account.businessEmail || '',
                        costCenterCode: 'CC-NAIROBI-HQ'
                    });
                }
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

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsSaving(true);
        setSettingsSuccessMsg(null);
        try {
            const res = await fetch(`/api/corporate/account?orgId=${targetOrgId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsForm)
            });
            const data = await res.json();
            if (data.success) {
                setAccount(data.data);
                setSettingsSuccessMsg('Organization profile and billing configurations saved successfully.');
                setTimeout(() => setSettingsSuccessMsg(null), 3000);
            } else {
                alert(data.message || 'Failed to update company settings');
            }
        } catch (err) {
            alert('Error updating company settings');
        } finally {
            setSettingsSaving(false);
        }
    };

    const handleDownloadSampleTemplate = (format: 'CABI' | 'UBER_BUSINESS' | 'BOLT_BUSINESS' | 'LITTLE_CAB') => {
        const csvContent = generateSampleCsv(format);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cabi_${format.toLowerCase()}_migration_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCsvFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCsvFileName(file.name);
        setImportSummary(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setCsvFileContent(content);
            const result = parseMigrationCsv(content, migrationPlatform, {
                department: defaultDepartment,
                defaultLimit: defaultLimit
            });
            setParsedData(result);
        };
        reader.readAsText(file);
    };

    const handlePlatformChange = (newPlatform: 'AUTO' | 'CABI' | 'UBER_BUSINESS' | 'BOLT_BUSINESS' | 'LITTLE_CAB') => {
        setMigrationPlatform(newPlatform);
        if (csvFileContent) {
            const result = parseMigrationCsv(csvFileContent, newPlatform, {
                department: defaultDepartment,
                defaultLimit: defaultLimit
            });
            setParsedData(result);
        }
    };

    const handleExecuteBulkImport = async () => {
        if (!parsedData || parsedData.validCount === 0) return;
        setIsImporting(true);
        try {
            const payload = parsedData.rows
                .filter(r => r.isValid)
                .map(r => ({
                    fullName: r.fullName,
                    email: r.email,
                    phone: r.phone,
                    role: r.role,
                    department: r.department || defaultDepartment,
                    employeeNumber: r.employeeNumber,
                    monthlyLimit: r.monthlyLimit || defaultLimit
                }));

            const res = await fetch(`/api/corporate/members?orgId=${targetOrgId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bulk: true,
                    members: payload,
                    invitedBy: account?.companyName || 'Corporate Admin'
                })
            });

            const data = await res.json();
            if (data.success) {
                setImportSummary({
                    added: data.data.addedCount,
                    skipped: data.data.skippedCount,
                    errors: data.data.errors || []
                });
                fetchDashboardData();
            } else {
                alert(data.message || 'Bulk import failed');
            }
        } catch (err) {
            alert('Error performing bulk import');
        } finally {
            setIsImporting(false);
        }
    };

    const handleExportRidesCsv = () => {
        if (!trips || trips.length === 0) {
            alert('No trips available to export');
            return;
        }
        const headers = ['Receipt Number', 'Date', 'Rider Name', 'Department', 'Pickup Location', 'Dropoff Location', 'Vehicle Tier', 'Fare (KES)', 'Status', 'Out of Policy'];
        const rows = trips.map(t => [
            `"${t.receiptNumber}"`,
            `"${new Date(t.date).toLocaleDateString()}"`,
            `"${t.memberName}"`,
            `"${t.department}"`,
            `"${t.pickupLocation.replace(/"/g, '""')}"`,
            `"${t.dropoffLocation.replace(/"/g, '""')}"`,
            `"${t.vehicleType}"`,
            t.fare,
            `"${t.reviewStatus}"`,
            `"${t.isOutOfPolicy ? 'YES' : 'NO'}"`
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cabi_${(account?.companyName || 'corporate').toLowerCase().replace(/\s+/g, '_')}_rides_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white flex items-center justify-center transition-colors duration-300">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-brand-yellow animate-spin" />
                    <span className="text-sm font-semibold tracking-wide text-gray-400">Loading Cabi for Business Portal...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white selection:bg-[#D4AF37] selection:text-black transition-colors duration-300">
            <Head>
                <title>{account?.companyName || 'Corporate'} | Cabi for Business Portal</title>
                <meta name="description" content="Manage corporate travel, employee allowances, travel policies, and unified billing." />
            </Head>

            <Header />

            <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Top Enterprise Banner */}
                <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6 mb-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
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
                                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-gray-400 mt-1 flex-wrap">
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
                                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-yellow' : ''}`} />
                            </button>

                            <button
                                onClick={() => setShowMigrationModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white font-bold text-xs tracking-wider uppercase transition-all"
                            >
                                <FileSpreadsheet className="w-4 h-4 text-brand-yellow" />
                                Import CSV / Migrate
                            </button>

                            <button
                                onClick={() => setShowTopUpModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white font-bold text-xs tracking-wider uppercase transition-all"
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
                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-xl rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Prepaid Wallet</span>
                            <div className="p-2 rounded-xl bg-brand-yellow/10 text-brand-yellow">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                            KES {wallet?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-200 dark:border-white/5">
                            <span className="text-gray-400">Status</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Funded & Ready
                            </span>
                        </div>
                    </div>

                    {/* KPI 2: Safety Overdraft Buffer (Option B) */}
                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-xl rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Safety Overdraft (Opt B)</span>
                            <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] dark:text-[#FACC15]">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                            KES {(wallet ? wallet.overdraftLimit - wallet.overdraftUsed : 0).toLocaleString()}
                        </div>
                        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-200 dark:border-white/5">
                            <span className="text-gray-400">Buffer Limit: KES {wallet?.overdraftLimit.toLocaleString()}</span>
                            <span className="text-brand-yellow font-semibold">Active Protect</span>
                        </div>
                    </div>

                    {/* KPI 3: Spend This Month */}
                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-xl rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Spend This Month</span>
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                            KES {(metrics.totalSpendMonth || 0).toLocaleString()}
                        </div>
                        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-200 dark:border-white/5">
                            <span className="text-gray-400">Trips Completed: {metrics.totalTripsMonth || 0}</span>
                            <span className="text-emerald-400 font-semibold">{metrics.activeMembersCount || 0} Active Riders</span>
                        </div>
                    </div>

                    {/* KPI 4: Out-of-Policy Exceptions (Option C) */}
                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-xl rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Policy Exceptions (Opt C)</span>
                            <div className="p-2 rounded-xl bg-amber-500/10 text-brand-yellow">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                            {metrics.pendingJustifications || 0} Flagged
                        </div>
                        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-200 dark:border-white/5">
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
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'overview'
                                ? 'bg-brand-yellow text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5'
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
                                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5'
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
                                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5'
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
                                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5'
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
                                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5'
                        }`}
                    >
                        <Car className="w-4 h-4" />
                        Live Trips ({trips.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'settings'
                                ? 'bg-brand-yellow text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5'
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                        Settings & Invoicing
                    </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Quick Action Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1: Bulk Migration / Import */}
                            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/10 rounded-full blur-xl pointer-events-none" />
                                <div>
                                    <div className="flex items-center gap-2 text-brand-yellow font-bold text-xs uppercase tracking-wider mb-2">
                                        <FileSpreadsheet className="w-4 h-4" /> 1-Click Migration
                                    </div>
                                    <h3 className="text-lg font-extrabold mb-1">Import from Uber / Bolt</h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mb-4">
                                        Migrating from Uber for Business, Bolt, or Little Cab? Upload your staff CSV to onboard hundreds of riders instantly.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowMigrationModal(true)}
                                    className="w-full py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-xs font-bold text-black transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                >
                                    <UploadCloud className="w-4 h-4" /> Import CSV / Migrate
                                </button>
                            </div>

                            {/* Card 2: Team Growth */}
                            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-brand-yellow font-bold text-xs uppercase tracking-wider mb-2">
                                        <UserCheck className="w-4 h-4" /> Team Growth
                                    </div>
                                    <h3 className="text-lg font-extrabold mb-1">Add Team Members</h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mb-4">
                                        Distribute instant Email and SMS invite links to individual employees so they can hail business rides billed to your corporate wallet.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-bold text-slate-900 dark:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4 text-brand-yellow" /> Create Single Invite
                                </button>
                            </div>

                            {/* Card 3: Policy Status */}
                            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-[#FACC15] font-bold text-xs uppercase tracking-wider mb-2">
                                        <Sliders className="w-4 h-4" /> Active Guardrails
                                    </div>
                                    <h3 className="text-lg font-extrabold mb-1">Ride Policy Rules</h3>
                                    <div className="text-xs text-slate-600 dark:text-gray-400 space-y-1.5 mb-4">
                                        <div className="flex justify-between">
                                            <span>Trip Cap:</span>
                                            <strong className="text-slate-900 dark:text-white">KES {policy?.maxFarePerTrip.toLocaleString()}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Daily Limit:</span>
                                            <strong className="text-slate-900 dark:text-white">KES {policy?.dailyLimitPerEmployee.toLocaleString()}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Allowed Hours:</span>
                                            <strong className="text-slate-900 dark:text-white">{policy?.allowedHoursStart} – {policy?.allowedHoursEnd}</strong>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('policies')}
                                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-bold text-slate-900 dark:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Configure Policies <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Card 4: Instant Treasury Top Up */}
                            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                                        <CreditCard className="w-4 h-4" /> Corporate Treasury
                                    </div>
                                    <h3 className="text-lg font-extrabold mb-1">Mobile Money & Card Funding</h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mb-4">
                                        Immediate wallet top-up via Mobile Money Express STK push or corporate credit cards. Zero settlement delay.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowTopUpModal(true)}
                                    className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <DollarSign className="w-4 h-4" /> Top Up Treasury
                                </button>
                            </div>
                        </div>

                        {/* Grace with Justification Queue (Option C) */}
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black tracking-tight">Grace Justifications Review Queue</h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-brand-yellow text-xs font-bold">
                                            Option C Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                                        Review employee business justifications for out-of-policy rides that exceeded trip caps or took place after hours
                                    </p>
                                </div>
                                <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                                    Auto-protection buffer ensures zero stranded employees
                                </span>
                            </div>

                            {trips.filter(t => t.isOutOfPolicy).length === 0 ? (
                                <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                                    No out-of-policy rides requiring review. All team trips are within set limits.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {trips.filter(t => t.isOutOfPolicy).map((trip) => (
                                        <div 
                                            key={trip.id}
                                            className="p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/40 transition-colors"
                                        >
                                            <div className="space-y-1.5 max-w-2xl">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{trip.memberName}</span>
                                                    <span className="text-xs text-gray-500">• {trip.department}</span>
                                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-brand-yellow font-mono text-[10px] font-bold">
                                                        KES {trip.fare.toLocaleString()}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-semibold">
                                                        {trip.outOfPolicyReason}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-600 dark:text-gray-400">
                                                    Route: <strong>{trip.pickupLocation}</strong> → <strong>{trip.dropoffLocation}</strong>
                                                </div>
                                                <div className="text-xs bg-white dark:bg-black/30 p-2.5 rounded-lg border border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 italic">
                                                    "{trip.justificationNote || 'No employee justification note provided'}"
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                                                {trip.reviewStatus === 'PENDING_REVIEW' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleTripReview(trip.id, 'APPROVED')}
                                                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-1"
                                                        >
                                                            <Check className="w-3.5 h-3.5" /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleTripReview(trip.id, 'FLAGGED')}
                                                            className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/30 transition-all flex items-center gap-1"
                                                        >
                                                            <AlertTriangle className="w-3.5 h-3.5" /> Flag
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                                        trip.reviewStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {trip.reviewStatus === 'APPROVED' ? 'Approved' : 'Flagged by Reviewer'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: TEAM & INVITES */}
                {activeTab === 'team' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Migration Callout Notice */}
                        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-brand-yellow/10 text-brand-yellow flex-shrink-0">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        Migrating from Uber for Business, Bolt, or Little Cab?
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
                                        Export your team list from your previous provider and upload it directly. Cabi Africa auto-detects columns, assigns departments, and provisions invitations with zero manual entry.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMigrationModal(true)}
                                className="px-4 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                            >
                                <UploadCloud className="w-4 h-4" /> 1-Click Platform Migration
                            </button>
                        </div>

                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Team Members & Access</h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400">Manage employee accounts, assign administrative roles, and send invitations</p>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button
                                        onClick={() => setShowMigrationModal(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white font-bold text-xs tracking-wider uppercase transition-all"
                                    >
                                        <FileSpreadsheet className="w-4 h-4 text-brand-yellow" /> Import CSV / Migrate
                                    </button>
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                    >
                                        <Plus className="w-4 h-4" /> Single Invite
                                    </button>
                                </div>
                            </div>

                            {/* Search bar */}
                            <div className="relative mb-6">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    placeholder="Search team members by name, email, or department..."
                                    className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-700 dark:text-gray-300">
                                    <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] tracking-wider text-slate-600 dark:text-gray-400 border-b border-slate-200 dark:border-white/10">
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
                                    <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-medium">
                                        {filteredMembers.map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900 dark:text-white">{m.fullName}</div>
                                                    <div className="text-[10px] text-gray-500">{m.employeeNumber || 'ID: ' + m.id}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>{m.email}</div>
                                                    <div className="text-[11px] text-gray-500">{m.phone}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                                                        m.role === 'ADMIN' ? 'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/40' :
                                                        m.role === 'BILLING_LEAD' ? 'bg-[#D4AF37]/15 text-amber-800 dark:text-[#ffe088] border border-[#D4AF37]/40' :
                                                        'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300'
                                                    }`}>
                                                        {m.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{m.department}</td>
                                                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
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
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6 sm:p-8">
                            <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <Sliders className="w-5 h-5 text-brand-yellow" />
                                        Travel Spending Policies & Guardrails
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
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
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Max Fare Per Single Ride (KES)
                                        </label>
                                        <input
                                            type="number"
                                            value={policyForm.maxFarePerTrip || 2500}
                                            onChange={(e) => setPolicyForm({ ...policyForm, maxFarePerTrip: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                        <span className="text-[11px] text-gray-500 mt-1 block">Default cap per individual trip</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Daily Limit Per Employee (KES)
                                        </label>
                                        <input
                                            type="number"
                                            value={policyForm.dailyLimitPerEmployee || 6000}
                                            onChange={(e) => setPolicyForm({ ...policyForm, dailyLimitPerEmployee: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                        <span className="text-[11px] text-gray-500 mt-1 block">Cumulative daily cap</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Monthly Limit Per Employee (KES)
                                        </label>
                                        <input
                                            type="number"
                                            value={policyForm.monthlyLimitPerEmployee || 45000}
                                            onChange={(e) => setPolicyForm({ ...policyForm, monthlyLimitPerEmployee: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                        <span className="text-[11px] text-gray-500 mt-1 block">Monthly auto-refreshing allowance</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Allowed Travel Hours
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="time"
                                                value={policyForm.allowedHoursStart || '06:00'}
                                                onChange={(e) => setPolicyForm({ ...policyForm, allowedHoursStart: e.target.value })}
                                                className="bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                            />
                                            <span className="text-gray-500 text-xs">to</span>
                                            <input
                                                type="time"
                                                value={policyForm.allowedHoursEnd || '21:30'}
                                                onChange={(e) => setPolicyForm({ ...policyForm, allowedHoursEnd: e.target.value })}
                                                className="bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                            />
                                        </div>
                                        <span className="text-[11px] text-gray-500 mt-1 block">Rides booked outside this window trigger Grace with Justification</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Safety Overdraft Buffer Limit (Option B)
                                        </label>
                                        <input
                                            type="number"
                                            value={policyForm.safetyOverdraftBuffer || 25000}
                                            onChange={(e) => setPolicyForm({ ...policyForm, safetyOverdraftBuffer: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                        <span className="text-[11px] text-gray-500 mt-1 block">Credit buffer allocated when prepaid balance reaches zero</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-brand-yellow" />
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Grace with Mandatory Justification (Option C)</h4>
                                                <p className="text-xs text-slate-600 dark:text-gray-400">Allow employees to take emergency trips exceeding caps provided they type a justification note.</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={policyForm.graceWithJustification ?? true}
                                            onChange={(e) => setPolicyForm({ ...policyForm, graceWithJustification: e.target.checked })}
                                            className="w-5 h-5 accent-brand-yellow rounded cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={policySaving}
                                        className="px-6 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
                                    >
                                        {policySaving ? 'Saving Changes...' : 'Save Policy Rules'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* TAB 4: WALLET & STATEMENTS */}
                {activeTab === 'billing' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card 1: Balance Details */}
                            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6">
                                <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-brand-yellow" /> Corporate Treasury Status
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex justify-between items-center">
                                        <span className="text-xs text-gray-400 uppercase font-semibold">Available Prepaid Balance</span>
                                        <span className="text-xl font-black text-emerald-400">
                                            KES {wallet?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex justify-between items-center">
                                        <span className="text-xs text-gray-400 uppercase font-semibold">Overdraft Buffer Allocated</span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                                            KES {wallet?.overdraftLimit.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex justify-between items-center">
                                        <span className="text-xs text-gray-400 uppercase font-semibold">Overdraft Used</span>
                                        <span className="text-lg font-bold text-amber-500">
                                            KES {wallet?.overdraftUsed.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowTopUpModal(true)}
                                    className="w-full mt-6 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                >
                                    Top Up Treasury via Mobile Money / Card / Bank
                                </button>
                            </div>

                            {/* Card 2: Automatic Top-Up & Low Balance Alert */}
                            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight mb-2 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-brand-yellow" /> Automated Billing & Invoicing
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mb-6">
                                        Invoices are consolidated on the 1st of every month with individual trip receipts and eTIMS tax compliance.
                                    </p>
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 space-y-1 mb-4">
                                        <div className="font-bold">Next Statement Date: 1st of Next Month</div>
                                        <div className="text-gray-400">All ride receipts include full KRA PIN tax documentation.</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <button 
                                        onClick={handleExportRidesCsv}
                                        className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-bold text-slate-900 dark:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4 text-brand-yellow" /> Export Monthly Statement (.CSV)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6">
                            <h3 className="text-lg font-black tracking-tight mb-4">Corporate Wallet Ledger</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-700 dark:text-gray-300">
                                    <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] tracking-wider text-slate-600 dark:text-gray-400 border-b border-slate-200 dark:border-white/10">
                                        <tr>
                                            <th className="py-3 px-4">Date & Time</th>
                                            <th className="py-3 px-4">Type</th>
                                            <th className="py-3 px-4">Reference</th>
                                            <th className="py-3 px-4">Channel</th>
                                            <th className="py-3 px-4">Amount</th>
                                            <th className="py-3 px-4">Balance After</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-medium">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-gray-400">
                                                    {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        tx.type === 'TOP_UP' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300'
                                                    }`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[11px] text-gray-300">{tx.reference}</td>
                                                <td className="py-3 px-4">{tx.paymentMethod}</td>
                                                <td className={`py-3 px-4 font-bold ${tx.type === 'TOP_UP' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
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
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Corporate Ride Activity Log</h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400">Complete record of business travel trips taken by team members</p>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setTripFilter('ALL')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tripFilter === 'ALL' ? 'bg-brand-yellow text-black' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400'}`}
                                        >
                                            All ({trips.length})
                                        </button>
                                        <button
                                            onClick={() => setTripFilter('FLAGGED')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tripFilter === 'FLAGGED' ? 'bg-brand-yellow text-black' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400'}`}
                                        >
                                            Grace Out-of-Policy
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleExportRidesCsv}
                                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 dark:border-white/10"
                                    >
                                        <Download className="w-3.5 h-3.5 text-brand-yellow" /> Export CSV Report
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-700 dark:text-gray-300">
                                    <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] tracking-wider text-slate-600 dark:text-gray-400 border-b border-slate-200 dark:border-white/10">
                                        <tr>
                                            <th className="py-3 px-4">Date & Time</th>
                                            <th className="py-3 px-4">Employee</th>
                                            <th className="py-3 px-4">Pickup → Destination</th>
                                            <th className="py-3 px-4">Vehicle Tier</th>
                                            <th className="py-3 px-4">Fare</th>
                                            <th className="py-3 px-4">Policy Status</th>
                                            <th className="py-3 px-4">Receipt #</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-medium">
                                        {filteredTrips.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-gray-400">
                                                    {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900 dark:text-white">{t.memberName}</div>
                                                    <div className="text-[10px] text-gray-500">{t.department}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="truncate max-w-xs">{t.pickupLocation}</div>
                                                    <div className="truncate max-w-xs text-gray-500">→ {t.dropoffLocation}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-mono">
                                                        {t.vehicleType}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
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

                {/* TAB 6: ORGANIZATION SETTINGS & INVOICING */}
                {activeTab === 'settings' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Company Profile Settings Form */}
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-brand-yellow" />
                                        Organization Profile & Tax Credentials
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                                        Configure official business entity details, registered office, and tax identifiers for billing receipts
                                    </p>
                                </div>
                                {settingsSuccessMsg && (
                                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
                                        <CheckCircle2 className="w-4 h-4" /> {settingsSuccessMsg}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSaveSettings} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Legal Company Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={settingsForm.companyName}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Business Email
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={settingsForm.businessEmail}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, businessEmail: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Official Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={settingsForm.phone}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Certificate / Reg Number
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={settingsForm.regNumber}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, regNumber: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            KRA PIN (Tax Identification)
                                        </label>
                                        <input
                                            type="text"
                                            value={settingsForm.kraPin}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, kraPin: e.target.value })}
                                            placeholder="e.g. P051982341Z"
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Industry Sector
                                        </label>
                                        <input
                                            type="text"
                                            value={settingsForm.industry}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, industry: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            City & Country
                                        </label>
                                        <input
                                            type="text"
                                            value={`${settingsForm.city}, ${settingsForm.country}`}
                                            onChange={(e) => {
                                                const parts = e.target.value.split(',');
                                                setSettingsForm({
                                                    ...settingsForm,
                                                    city: parts[0]?.trim() || '',
                                                    country: parts[1]?.trim() || 'Kenya'
                                                });
                                            }}
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Billing Invoices Email
                                        </label>
                                        <input
                                            type="email"
                                            value={settingsForm.billingEmail}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, billingEmail: e.target.value })}
                                            placeholder="finance@company.com"
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                            Primary Cost Center Code
                                        </label>
                                        <input
                                            type="text"
                                            value={settingsForm.costCenterCode}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, costCenterCode: e.target.value })}
                                            placeholder="e.g. CC-NAIROBI-HQ"
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/10">
                                    <button
                                        type="submit"
                                        disabled={settingsSaving}
                                        className="px-6 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {settingsSaving ? 'Saving Changes...' : 'Save Organization Profile'}
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Tax Invoicing & ERP Accounting Reports */}
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 shadow-sm dark:shadow-2xl rounded-2xl p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-brand-yellow" />
                                        Tax Invoicing & ERP Accounting Exports
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                                        Download compliant monthly tax invoices, KRA PIN certificates, and raw CSV ledger records for QuickBooks, SAP, and Xero
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Current Month Tax Invoice</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">VAT Compliant</span>
                                        </div>
                                        <div className="text-lg font-black text-slate-900 dark:text-white mb-1">
                                            KES {metrics.totalSpendMonth ? metrics.totalSpendMonth.toLocaleString() : '0'}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-gray-400 mb-4">
                                            Includes 16% standard VAT breakdown, legal KRA PIN ({account?.kraPin || 'N/A'}), and eTIMS validation reference.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleExportRidesCsv}
                                        className="w-full py-2.5 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4 text-brand-yellow" /> Download Tax Invoice (CSV)
                                    </button>
                                </div>

                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Trip Ledger & Expense Codes</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-yellow/15 text-brand-yellow">Accounting Ready</span>
                                        </div>
                                        <div className="text-lg font-black text-slate-900 dark:text-white mb-1">
                                            {trips.length} Rides Logged
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-gray-400 mb-4">
                                            Itemized spreadsheet mapped with rider names, cost centers, project codes, pickup/dropoff points, and justification notes.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleExportRidesCsv}
                                        className="w-full py-2.5 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4 text-brand-yellow" /> Export Ledger (.CSV)
                                    </button>
                                </div>

                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Corporate Staff Roster</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">HR Directory</span>
                                        </div>
                                        <div className="text-lg font-black text-slate-900 dark:text-white mb-1">
                                            {members.length} Registered Staff
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-gray-400 mb-4">
                                            Complete roster of active employees, spending allowances, invited roles, and department breakdown.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDownloadSampleTemplate('CABI')}
                                        className="w-full py-2.5 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4 text-brand-yellow" /> Export Roster (.CSV)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 1: INVITE TEAM MEMBER */}
                {showInviteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/30 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                            <button
                                onClick={() => { setShowInviteModal(false); setLastInviteUrl(null); }}
                                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-brand-yellow/10 text-brand-yellow">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Invite Team Member</h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400">Dispatch invite via Email and SMS</p>
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

                                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                                        <span className="text-xs font-mono text-slate-700 dark:text-gray-300 truncate">{lastInviteUrl}</span>
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
                                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white font-bold text-xs"
                                        >
                                            Invite Another
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleInviteSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                                            Employee Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={inviteForm.fullName}
                                            onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                                            placeholder="e.g. Sarah Mwangi"
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                                                Work Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={inviteForm.email}
                                                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                                placeholder="sarah@company.com"
                                                className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                                                Phone (for SMS Link) *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={inviteForm.phone}
                                                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                                                placeholder="+254712345678"
                                                className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                                                Role
                                            </label>
                                            <select
                                                value={inviteForm.role}
                                                onChange={(e: any) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                            >
                                                <option value="EMPLOYEE">Employee / Rider</option>
                                                <option value="BILLING_LEAD">Billing Lead</option>
                                                <option value="ADMIN">Corporate Admin</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                                                Department
                                            </label>
                                            <input
                                                type="text"
                                                value={inviteForm.department}
                                                onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                                                placeholder="e.g. Sales, IT, Ops"
                                                className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
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

                {/* MODAL 2: TOP UP WALLET WITH MOBILE MONEY, CARD & BANK VIRTUAL ACCOUNT */}
                {showTopUpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/30 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
                            <button
                                onClick={() => setShowTopUpModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Top Up Corporate Treasury</h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400">Preload balance for company-billed employee rides</p>
                                </div>
                            </div>

                            {topUpSuccessMsg ? (
                                <div className="p-6 text-center space-y-3 animate-fade-in">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{topUpSuccessMsg}</h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400">Your corporate balance has been immediately credited and available to your team.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleTopUpSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
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
                                                            : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/40'
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
                                            className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                                            Select Treasury Funding Channel
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setTopUpMethod('MPESA')}
                                                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                                                    topUpMethod === 'MPESA'
                                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                                        : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400'
                                                }`}
                                            >
                                                Mobile Money STK
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTopUpMethod('CARD')}
                                                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                                                    topUpMethod === 'CARD'
                                                        ? 'border-brand-yellow bg-brand-yellow/10 text-brand-yellow'
                                                        : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400'
                                                }`}
                                            >
                                                Corporate Card
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTopUpMethod('BANK_TRANSFER')}
                                                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                                                    topUpMethod === 'BANK_TRANSFER'
                                                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                                        : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400'
                                                }`}
                                            >
                                                Bank EFT / RTGS
                                            </button>
                                        </div>
                                    </div>

                                    {topUpMethod === 'MPESA' && (
                                        <div className="animate-fade-in space-y-1.5">
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1">
                                                Mobile Money Phone Number (Instant STK Push)
                                            </label>
                                            <input
                                                type="tel"
                                                value={topUpPhone}
                                                onChange={(e) => setTopUpPhone(e.target.value)}
                                                placeholder="+254712345678"
                                                className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                            />
                                            <span className="text-[11px] text-gray-500 block">
                                                A prompt will pop up on your mobile handset immediately to enter your secret PIN.
                                            </span>
                                        </div>
                                    )}

                                    {topUpMethod === 'BANK_TRANSFER' && (
                                        <div className="animate-fade-in p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                <span>Virtual Dedicated Bank Account:</span>
                                                <span className="text-[10px] text-emerald-400 font-mono">Real-time Settlement</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-gray-400 text-[11px]">
                                                <div>Bank: <strong className="text-slate-700 dark:text-gray-200">Standard Chartered / KCB</strong></div>
                                                <div>Branch: <strong className="text-slate-700 dark:text-gray-200">Westlands HQ</strong></div>
                                                <div>Account Name: <strong className="text-slate-700 dark:text-gray-200">Cabi - {account?.companyName || 'Enterprise'}</strong></div>
                                                <div>Virtual IBAN: <strong className="text-brand-yellow font-mono">9088-2938-11</strong></div>
                                                <div>Swift Code: <strong className="text-slate-700 dark:text-gray-200 font-mono">SCBLKENX</strong></div>
                                                <div>Reference: <strong className="text-slate-700 dark:text-gray-200 font-mono">{account?.id || 'CABI-CORP'}</strong></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={topUpSubmitting}
                                            className="w-full py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
                                        >
                                            {topUpSubmitting 
                                                ? 'Processing Payment...' 
                                                : topUpMethod === 'BANK_TRANSFER'
                                                    ? `Confirm KES ${topUpAmount.toLocaleString()} Bank Allocation`
                                                    : `Confirm KES ${topUpAmount.toLocaleString()} Top Up`}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL 3: BULK CSV IMPORT & 1-CLICK RIDE PLATFORM MIGRATION */}
                {showMigrationModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/30 rounded-2xl w-full max-w-3xl p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => { setShowMigrationModal(false); setParsedData(null); setCsvFileContent(''); setCsvFileName(''); setImportSummary(null); }}
                                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-2xl bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                        Bulk Employee Import & Platform Migration
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-gray-400">
                                        Migrate your staff from Uber for Business, Bolt for Business, Little Cab Corporate, or any CSV roster
                                    </p>
                                </div>
                            </div>

                            {/* Preset Format Selection Tabs */}
                            <div className="mb-6">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                                    Select Source Platform or Template Format:
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {[
                                        { id: 'AUTO', name: 'Auto-Detect', icon: Sparkles },
                                        { id: 'CABI', name: 'Cabi Standard', icon: FileText },
                                        { id: 'UBER_BUSINESS', name: 'Uber for Business', icon: Layers },
                                        { id: 'BOLT_BUSINESS', name: 'Bolt Business', icon: Car },
                                        { id: 'LITTLE_CAB', name: 'Little Corporate', icon: Briefcase }
                                    ].map((preset) => {
                                        const IconComponent = preset.icon;
                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => handlePlatformChange(preset.id as any)}
                                                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 text-center ${
                                                    migrationPlatform === preset.id
                                                        ? 'border-brand-yellow bg-brand-yellow/15 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                                        : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:border-[#D4AF37]/40'
                                                }`}
                                            >
                                                <IconComponent className="w-4 h-4 text-brand-yellow" />
                                                <span className="text-[11px] truncate w-full">{preset.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Download Sample Template link */}
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 mb-6 text-xs">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                                    <HelpCircle className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                                    <span>Need the clean layout format? Download sample file:</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleDownloadSampleTemplate(migrationPlatform === 'AUTO' ? 'CABI' : migrationPlatform as any)}
                                        className="font-bold text-brand-yellow hover:underline flex items-center gap-1"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Download Template (.CSV)
                                    </button>
                                </div>
                            </div>

                            {/* Upload Zone */}
                            {!csvFileContent ? (
                                <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-8 text-center hover:border-brand-yellow transition-colors relative mb-6">
                                    <input
                                        type="file"
                                        accept=".csv,text/csv"
                                        onChange={handleCsvFileSelected}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 text-brand-yellow flex items-center justify-center">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                                            Click to upload or drag and drop your employee CSV file
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-gray-400 max-w-sm">
                                            Accepts standard CSV exports with headers like Full Name, Email, Phone, Department, and Monthly Limit
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* File Header Bar */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="w-5 h-5 text-brand-yellow" />
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">{csvFileName}</div>
                                                <div className="text-[11px] text-gray-500">
                                                    Detected Platform: <strong className="text-brand-yellow">{parsedData?.detectedPlatform}</strong> • {parsedData?.totalRows} Rows
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                                                Change File
                                                <input
                                                    type="file"
                                                    accept=".csv,text/csv"
                                                    onChange={handleCsvFileSelected}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Default Mapping Overrides */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10">
                                        <div>
                                            <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1">
                                                Fallback Department (if blank in CSV)
                                            </label>
                                            <input
                                                type="text"
                                                value={defaultDepartment}
                                                onChange={(e) => {
                                                    setDefaultDepartment(e.target.value);
                                                    if (csvFileContent) {
                                                        setParsedData(parseMigrationCsv(csvFileContent, migrationPlatform, { department: e.target.value, defaultLimit }));
                                                    }
                                                }}
                                                className="w-full bg-white dark:bg-card-dark border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-1">
                                                Default Monthly Travel Limit (KES)
                                            </label>
                                            <input
                                                type="number"
                                                value={defaultLimit}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    setDefaultLimit(val);
                                                    if (csvFileContent) {
                                                        setParsedData(parseMigrationCsv(csvFileContent, migrationPlatform, { department: defaultDepartment, defaultLimit: val }));
                                                    }
                                                }}
                                                className="w-full bg-white dark:bg-card-dark border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Parsed Preview Table */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                Verification Preview ({parsedData?.validCount} ready, {parsedData?.errorCount} with errors)
                                            </span>
                                            <span className="text-[11px] text-gray-500">Showing first rows</span>
                                        </div>

                                        <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-xl max-h-60 overflow-y-auto">
                                            <table className="w-full text-left text-xs text-slate-700 dark:text-gray-300">
                                                <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] tracking-wider text-slate-600 dark:text-gray-400 sticky top-0 backdrop-blur-md">
                                                    <tr>
                                                        <th className="py-2.5 px-3">Status</th>
                                                        <th className="py-2.5 px-3">Name</th>
                                                        <th className="py-2.5 px-3">Email</th>
                                                        <th className="py-2.5 px-3">Normalized Phone</th>
                                                        <th className="py-2.5 px-3">Department</th>
                                                        <th className="py-2.5 px-3">Role</th>
                                                        <th className="py-2.5 px-3">Monthly Cap</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-medium">
                                                    {parsedData?.rows.map((row) => (
                                                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                                            <td className="py-2 px-3">
                                                                {row.isValid ? (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                                                                        <CheckCircle2 className="w-3 h-3" /> Valid
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit" title={row.errors.join('; ')}>
                                                                        <AlertCircle className="w-3 h-3" /> Error
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                                                                {row.fullName}
                                                            </td>
                                                            <td className="py-2 px-3 font-mono text-[11px]">{row.email}</td>
                                                            <td className="py-2 px-3 font-mono text-[11px] text-gray-400">{row.phone}</td>
                                                            <td className="py-2 px-3">{row.department}</td>
                                                            <td className="py-2 px-3">
                                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-mono font-bold">
                                                                    {row.role}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                                                                KES {row.monthlyLimit?.toLocaleString() || defaultLimit.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Import Summary Feedback if already executed */}
                                    {importSummary && (
                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1 animate-fade-in">
                                            <div className="font-bold flex items-center gap-1.5 text-sm">
                                                <CheckCircle2 className="w-4 h-4" /> Migration Complete!
                                            </div>
                                            <div>
                                                Successfully onboarded <strong>{importSummary.added}</strong> new corporate riders. ({importSummary.skipped} duplicates skipped).
                                            </div>
                                            <div className="text-gray-400">
                                                Welcome invitation tokens have been generated and dispatched to the employee roster.
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => { setCsvFileContent(''); setParsedData(null); setImportSummary(null); }}
                                            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white font-bold text-xs"
                                        >
                                            Reset / Pick Another File
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleExecuteBulkImport}
                                            disabled={isImporting || !parsedData || parsedData.validCount === 0}
                                            className="px-6 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isImporting ? 'Importing Employees...' : `Import & Invite ${parsedData?.validCount || 0} Employees`}
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
