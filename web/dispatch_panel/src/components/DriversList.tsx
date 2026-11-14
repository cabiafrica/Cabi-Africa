import { Driver } from '../types';

interface DriversListProps {
    drivers: Driver[];
}

const DriversList = ({ drivers }: DriversListProps) => {
    const getStatusColor = (status: Driver['status']) => {
        switch (status) {
            case 'online':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'busy':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'on-break':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'offline':
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const onlineDrivers = drivers.filter(d => d.status === 'online');
    const busyDrivers = drivers.filter(d => d.status === 'busy');
    const onBreakDrivers = drivers.filter(d => d.status === 'on-break');
    const offlineDrivers = drivers.filter(d => d.status === 'offline');

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-400 mb-1">Online</p>
                    <p className="text-3xl font-bold text-white">{onlineDrivers.length}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-600/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-sm text-yellow-400 mb-1">Busy</p>
                    <p className="text-3xl font-bold text-white">{busyDrivers.length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
                    <p className="text-sm text-orange-400 mb-1">On Break</p>
                    <p className="text-3xl font-bold text-white">{onBreakDrivers.length}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-600/10 to-slate-600/5 border border-slate-500/20 rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-1">Offline</p>
                    <p className="text-3xl font-bold text-white">{offlineDrivers.length}</p>
                </div>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers.map((driver) => (
                    <div
                        key={driver.id}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-5 hover:border-amber-500/50 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-bold text-lg">
                                    {driver.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold">{driver.name}</h4>
                                    <p className="text-xs text-slate-400">{driver.phone}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(driver.status)}`}>
                                {driver.status}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Vehicle</span>
                                <span className="text-white font-medium">{driver.vehicleType}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Plate</span>
                                <span className="text-white font-mono">{driver.vehiclePlate}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Rating</span>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-white font-semibold">{driver.rating}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800/50">
                            <div className="text-center">
                                <p className="text-xs text-slate-500 mb-1">Completed</p>
                                <p className="text-lg font-bold text-white">{driver.completedRides}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500 mb-1">Acceptance</p>
                                <p className="text-lg font-bold text-green-400">{driver.acceptanceRate}%</p>
                            </div>
                        </div>

                        {driver.status === 'busy' && driver.activeRideId && (
                            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                <p className="text-xs text-yellow-400">
                                    Active Ride: <span className="font-mono">{driver.activeRideId}</span>
                                </p>
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${driver.status === 'online' ? 'bg-green-500' : driver.status === 'busy' ? 'bg-yellow-500' : 'bg-slate-500'}`}></div>
                                <span className="text-xs text-slate-400">Score: {driver.score}</span>
                            </div>
                            <button className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                                View Details →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriversList;
