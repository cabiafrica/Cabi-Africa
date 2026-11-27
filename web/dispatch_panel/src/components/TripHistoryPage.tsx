import { useState, useMemo } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import SearchBar from './SearchBar';
import AdvancedFilters, { FilterConfig } from './AdvancedFilters';
import { TripHistory, Driver, Passenger } from '../types';
import TripDetailsModal from './TripDetailsModal';

interface TripHistoryPageProps {
    trips: TripHistory[];
    drivers?: Driver[];
    passengers?: Passenger[];
}

const TripHistoryPage = ({ trips, drivers = [], passengers = [] }: TripHistoryPageProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [selectedTrip, setSelectedTrip] = useState<TripHistory | null>(null);

    const filterConfigs: FilterConfig[] = [
        {
            id: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'In Progress', value: 'in-progress' },
                { label: 'Pending', value: 'pending' },
            ],
        },
        {
            id: 'priority',
            label: 'Priority',
            type: 'select',
            options: [
                { label: 'Urgent', value: 'urgent' },
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' },
            ],
        },
        {
            id: 'paymentMethod',
            label: 'Payment Method',
            type: 'multiselect',
            options: [
                { label: 'Cash', value: 'cash' },
                { label: 'Card', value: 'card' },
                { label: 'Mobile Money', value: 'mobile-money' },
            ],
        },
        {
            id: 'paymentStatus',
            label: 'Payment Status',
            type: 'select',
            options: [
                { label: 'Completed', value: 'completed' },
                { label: 'Pending', value: 'pending' },
                { label: 'Failed', value: 'failed' },
            ],
        },
        {
            id: 'dateRange',
            label: 'Date Range',
            type: 'daterange',
        },
    ];

    const filteredTrips = useMemo(() => {
        return trips.filter((trip) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    trip.id.toLowerCase().includes(query) ||
                    trip.passengerName.toLowerCase().includes(query) ||
                    trip.passengerPhone.includes(query) ||
                    trip.pickupLocation.address.toLowerCase().includes(query) ||
                    trip.dropoffLocation.address.toLowerCase().includes(query);

                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.status && trip.status !== filters.status) {
                return false;
            }

            // Priority filter
            if (filters.priority && trip.priority !== filters.priority) {
                return false;
            }

            // Payment method filter
            if (filters.paymentMethod && filters.paymentMethod.length > 0) {
                if (!filters.paymentMethod.includes(trip.paymentMethod)) {
                    return false;
                }
            }

            // Payment status filter
            if (filters.paymentStatus && trip.paymentStatus !== filters.paymentStatus) {
                return false;
            }

            // Date range filter
            if (filters.dateRange?.start || filters.dateRange?.end) {
                const tripDate = new Date(trip.requestedAt);
                if (filters.dateRange.start && tripDate < new Date(filters.dateRange.start)) {
                    return false;
                }
                if (filters.dateRange.end && tripDate > new Date(filters.dateRange.end)) {
                    return false;
                }
            }

            return true;
        });
    }, [trips, searchQuery, filters]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'in-progress':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'low':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <SearchBar
                    placeholder="Search by ID, passenger, phone, or location..."
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
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-[3px] p-4">
                    <p className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400 mb-1">Total Trips</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{filteredTrips.length}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[3px] p-4">
                    <p className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1">Completed</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                        {filteredTrips.filter((t) => t.status === 'completed').length}
                    </p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-[3px] p-4">
                    <p className="text-xs uppercase font-bold text-cyan-600 dark:text-cyan-400 mb-1">Total Revenue</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                        KES {filteredTrips.reduce((sum, t) => sum + (t.actualFare || 0), 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-[3px] p-4">
                    <p className="text-xs uppercase font-bold text-orange-600 dark:text-orange-400 mb-1">Avg. Fare</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                        KES{' '}
                        {filteredTrips.length > 0
                            ? Math.round(
                                filteredTrips.reduce((sum, t) => sum + (t.actualFare || 0), 0) / filteredTrips.length
                            ).toLocaleString()
                            : 0}
                    </p>
                </div>
            </div>

            {/* Trips Table */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[3px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Trip ID</th>
                                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Passenger</th>
                                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Route</th>
                                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Date & Time</th>
                                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Status</th>
                                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Priority</th>
                                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Fare</th>
                                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Payment</th>
                                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrips.map((trip) => (
                                <tr
                                    key={trip.id}
                                    className="border-t border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    onClick={() => setSelectedTrip(trip)}
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Trip Code</span>
                                            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{trip.id}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{trip.passengerName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{trip.passengerPhone}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="space-y-1">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">
                                                    {trip.pickupLocation.address}
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">
                                                    {trip.dropoffLocation.address}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs text-slate-600 dark:text-slate-300">
                                                {new Date(trip.requestedAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span
                                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-[3px] border ${getStatusColor(
                                                trip.status
                                            )}`}
                                        >
                                            {trip.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span
                                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-[3px] border ${getPriorityColor(
                                                trip.priority
                                            )}`}
                                        >
                                            {trip.priority}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                            KES {trip.actualFare?.toLocaleString() || trip.estimatedFare.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 capitalize">{trip.paymentMethod}</p>
                                            <p
                                                className={`text-[11px] font-bold ${trip.paymentStatus === 'completed'
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : trip.paymentStatus === 'pending'
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                    }`}
                                            >
                                                {trip.paymentStatus}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTrip(trip);
                                            }}
                                            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredTrips.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-slate-500 text-xs">No trips found matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Comprehensive Trip Details & Counterpart Dossier Modal */}
            {selectedTrip && (
                <TripDetailsModal
                    trip={selectedTrip}
                    driver={drivers.find(d => d.id === selectedTrip.assignedDriverId || d.activeRideId === selectedTrip.id)}
                    passenger={passengers.find(p => p.id === selectedTrip.passengerId)}
                    availableDrivers={drivers.filter(d => d.status === 'online')}
                    onClose={() => setSelectedTrip(null)}
                />
            )}
        </div>
    );
};

export default TripHistoryPage;
