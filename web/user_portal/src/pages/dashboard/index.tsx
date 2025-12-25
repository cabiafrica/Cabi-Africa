
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-brand-black text-white flex">
            <Head>
                <title>Dashboard - Cabi</title>
            </Head>

            {/* Sidebar Mock */}
            <aside className="w-64 border-r border-white/10 p-6 hidden md:block">
                <div className="text-2xl font-bold mb-10">Cabi <span className="text-brand-yellow">.</span></div>
                <nav className="space-y-4">
                    <Link href="#" className="block p-3 rounded-xl bg-brand-yellow/10 text-brand-yellow font-bold">Overview</Link>
                    <Link href="#" className="block p-3 rounded-xl hover:bg-white/5 text-gray-400">Trips</Link>
                    <Link href="#" className="block p-3 rounded-xl hover:bg-white/5 text-gray-400">Wallet</Link>
                    <div className="pt-4 border-t border-white/5">
                        <Link href="#" className="block p-3 rounded-xl hover:bg-white/5 text-gray-400">Settings</Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-2">Welcome back, User</h1>
                <p className="text-gray-400 mb-8">Role: <span className="text-brand-accent">Organization</span> (Example)</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-2xl">
                        <h3 className="text-gray-400 text-sm uppercase mb-2">Total Revenue</h3>
                        <div className="text-3xl font-bold">KES 0.00</div>
                    </div>
                    <div className="glass p-6 rounded-2xl">
                        <h3 className="text-gray-400 text-sm uppercase mb-2">Active Drivers</h3>
                        <div className="text-3xl font-bold">0</div>
                    </div>
                    <div className="glass p-6 rounded-2xl">
                        <h3 className="text-gray-400 text-sm uppercase mb-2">Total Trips</h3>
                        <div className="text-3xl font-bold">0</div>
                    </div>
                </div>
            </main>
        </div>
    );
}
