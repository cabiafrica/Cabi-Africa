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
        adminService.getBIStats().then(setStats).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    // Mock chart data since adminService might not provide it yet
    const revenueData = [
        { date: 'Jan', Revenue: 450000, Target: 400000 },
        { date: 'Feb', Revenue: 520000, Target: 420000 },
        { date: 'Mar', Revenue: 480000, Target: 440000 },
        { date: 'Apr', Revenue: 610000, Target: 460000 },
        { date: 'May', Revenue: 590000, Target: 480000 },
        { date: 'Jun', Revenue: 720000, Target: 500000 },
    ];

    const cityVolumeData = [
        { city: 'Nairobi', Trips: 12450 },
        { city: 'Mombasa', Trips: 3840 },
        { city: 'Kisumu', Trips: 2100 },
        { city: 'Nakuru', Trips: 1560 },
        { city: 'Eldoret', Trips: 980 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-indigo-600 dark:text-indigo-400" />
                        Business Intelligence
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Global performance metrics and growth analytics.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800 flex items-center">
                        Market Health: Strong
                    </span>
                </div>
            </div>

            <Grid numItems={1} numItemsSm={2} numItemsLg={5} className="gap-4">
                <Card decoration="top" decorationColor="indigo" className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                    <Text className="dark:text-slate-400">Gross Bookings</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.grossBookings.toLocaleString()} KES</Metric>
                    <BadgeDelta deltaType="moderateIncrease" size="xs" className="mt-2">+12.5%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="rose" className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                    <Text className="dark:text-slate-400">Total Trips</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.trips.toLocaleString()}</Metric>
                    <BadgeDelta deltaType="increase" size="xs" className="mt-2">+8.2%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="cyan" className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                    <Text className="dark:text-slate-400">New Users</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.newUsers}</Metric>
                    <BadgeDelta deltaType="increase" size="xs" className="mt-2">+24%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="amber" className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                    <Text className="dark:text-slate-400">Active Drivers</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.activeDrivers}</Metric>
                    <BadgeDelta deltaType="moderateDecrease" size="xs" className="mt-2 text-red-500">-1.4%</BadgeDelta>
                </Card>
                <Card decoration="top" decorationColor="emerald" className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                    <Text className="dark:text-slate-400">Avg Rating</Text>
                    <Metric className="dark:text-white mt-1 text-2xl">{stats.avgRating} ★</Metric>
                    <Text className="text-xs text-slate-500 mt-2">Target: 4.8</Text>
                </Card>
            </Grid>

            <Grid numItems={1} numItemsLg={2} className="gap-6">
                <Card className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
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
                <Card className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
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
