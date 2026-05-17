import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import SafetyTab from '@/components/dashboard/SafetyTab';

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
    const [userRole, setUserRole] = React.useState<'passenger' | 'driver'>('driver');
    const [hasOrganization, setHasOrganization] = React.useState(true); // Default to true for detail view
    const [activeTab, setActiveTab] = React.useState<'overview' | 'analytics' | 'network' | 'wallet' | 'vehicles' | 'safety'>('overview');
    const [referralCode, setReferralCode] = React.useState('REF-INVITE');
    const [isConnectingSacco, setIsConnectingSacco] = React.useState(false);
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);

    const connectSacco = async () => {
        setIsConnectingSacco(true);
        // Simulate API call to external Sacco system
        await new Promise(r => setTimeout(r, 2000));
        alert('Successfully connected to Nairobi Central Sacco API!');
        setIsConnectingSacco(false);
    };

    const { user, logout } = useAuth();

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
            if (user.role) setUserRole(user.role as any);
            if (user.referralCode) setReferralCode(user.referralCode);
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-brand-black text-slate-900 dark:text-white flex font-sans text-sm md:text-base transition-colors duration-300">
            <Head>
                <title>Dashboard - Cabi</title>
            </Head>

            {/* Sidebar Mock */}
            <aside className="w-64 border-r border-slate-200 dark:border-white/10 p-6 hidden md:block bg-white/50 dark:bg-brand-black/50 backdrop-blur-md sticky top-0 h-screen flex flex-col">
                <div className="flex-1">
                    <div className="text-2xl font-black mb-10 px-2 flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-yellow rounded-md flex items-center justify-center text-black text-xs font-black">C</div>
                        <span className="tracking-tighter">Cabi<span className="text-brand-yellow">.</span></span>
                    </div>

                    <nav className="space-y-1 mb-10">
                        <Link href="/" className="group flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 transition-all font-bold text-sm">
                            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" /> Home
                        </Link>

                        <div className="py-4">
                            <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-2">Menu</div>
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all font-bold text-sm mb-1 ${activeTab === 'overview' ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/20' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                            >
                                <LayoutDashboard className="w-4 h-4" /> Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all font-bold text-sm mb-1 ${activeTab === 'analytics' ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/20' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                            >
                                <BarChart3 className="w-4 h-4" /> Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('network')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all font-bold text-sm mb-1 ${activeTab === 'network' ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/20' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                            >
                                <Users className="w-4 h-4" /> My Network
                            </button>
                            <button
                                onClick={() => setActiveTab('vehicles')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all font-bold text-sm mb-1 ${activeTab === 'vehicles' ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/20' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                            >
                                <Car className="w-4 h-4" /> My Vehicles
                            </button>
                            <button
                                onClick={() => setActiveTab('wallet')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all font-bold text-sm mb-1 ${activeTab === 'wallet' ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/20' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                            >
                                <Wallet className="w-4 h-4" /> Wallet
                            </button>
                            <button
                                onClick={() => setActiveTab('safety')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all font-bold text-sm mb-1 ${activeTab === 'safety' ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/20' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                            >
                                <Shield className="w-4 h-4" /> Safety &amp; Incidents
                            </button>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                            <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-2">Account</div>
                            <Link href="/settings/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 transition-all font-bold text-sm">
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
            <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
                {/* Modern subtle background glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-[2px] bg-brand-yellow rounded-full"></span>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-yellow">Dashboard</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Welcome back, <span className="text-brand-yellow">{user?.firstName || user?.fullName || 'User'}</span>
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Active as <span className="capitalize font-bold text-slate-700 dark:text-slate-200">{userRole}</span>
                            {userRole === 'driver' && <span className="opacity-50 text-sm">({hasOrganization ? 'Organization Member' : 'Independent'})</span>}
                        </p>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-4 group focus:outline-none"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-brand-yellow transition-colors tracking-tight">
                                    {user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName}` : 'Cabi User')}
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Diamond Member</div>
                            </div>
                            <div className={`w-14 h-14 rounded-lg bg-gradient-to-tr from-brand-yellow to-brand-accent p-[2px] shadow-lg shadow-brand-yellow/10 group-hover:scale-105 transition-all ${showProfileMenu ? 'scale-105 rotate-3' : ''}`}>
                                <div className="w-full h-full rounded-lg bg-white dark:bg-brand-black flex items-center justify-center text-2xl border-2 border-white dark:border-brand-black overflow-hidden relative">
                                    {user?.profilePictureUrl ? (
                                        <img src={user.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-slate-400" />
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
                                <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-brand-dark rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
                                    <div className="p-6 border-b border-slate-100 dark:border-white/10">
                                        <div className="font-black text-slate-900 dark:text-white">Account Info</div>
                                        <div className="text-xs text-slate-500">ID: {user?.id || 'CABI-4920-X'}</div>
                                    </div>
                                    <div className="p-2">
                                        <Link href="/settings/profile" className="flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-bold text-sm">
                                            <User className="w-4 h-4" /> View Profile
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 p-4 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-bold text-sm"
                                        >
                                            <LogOut className="w-4 h-4" /> Log Out
                                        </button>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-black/20 text-center">
                                        <div className="text-[10px] font-black uppercase text-slate-400">Security Level: High</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Dynamic Content Based on Tab */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
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
                                    <button className="px-8 py-4 bg-slate-900 dark:bg-brand-yellow text-white dark:text-black font-black rounded-lg hover:scale-105 transition-all active:scale-95 shadow-xl shadow-brand-yellow/10 text-sm">
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
                                    icon: userRole === 'driver' ? <Car className="w-5 h-5 text-brand-accent" /> : <MapPin className="w-5 h-5 text-brand-accent" />
                                },
                                {
                                    label: userRole === 'driver' ? 'Driver Rating' : 'Loyalty Points',
                                    value: userRole === 'driver' ? '4.95' : '850',
                                    trend: 'Top 1%',
                                    color: 'brand-purple',
                                    icon: <Star className="w-5 h-5 text-brand-purple" />
                                }
                            ].map((stat, idx) => (
                                <div key={idx} className="glass p-8 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-brand-yellow/30 transition-all duration-500 group relative overflow-hidden bg-white/40 dark:bg-white/5">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-25 transition-opacity text-5xl translate-x-4 -translate-y-4">
                                        {stat.icon}
                                    </div>
                                    <h3 className="text-slate-500 dark:text-gray-500 text-[10px] uppercase font-black tracking-widest mb-4">{stat.label}</h3>
                                    <div className="flex items-end justify-between">
                                        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</div>
                                        <div className={`text-[10px] font-black px-2 py-1 rounded ${idx === 0 ? 'bg-green-500/10 text-green-500' : stat.trend.includes('%') ? 'bg-brand-yellow/10 text-brand-yellow' : 'bg-brand-accent/10 text-brand-accent'}`}>
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

                                    {/* Sacco/Org Status */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-brand-purple/20 to-black/40 p-8 rounded-xl border border-brand-purple/30 group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-[100px] group-hover:bg-brand-purple/20 transition-all duration-700"></div>
                                        <div className="relative z-10">
                                            <h2 className="text-xl font-bold mb-2">Nairobi Central Sacco</h2>
                                            <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">Connected Partner Organization</p>

                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/5">
                                                    <div className="text-slate-500 dark:text-gray-500 text-xs font-bold uppercase mb-1">Welfare Fund</div>
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
                                                className="w-full py-4 bg-brand-purple text-white font-bold rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-purple/20"
                                            >
                                                {isConnectingSacco ? (
                                                    <span className="animate-spin text-xl">◌</span>
                                                ) : (
                                                    <>
                                                        <Building2 className="w-4 h-4" /> View Sacco Portal (External API)
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
                                            <MapPin className="w-5 h-5 text-brand-accent" /> Frequent Places
                                        </h2>
                                        <div className="space-y-4">
                                            {[
                                                { icon: '🏠', name: 'Home', addr: 'Westlands, Woodvale Grove' },
                                                { icon: '💼', name: 'Work', addr: 'Kenyatta Ave, CBD' },
                                                { icon: '🏋️', name: 'Gym', addr: 'Lavington Mall, 2nd Floor' }
                                            ].map((place, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-xl grayscale hover:grayscale-0 transition-all">
                                                        {place.icon === '🏠' ? <Home className="w-5 h-5" /> : place.icon === '💼' ? <Briefcase className="w-5 h-5" /> : <Heart className="w-5 h-5" /> }
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
                                    <div className="relative overflow-hidden bg-gradient-to-br from-brand-accent/20 to-black/40 p-8 rounded-xl border border-brand-accent/30 group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-[100px] group-hover:bg-brand-accent/20 transition-all duration-700"></div>
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
                                                        <span>✓</span> Business Trips Allowed
                                                    </li>
                                                    <li className="flex items-center gap-2 text-slate-400">
                                                        <span>✓</span> Premium Class Eligible
                                                    </li>
                                                    <li className="flex items-center gap-2 text-slate-400">
                                                        <span>✓</span> 24/7 Cabi Support
                                                    </li>
                                                </ul>
                                            </div>

                                            <Link href="#" className="w-full py-4 bg-brand-accent text-brand-black font-bold rounded-lg hover:opacity-80 transition-all flex items-center justify-center gap-3">
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
                                                <h2 className="text-2xl font-bold mb-2">Join or Start an Organization</h2>
                                                <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
                                                    Unlock fleet management tools, welfare support, and investment opportunities. Register your own fleet or join an existing Sacco.
                                                </p>
                                            </div>
                                            <div className="flex gap-4">
                                                <Link href="/organizations/register" className="px-6 py-3 bg-brand-accent text-brand-black font-bold rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] transform hover:-translate-y-1 text-sm">
                                                    Register Organization
                                                </Link>
                                                <Link href="#" className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10 text-sm">
                                                    Find Sacco
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Has Organization View
                                    <div className="bg-gradient-to-r from-brand-purple/20 to-brand-black p-8 rounded-3xl border border-brand-purple/30 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-[80px]"></div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <div className="inline-block px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple text-xs font-bold mb-3">My Organization</div>
                                                    <h2 className="text-2xl font-bold">Nairobi Central Sacco</h2>
                                                    <p className="text-gray-400 text-sm">Member since Dec 2024</p>
                                                </div>
                                                <button className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors">
                                                    Leave Organization
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-brand-purple/50 transition-colors cursor-pointer group">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1 group-hover:text-brand-purple">Welfare</div>
                                                    <div className="text-lg font-bold">Active</div>
                                                </div>
                                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-brand-purple/50 transition-colors cursor-pointer group">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1 group-hover:text-brand-purple">Investments</div>
                                                    <div className="text-lg font-bold">KES 50k</div>
                                                </div>
                                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-brand-purple/50 transition-colors cursor-pointer group">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1 group-hover:text-brand-purple">Fleet Size</div>
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
                                                <span className="font-bold text-green-500 flex items-center gap-1">✓ Valid</span>
                                            </div>
                                            <div className="flex justify-between text-sm py-2 border-b border-dashed border-slate-200 dark:border-white/5">
                                                <span className="text-slate-500">Inspection</span>
                                                <span className="font-bold text-green-500 flex items-center gap-1">✓ Passed</span>
                                            </div>
                                        </div>
                                        <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                            <span>⚙️</span> Manage Settings
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
                                    className="px-6 py-3 bg-brand-purple text-white font-black rounded-lg text-sm shadow-xl shadow-brand-purple/20 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {isConnectingSacco ? (
                                        <span className="animate-spin text-lg">◌</span>
                                    ) : (
                                        <>
                                            <Building2 className="w-4 h-4" /> Sacco Link
                                        </>
                                    )}
                                </button>
                                <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-lg text-sm shadow-xl">Top Up</button>
                                <button className="px-6 py-3 bg-brand-yellow text-black font-black rounded-lg text-sm shadow-xl shadow-brand-yellow/20">Withdraw</button>
                            </div>
                        </div>

                        {/* Card Component */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative overflow-hidden bg-slate-900 rounded-[1.25rem] p-10 text-white min-h-[280px] shadow-2xl">
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
                                    { title: 'Top-up via M-Pesa', type: 'Deposit', amount: '+2,000', color: 'text-green-500', date: 'Yesterday' },
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
