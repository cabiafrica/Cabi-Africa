import { useState, useMemo } from 'react';
import { Star, Phone, Mail, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import SearchBar from './SearchBar';
import AdvancedFilters, { FilterConfig } from './AdvancedFilters';
import { Passenger } from '../types';

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
                <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800/50 rounded-xl p-1">
                    <button
                        onClick={() => setViewStyle('grid')}
                        className={`p-2 rounded-lg transition-all ${viewStyle === 'grid'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        title="Grid View"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className={`p-2 rounded-lg transition-all ${viewStyle === 'list'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        title="List View"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className={`p-2 rounded-lg transition-all ${viewStyle === 'table'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        title="Table View"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm text-blue-400 mb-1">Total Passengers</p>
                    <p className="text-3xl font-bold text-white">{filteredPassengers.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-400 mb-1">Active</p>
                    <p className="text-3xl font-bold text-white">
                        {filteredPassengers.filter((p) => p.status === 'active').length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-sm text-purple-400 mb-1">Total Rides</p>
                    <p className="text-3xl font-bold text-white">
                        {filteredPassengers.reduce((sum, p) => sum + p.totalRides, 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
                    <p className="text-sm text-orange-400 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">
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
                            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
                        >
                            {/* Passenger Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                                        {passenger.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                            {passenger.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-mono">{passenger.id}</p>
                                    </div>
                                </div>
                                <span
                                    className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(
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
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-slate-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-white">{passenger.rating.toFixed(1)}</span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <p className="text-xs text-slate-500">Total Rides</p>
                                    <p className="text-lg font-bold text-white">{passenger.totalRides}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Spent</p>
                                    <p className="text-lg font-bold text-green-400">
                                        KES {(passenger.totalSpent / 1000).toFixed(1)}k
                                    </p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-2 pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Phone className="w-4 h-4" />
                                    <span>{passenger.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Mail className="w-4 h-4" />
                                    <span className="truncate">{passenger.email}</span>
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
                            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4 hover:border-blue-500/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                        {passenger.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                {passenger.name}
                                            </h3>
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(
                                                    passenger.status
                                                )}`}
                                            >
                                                {passenger.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {passenger.phone}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {passenger.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">Rating</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-semibold text-white">
                                                {passenger.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">Rides</p>
                                        <p className="text-sm font-semibold text-white">{passenger.totalRides}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">Spent</p>
                                        <p className="text-sm font-semibold text-green-400">
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
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                                        Passenger
                                    </th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Contact</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Status</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Rating</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Rides</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                                        Total Spent
                                    </th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Payment</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPassengers.map((passenger) => (
                                    <tr
                                        key={passenger.id}
                                        onClick={() => setSelectedPassenger(passenger)}
                                        className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                                    {passenger.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{passenger.name}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{passenger.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-300">{passenger.phone}</p>
                                                <p className="text-xs text-slate-500">{passenger.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(
                                                    passenger.status
                                                )}`}
                                            >
                                                {passenger.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm font-semibold text-white">
                                                    {passenger.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{passenger.totalRides}</p>
                                                <p className="text-xs text-slate-500">
                                                    {passenger.completedRides} completed
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-semibold text-green-400">
                                                KES {passenger.totalSpent.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-slate-300 capitalize">
                                                {passenger.preferredPaymentMethod.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-slate-300">
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
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-12 text-center">
                    <p className="text-slate-500">No passengers found matching your criteria</p>
                </div>
            )}

            {/* Passenger Detail Modal */}
            {selectedPassenger && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedPassenger(null)}
                >
                    <div
                        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-2xl">
                                        {selectedPassenger.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{selectedPassenger.name}</h3>
                                        <p className="text-sm text-slate-400 font-mono mt-1">{selectedPassenger.id}</p>
                                        <span
                                            className={`inline-block text-xs font-medium px-2 py-1 rounded-full border mt-2 ${getStatusColor(
                                                selectedPassenger.status
                                            )}`}
                                        >
                                            {selectedPassenger.status}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPassenger(null)}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5 text-slate-400"
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
                                <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-blue-400" />
                                        <p className="text-xs text-blue-400">Total Rides</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{selectedPassenger.totalRides}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-green-400" />
                                        <p className="text-xs text-green-400">Total Spent</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        KES {selectedPassenger.totalSpent.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-600/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-4 h-4 text-yellow-400" />
                                        <p className="text-xs text-yellow-400">Rating</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{selectedPassenger.rating.toFixed(1)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-purple-400" />
                                        <p className="text-xs text-purple-400">Completed</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{selectedPassenger.completedRides}</p>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-white">Contact Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-white">{selectedPassenger.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-white">{selectedPassenger.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Preference */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-white">Payment Information</h4>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm text-white capitalize">
                                        {selectedPassenger.preferredPaymentMethod.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                                <h4 className="text-sm font-semibold text-white">Activity Timeline</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Joined</span>
                                        <span className="text-white">
                                            {new Date(selectedPassenger.joinedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Last Ride</span>
                                        <span className="text-white">
                                            {new Date(selectedPassenger.lastRideDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ride Statistics */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-white">Ride Statistics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Completed Rides</p>
                                        <p className="text-lg font-bold text-green-400">{selectedPassenger.completedRides}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Cancelled Rides</p>
                                        <p className="text-lg font-bold text-red-400">{selectedPassenger.cancelledRides}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Completion Rate</p>
                                        <p className="text-lg font-bold text-white">
                                            {selectedPassenger.totalRides > 0
                                                ? Math.round(
                                                    (selectedPassenger.completedRides / selectedPassenger.totalRides) * 100
                                                )
                                                : 0}
                                            %
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Avg. Fare</p>
                                        <p className="text-lg font-bold text-white">
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
