import React from 'react';
import { Card, Title, Flex, Text, Metric, Grid, BadgeDelta, Tab, TabList, TabGroup, TabPanels, TabPanel, List, ListItem, BarChart } from '@tremor/react';
import { RevenueWidget } from '../widgets/RevenueWidget';
import { RideStatusWidget } from '../widgets/RideStatusWidget';
import { NetworkGrowthWidget } from '../widgets/NetworkGrowthWidget';
import { AcquisitionChannelWidget } from '../widgets/AcquisitionChannelWidget';
import { kpiData, dailySignups } from '../widgets/data';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { 
    TrendingUp, 
    Assignment, 
    NotificationsActive,
    ElectricBolt,
    Security
} from '@mui/icons-material';
import { PageHeader } from '../common/PageHeader';

const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';

export const DashboardAnalytics: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                category="Command Center"
                title="Executive Telemetry & Analytics"
                subtitle="Real-time ecosystem vital signs, gross bookings, and network performance."
                icon={<TrendingUp className="text-amber-500" />}
            />
            
            <TabGroup>
                <TabList className="mt-2 flex gap-2 border-b border-white/10 pb-2">
                    <Tab className="ui-selected:bg-gradient-to-r ui-selected:from-amber-500 ui-selected:to-amber-600 ui-selected:text-black ui-selected:font-bold ui-selected:shadow-sm ui-selected:shadow-amber-500/20 text-slate-400 font-semibold px-4 py-1.5 text-xs rounded-[3px] transition-all outline-none border border-white/5 ui-selected:border-amber-500">Overview</Tab>
                    <Tab className="ui-selected:bg-gradient-to-r ui-selected:from-amber-500 ui-selected:to-amber-600 ui-selected:text-black ui-selected:font-bold ui-selected:shadow-sm ui-selected:shadow-amber-500/20 text-slate-400 font-semibold px-4 py-1.5 text-xs rounded-[3px] transition-all outline-none border border-white/5 ui-selected:border-amber-500">Network Growth</Tab>
                    <Tab className="ui-selected:bg-gradient-to-r ui-selected:from-amber-500 ui-selected:to-amber-600 ui-selected:text-black ui-selected:font-bold ui-selected:shadow-sm ui-selected:shadow-amber-500/20 text-slate-400 font-semibold px-4 py-1.5 text-xs rounded-[3px] transition-all outline-none border border-white/5 ui-selected:border-amber-500">Financial Intelligence</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <div className="space-y-8 mt-6">
                            {/* Top KPIs */}
                            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                                {kpiData.map((item) => (
                                    <Card 
                                        key={item.title} 
                                        className="bg-[#131722] border border-white/10 rounded-[3px] p-6 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <TrendingUp sx={{ fontSize: 60, color: '#FFD700' }} />
                                        </div>
                                        <Flex alignItems="start" className="relative z-10">
                                            <div className="truncate">
                                                <Text className="text-slate-400 font-medium uppercase tracking-wider text-xs mb-1">
                                                    {item.title}
                                                </Text>
                                                <Metric className="text-white font-bold text-3xl">
                                                    {item.metric}
                                                </Metric>
                                            </div>
                                            <BadgeDelta 
                                                deltaType={item.deltaType as any}
                                                className="bg-primary/10 text-primary border border-primary/20"
                                            >
                                                {item.delta}
                                            </BadgeDelta>
                                        </Flex>
                                        <div className="mt-4 h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary/60 w-[65%]" />
                                        </div>
                                    </Card>
                                ))}
                            </Grid>

                            {/* Main Charts */}
                            <Grid numItems={1} numItemsLg={2} className="gap-8">
                                <RevenueWidget />
                                <RideStatusWidget />
                            </Grid>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="bg-[#131722] border border-white/10 rounded-[3px] p-6 lg:col-span-1">
                                    <Flex className="mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-[3px]">
                                                <NotificationsActive sx={{ color: '#ef4444' }} />
                                            </div>
                                            <Title className="text-white font-bold">Priority Alerts</Title>
                                        </div>
                                    </Flex>
                                    <List>
                                        <ListItem className="py-3 border-b border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                                                <Text className="text-slate-200">New OB Entry: SOS Triggered</Text>
                                            </div>
                                            <Text className="text-slate-500 text-xs">2m ago</Text>
                                        </ListItem>
                                        <ListItem className="py-3 border-b border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                                                <Text className="text-slate-200">Driver Verification Pending</Text>
                                            </div>
                                            <Text className="text-slate-500 text-xs">15m ago</Text>
                                        </ListItem>
                                        <ListItem className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#22D3EE]" />
                                                <Text className="text-slate-200">System Backup Completed</Text>
                                            </div>
                                            <Text className="text-slate-500 text-xs">1h ago</Text>
                                        </ListItem>
                                    </List>
                                </Card>

                                <Card className="bg-[#131722] border border-white/10 rounded-[3px] p-6 lg:col-span-2 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Security sx={{ fontSize: 120, color: '#FFD700' }} />
                                    </div>
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-[3px]">
                                                    <Assignment sx={{ color: '#F59E0B' }} />
                                                </div>
                                                <Title className="text-white font-bold">Operational Command</Title>
                                            </div>
                                            <Metric className="text-amber-400 font-bold mb-4">Ready for Review</Metric>
                                            <Text className="text-slate-400 max-w-lg leading-relaxed">
                                                Your administrative dashboard is synced with real-time field operations. 
                                                Currently, there are <span className="text-white font-medium">0 document verifications</span> and 
                                                <span className="text-white font-medium"> 0 urgent support tickets</span> requiring attention.
                                            </Text>
                                        </div>
                                        <div className="mt-8 flex gap-3">
                                            <button className="btn-primary">
                                                Execute Verification
                                            </button>
                                            <button className="btn-secondary">
                                                Audit Logs
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="space-y-8 mt-8">
                            <Grid numItems={1} numItemsLg={3} className="gap-8">
                                <div className="col-span-1 lg:col-span-2">
                                    <NetworkGrowthWidget />
                                </div>
                                <AcquisitionChannelWidget />
                            </Grid>

                            <Grid numItems={1} numItemsLg={2} className="gap-8">
                                <Card className="bg-slate-900/40 backdrop-blur-md ring-1 ring-white/10 rounded-2xl p-6">
                                    <Title className="text-white font-bold mb-6">Daily Operational Pulse</Title>
                                    <BarChart
                                        className="h-72"
                                        data={dailySignups}
                                        index="date"
                                        categories={["NewUsers"]}
                                        colors={["amber"]}
                                        showAnimation={true}
                                    />
                                </Card>
                                <Card className="bg-slate-900/40 backdrop-blur-md ring-1 ring-white/10 rounded-2xl p-6 flex flex-col justify-center">
                                    <Title className="text-white font-bold">Growth Intelligence</Title>
                                    <div className="mt-8 text-center">
                                        <Metric className="text-6xl text-primary font-black mb-2">0.0</Metric>
                                        <Text className="text-slate-400 font-medium uppercase tracking-[0.2em]">Virality Coefficient</Text>
                                    </div>
                                    <div className="mt-12 space-y-4">
                                        <Flex>
                                            <Text className="text-slate-400">Network Density</Text>
                                            <Text className="text-white font-bold">Low</Text>
                                        </Flex>
                                        <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary/60 w-[5%]" />
                                        </div>
                                        <Text className="text-xs text-slate-500 italic">Initialization of regional nodes in progress...</Text>
                                    </div>
                                </Card>
                            </Grid>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <ElectricBolt sx={{ fontSize: 80, color: 'rgba(255,215,0,0.1)', mb: 3 }} />
                            <Title className="text-white font-bold text-2xl mb-2">Quantum Financials</Title>
                            <Text className="text-slate-500 max-w-sm">
                                Real-time ledger tracking and algorithmic revenue forecasting are being calibrated.
                            </Text>
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};


