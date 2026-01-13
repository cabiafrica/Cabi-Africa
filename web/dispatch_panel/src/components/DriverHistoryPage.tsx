import { useState, useMemo } from 'react';
import { Star, Phone, Car, Calendar, DollarSign, TrendingUp, Award, Clock } from 'lucide-react';
import SearchBar from './SearchBar';
import AdvancedFilters, { FilterConfig } from './AdvancedFilters';
import { DriverHistory } from '../types';

interface DriverHistoryPageProps {
    drivers: DriverHistory[];
}

const DriverHistoryPage = ({ drivers }: DriverHistoryPageProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [selectedDriver, setSelectedDriver] = useState<DriverHistory | null>(null);

    const filterConfigs: FilterConfig[] = [
        {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            options: [
                { label: 'Online', value: 'online' },
                { label: 'Offline', value: 'offline' },
                { label: 'Busy', value: 'busy' },
                { label: 'On Break', value: 'on-break' },
            ],
        },
        {
            id: 'vehicleType',
            label: 'Vehicle Type',
            type: 'multiselect',
            options: [
                { label: 'Sedan', value: 'sedan' },
                { label: 'SUV', value: 'suv' },
                { label: 'Van', value: 'van' },
                { label: 'Luxury', value: 'luxury' },
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

    const filteredDrivers = useMemo(() => {
        return drivers.filter((driver) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    driver.id.toLowerCase().includes(query) ||
                    driver.name.toLowerCase().includes(query) ||
                    driver.phone.includes(query) ||
                    driver.vehiclePlate.toLowerCase().includes(query) ||
                    driver.licenseNumber.toLowerCase().includes(query);

                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.status && filters.status.length > 0) {
                if (!filters.status.includes(driver.status)) {
                    return false;
                }
            }

            // Vehicle type filter
            if (filters.vehicleType && filters.vehicleType.length > 0) {
                if (!filters.vehicleType.includes(driver.vehicleType)) {
                    return false;
                }
            }

            // Rating filter
            if (filters.rating) {
                if (driver.rating < parseFloat(filters.rating)) {
                    return false;
                }
            }

            return true;
        });
    }, [drivers, searchQuery, filters]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'busy':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'on-break':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'offline':
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <SearchBar
                    placeholder="Search by name, phone, plate, or license..."
                    onSearch={setSearchQuery}
                    className="flex-1"
                />
                <AdvancedFilters
                    filters={filterConfigs}
                    onFilterChange={setFilters}
                    onClear={() => setFilters({})}
                />
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm text-blue-400 mb-1">Total Drivers</p>
                    <p className="text-3xl font-bold text-white">{filteredDrivers.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-400 mb-1">Online Now</p>
                    <p className="text-3xl font-bold text-white">
                        {filteredDrivers.filter((d) => d.status === 'online').length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-sm text-purple-400 mb-1">Avg. Rating</p>
                    <p className="text-3xl font-bold text-white">
                        {filteredDrivers.length > 0
                            ? (filteredDrivers.reduce((sum, d) => sum + d.rating, 0) / filteredDrivers.length).toFixed(1)
                            : '0.0'}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
                    <p className="text-sm text-orange-400 mb-1">Total Rides</p>
                    <p className="text-3xl font-bold text-white">
                        {filteredDrivers.reduce((sum, d) => sum + d.completedRides, 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrivers.map((driver) => (
                    <div
                        key={driver.id}
                        onClick={() => setSelectedDriver(driver)}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
                    >
                        {/* Driver Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    {driver.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                        {driver.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono">{driver.id}</p>
                                </div>
                            </div>
                            <span
                                className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(
                                    driver.status
                                )}`}
                            >
                                {driver.status}
                            </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(driver.rating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-slate-700'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-semibold text-white">{driver.rating.toFixed(1)}</span>
                            <span className="text-xs text-slate-500">({driver.totalRatings} ratings)</span>
                        </div>

                        {/* Vehicle Info */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Car className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-300">
                                    {driver.vehicleModel} ({driver.vehicleYear})
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500">Plate:</span>
                                <span className="text-white font-mono">{driver.vehiclePlate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500">Type:</span>
                                <span className="text-white capitalize">{driver.vehicleType}</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                            <div>
                                <p className="text-xs text-slate-500">Completed Rides</p>
                                <p className="text-lg font-bold text-white">{driver.completedRides}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Earnings</p>
                                <p className="text-lg font-bold text-green-400">
                                    KES {(driver.totalEarnings / 1000).toFixed(1)}k
                                </p>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="mt-4 pt-4 border-t border-slate-800">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Phone className="w-4 h-4" />
                                <span>{driver.phone}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredDrivers.length === 0 && (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-12 text-center">
                    <p className="text-slate-500">No drivers found matching your criteria</p>
                </div>
            )}

            {/* Driver Detail Modal */}
            {selectedDriver && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedDriver(null)}
                >
                    <div
                        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                                        {selectedDriver.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{selectedDriver.name}</h3>
                                        <p className="text-sm text-slate-400 font-mono mt-1">{selectedDriver.id}</p>
                                        <span
                                            className={`inline-block text-xs font-medium px-2 py-1 rounded-full border mt-2 ${getStatusColor(
                                                selectedDriver.status
                                            )}`}
                                        >
                                            {selectedDriver.status}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDriver(null)}
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
                            {/* Performance Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-blue-400" />
                                        <p className="text-xs text-blue-400">Completed Rides</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{selectedDriver.completedRides}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-green-400" />
                                        <p className="text-xs text-green-400">Total Earnings</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        KES {selectedDriver.totalEarnings.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-600/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-4 h-4 text-yellow-400" />
                                        <p className="text-xs text-yellow-400">Rating</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{selectedDriver.rating.toFixed(1)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-4 h-4 text-purple-400" />
                                        <p className="text-xs text-purple-400">Acceptance Rate</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{selectedDriver.acceptanceRate}%</p>
                                </div>
                            </div>

                            {/* Earnings Breakdown */}
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-white mb-4">Earnings Breakdown</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Today</p>
                                        <p className="text-lg font-bold text-white">
                                            KES {selectedDriver.todayEarnings.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">This Week</p>
                                        <p className="text-lg font-bold text-white">
                                            KES {selectedDriver.weekEarnings.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">This Month</p>
                                        <p className="text-lg font-bold text-white">
                                            KES {selectedDriver.monthEarnings.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Information */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-white">Vehicle Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Model</p>
                                        <p className="text-sm text-white">
                                            {selectedDriver.vehicleModel} ({selectedDriver.vehicleYear})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Color</p>
                                        <p className="text-sm text-white capitalize">{selectedDriver.vehicleColor}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Plate Number</p>
                                        <p className="text-sm text-white font-mono">{selectedDriver.vehiclePlate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Type</p>
                                        <p className="text-sm text-white capitalize">{selectedDriver.vehicleType}</p>
                                    </div>
                                </div>
                            </div>

                            {/* License Information */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-white">License Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">License Number</p>
                                        <p className="text-sm text-white font-mono">{selectedDriver.licenseNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Expiry Date</p>
                                        <p className="text-sm text-white">
                                            {new Date(selectedDriver.licenseExpiry).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-white">Contact Information</h4>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm text-white">{selectedDriver.phone}</span>
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                                <h4 className="text-sm font-semibold text-white">Activity Timeline</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Joined</span>
                                        <span className="text-white">
                                            {new Date(selectedDriver.joinedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Last Active</span>
                                        <span className="text-white">
                                            {new Date(selectedDriver.lastActiveDate).toLocaleDateString()}
                                        </span>
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

export default DriverHistoryPage;
