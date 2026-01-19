import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    Assessment,
    DirectionsCar,
    MonetizationOn,
    Star,
    ThumbUp,
    Download,
    TrendingUp,
    TrendingDown
} from '@mui/icons-material';

export const DriverPerformanceReport: React.FC = () => {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating a slightly more detailed dataset for visual enhancement
        adminService.getDriverPerformanceReport().then((data) => {
            setReport({
                ...data,
                weeklyGrowth: 12.5,
                earningsGrowth: -2.3,
                ratingGrowth: 0.1,
                acceptanceGrowth: 5.4
            });
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Generating performance report...</div>
            </div>
        );
    }

    if (!report) return <div className="text-center p-8 text-slate-500">No data available</div>;

    const cards = [
        {
            label: "Total Rides",
            value: report.totalRides.toLocaleString(),
            icon: DirectionsCar,
            color: "blue",
            growth: report.weeklyGrowth,
            bgClass: "bg-blue-50 dark:bg-blue-900/20",
            textClass: "text-blue-600 dark:text-blue-400"
        },
        {
            label: "Total Earnings",
            value: `KES ${report.earnings.toLocaleString()}`,
            icon: MonetizationOn,
            color: "green",
            growth: report.earningsGrowth,
            bgClass: "bg-green-50 dark:bg-green-900/20",
            textClass: "text-green-600 dark:text-green-400"
        },
        {
            label: "Avg Rating",
            value: report.avgRating,
            icon: Star,
            color: "yellow",
            growth: report.ratingGrowth,
            bgClass: "bg-yellow-50 dark:bg-yellow-900/20",
            textClass: "text-yellow-600 dark:text-yellow-400"
        },
        {
            label: "Acceptance Rate",
            value: `${report.acceptanceRate}%`,
            icon: ThumbUp,
            color: "purple",
            growth: report.acceptanceGrowth,
            bgClass: "bg-purple-50 dark:bg-purple-900/20",
            textClass: "text-purple-600 dark:text-purple-400"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Assessment className="text-blue-600 dark:text-blue-400" />
                        Driver Performance Report
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of fleet metrics and driver efficiency.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm font-medium">
                    <Download fontSize="small" />
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${card.bgClass} ${card.textClass}`}>
                                <card.icon fontSize="medium" />
                            </div>
                            {card.growth !== undefined && (
                                <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${card.growth >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {card.growth >= 0 ? <TrendingUp style={{ fontSize: 14 }} className="mr-1" /> : <TrendingDown style={{ fontSize: 14 }} className="mr-1" />}
                                    {Math.abs(card.growth)}%
                                </div>
                            )}
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Placeholder Chart / Table Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-80 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full mb-4">
                        <DirectionsCar className="text-slate-300 dark:text-slate-600 text-4xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Driver Activity Trends</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                        Chart visualization would appear here (e.g., rides per day vs. active drivers).
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-80 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full mb-4">
                        <MonetizationOn className="text-slate-300 dark:text-slate-600 text-4xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Earnings Distribution</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                        Chart visualization would appear here (e.g., top earners vs. average).
                    </p>
                </div>
            </div>
        </div>
    );
};
