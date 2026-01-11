
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
    // For demo purposes, we'll use state to simulate different user roles.
    const [userRole, setUserRole] = React.useState<'passenger' | 'driver'>('driver');
    const [hasOrganization, setHasOrganization] = React.useState(false);

    return (
        <div className="min-h-screen bg-brand-black text-white flex font-sans text-sm md:text-base">
            <Head>
                <title>Dashboard - Cabi</title>
            </Head>

            {/* Sidebar Mock */}
            <aside className="w-64 border-r border-white/10 p-6 hidden md:block bg-brand-black/50 backdrop-blur-md sticky top-0 h-screen">
                <div className="text-2xl font-bold mb-10 tracking-tighter">Cabi <span className="text-brand-yellow">.</span></div>

                <nav className="space-y-2 mb-10">
                    <Link href="/dashboard" className="block p-3 rounded-xl bg-brand-yellow/10 text-brand-yellow font-bold">Overview</Link>
                    <Link href="#" className="block p-3 rounded-xl hover:bg-white/5 text-gray-400 transition-colors">Trips</Link>
                    <Link href="#" className="block p-3 rounded-xl hover:bg-white/5 text-gray-400 transition-colors">Wallet</Link>
                    <div className="pt-4 border-t border-white/5 mt-4">
                        <Link href="#" className="block p-3 rounded-xl hover:bg-white/5 text-gray-400 transition-colors">Settings</Link>
                    </div>
                </nav>

                {/* Role Switcher for Demo */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-3">Simulate State</div>
                    <div className="space-y-2">
                        <button
                            onClick={() => { setUserRole('passenger'); setHasOrganization(false); }}
                            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${userRole === 'passenger' ? 'bg-brand-yellow text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            Passenger
                        </button>
                        <button
                            onClick={() => { setUserRole('driver'); setHasOrganization(false); }}
                            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${userRole === 'driver' && !hasOrganization ? 'bg-brand-accent text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            Driver (Independent)
                        </button>
                        <button
                            onClick={() => { setUserRole('driver'); setHasOrganization(true); }}
                            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${userRole === 'driver' && hasOrganization ? 'bg-brand-purple text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            Driver (In Org)
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, User</h1>
                        <p className="text-gray-400">
                            Current Status: <span className="capitalize text-brand-yellow font-bold">{userRole}</span>
                            {userRole === 'driver' && <span className="text-gray-500 text-sm ml-2">({hasOrganization ? 'Organization Member' : 'Independent'})</span>}
                        </p>
                    </div>
                </header>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-gray-400 text-xs uppercase mb-2 font-bold tracking-wider">Wallet Balance</h3>
                        <div className="text-3xl font-bold">KES 12,450</div>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-gray-400 text-xs uppercase mb-2 font-bold tracking-wider">Total Trips</h3>
                        <div className="text-3xl font-bold">42</div>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-gray-400 text-xs uppercase mb-2 font-bold tracking-wider">Rating</h3>
                        <div className="text-3xl font-bold flex items-center gap-2">
                            4.9 <span className="text-brand-yellow text-xl">★</span>
                        </div>
                    </div>
                </div>

                {/* Driver - Organization Section */}
                {userRole === 'driver' && (
                    <div className="mb-10 animate-fade-in">
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
                )}

                {/* Recent Activity Placeholder */}
                <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-brand-dark flex items-center justify-center text-xl">
                                    🚗
                                </div>
                                <div>
                                    <div className="font-bold">Trip to CBD</div>
                                    <div className="text-sm text-gray-400">Today, 2:30 PM</div>
                                </div>
                            </div>
                            <div className="font-bold text-right">
                                <div>KES 450</div>
                                <div className="text-xs text-green-400">Completed</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
