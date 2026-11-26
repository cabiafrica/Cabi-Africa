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
import { PageHeader } from '../common/PageHeader';
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
            <PageHeader
                category="Growth & Platform"
                title="Marketplace Simulator"
                subtitle="Predict outcomes of pricing strategy changes before applying them live."
                icon={<Science className="text-amber-500" />}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Simulation Controls */}
                <Card className="!bg-[#131722] !border !border-white/10 rounded h-fit lg:col-span-1 shadow-lg">
                    <Title className="mb-4 text-white">Simulation Parameters</Title>

                    <div className="space-y-6">
                        <div>
                            <Flex className="mb-2">
                                <Text className="text-slate-300">Base Fare Adjustment</Text>
                                <Text className="font-bold text-white">{fareIncrease > 0 ? '+' : ''}{fareIncrease}%</Text>
                            </Flex>
                            <input
                                type="range"
                                aria-label="Base Fare Adjustment"
                                min="-50"
                                max="50"
                                value={fareIncrease}
                                onChange={(e) => setFareIncrease(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>-50%</span>
                                <span>0%</span>
                                <span>+50%</span>
                            </div>
                        </div>

                        <div>
                            <Flex className="mb-2">
                                <Text className="text-slate-300">Surge Cap Multiplier</Text>
                                <Text className="font-bold text-white">{surgeCap.toFixed(1)}x</Text>
                            </Flex>
                            <input
                                type="range"
                                aria-label="Surge Cap Multiplier"
                                min="1.0"
                                max="5.0"
                                step="0.1"
                                value={surgeCap}
                                onChange={(e) => setSurgeCap(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>1.0x</span>
                                <span>3.0x</span>
                                <span>5.0x</span>
                            </div>
                        </div>

                        <div>
                            <Flex className="mb-2">
                                <Text className="text-slate-300">Driver Incentive Boost</Text>
                                <Text className="font-bold text-white">{incentiveBoost}%</Text>
                            </Flex>
                            <input
                                type="range"
                                aria-label="Driver Incentive Boost"
                                min="0"
                                max="100"
                                value={incentiveBoost}
                                onChange={(e) => setIncentiveBoost(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <button
                                onClick={handleRun}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black py-2 px-4 rounded text-xs font-semibold shadow-sm shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#131722]/60 rounded border-2 border-dashed border-white/10">
                            <Science fontSize="large" className="text-amber-500/40 mb-4 scale-150" />
                            <h3 className="text-lg font-bold text-white">Ready to Simulate</h3>
                            <p className="text-slate-400 max-w-sm mt-2 text-sm">
                                Adjust parameters on the left and click "Run Simulation" to see AI-projected outcomes for revenue and demand.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="!bg-[#131722] !border !border-white/10 rounded border-l-4 border-l-amber-500 shadow-lg">
                                <Title className="text-white mb-2">30-Day Projection Overview</Title>
                                <Text className="text-slate-400 mb-6">Estimated impact based on historical data and elasticity models.</Text>

                                <Grid numItems={1} numItemsSm={3} className="gap-6">
                                    <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded">
                                        <Flex justifyContent="start" alignItems="center" className="gap-2 mb-1">
                                            <AttachMoney fontSize="small" className="text-amber-400" />
                                            <Text className="text-slate-400 uppercase text-xs font-bold tracking-wider">Revenue</Text>
                                        </Flex>
                                        <Metric className="text-white text-2xl">${result.projectedRevenue.toLocaleString()}</Metric>
                                        <BadgeDelta deltaType={getDeltaType(result.revenueChange)} className="mt-2">
                                            {result.revenueChange > 0 ? '+' : ''}{result.revenueChange}%
                                        </BadgeDelta>
                                    </div>

                                    <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded">
                                        <Flex justifyContent="start" alignItems="center" className="gap-2 mb-1">
                                            <People fontSize="small" className="text-amber-400" />
                                            <Text className="text-slate-400 uppercase text-xs font-bold tracking-wider">Driver Earnings</Text>
                                        </Flex>
                                        <Metric className="text-white text-2xl">${result.projectedDriverEarnings.toLocaleString()}</Metric>
                                        <BadgeDelta deltaType={getDeltaType(result.driverEarningsChange)} className="mt-2">
                                            {result.driverEarningsChange > 0 ? '+' : ''}{result.driverEarningsChange}%
                                        </BadgeDelta>
                                    </div>

                                    <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded">
                                        <Flex justifyContent="start" alignItems="center" className="gap-2 mb-1">
                                            <TrendingUp fontSize="small" className="text-amber-400" />
                                            <Text className="text-slate-400 uppercase text-xs font-bold tracking-wider">Ride Volume</Text>
                                        </Flex>
                                        <Metric className="text-white text-2xl">{result.projectedRides.toLocaleString()}</Metric>
                                        <BadgeDelta deltaType={getDeltaType(result.demandChange)} className="mt-2">
                                            {result.demandChange > 0 ? '+' : ''}{result.demandChange}%
                                        </BadgeDelta>
                                    </div>
                                </Grid>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="!bg-[#131722] !border !border-white/10 rounded shadow-lg">
                                    <Title className="text-white mb-4">Driver Retention Probability</Title>
                                    <Flex className="mb-2">
                                        <Text className="text-slate-300">High Retention Zone</Text>
                                        <Text className="font-bold text-emerald-400">85%</Text>
                                    </Flex>
                                    <ProgressBar value={85} color="emerald" className="mt-2" />
                                    <Text className="text-xs text-slate-400 mt-3">
                                        Incentive boost of {incentiveBoost}% likely improves retention by ~12%.
                                    </Text>
                                </Card>

                                <Card className="!bg-[#131722] !border !border-white/10 rounded shadow-lg">
                                    <Title className="text-white mb-4">Passenger Churn Risk</Title>
                                    <Flex className="mb-2">
                                        <Text className="text-slate-300">Churn Likelihood</Text>
                                        <Text className={`font-bold ${fareIncrease > 10 ? 'text-red-400' : 'text-slate-300'}`}>
                                            {fareIncrease > 10 ? 'High' : 'Low'}
                                        </Text>
                                    </Flex>
                                    <ProgressBar
                                        value={Math.max(10, Math.min(100, 20 + fareIncrease * 1.5))}
                                        color={fareIncrease > 10 ? 'rose' : 'amber'}
                                        className="mt-2"
                                    />
                                    <Text className="text-xs text-slate-400 mt-3">
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
