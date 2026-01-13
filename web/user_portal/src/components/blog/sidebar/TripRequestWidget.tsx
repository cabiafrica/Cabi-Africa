import Link from 'next/link';
import { FaCar, FaUserPlus, FaMapMarkerAlt } from 'react-icons/fa';

export default function TripRequestWidget() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FaCar className="text-indigo-600" />
                Book a Ride
            </h3>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pickup Location"
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-indigo-500" />
                    <input
                        type="text"
                        placeholder="Destination"
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors">
                    Request Now
                </button>
            </form>
        </div>
    );
}
