'use client';

import Link from 'next/link';

export default function DashboardPage() {
    const userName = "Jane";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center z-10">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="text-2xl font-bold">Cabi</Link>
                    <nav className="hidden md:flex space-x-6 text-sm font-medium">
                        <Link href="/dashboard" className="text-black">Dashboard</Link>
                        <Link href="/account/profile" className="text-gray-500 hover:text-black">Profile</Link>
                        <Link href="/my-trips" className="text-gray-500 hover:text-black">My Trips</Link>
                        <Link href="/account/payments" className="text-gray-500 hover:text-black">Payment Methods</Link>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-sm font-bold">{userName}</div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                        JD
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Welcome back, {userName}!</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Book a Ride Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-8xl">🚗</span>
                        </div>
                        <h2 className="text-xl font-bold mb-2 relative z-10">Book a Ride</h2>
                        <p className="text-gray-500 mb-6 relative z-10">Need to go somewhere? Get a reliable ride in minutes.</p>
                        <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded-xl font-bold relative z-10 hover:bg-gray-800">
                            Book Now
                        </Link>
                    </div>

                    {/* My Trips Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-8xl">🗺️</span>
                        </div>
                        <h2 className="text-xl font-bold mb-2 relative z-10">My Trips</h2>
                        <p className="text-gray-500 mb-6 relative z-10">View your ride history, receipts, and lost items.</p>
                        <Link href="/my-trips" className="inline-block bg-gray-100 text-black px-6 py-3 rounded-xl font-bold relative z-10 hover:bg-gray-200">
                            View History
                        </Link>
                    </div>

                    {/* Account Settings Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-8xl">⚙️</span>
                        </div>
                        <h2 className="text-xl font-bold mb-2 relative z-10">Account Settings</h2>
                        <p className="text-gray-500 mb-6 relative z-10">Manage payment methods, profile details, and security.</p>
                        <Link href="/account/profile" className="inline-block bg-gray-100 text-black px-6 py-3 rounded-xl font-bold relative z-10 hover:bg-gray-200">
                            Manage Account
                        </Link>
                    </div>
                </div>

                {/* Recent Activity Mini-Section */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">
                                    🏁
                                </div>
                                <div>
                                    <div className="font-bold">Trip to 456 Valencia St</div>
                                    <div className="text-sm text-gray-500">Yesterday • $15.50</div>
                                </div>
                            </div>
                            <Link href="/trip/trip_101" className="text-sm font-bold underline">View Receipt</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
