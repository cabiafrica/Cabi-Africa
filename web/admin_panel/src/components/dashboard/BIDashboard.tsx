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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-cyan-600 dark:text-cyan-400" />
                        Business Intelligence
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Global performance metrics and growth analytics.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800 flex items-center">
                        Market Health: Initializing
                    </span>
                </div>
            </div>

            <Grid numItems={1} numItemsSm={2} numItemsLg={5} className="gap-4">
                <Card decoration="top" decorationColor="indigo" className="bg-white dark:bg-card-dark ring-1 ring-slate-200 dark:ring-slate-700">
                    <Text className="dark:text-slate-400">Gross Bookings</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.grossBookings?.toLocaleString() || '0'} KES</Metric>
                    <BadgeDelta deltaType="unchanged" size="xs" className="mt-2">0.0%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="rose" className="bg-white dark:bg-card-dark ring-1 ring-slate-200 dark:ring-slate-700">
                    <Text className="dark:text-slate-400">Total Trips</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.trips?.toLocaleString() || '0'}</Metric>
                    <BadgeDelta deltaType="unchanged" size="xs" className="mt-2">0.0%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="cyan" className="bg-white dark:bg-card-dark ring-1 ring-slate-200 dark:ring-slate-700">
                    <Text className="dark:text-slate-400">New Users</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.newUsers || '0'}</Metric>
                    <BadgeDelta deltaType="unchanged" size="xs" className="mt-2">0.0%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="amber" className="bg-white dark:bg-card-dark ring-1 ring-slate-200 dark:ring-slate-700">
                    <Text className="dark:text-slate-400">Active Drivers</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.activeDrivers || '0'}</Metric>
                    <BadgeDelta deltaType="unchanged" size="xs" className="mt-2">0.0%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="emerald" className="bg-white dark:bg-card-dark ring-1 ring-slate-200 dark:ring-slate-700">
                    <Text className="dark:text-slate-400">Avg Rating</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.avgRating || '0'} ★</Metric>
                    <Text className="text-xs text-slate-500 mt-2">Target: 4.8</Text>
                </Card>
            </Grid>

            <Grid numItems={1} numItemsLg={2} className="gap-6">
                <Card className="bg-white dark:bg-card-dark ring-1 ring-slate-200 dark:ring-slate-700">
                    <Title className="dark:text-white">Revenue Growth (H1 2024)</Title>
                    <AreaChart
                        className="h-72 mt-4"
                        data={revenueData}
                        index="date"
                        categories={["Revenue", "Target"]}
                        colors={["indigo", "cyan"]}
                        valueFormatter={valueFormatter}
                        showAnimation={true}
                    />
                </Card>
                <Card className="bg-white dark:bg-card-dark ring-1 ring-slate-200 dark:ring-slate-700">
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
