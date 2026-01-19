import React, { useState } from 'react';
import { adminService, SimulationResult } from '../../services/adminService';
import {
    Science,
    AttachMoney,
    TrendingUp,
    TrendingDown,
    Speed,
    People,
    PlayArrow
} from '@mui/icons-material';
import {
    AreaChart,
    Card,
    Title,
    Text,
    Metric,
    Grid,
    BadgeDelta,
    Flex,
    ProgressBar
} from '@tremor/react';

export const SimulationDashboard: React.FC = () => {
    const [fareIncrease, setFareIncrease] = useState(0);
    const [surgeCap, setSurgeCap] = useState(2.0);
    const [incentiveBoost, setIncentiveBoost] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);

    const handleRun = async () => {
        setLoading(true);
        try {
            const data = await adminService.runSimulation({
                fareIncreasePercentage: fareIncrease,
                surgeCapMultiplier: surgeCap,
                incentiveBoostPercentage: incentiveBoost
            });
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Simulation failed.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine delta type for Tremor Badges
    const getDeltaType = (change: number) => {
        if (change > 10) return "increase";
        if (change > 0) return "moderateIncrease";
        if (change === 0) return "unchanged";
        if (change > -10) return "moderateDecrease";
        return "decrease";
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Science className="text-purple-600 dark:text-purple-400" />
                        Marketplace Simulator
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Predict outcomes of pricing strategy changes before applying them live.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Simulation Controls */}
                <Card className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 h-fit lg:col-span-1">
                    <Title className="mb-4 dark:text-white">Simulation Parameters</Title>

                    <div className="space-y-6">
                        <div>
                            <Flex className="mb-2">
                                <Text className="dark:text-slate-300">Base Fare Adjustment</Text>
                                <Text className="font-bold dark:text-white">{fareIncrease > 0 ? '+' : ''}{fareIncrease}%</Text>
                            </Flex>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                value={fareIncrease}
                                onChange={(e) => setFareIncrease(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>-50%</span>
                                <span>0%</span>
                                <span>+50%</span>
                            </div>
                        </div>

                        <div>
                            <Flex className="mb-2">
                                <Text className="dark:text-slate-300">Surge Cap Multiplier</Text>
                                <Text className="font-bold dark:text-white">{surgeCap.toFixed(1)}x</Text>
                            </Flex>
                            <input
                                type="range"
                                min="1.0"
                                max="5.0"
                                step="0.1"
                                value={surgeCap}
                                onChange={(e) => setSurgeCap(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>1.0x</span>
                                <span>3.0x</span>
                                <span>5.0x</span>
                            </div>
                        </div>

                        <div>
                            <Flex className="mb-2">
                                <Text className="dark:text-slate-300">Driver Incentive Boost</Text>
                                <Text className="font-bold dark:text-white">{incentiveBoost}%</Text>
                            </Flex>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={incentiveBoost}
                                onChange={(e) => setIncentiveBoost(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={handleRun}
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><PlayArrow /> Run Simulation</>
                                )}
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Results Section */}
                <div className="lg:col-span-2 space-y-6">
                    {!result ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Science fontSize="large" className="text-slate-300 dark:text-slate-600 mb-4 scale-150" />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Ready to Simulate</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
                                Adjust parameters on the left and click "Run Simulation" to see AI-projected outcomes for revenue and demand.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 border-l-4 border-purple-500">
                                <Title className="dark:text-white mb-2">30-Day Projection Overview</Title>
                                <Text className="dark:text-slate-400 mb-6">Estimated impact based on historical data and elasticity models.</Text>

                                <Grid numItems={1} numItemsSm={3} className="gap-6">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <Flex justifyContent="start" alignItems="center" className="gap-2 mb-1">
                                            <AttachMoney fontSize="small" className="text-slate-500" />
                                            <Text className="text-slate-500 uppercase text-xs font-bold tracking-wider">Revenue</Text>
                                        </Flex>
                                        <Metric className="dark:text-white text-2xl">${result.projectedRevenue.toLocaleString()}</Metric>
                                        <BadgeDelta deltaType={getDeltaType(result.revenueChange)} className="mt-2">
                                            {result.revenueChange > 0 ? '+' : ''}{result.revenueChange}%
                                        </BadgeDelta>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <Flex justifyContent="start" alignItems="center" className="gap-2 mb-1">
                                            <People fontSize="small" className="text-slate-500" />
                                            <Text className="text-slate-500 uppercase text-xs font-bold tracking-wider">Driver Earnings</Text>
                                        </Flex>
                                        <Metric className="dark:text-white text-2xl">${result.projectedDriverEarnings.toLocaleString()}</Metric>
                                        <BadgeDelta deltaType={getDeltaType(result.driverEarningsChange)} className="mt-2">
                                            {result.driverEarningsChange > 0 ? '+' : ''}{result.driverEarningsChange}%
                                        </BadgeDelta>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <Flex justifyContent="start" alignItems="center" className="gap-2 mb-1">
                                            <TrendingUp fontSize="small" className="text-slate-500" />
                                            <Text className="text-slate-500 uppercase text-xs font-bold tracking-wider">Ride Volume</Text>
                                        </Flex>
                                        <Metric className="dark:text-white text-2xl">{result.projectedRides.toLocaleString()}</Metric>
                                        <BadgeDelta deltaType={getDeltaType(result.demandChange)} className="mt-2">
                                            {result.demandChange > 0 ? '+' : ''}{result.demandChange}%
                                        </BadgeDelta>
                                    </div>
                                </Grid>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                                    <Title className="dark:text-white mb-4">Driver Retention Probability</Title>
                                    <Flex className="mb-2">
                                        <Text className="dark:text-slate-300">High Retention Zone</Text>
                                        <Text className="font-bold text-green-600">85%</Text>
                                    </Flex>
                                    <ProgressBar value={85} color="emerald" className="mt-2" />
                                    <Text className="text-xs text-slate-500 mt-3">
                                        Incentive boost of {incentiveBoost}% likely improves retention by ~12%.
                                    </Text>
                                </Card>

                                <Card className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                                    <Title className="dark:text-white mb-4">Passenger Churn Risk</Title>
                                    <Flex className="mb-2">
                                        <Text className="dark:text-slate-300">Churn Likelihood</Text>
                                        <Text className={`font-bold ${fareIncrease > 10 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {fareIncrease > 10 ? 'High' : 'Low'}
                                        </Text>
                                    </Flex>
                                    <ProgressBar
                                        value={Math.max(10, Math.min(100, 20 + fareIncrease * 1.5))}
                                        color={fareIncrease > 10 ? 'rose' : 'blue'}
                                        className="mt-2"
                                    />
                                    <Text className="text-xs text-slate-500 mt-3">
                                        Price sensitivity analysis suggests churn risk increases significantly above +15% fare hike.
                                    </Text>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
