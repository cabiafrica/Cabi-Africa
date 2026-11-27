import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import SafetyTab from '@/components/dashboard/SafetyTab';
import BrandLogo from '@/components/ui/BrandLogo';

import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import ReferralNetworkVisualizer from '@/components/dashboard/ReferralNetworkVisualizer';
import { 
    Home, 
    LayoutDashboard, 
    BarChart3, 
    Users, 
    Car, 
    Wallet, 
    Settings, 
    Settings2,
    LogOut, 
    User,
    ChevronRight,
    Search,
    Bell,
    ExternalLink,
    DollarSign,
    MapPin,
    Star,
    Clock,
    Briefcase,
    Heart,
    Check,
    CheckCircle2,
    Building2,
    Plus,
    Gift,
    ShieldCheck,
    Shield,
    CreditCard,
    Zap
} from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [userRole, setUserRole] = React.useState<'passenger' | 'driver'>('passenger');
    const [hasOrganization, setHasOrganization] = React.useState(true); // Default to true for detail view
    const [activeTab, setActiveTab] = React.useState<'overview' | 'analytics' | 'network' | 'wallet' | 'vehicles' | 'safety'>('overview');
    const [referralCode, setReferralCode] = React.useState('REF-INVITE');
    const [isConnectingSacco, setIsConnectingSacco] = React.useState(false);
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const connectSacco = async () => {
        setIsConnectingSacco(true);
        // Simulate API call to external Wealth Creation system
        await new Promise(r => setTimeout(r, 2000));
        alert('Successfully connected to Nairobi Wealth & Asset Cooperative API!');
        setIsConnectingSacco(false);
    };

    const { user, logout } = useAuth();

    React.useEffect(() => {
        if (mounted && !user) {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || localStorage.getItem('token') : null;
            if (!token) {
                router.replace('/login?redirect=/dashboard');
            }
        }
    }, [mounted, user, router]);

    React.useEffect(() => {
        if (router.isReady && router.query.tab) {
            const tab = router.query.tab as string;
            if (['overview', 'analytics', 'network', 'wallet', 'vehicles', 'safety'].includes(tab)) {
                setActiveTab(tab as any);
            }
        }
    }, [router.isReady, router.query.tab]);

    React.useEffect(() => {
        if (user) {
            if (user.role === 'driver' || user.driverProfileId) {
                // If user is a driver and came explicitly with driver query, set driver role
                if (router.query.role === 'driver') {
                    setUserRole('driver');
                }
            }
            if (user.referralCode) setReferralCode(user.referralCode);
        }
    }, [user, router.query.role]);

    const sidebarItems = userRole === 'driver' ? [
        { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
        { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
        { id: 'network' as const, label: 'My Network', icon: Users },
        { id: 'vehicles' as const, label: 'My Vehicles', icon: Car },
        { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
        { id: 'safety' as const, label: 'Safety & Incidents', icon: Shield },
    ] : [
        { id: 'overview' as const, label: 'Overview & Rides', icon: LayoutDashboard },
        { id: 'wallet' as const, label: 'Ride Wallet', icon: Wallet },
        { id: 'network' as const, label: 'Referral Rewards', icon: Users },
        { id: 'safety' as const, label: 'Safety & SOS', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-brand-black text-slate-900 dark:text-white flex font-sans text-sm md:text-base transition-colors duration-300">
            <Head>
                <title>Dashboard - Cabi</title>
            </Head>

            {/* Sidebar Mock */}
            <aside className="w-64 border-r border-slate-200 dark:border-white/10 p-6 hidden md:block bg-white/50 dark:bg-brand-black/50 backdrop-blur-md sticky top-0 h-screen flex flex-col">
                <div className="flex-1">
                    <Link href="/" className="mb-10 px-2 inline-flex items-center">
                        <BrandLogo size="md" />
                    </Link>

                    <nav className="space-y-1 mb-10">
                        <Link href="/" className="group flex items-center gap-3 p-3 rounded-[3px] hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 transition-all font-bold text-sm">
                            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" /> Home
                        </Link>

                        <div className="py-4">
                            <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-2">Menu</div>
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const active = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-[3px] transition-all font-bold text-sm mb-1 ${
                                            active
                                                ? 'bg-brand-yellow text-black shadow-sm font-black'
                                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" /> {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                            <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-2">Account</div>
                            <Link href="/settings/profile" className="flex items-center gap-3 p-3 rounded-[3px] hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 transition-all font-bold text-sm">
                                <Settings className="w-4 h-4" /> Profile Settings
                            </Link>
                        </div>
                    </nav>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-white/10 opacity-50">
                    <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">System v1.2.4</div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto relative min-w-0">
                {/* Mobile Navigation Tabs (Visible below md) */}
                <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
                    {sidebarItems.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    active
                                        ? 'bg-brand-yellow text-black shadow-sm'
                                        : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                {/* Modern subtle background glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                {/* Header with Golden Separator */}
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-8 h-[2px] bg-brand-yellow rounded-[3px]"></span>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-yellow">User Operations Portal</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                Welcome back, <span className="text-brand-yellow">{mounted ? (user?.firstName || user?.fullName || 'User') : 'User'}</span>
                            </h1>
                            <p className="text-slate-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Active as <span className="capitalize font-bold text-slate-700 dark:text-slate-200">{userRole === 'driver' ? 'Captain (Driver)' : 'Rider (Passenger)'}</span>
                                {userRole === 'driver' && <span className="opacity-50 text-sm">({hasOrganization ? 'Organization Member' : 'Independent'})</span>}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            {/* Contextual Role Switcher Pill */}
                            <div className="inline-flex p-1 rounded-[3px] bg-slate-200/80 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 shadow-sm">
                                <button
                                    onClick={() => {
                                        setUserRole('passenger');
                                        if (activeTab === 'vehicles' || activeTab === 'analytics') setActiveTab('overview');
                                    }}
                                    className={`px-3 py-1.5 rounded-[3px] text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                                        userRole === 'passenger'
                                            ? 'bg-brand-yellow text-black shadow-sm'
                                            : 'text-slate-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                                    }`}
                                >
                                    <User className="w-3.5 h-3.5" />
                                    <span>Rider View</span>
                                </button>
                                <button
                                    onClick={() => setUserRole('driver')}
                                    className={`px-3 py-1.5 rounded-[3px] text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                                        userRole === 'driver'
                                            ? 'bg-brand-yellow text-black shadow-sm'
                                            : 'text-slate-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                                    }`}
                                >
                                    <Car className="w-3.5 h-3.5" />
                                    <span>Captain View</span>
                                </button>
                            </div>

                            <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-4 group focus:outline-none cursor-pointer"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-brand-yellow transition-colors tracking-tight">
                                        {mounted ? (user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName}` : 'Cabi User')) : 'Cabi User'}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Diamond Member</div>
                                </div>
                                <div className={`w-12 h-12 rounded-[3px] bg-gradient-to-tr from-[#FACC15] to-[#D4AF37] p-[2px] shadow-sm group-hover:scale-105 transition-all ${showProfileMenu ? 'scale-105' : ''}`}>
                                    <div className="w-full h-full rounded-[3px] bg-white dark:bg-brand-black flex items-center justify-center text-xl border border-white dark:border-brand-black overflow-hidden relative">
                                        {mounted && user?.profilePictureUrl ? (
                                            <img src={user.profilePictureUrl} alt={`${user?.fullName || 'CABI User'} verified account profile photo`} width={48} height={48} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-slate-400" />
                                        )}
                                        {showProfileMenu && <div className="absolute inset-0 bg-brand-yellow/20 backdrop-blur-[2px]"></div>}
                                    </div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowProfileMenu(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-brand-dark rounded-[3px] border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
                                        <div className="p-4 border-b border-slate-100 dark:border-white/10">
                                            <div className="font-black text-slate-900 dark:text-white">Account Info</div>
                                            <div className="text-xs text-slate-500 font-mono">ID: {user?.id || 'CABI-4920-X'}</div>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <Link href="/settings/profile" className="flex items-center gap-3 p-3 rounded-[3px] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-bold text-xs">
                                                <User className="w-4 h-4 text-amber-500" /> View Profile
                                            </Link>
                                            <button
                                                onClick={logout}
                                                className="w-full flex items-center gap-3 p-3 rounded-[3px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-bold text-xs cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" /> Log Out
                                            </button>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-black/20 text-center border-t border-slate-100 dark:border-white/5">
                                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Security Level: High</div>
                                        </div>
                                    </div>
                                </>
                            )}
                            </div>
                        </div>
                    </div>
                    {/* Golden Separator */}
                    <div className="golden-separator my-4"></div>
                </header>

                {/* Dynamic Content Based on Tab */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        {/* 1-Tap Passenger Booking Callout */}
                        {userRole === 'passenger' && (
                            <div className="relative group overflow-hidden bg-gradient-to-r from-brand-yellow/15 via-[#D4AF37]/10 to-transparent p-6 rounded-2xl border border-brand-yellow/30 backdrop-blur-md mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-brand-yellow/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-brand-yellow text-black flex items-center justify-center font-black text-xl shadow-md shrink-0">
                                        <Car className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Need a Ride Right Now?</h3>
                                        <p className="text-xs text-slate-600 dark:text-gray-300 mt-0.5">Instant booking across Nairobi with precision ETA, verified captains, and M-Pesa / Airtel Money settlement.</p>
                                    </div>
                                </div>
                                <Link
                                    href="/#booking-section"
                                    className="px-6 py-3 bg-brand-yellow text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2"
                                >
                                    <span>Book Precision Ride</span>
                                    <span>&rarr;</span>
                                </Link>
                            </div>
                        )}

                        {/* Referral Section - Modern Glassmorphism */}
                        <div className="relative group overflow-hidden bg-gradient-to-r from-brand-yellow/10 to-transparent p-8 rounded-[1.25rem] border border-brand-yellow/20 backdrop-blur-sm mb-10">
                            <div className="absolute top-0 right-0 w-64 h-full bg-brand-yellow/5 skew-x-[-20deg] translate-x-32 group-hover:translate-x-12 transition-transform duration-1000"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="text-center md:text-left">
                                    <div className="inline-block px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-yellow text-[10px] font-black uppercase tracking-widest mb-4">
                                        Partner Program
                                    </div>
                                    <h3 className="text-4xl font-black mb-2 text-slate-900 dark:text-white tracking-tighter">Invite & Earn Rewards</h3>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm max-w-lg leading-relaxed">
                                        Your network is your net worth. Build your <span className="text-brand-yellow font-bold">Business Builder</span> organization today and unlock recurring revenue from every trip.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl">
                                    <div className="px-6 py-3 rounded-lg bg-white dark:bg-brand-black/40 border border-slate-200 dark:border-white/5 font-mono text-xl font-black text-brand-yellow tracking-[0.2em]">
                                        {referralCode}
                                    </div>
                                    <button className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FACC15] text-black font-black rounded-lg hover:scale-105 transition-all active:scale-95 shadow-xl shadow-[#D4AF37]/20 text-sm">
                                        Copy Code
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Stats - Modern Minimalist */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {[
                                {
                                    label: userRole === 'driver' ? 'Earnings (Net)' : 'Wallet Balance',
                                    value: `KES ${userRole === 'driver' ? '124,450' : '12,450'}`,
                                    trend: '+12.5%',
                                    color: 'brand-yellow',
                                    icon: <DollarSign className="w-5 h-5 text-brand-yellow" />
                                },
                                {
                                    label: userRole === 'driver' ? 'Trips Done' : 'Total Rides',
                                    value: userRole === 'driver' ? '412' : '42',
                                    trend: '+3.2%',
                                    color: 'brand-accent',
                                    icon: userRole === 'driver' ? <Car className="w-5 h-5 text-[#FACC15]" /> : <MapPin className="w-5 h-5 text-[#FACC15]" />
                                },
                                {
                                    label: userRole === 'driver' ? 'Driver Rating' : 'Loyalty Points',
                                    value: userRole === 'driver' ? '4.95' : '850',
                                    trend: 'Top 1%',
                                    color: 'brand-accent',
                                    icon: <Star className="w-5 h-5 text-[#ffe088]" />
                                }
                            ].map((stat, idx) => (
                                <div key={idx} className="glass p-8 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-brand-yellow/30 transition-all duration-500 group relative overflow-hidden bg-white/40 dark:bg-white/5">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-25 transition-opacity text-5xl translate-x-4 -translate-y-4">
                                        {stat.icon}
                                    </div>
                                    <h3 className="text-slate-500 dark:text-gray-500 text-[10px] uppercase font-black tracking-widest mb-4">{stat.label}</h3>
                                    <div className="flex items-end justify-between">
                                        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</div>
                                        <div className={`text-[10px] font-black px-2 py-1 rounded ${idx === 0 ? 'bg-green-500/10 text-green-500' : stat.trend.includes('%') ? 'bg-brand-yellow/10 text-brand-yellow' : 'bg-[#D4AF37]/15 text-[#FACC15]'}`}>
                                            {stat.trend}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Role Specific Details Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            {userRole === 'driver' ? (
                                <>
                                    {/* Driver Stats */}
                                    <div className="glass p-8 rounded-xl border border-slate-200 dark:border-white/5">
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-brand-yellow" /> Driving Performance
                                        </h2>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center bg-slate-100 dark:bg-white/5 p-4 rounded-md">
                                                <span className="text-slate-600 dark:text-gray-400">Hours Online Today</span>
                                                <span className="font-bold text-lg">6.5h</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-100 dark:bg-white/5 p-4 rounded-md">
                                                <span className="text-slate-600 dark:text-gray-400">Weekly Target</span>
                                                <div className="text-right">
                                                    <div className="font-bold">32.5 / 40h</div>
                                                    <div className="w-32 h-2 bg-slate-200 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                                                        <div className="h-full bg-brand-yellow w-[81%] shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-100 dark:bg-white/5 p-4 rounded-md">
                                                <span className="text-slate-600 dark:text-gray-400">Compliance Documents</span>
                                                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-wider">All Clear</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Wealth & Partner Group Status */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-[#D4AF37]/15 to-card-dark p-8 rounded-xl border border-[#D4AF37]/30 group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[100px] group-hover:bg-[#D4AF37]/20 transition-all duration-700"></div>
                                        <div className="relative z-10">
                                            <h2 className="text-xl font-bold mb-2">Nairobi Wealth &amp; Asset Cooperative</h2>
                                            <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">Connected Wealth Creation Partner</p>

                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/5">
                                                    <div className="text-slate-500 dark:text-gray-500 text-xs font-bold uppercase mb-1">Wealth &amp; Welfare Fund</div>
                                                    <div className="text-lg font-bold">KES 14,200</div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/5">
                                                    <div className="text-slate-500 dark:text-gray-500 text-xs font-bold uppercase mb-1">Fleet Rank</div>
                                                    <div className="text-lg font-bold">#4 / 120</div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={connectSacco}
                                                disabled={isConnectingSacco}
                                                className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FACC15] text-black font-black rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#D4AF37]/20"
                                            >
                                                {isConnectingSacco ? (
                                                    <span className="animate-spin text-xl">◌</span>
                                                ) : (
                                                    <>
                                                        <Building2 className="w-4 h-4" /> View Wealth Portal (External API)
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Passenger History */}
                                    <div className="glass p-8 rounded-xl border border-slate-200 dark:border-white/5">
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-[#D4AF37]" /> Frequent Places
                                        </h2>                                        <div className="space-y-4">
                                            {([
                                                { Icon: Home, name: 'Home', addr: 'Westlands, Woodvale Grove' },
                                                { Icon: Briefcase, name: 'Work', addr: 'Kenyatta Ave, CBD' },
                                                { Icon: Heart, name: 'Gym', addr: 'Lavington Mall, 2nd Floor' }
                                            ] as { Icon: React.ElementType, name: string, addr: string }[]).map((place, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center transition-all">
                                                        <place.Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{place.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-gray-500">{place.addr}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Corporate Policy */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-[#FACC15]/15 to-card-dark p-8 rounded-xl border border-[#D4AF37]/30 group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15]/10 rounded-full blur-[100px] group-hover:bg-[#FACC15]/20 transition-all duration-700"></div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h2 className="text-xl font-bold">Gold Tier Member</h2>
                                                    <p className="text-slate-500 dark:text-gray-400 text-sm">Linked to Google Kenya LTD</p>
                                                </div>
                                                <div className="bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    850 Points
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/5">
                                                    <div className="text-slate-500 dark:text-gray-500 text-xs font-bold uppercase mb-1">Carbon Saved</div>
                                                    <div className="text-lg font-bold text-green-400">12.4kg CO2</div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/5">
                                                    <div className="text-slate-500 dark:text-gray-500 text-xs font-bold uppercase mb-1">Corporate Limit</div>
                                                    <div className="text-lg font-bold">KES 50k / mo</div>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/5 mb-6">
                                                <div className="text-slate-500 dark:text-gray-500 text-xs font-bold uppercase mb-2">Travel Policy</div>
                                                <ul className="space-y-2 text-sm">
                                                    <li className="flex items-center gap-2 text-green-500">
                                                        <CheckCircle2 className="w-4 h-4" /> Business Trips Allowed
                                                    </li>
                                                    <li className="flex items-center gap-2 text-slate-400">
                                                        <CheckCircle2 className="w-4 h-4" /> Premium Class Eligible
                                                    </li>
                                                    <li className="flex items-center gap-2 text-slate-400">
                                                        <CheckCircle2 className="w-4 h-4" /> 24/7 Cabi Support
                                                    </li>
                                                </ul>
                                            </div>

                                            <Link href="#" className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FACC15] text-black font-black rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-3">
                                                <Building2 className="w-4 h-4" /> View Corporate Benefits
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Driver - Organization Section */}
                        {/* {userRole === 'driver' && (
                            <div className="mb-10">
                                {!hasOrganization ? (
                                    // Call to Action: Join/Register Org
                                    <div className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-[80px] group-hover:bg-brand-accent/20 transition-all duration-700"></div>

                                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div>
                                                <div className="inline-block px-3 py-1 rounded-full bg-brand-accent/20 text-brand-accent text-xs font-bold mb-3">Scale Your Business</div>
                                                <h2 className="text-2xl font-bold mb-2">Join or Start a Cabi Legacy Partner Group</h2>
                                                <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
                                                    Unlock fleet management tools, welfare support, and Cabi Legacy asset opportunities. Register your own fleet or join an existing Cabi Legacy Cooperative.
                                                </p>
                                            </div>
                                            <div className="flex gap-4">
                                                <Link href="/organizations/register" className="px-6 py-3 bg-brand-accent text-brand-black font-bold rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] transform hover:-translate-y-1 text-sm">
                                                    Register Organization
                                                </Link>
                                                <Link href="#" className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10 text-sm">
                                                    Find Wealth Group
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Has Organization View
                                    <div className="bg-gradient-to-r from-amber-500/20 to-brand-black p-8 rounded-3xl border border-amber-500/30 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-3">My Organization</div>
                                                    <h2 className="text-2xl font-bold">Nairobi Wealth &amp; Asset Cooperative</h2>
                                                    <p className="text-gray-400 text-sm">Member since Dec 2024</p>
                                                </div>
                                                <button className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors">
                                                    Leave Organization
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-amber-500/50 transition-colors cursor-pointer group">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1 group-hover:text-amber-400">Welfare</div>
                                                    <div className="text-lg font-bold">Active</div>
                                                </div>
                                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-amber-500/50 transition-colors cursor-pointer group">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1 group-hover:text-amber-400">Investments</div>
                                                    <div className="text-lg font-bold">KES 50k</div>
                                                </div>
                                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-amber-500/50 transition-colors cursor-pointer group">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1 group-hover:text-amber-400">Fleet Size</div>
                                                    <div className="text-lg font-bold">14 Cars</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )} */}

                        {/* Recent Activity Placeholder */}
                        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Recent Activity</h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-brand-dark flex items-center justify-center">
                                            <Car className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">Trip to CBD</div>
                                            <div className="text-sm text-slate-500 dark:text-gray-400">Today, 2:30 PM</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-right">
                                        <div className="text-slate-900 dark:text-white">KES 450</div>
                                        <div className="text-xs text-green-600 dark:text-green-400">Completed</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && <AnalyticsDashboard role={userRole} />}

                {activeTab === 'network' && (
                    <div className="animate-fade-in">
                        <ReferralNetworkVisualizer referralCode={referralCode} />
                    </div>
                )}

                {activeTab === 'vehicles' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">My Vehicles</h2>
                                <p className="text-slate-500 mt-1">Manage your fleet and vehicle documents</p>
                            </div>
                            <Link href="/vehicles/register" className="px-6 py-3 bg-brand-yellow text-black font-black rounded-lg text-sm shadow-xl shadow-brand-yellow/20 hover:scale-105 transition-all flex items-center gap-2">
                                <span>+</span> Register New Vehicle
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userRole === 'driver' ? (
                                <>
                                    <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-white/5 group hover:border-brand-yellow/50 transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shadow-inner">
                                                    <Car className="w-8 h-8 text-brand-yellow" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg leading-tight">Toyota Fielder</h3>
                                                    <p className="text-xs font-mono text-slate-500 mt-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded inline-block">KCB 123A</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-500/20">Active</span>
                                        </div>
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-sm py-2 border-b border-dashed border-slate-200 dark:border-white/5">
                                                <span className="text-slate-500">Color</span>
                                                <span className="font-bold">Silver</span>
                                            </div>
                                            <div className="flex justify-between text-sm py-2 border-b border-dashed border-slate-200 dark:border-white/5">
                                                <span className="text-slate-500">Insurance</span>
                                                <span className="font-bold text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Valid</span>
                                            </div>
                                            <div className="flex justify-between text-sm py-2 border-b border-dashed border-slate-200 dark:border-white/5">
                                                <span className="text-slate-500">Inspection</span>
                                                <span className="font-bold text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Passed</span>
                                            </div>
                                        </div>
                                        <button className="w-full py-3 bg-surface-dark dark:bg-[#FACC15] text-white dark:text-black border border-[#D4AF37]/30 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                            <Settings2 className="w-4 h-4" /> Manage Settings
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-1 md:col-span-3 py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-white/5">
                                    <div className="w-20 h-20 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Car className="w-10 h-10 text-slate-400 opacity-50" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">Start Your Engine</h3>
                                    <p className="text-slate-500 mb-8 max-w-md mx-auto">You haven't added any vehicles yet. Register a vehicle to start driving or manage a fleet on Cabi.</p>
                                    <div className="flex justify-center gap-4">
                                        <Link href="/vehicles/register" className="px-8 py-4 bg-brand-yellow text-black font-black rounded-xl hover:scale-105 transition-all shadow-xl shadow-brand-yellow/20 text-lg">
                                            Register First Vehicle
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'wallet' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">My Wallet</h2>
                                <p className="text-slate-500 mt-1">Manage your balances and transactions</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={connectSacco}
                                    disabled={isConnectingSacco}
                                    className="px-6 py-3 bg-card-dark border border-[#D4AF37]/40 text-[#FACC15] hover:bg-[#D4AF37]/10 font-black rounded-lg text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {isConnectingSacco ? (
                                        <span className="animate-spin text-lg">◌</span>
                                    ) : (
                                        <>
                                            <Building2 className="w-4 h-4" /> Wealth Portal
                                        </>
                                    )}
                                </button>
                                <button className="px-6 py-3 bg-surface-dark dark:bg-card-dark border border-[#D4AF37]/30 text-white dark:text-[#ffe088] font-black rounded-lg text-sm shadow-xl">Top Up</button>
                                <button className="px-6 py-3 bg-brand-yellow text-black font-black rounded-lg text-sm shadow-xl shadow-brand-yellow/20">Withdraw</button>
                            </div>
                        </div>

                        {/* Card Component */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark via-card-dark to-black border border-[#D4AF37]/30 rounded-[1.25rem] p-10 text-white min-h-[280px] shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="text-2xl font-black">Cabi <span className="text-brand-yellow">Pay</span></div>
                                        <div className="w-12 h-8 bg-white/10 rounded-md backdrop-blur-md"></div>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase font-black tracking-widest text-slate-400 mb-2">Available Balance</div>
                                        <div className="text-5xl font-black tracking-tighter">KES 12,450<span className="text-xl text-brand-yellow ml-2">.00</span></div>
                                    </div>
                                    <div className="flex gap-8">
                                        <div>
                                            <div className="text-[10px] uppercase font-black text-slate-500 mb-1">Card Holder</div>
                                            <div className="text-sm font-bold uppercase tracking-widest">{user?.fullName || 'CABI USER'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-black text-slate-500 mb-1">Expires</div>
                                            <div className="text-sm font-bold">12/28</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass rounded-[1.25rem] p-10 border border-slate-200 dark:border-white/5 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-6">Quick Stats</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="text-slate-500 font-bold">Monthly Spend</div>
                                            <div className="font-black">KES 4,200</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-slate-500 font-bold">Total Cashback</div>
                                            <div className="text-green-500 font-black">+ KES 120</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-slate-500 font-bold">Reward Points</div>
                                            <div className="text-brand-yellow font-black">850 Pts</div>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-4 mt-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 text-slate-400 font-bold hover:border-brand-yellow hover:text-brand-yellow transition-all">
                                    + Add New Method
                                </button>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="mt-12">
                            <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
                            <div className="space-y-4">
                                {[
                                    { title: 'Ride to CBD', type: 'Ride', amount: '-450', color: 'text-slate-900 dark:text-white', date: 'Today, 2:30 PM' },
                                    { title: 'Top-up via Mobile Money', type: 'Deposit', amount: '+2,000', color: 'text-green-500', date: 'Yesterday' },
                                    { title: 'Referral Bonus', type: 'Network', amount: '+150', color: 'text-brand-yellow', date: '2 days ago' },
                                ].map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 glass rounded-xl border border-slate-200 dark:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${tx.type === 'Ride' ? 'bg-slate-100 dark:bg-white/5' : tx.type === 'Deposit' ? 'bg-green-500/10' : 'bg-brand-yellow/10'}`}>
                                                {tx.type === 'Ride' ? <Car className="w-5 h-5" /> : tx.type === 'Deposit' ? <Plus className="w-5 h-5 text-green-500" /> : <Gift className="w-5 h-5 text-brand-yellow" />}
                                            </div>
                                            <div>
                                                <div className="font-bold">{tx.title}</div>
                                                <div className="text-xs text-slate-500">{tx.date}</div>
                                            </div>
                                        </div>
                                        <div className={`text-lg font-black ${tx.color}`}>
                                            KES {tx.amount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'safety' && user && (
                    <SafetyTab userId={user.id} />
                )}
            </main>
        </div>
    );
}
