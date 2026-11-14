import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Card, Title, Text, BarChart, Grid, Metric } from '@tremor/react';

// Define the interface for dashboard stats
interface ReferralDashboardStats {
    totalCommissions: number;
    totalReferredDrivers: number;
    newReferredDriversLast30Days: number;
    referralConversionRate: number;
    avgReferralsPerDriver: number;
    topReferrers: { driverId: string; name: string; referrals: number }[];
    chartData: { date: string; newReferrals: number }[];
}

export const ReferralDashboard: React.FC = () => {
    const [stats, setStats] = useState<ReferralDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await adminService.getReferralDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch Referral stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-6 text-center text-gray-500">Loading Dashboard...</div>;
    if (!stats) return <div className="p-6 text-center text-red-500">Failed to load data.</div>;

    const dataFormatter = (number: number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-900">Referral Program Overview</h1>

            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
                <Card>
                    <Text>Total Commissions Paid</Text>
                    <Metric>KSh {dataFormatter(stats.totalCommissions)}</Metric>
                </Card>
                <Card>
                    <Text>Total Referred Drivers</Text>
                    <Metric>{dataFormatter(stats.totalReferredDrivers)}</Metric>
                </Card>
                <Card>
                    <Text>New Referrals (Last 30 Days)</Text>
                    <Metric>{dataFormatter(stats.newReferredDriversLast30Days)}</Metric>
                </Card>
                <Card>
                    <Text>Avg Referrals / Driver</Text>
                    <Metric>{stats.avgReferralsPerDriver}</Metric>
                </Card>
            </Grid>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <Title>New Driver Referrals Trend</Title>
                    <BarChart
                        className="mt-6"
                        data={stats.chartData}
                        index="date"
                        categories={["newReferrals"]}
                        colors={["blue"]}
                        valueFormatter={dataFormatter}
                        yAxisWidth={48}
                    />
                </Card>

                <Card>
                    <Title>Top Referrers Leaderboard</Title>
                    <div className="mt-4 flow-root">
                        <ul role="list" className="divide-y divide-gray-200">
                            {stats.topReferrers.map((referrer) => (
                                <li key={referrer.driverId} className="py-3 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                                            {referrer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{referrer.name}</p>
                                            <p className="text-xs text-gray-500">ID: {referrer.driverId}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">{referrer.referrals} Referrals</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
};
