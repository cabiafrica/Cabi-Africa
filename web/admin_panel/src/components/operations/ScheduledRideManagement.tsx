import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    Event, // Changed from CalendarMonth to Event for safety
    AccessTime,
    Person,
    LocationOn,
    Cancel,
    CheckCircle,
    Schedule,
    Search,
    FilterList,
    MoreVert
} from '@mui/icons-material';

interface ScheduledRide {
    id: string;
    pickupTime: string;
    passengerName: string;
    passengerPhone: string;
    pickupLocation: string;
    dropoffLocation: string;
    estimatedFare: number;
    status: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
}

export const ScheduledRideManagement: React.FC = () => {
    console.log("ScheduledRideManagement: Component Rendering...");

    const [rides, setRides] = useState<ScheduledRide[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchScheduledRides();
    }, []);

    const fetchScheduledRides = async () => {
        setLoading(true);
        console.log("ScheduledRideManagement: Fetching rides...");
        try {
            const data = await adminService.getScheduledRides();
            console.log("ScheduledRideManagement: Fetched data", data);

            // Basic validation/mapping
            let mapped: ScheduledRide[] = [];

            if (Array.isArray(data) && data.length > 0) {
                mapped = data.map(d => ({
                    id: d.id || 'unknown',
                    pickupTime: d.pickupTime || new Date().toISOString(),
                    passengerName: d.passengerName || d.passenger || 'Unknown',
                    passengerPhone: d.passengerPhone || 'N/A',
                    pickupLocation: d.pickupLocation || d.pickup || 'Unknown',
                    dropoffLocation: d.dropoffLocation || d.dropoff || 'Unknown',
                    estimatedFare: d.estimatedFare || 0,
                    status: d.status || 'PENDING'
                }));
            } else {
                console.log("ScheduledRideManagement: Data empty or invalid, using mock");
                mapped = generateMockScheduledRides();
            }
            setRides(mapped);
        } catch (error: any) {
            console.error("Failed to fetch scheduled rides", error);
            setError(error.message || "Failed to load rides");
            setRides(generateMockScheduledRides());
        } finally {
            setLoading(false);
        }
    };

    const filteredRides = rides.filter(ride => {
        const matchesStatus = filterStatus === 'ALL' || ride.status === filterStatus;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = ride.passengerName.toLowerCase().includes(searchLower) ||
            ride.pickupLocation.toLowerCase().includes(searchLower) ||
            ride.dropoffLocation.toLowerCase().includes(searchLower);
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-700';
            case 'ASSIGNED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700';
            case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700';
            case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-700';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Event className="text-blue-600 dark:text-blue-400" />
                        Scheduled Rides
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage upcoming bookings and assignments</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <Schedule fontSize="small" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Upcoming</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{rides.filter(r => r.status === 'PENDING' || r.status === 'ASSIGNED').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search passenger, location..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="ASSIGNED">Assigned</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Rides List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time & Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passenger</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Route</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fare (Est)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading scheduled rides...</td>
                                </tr>
                            ) : filteredRides.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Event className="text-slate-300 dark:text-slate-600 text-5xl mb-3" />
                                            <p>No scheduled rides found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRides.map((ride) => (
                                    <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-slate-900 dark:text-slate-100 font-medium">
                                                <AccessTime className="mr-2 text-slate-400" fontSize="small" />
                                                {new Date(ride.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-7">
                                                {new Date(ride.pickupTime).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 mr-3">
                                                    <Person fontSize="small" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{ride.passengerName}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{ride.passengerPhone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm space-y-1">
                                                <div className="flex items-start">
                                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 mr-2 flex-shrink-0"></div>
                                                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={ride.pickupLocation}>{ride.pickupLocation}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 mr-2 flex-shrink-0"></div>
                                                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={ride.dropoffLocation}>{ride.dropoffLocation}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                                            KES {ride.estimatedFare.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ride.status)}`}>
                                                {ride.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                <MoreVert />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// Helper to generate mock data if API fails or returns empty in dev
function generateMockScheduledRides(): ScheduledRide[] {
    const now = new Date();
    return Array.from({ length: 8 }).map((_, i) => {
        const pickup = new Date(now);
        pickup.setHours(now.getHours() + (i + 1) * 2);

        return {
            id: `sch-${i}`,
            pickupTime: pickup.toISOString(),
            passengerName: ['Alice Njoroge', 'Brian Kiptoo', 'Charity Wambui', 'David Owino'][i % 4],
            passengerPhone: `+254 7${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100}`,
            pickupLocation: ['Westlands, Nairobi', 'JKIA Airport', 'Karen Hub', 'Upper Hill'][i % 4],
            dropoffLocation: ['CBD, Nairobi', 'Gigiri, UN', 'Lavington Mall', 'Thika Road'][i % 4],
            estimatedFare: Math.floor(Math.random() * 2000) + 500,
            status: i === 0 ? 'ASSIGNED' : i === 4 ? 'CANCELLED' : 'PENDING'
        };
    });
}
