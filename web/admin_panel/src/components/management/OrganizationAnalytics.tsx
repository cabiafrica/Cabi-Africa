import React from 'react';
import { Card, Title, AreaChart, DonutChart, BarList, Flex, Text, Metric, Grid, BadgeDelta } from '@tremor/react';

const chartdata = [
    { date: 'Jan 23', "Nairobi West Drivers": 100, "CBD Elite": 60, "Taxi Association": 200 },
    { date: 'Feb 23', "Nairobi West Drivers": 110, "CBD Elite": 65, "Taxi Association": 220 },
    { date: 'Mar 23', "Nairobi West Drivers": 115, "CBD Elite": 70, "Taxi Association": 250 },
    { date: 'Apr 23', "Nairobi West Drivers": 118, "CBD Elite": 72, "Taxi Association": 300 },
    { date: 'May 23', "Nairobi West Drivers": 120, "CBD Elite": 80, "Taxi Association": 380 },
    { date: 'Jun 23', "Nairobi West Drivers": 140, "CBD Elite": 85, "Taxi Association": 450 },
];

const typeData = [
    { name: 'Unions', value: 450 },
    { name: 'Groups', value: 205 }, // 120 + 85
    { name: 'Associations', value: 0 },
];

const activityData = [
    { name: 'Nairobi Taxi Association', value: 85, icon: () => <span>🚕</span> },
    { name: 'Nairobi West Drivers', value: 65, icon: () => <span>🚗</span> },
    { name: 'CBD Elite', value: 45, icon: () => <span>🚙</span> },
    { name: 'Digital Drivers Ke', value: 30, icon: () => <span>📱</span> },
];

const kpiData = [
    { title: "Total Organizations", metric: "4", delta: "+1", deltaType: "moderateIncrease" },
    { title: "Total Members", metric: "655", delta: "+12.5%", deltaType: "increase" },
    { title: "Active Trips Now", metric: "142", delta: "-3.2%", deltaType: "moderateDecrease" },
];

export const OrganizationAnalytics: React.FC = () => {
    return (
        <div className="space-y-6 mb-8">
            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                {kpiData.map((item) => (
                    <Card key={item.title} decoration="top" decorationColor="indigo">
                        <Flex alignItems="start">
                            <div className="truncate">
                                <Text>{item.title}</Text>
                                <Metric>{item.metric}</Metric>
                            </div>
                            <BadgeDelta deltaType={item.deltaType}>{item.delta}</BadgeDelta>
                        </Flex>
                    </Card>
                ))}
            </Grid>

            <Grid numItems={1} numItemsLg={2} className="gap-6">
                <Card>
                    <Title>Membership Growth (Top Orgs)</Title>
                    <AreaChart
                        className="h-72 mt-4"
                        data={chartdata}
                        index="date"
                        categories={["Nairobi West Drivers", "CBD Elite", "Taxi Association"]}
                        colors={["indigo", "cyan", "blue"]}
                    />
                </Card>
                <Card>
                    <Title>Organization Details</Title>
                    <Flex className="mt-4">
                        <div className="w-1/2">
                            <Text className="text-center mb-2">Structure Distribution</Text>
                            <DonutChart
                                className="h-40"
                                data={typeData}
                                category="value"
                                index="name"
                                colors={["slate", "teal", "indigo", "rose", "cyan", "amber"]}
                            />
                        </div>
                        <div className="w-1/2 pl-4 border-l border-gray-200">
                            <Text className="mb-2">Engagement Score (Activity)</Text>
                            <BarList data={activityData} className="mt-2" />
                        </div>
                    </Flex>
                </Card>
            </Grid>
        </div>
    );
};
