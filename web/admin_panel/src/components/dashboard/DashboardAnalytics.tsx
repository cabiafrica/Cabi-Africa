import React from 'react';
import { Card, Title, Flex, Text, Metric, Grid, BadgeDelta, Tab, TabList, TabGroup, TabPanels, TabPanel, List, ListItem, BarChart } from '@tremor/react';
import { RevenueWidget } from '../widgets/RevenueWidget';
import { RideStatusWidget } from '../widgets/RideStatusWidget';
import { NetworkGrowthWidget } from '../widgets/NetworkGrowthWidget';
import { AcquisitionChannelWidget } from '../widgets/AcquisitionChannelWidget';
import { kpiData, dailySignups } from '../widgets/data';

const alertData = [
    { name: 'High Surge in CBD', status: 'critical' },
    { name: 'Driver Verification Pending (5)', status: 'warning' },
    { name: 'Payment Gateway Stable', status: 'success' }
];

export const DashboardAnalytics: React.FC = () => {
    return (
        <div className="space-y-6">
            <TabGroup>
                <TabList className="mt-4">
                    <Tab>Overview</Tab>
                    <Tab>Network Growth</Tab>
                    <Tab>Financial Performance</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <div className="space-y-6 mt-6">
                            {/* Top KPIs */}
                            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                                {kpiData.map((item) => (
                                    <Card key={item.title} decoration="top" decorationColor={'amber' as any}>
                                        <Flex alignItems="start">
                                            <div className="truncate">
                                                <Text>{item.title}</Text>
                                                <Metric>{item.metric}</Metric>
                                            </div>
                                            <BadgeDelta deltaType={item.deltaType as any}>{item.delta}</BadgeDelta>
                                        </Flex>
                                    </Card>
                                ))}
                            </Grid>

                            {/* Main Charts */}
                            <Grid numItems={1} numItemsLg={2} className="gap-6">
                                <RevenueWidget />
                                <RideStatusWidget />
                            </Grid>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <Title>System Alerts</Title>
                                    <List className="mt-4">
                                        {alertData.map((item) => (
                                            <ListItem key={item.name}>
                                                <span>{item.name}</span>
                                                <span className={`inline-block w-3 h-3 rounded-full ${item.status === 'critical' ? 'bg-red-500' :
                                                    item.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}></span>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Card>
                                <Card decoration="left" decorationColor="amber">
                                    <Title>Pending Tasks</Title>
                                    <Text className="mt-2">You have 5 document verifications and 2 support tickets requiring high priority attention.</Text>
                                    <div className="mt-6">
                                        <button className="bg-primary text-black px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-colors">View Tasks</button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="space-y-6 mt-6">
                            <Grid numItems={1} numItemsLg={3} className="gap-6">
                                <div className="col-span-1 lg:col-span-2">
                                    <NetworkGrowthWidget />
                                </div>
                                <AcquisitionChannelWidget />
                            </Grid>

                            <Grid numItems={1} numItemsLg={2} className="gap-6">
                                <Card>
                                    <Title>Daily New Registrations (This Week)</Title>
                                    <BarChart
                                        className="h-60 mt-4"
                                        data={dailySignups}
                                        index="date"
                                        categories={["NewUsers"]}
                                        colors={["teal"]}
                                    />
                                </Card>
                                <Card decoration="top" decorationColor="amber">
                                    <Title>Network Virality Coefficient</Title>
                                    <Metric className="mt-4">1.4</Metric>
                                    <Text>Each active user invites ~1.4 new users.</Text>
                                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[70%] shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
                                    </div>
                                    <Text className="text-xs text-gray-500 mt-2">Target: 2.0 (Viral Growth)</Text>
                                </Card>
                            </Grid>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="space-y-6 mt-6">
                            <Text>Financial Analytics coming soon...</Text>
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};

