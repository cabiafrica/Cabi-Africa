import React from 'react';

export default function HeatmapReportPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Trip Heatmap Activity</h1>

            <div className="flex gap-4 mb-6">
                <select className="border p-2 rounded">
                    <option>Pickups</option>
                    <option>Dropoffs</option>
                </select>
                <select className="border p-2 rounded">
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                </select>
                <button className="bg-amber-500 text-black px-4 py-2 rounded">Update Map</button>
            </div>

            <div className="border border-gray-300 rounded-lg h-96 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-amber-50 opacity-50"></div>
                <p className="text-gray-500 z-10">Map Visualization Placeholder (Would use Leaflet/Google Maps)</p>

                {/* Mock Hitpoints */}
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-red-500 rounded-full blur-3xl opacity-40 transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-orange-500 rounded-full blur-2xl opacity-40"></div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p>Highest density: Times Square (Weight: 1.0)</p>
            </div>
        </div>
    );
}
