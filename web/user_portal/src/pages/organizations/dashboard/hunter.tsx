import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { FaPaperPlane, FaSearch, FaCheck } from 'react-icons/fa';

// Mock drivers who are not in any organization
const MOCK_DRIVERS = [
    { id: 'd1', name: 'James Kamau', location: 'Westlands, Nairobi', rating: 4.8, vehicle: 'Toyota Fielder' },
    { id: 'd2', name: 'Sarah Ochieng', location: 'Kilimani, Nairobi', rating: 4.9, vehicle: 'Mazda Demio' },
    { id: 'd3', name: 'Peter Njoroge', location: 'Thika Road, Nairobi', rating: 4.6, vehicle: 'Nissan Tiida' },
    { id: 'd4', name: 'John Doe', location: 'CBD, Nairobi', rating: 4.7, vehicle: 'Toyota Vitz' },
];

export default function HunterDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [invitedDrivers, setInvitedDrivers] = useState<string[]>([]);
    const [drivers, setDrivers] = useState(MOCK_DRIVERS);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInvite = (id: string) => {
        // Mock API call
        setInvitedDrivers([...invitedDrivers, id]);
        alert(`Invitation sent to ${drivers.find(d => d.id === id)?.name}!`);
    };

    return (
        <MainLayout title="Hunter Dashboard - Cabi Africa" description="Find and recruit top drivers for your organization.">
            <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12">
                <div className="container mx-auto px-6">
                    <div className="mb-8">
                        <Link href="/organizations/dashboard/members" className="text-sm text-gray-500 hover:text-indigo-600 mb-4 inline-block">&larr; Back to Members</Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recruitment Hub</h1>
                        <p className="text-gray-500 mt-2">Hunt for ungrouped drivers and invite them to join your fleet.</p>
                    </div>

                    {/* Search Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-gray-500 text-sm font-medium">Ungrouped Drivers Near You</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">124</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-gray-500 text-sm font-medium">Invitations Sent</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{invitedDrivers.length}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-gray-500 text-sm font-medium">Successful Recruits</h3>
                            <p className="text-3xl font-bold text-brand-accent mt-2">12</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:bg-slate-900 dark:border-gray-600 dark:text-white"
                                placeholder="Search by name or location..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredDrivers.map((driver) => (
                                <li key={driver.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                {driver.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{driver.name}</h4>
                                                <p className="text-sm text-gray-500">{driver.vehicle} • {driver.location}</p>
                                                <div className="flex items-center mt-1">
                                                    <span className="text-amber-500 font-bold text-sm">★ {driver.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {invitedDrivers.includes(driver.id) ? (
                                                <button disabled className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium cursor-default">
                                                    <FaCheck /> Invited
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleInvite(driver.id)}
                                                    className="flex items-center gap-2 bg-brand-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
                                                >
                                                    <FaPaperPlane className="text-xs" /> Invite
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
