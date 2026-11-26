import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    AreaChart,
    BarChart,
    Card,
    Title,
    Text,
    Metric,
    Grid,
    Flex,
    BadgeDelta
} from '@tremor/react';
import {
    TrendingUp,
    People,
    AttachMoney,
    DirectionsCar,
    Star
} from '@mui/icons-material';
import { PageHeader } from '../common/PageHeader';

const valueFormatter = (number: number) =>
    `KES ${Intl.NumberFormat('us').format(number).toString()}`;

export const BIDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getBIStats().then(data => {
            setStats(data || { grossBookings: 0, trips: 0, newUsers: 0, activeDrivers: 0, avgRating: 0 });
        }).catch(err => {
            console.error('Failed to load BI stats', err);
            setStats({ grossBookings: 0, trips: 0, newUsers: 0, activeDrivers: 0, avgRating: 0 });
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
    );

    // Data will be populated from API
    const revenueData: any[] = [];
    const cityVolumeData: any[] = [];

    return (
        <div className="space-y-6">
            <PageHeader
                category="Command Center"
                title="Business Intelligence"
                subtitle="Global performance metrics, revenue trajectories, and growth analytics."
                icon={<TrendingUp className="text-amber-500" />}
                badge={
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-[3px] border border-amber-500/20">
                        Market Health: 99.4%
                    </span>
                }
            />

            <Grid numItems={1} numItemsSm={2} numItemsLg={5} className="gap-4">
                <Card decoration="top" decorationColor="amber" className="bg-white dark:bg-[#131722] ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl">
                    <Text className="dark:text-slate-400 font-medium">Gross Bookings</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.grossBookings?.toLocaleString() || '0'} KES</Metric>
                    <BadgeDelta deltaType="unchanged" size="xs" className="mt-2">0.0%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="amber" className="bg-white dark:bg-[#131722] ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl">
                    <Text className="dark:text-slate-400 font-medium">Total Trips</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.trips?.toLocaleString() || '0'}</Metric>
                    <BadgeDelta deltaType="unchanged" size="xs" className="mt-2">0.0%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="emerald" className="bg-white dark:bg-[#131722] ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl">
                    <Text className="dark:text-slate-400 font-medium">New Users</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.newUsers || '0'}</Metric>
                    <BadgeDelta deltaType="unchanged" size="xs" className="mt-2">0.0%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="amber" className="bg-white dark:bg-[#131722] ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl">
                    <Text className="dark:text-slate-400 font-medium">Active Drivers</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.activeDrivers || '0'}</Metric>
                    <BadgeDelta deltaType="unchanged" size="xs" className="mt-2">0.0%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="emerald" className="bg-white dark:bg-[#131722] ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl">
                    <Text className="dark:text-slate-400 font-medium">Avg Rating</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.avgRating || '0'} ★</Metric>
                    <Text className="text-xs text-slate-500 mt-2">Target: 4.8</Text>
                </Card>
            </Grid>

            <Grid numItems={1} numItemsLg={2} className="gap-6">
                <Card className="bg-white dark:bg-[#131722] ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl">
                    <Title className="dark:text-white">Revenue Growth (H1 2024)</Title>
                    <AreaChart
                        className="h-72 mt-4"
                        data={revenueData}
                        index="date"
                        categories={["Revenue", "Target"]}
                        colors={["amber", "emerald"]}
                        valueFormatter={valueFormatter}
                        showAnimation={true}
                    />
                </Card>
                <Card className="bg-white dark:bg-[#131722] ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl">
                    <Title className="dark:text-white">Trip Volume by City</Title>
                    <BarChart
                        className="h-72 mt-4"
                        data={cityVolumeData}
                        index="city"
                        categories={["Trips"]}
                        colors={["emerald"]}
                        valueFormatter={(number) => Intl.NumberFormat('us').format(number).toString()}
                        layout="vertical"
                        showAnimation={true}
                    />
                </Card>
            </Grid>
        </div>
    );
};
