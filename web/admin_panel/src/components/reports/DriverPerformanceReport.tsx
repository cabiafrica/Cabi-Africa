import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../common/PageHeader';
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
        adminService.getDriverPerformanceReport().then((data) => {
            if (data && data.totalRides !== undefined) {
                setReport({
                    ...data,
                    weeklyGrowth: data.weeklyGrowth ?? 0,
                    earningsGrowth: data.earningsGrowth ?? 0,
                    ratingGrowth: data.ratingGrowth ?? 0,
                    acceptanceGrowth: data.acceptanceGrowth ?? 0
                });
            } else {
                setReport({
                    totalRides: 0,
                    earnings: 0,
                    avgRating: 0.0,
                    acceptanceRate: 0.0,
                    weeklyGrowth: 0,
                    earningsGrowth: 0,
                    ratingGrowth: 0,
                    acceptanceGrowth: 0
                });
            }
        }).catch((err) => {
            console.warn('Fallback to zero baseline performance data:', err);
            setReport({
                totalRides: 0,
                earnings: 0,
                avgRating: 0.0,
                acceptanceRate: 0.0,
                weeklyGrowth: 0,
                earningsGrowth: 0,
                ratingGrowth: 0,
                acceptanceGrowth: 0
            });
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-400 font-medium animate-pulse">Generating performance report...</div>
            </div>
        );
    }

    if (!report) return <div className="text-center p-8 text-slate-500">No data available</div>;

    const cards = [
        {
            label: "Total Rides",
            value: (report.totalRides ?? 0).toLocaleString(),
            icon: DirectionsCar,
            growth: report.weeklyGrowth,
            bgClass: "bg-amber-500/10",
            textClass: "text-amber-400"
        },
        {
            label: "Total Earnings",
            value: `KES ${(report.earnings ?? 0).toLocaleString()}`,
            icon: MonetizationOn,
            growth: report.earningsGrowth,
            bgClass: "bg-emerald-500/10",
            textClass: "text-emerald-400"
        },
        {
            label: "Avg Rating",
            value: report.avgRating ? Number(report.avgRating).toFixed(2) : "0.00",
            icon: Star,
            growth: report.ratingGrowth,
            bgClass: "bg-amber-500/10",
            textClass: "text-amber-400"
        },
        {
            label: "Acceptance Rate",
            value: `${report.acceptanceRate ?? 0}%`,
            icon: ThumbUp,
            growth: report.acceptanceGrowth,
            bgClass: "bg-emerald-500/10",
            textClass: "text-emerald-400"
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                category="Fleet & People"
                title="Driver Performance & Fleet Metrics"
                subtitle="Comprehensive overview of driver ratings, acceptance rates, and gross earnings."
                icon={<Assessment className="text-amber-500" />}
                actions={
                    <button className="btn-secondary flex items-center gap-1.5">
                        <Download fontSize="small" />
                        Export CSV
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-[#131722] p-6 rounded-[3px] shadow-sm border border-white/10 transition-all hover:border-amber-500/30">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-[3px] ${card.bgClass} ${card.textClass}`}>
                                <card.icon fontSize="medium" />
                            </div>
                            {card.growth !== undefined && (
                                <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${card.growth >= 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                                    {card.growth >= 0 ? <TrendingUp style={{ fontSize: 14 }} className="mr-1" /> : <TrendingDown style={{ fontSize: 14 }} className="mr-1" />}
                                    {Math.abs(card.growth)}%
                                </div>
                            )}
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
                        <h3 className="text-2xl font-bold text-white">{card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Placeholder Chart / Table Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#131722] p-6 rounded-2xl shadow-sm border border-white/10 h-80 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-white/[0.04] rounded-2xl mb-4">
                        <DirectionsCar className="text-amber-500 text-4xl" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Driver Activity Trends</h3>
                    <p className="text-slate-400 text-sm max-w-xs">
                        Fleet rides per day, online driver concurrency, and hour-by-hour operational activity.
                    </p>
                </div>

                <div className="bg-[#131722] p-6 rounded-2xl shadow-sm border border-white/10 h-80 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-white/[0.04] rounded-2xl mb-4">
                        <MonetizationOn className="text-emerald-400 text-4xl" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Earnings Distribution</h3>
                    <p className="text-slate-400 text-sm max-w-xs">
                        Net commission earnings, payout velocity, and top earner bracket benchmarks.
                    </p>
                </div>
            </div>
        </div>
    );
};
