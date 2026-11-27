import { useState, useMemo } from 'react';
import { Star, Phone, Mail, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import SearchBar from './SearchBar';
import AdvancedFilters, { FilterConfig } from './AdvancedFilters';
import { Passenger } from '../types';
import MaskedPhone from './common/MaskedPhone';

interface PassengerManagementPageProps {
    passengers: Passenger[];
}

type ViewStyle = 'grid' | 'list' | 'table';

const PassengerManagementPage = ({ passengers }: PassengerManagementPageProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
    const [viewStyle, setViewStyle] = useState<ViewStyle>('grid');

    const filterConfigs: FilterConfig[] = [
        {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Suspended', value: 'suspended' },
            ],
        },
        {
            id: 'paymentMethod',
            label: 'Preferred Payment',
            type: 'multiselect',
            options: [
                { label: 'Cash', value: 'cash' },
                { label: 'Card', value: 'card' },
                { label: 'Mobile Money', value: 'mobile-money' },
            ],
        },
        {
            id: 'rating',
            label: 'Minimum Rating',
            type: 'select',
            options: [
                { label: '4.5+', value: '4.5' },
                { label: '4.0+', value: '4.0' },
                { label: '3.5+', value: '3.5' },
                { label: '3.0+', value: '3.0' },
            ],
        },
    ];

    const filteredPassengers = useMemo(() => {
        return passengers.filter((passenger) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    passenger.id.toLowerCase().includes(query) ||
                    passenger.name.toLowerCase().includes(query) ||
                    passenger.phone.includes(query) ||
                    passenger.email.toLowerCase().includes(query);

                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.status && filters.status.length > 0) {
                if (!filters.status.includes(passenger.status)) {
                    return false;
                }
            }

            // Payment method filter
            if (filters.paymentMethod && filters.paymentMethod.length > 0) {
                if (!filters.paymentMethod.includes(passenger.preferredPaymentMethod)) {
                    return false;
                }
            }

            // Rating filter
            if (filters.rating) {
                if (passenger.rating < parseFloat(filters.rating)) {
                    return false;
                }
            }

            return true;
        });
    }, [passengers, searchQuery, filters]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'inactive':
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            case 'suspended':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Search, Filters, and View Toggle */}
            <div className="flex items-center gap-4">
                <SearchBar
                    placeholder="Search by name, phone, or email..."
                    onSearch={setSearchQuery}
                    className="flex-1"
                />
                <AdvancedFilters filters={filterConfigs} onFilterChange={setFilters} onClear={() => setFilters({})} />

                {/* View Style Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-1">
                    <button
                        onClick={() => setViewStyle('grid')}
                        className={`p-1.5 rounded-[3px] transition-all ${viewStyle === 'grid'
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        title="Grid View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewStyle('list')}
                        className={`p-1.5 rounded-[3px] transition-all ${viewStyle === 'list'
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        title="List View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewStyle('table')}
                        className={`p-1.5 rounded-[3px] transition-all ${viewStyle === 'table'
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        title="Table View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-[3px] p-4">
                    <p className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400 mb-1">Total Passengers</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{filteredPassengers.length}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[3px] p-4">
                    <p className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1">Active</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                        {filteredPassengers.filter((p) => p.status === 'active').length}
                    </p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-[3px] p-4">
                    <p className="text-xs uppercase font-bold text-cyan-600 dark:text-cyan-400 mb-1">Total Rides</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                        {filteredPassengers.reduce((sum, p) => sum + p.totalRides, 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-[3px] p-4">
                    <p className="text-xs uppercase font-bold text-orange-600 dark:text-orange-400 mb-1">Total Revenue</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                        KES {filteredPassengers.reduce((sum, p) => sum + p.totalSpent, 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Grid View */}
            {viewStyle === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPassengers.map((passenger) => (
                        <div
                            key={passenger.id}
                            onClick={() => setSelectedPassenger(passenger)}
                            className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-6 hover:border-amber-500/50 transition-all cursor-pointer group shadow-sm"
                        >
                            {/* Passenger Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-lg shadow-sm">
                                        {passenger.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                                            {passenger.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{passenger.id}</p>
                                    </div>
                                </div>
                                <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-[3px] border ${getStatusColor(
                                        passenger.status
                                    )}`}
                                >
                                    {passenger.status}
                                </span>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(passenger.rating)
                                                ? 'text-amber-500 fill-amber-500'
                                                : 'text-slate-200 dark:text-slate-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{passenger.rating.toFixed(1)}</span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Total Rides</p>
                                    <p className="text-base font-black text-slate-900 dark:text-white">{passenger.totalRides}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Total Spent</p>
                                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                        KES {(passenger.totalSpent / 1000).toFixed(1)}k
                                    </p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <MaskedPhone phone={passenger.phone} className="text-xs font-medium text-slate-700 dark:text-slate-300" />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="truncate text-slate-700 dark:text-slate-300">{passenger.email}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewStyle === 'list' && (
                <div className="space-y-3">
                    {filteredPassengers.map((passenger) => (
                        <div
                            key={passenger.id}
                            onClick={() => setSelectedPassenger(passenger)}
                            className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-4 hover:border-amber-500/50 transition-all cursor-pointer group shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-base flex-shrink-0 shadow-sm">
                                        {passenger.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                                                {passenger.name}
                                            </h3>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-[3px] border ${getStatusColor(
                                                    passenger.status
                                                )}`}
                                            >
                                                {passenger.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3 text-slate-400" />
                                                <MaskedPhone phone={passenger.phone} className="text-xs font-medium text-slate-700 dark:text-slate-300" />
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3 text-slate-400" />
                                                <span className="text-slate-700 dark:text-slate-300">{passenger.email}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Rating</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                {passenger.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Rides</p>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{passenger.totalRides}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Spent</p>
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            KES {(passenger.totalSpent / 1000).toFixed(1)}k
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewStyle === 'table' && (
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Passenger
                                    </th>
                                    <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Contact</th>
                                    <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Status</th>
                                    <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Rating</th>
                                    <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Rides</th>
                                    <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Total Spent
                                    </th>
                                    <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Payment</th>
                                    <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPassengers.map((passenger) => (
                                    <tr
                                        key={passenger.id}
                                        onClick={() => setSelectedPassenger(passenger)}
                                        className="border-t border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    >
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xs shadow-sm">
                                                    {passenger.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{passenger.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{passenger.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div className="space-y-0.5">
                                                <MaskedPhone phone={passenger.phone} className="text-xs text-slate-700 dark:text-slate-300 font-medium" />
                                                <p className="text-[11px] text-slate-500">{passenger.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-[3px] border ${getStatusColor(
                                                    passenger.status
                                                )}`}
                                            >
                                                {passenger.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {passenger.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{passenger.totalRides}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {passenger.completedRides} completed
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                KES {passenger.totalSpent.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className="text-xs text-slate-700 dark:text-slate-300 capitalize font-medium">
                                                {passenger.preferredPaymentMethod.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(passenger.joinedDate).toLocaleDateString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filteredPassengers.length === 0 && (
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] p-12 text-center">
                    <p className="text-slate-500 text-xs">No passengers found matching your criteria</p>
                </div>
            )}

            {/* Passenger Detail Modal */}
            {selectedPassenger && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedPassenger(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl shadow-sm">
                                        {selectedPassenger.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedPassenger.name}</h3>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold mt-0.5">{selectedPassenger.id}</p>
                                        <span
                                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-[3px] border mt-2 ${getStatusColor(
                                                selectedPassenger.status
                                            )}`}
                                        >
                                            {selectedPassenger.status}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPassenger(null)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[3px] transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Stats Overview */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-[3px] p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Total Rides</p>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedPassenger.totalRides}</p>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[3px] p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Spent</p>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                                        KES {selectedPassenger.totalSpent.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-[3px] p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Star className="w-4 h-4 text-amber-500" />
                                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Rating</p>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedPassenger.rating.toFixed(1)}</p>
                                </div>
                                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-[3px] p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                        <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Completed</p>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedPassenger.completedRides}</p>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[3px] p-4 space-y-3">
                                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">Contact Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <MaskedPhone phone={selectedPassenger.phone} className="text-sm font-semibold text-slate-900 dark:text-white" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedPassenger.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Preference */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[3px] p-4 space-y-3">
                                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">Payment Information</h4>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                                        {selectedPassenger.preferredPaymentMethod.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[3px] p-4 space-y-2">
                                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">Activity Timeline</h4>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Joined</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {new Date(selectedPassenger.joinedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Last Ride</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {new Date(selectedPassenger.lastRideDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ride Statistics */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[3px] p-4 space-y-3">
                                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">Ride Statistics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Completed Rides</p>
                                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{selectedPassenger.completedRides}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Cancelled Rides</p>
                                        <p className="text-base font-black text-red-600 dark:text-red-400">{selectedPassenger.cancelledRides}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Completion Rate</p>
                                        <p className="text-base font-black text-slate-900 dark:text-white">
                                            {selectedPassenger.totalRides > 0
                                                ? Math.round(
                                                    (selectedPassenger.completedRides / selectedPassenger.totalRides) * 100
                                                )
                                                : 0}
                                            %
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Avg. Fare</p>
                                        <p className="text-base font-black text-slate-900 dark:text-white">
                                            KES{' '}
                                            {selectedPassenger.completedRides > 0
                                                ? Math.round(
                                                    selectedPassenger.totalSpent / selectedPassenger.completedRides
                                                ).toLocaleString()
                                                : 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PassengerManagementPage;
