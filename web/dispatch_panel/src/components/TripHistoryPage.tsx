import { useState, useMemo } from 'react';
import { Calendar, MapPin, Star, Phone, User, TrendingUp } from 'lucide-react';
import SearchBar from './SearchBar';
import AdvancedFilters, { FilterConfig } from './AdvancedFilters';
import { TripHistory } from '../types';

interface TripHistoryPageProps {
    trips: TripHistory[];
}

const TripHistoryPage = ({ trips }: TripHistoryPageProps) => {
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
                <div className="bg-gradient-to-br from-amber-600/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-sm text-amber-400 mb-1">Total Trips</p>
                    <p className="text-3xl font-bold text-white">{filteredTrips.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-400 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-white">
                        {filteredTrips.filter((t) => t.status === 'completed').length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-cyan-600/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-4">
                    <p className="text-sm text-cyan-400 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">
                        KES {filteredTrips.reduce((sum, t) => sum + (t.actualFare || 0), 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
                    <p className="text-sm text-orange-400 mb-1">Avg. Fare</p>
                    <p className="text-3xl font-bold text-white">
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
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/50">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Trip ID</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Passenger</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Route</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Date & Time</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Status</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Priority</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Fare</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Payment</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrips.map((trip) => (
                                <tr
                                    key={trip.id}
                                    className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    onClick={() => setSelectedTrip(trip)}
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Trip Code</span>
                                            <span className="text-sm font-mono font-bold text-amber-400">{trip.id}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div>
                                            <p className="text-sm font-medium text-white">{trip.passengerName}</p>
                                            <p className="text-xs text-slate-500">{trip.passengerPhone}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="space-y-1">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-slate-300 line-clamp-1">
                                                    {trip.pickupLocation.address}
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-slate-300 line-clamp-1">
                                                    {trip.dropoffLocation.address}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            <span className="text-sm text-slate-300">
                                                {new Date(trip.requestedAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span
                                            className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(
                                                trip.status
                                            )}`}
                                        >
                                            {trip.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span
                                            className={`text-xs font-medium px-3 py-1 rounded-full border ${getPriorityColor(
                                                trip.priority
                                            )}`}
                                        >
                                            {trip.priority}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-sm font-semibold text-white">
                                            KES {trip.actualFare?.toLocaleString() || trip.estimatedFare.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div>
                                            <p className="text-sm text-slate-300 capitalize">{trip.paymentMethod}</p>
                                            <p
                                                className={`text-xs ${trip.paymentStatus === 'completed'
                                                    ? 'text-green-400'
                                                    : trip.paymentStatus === 'pending'
                                                        ? 'text-yellow-400'
                                                        : 'text-red-400'
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
                                            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
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
                            <p className="text-slate-500">No trips found matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Trip Detail Modal */}
            {selectedTrip && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedTrip(null)}
                >
                    <div
                        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">Trip Details</h3>
                                <p className="text-sm text-slate-400 font-mono mt-1">{selectedTrip.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTrip(null)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Status and Priority */}
                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(
                                        selectedTrip.status
                                    )}`}
                                >
                                    {selectedTrip.status}
                                </span>
                                <span
                                    className={`text-xs font-medium px-3 py-1 rounded-full border ${getPriorityColor(
                                        selectedTrip.priority
                                    )}`}
                                >
                                    {selectedTrip.priority} priority
                                </span>
                            </div>

                            {/* Passenger Info */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-white">Passenger Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-300">{selectedTrip.passengerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-300">{selectedTrip.passengerPhone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Route Info */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-white">Route Information</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-500">Pickup Location</p>
                                            <p className="text-sm text-white">{selectedTrip.pickupLocation.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-500">Dropoff Location</p>
                                            <p className="text-sm text-white">{selectedTrip.dropoffLocation.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-300">{selectedTrip.distance} km</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-white">Payment Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Fare Amount</p>
                                        <p className="text-lg font-bold text-white">
                                            KES {selectedTrip.actualFare?.toLocaleString() || selectedTrip.estimatedFare.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Payment Method</p>
                                        <p className="text-sm text-white capitalize">{selectedTrip.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Payment Status</p>
                                        <p
                                            className={`text-sm font-medium ${selectedTrip.paymentStatus === 'completed'
                                                ? 'text-green-400'
                                                : selectedTrip.paymentStatus === 'pending'
                                                    ? 'text-yellow-400'
                                                    : 'text-red-400'
                                                }`}
                                        >
                                            {selectedTrip.paymentStatus}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Duration</p>
                                        <p className="text-sm text-white">{selectedTrip.duration} minutes</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-slate-700/50 mt-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Fare Breakdown</p>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Base Fare</span>
                                                <span className="text-white">KES {(selectedTrip.actualFare || selectedTrip.estimatedFare) * 0.7}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Wait Time Charge</span>
                                                <span className="text-white">KES {(selectedTrip.actualFare || selectedTrip.estimatedFare) * 0.1}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Surge Multiplier</span>
                                                <span className="text-brand-yellow">x1.2</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold pt-1">
                                                <span className="text-slate-400">Total</span>
                                                <span className="text-white">KES {selectedTrip.actualFare || selectedTrip.estimatedFare}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rating & Feedback */}
                            {selectedTrip.rating && (
                                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-white">Rating & Feedback</h4>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        <span className="text-lg font-bold text-white">{selectedTrip.rating}</span>
                                        <span className="text-sm text-slate-400">/ 5.0</span>
                                    </div>
                                    {selectedTrip.feedback && (
                                        <p className="text-sm text-slate-300 italic">"{selectedTrip.feedback}"</p>
                                    )}
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                                <h4 className="text-sm font-semibold text-white">Timeline</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Requested</span>
                                        <span className="text-white">{new Date(selectedTrip.requestedAt).toLocaleString()}</span>
                                    </div>
                                    {selectedTrip.completedAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Completed</span>
                                            <span className="text-white">
                                                {new Date(selectedTrip.completedAt).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripHistoryPage;
