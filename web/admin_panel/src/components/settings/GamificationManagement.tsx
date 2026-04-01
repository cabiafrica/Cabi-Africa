import React, { useState, useEffect } from 'react';
import {
    EmojiEvents,
    Star,
    CardGiftcard,
    AccountBalanceWallet,
    Save,
    CheckCircle,
    Info,
    MilitaryTech,
    DirectionsCar,
    WorkspacePremium,
    EmojiEmotions,
    TrendingUp
} from '@mui/icons-material';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

interface RatingRule {
    stars: number;
    pointsAwarded: number;
}

interface BadgeLevel {
    id: string;
    name: string;
    minPoints: number;
    color: string;
    privileges: string[];
    loanDeductionRate: number;
    criteria?: any;
}

interface GamificationConfig {
    ratingRules: RatingRule[];
    badges: BadgeLevel[];
    passengerSpendRate: number;
    spinWheelThreshold: number;
}

const AVAILABLE_PRIVILEGES = [
    { id: 'PRIORITY_SUPPORT', label: 'Priority Support', type: 'both' },
    { id: 'ANALYTICS_ACCESS', label: 'Analytics Dashboard Access', type: 'driver' },
    { id: 'PAY_LATER', label: 'Pay Later Option', type: 'passenger' },
    { id: 'CHOOSE_DRIVER', label: 'Choose Specific Driver', type: 'passenger' },
    { id: 'FUEL_ADVANCE', label: 'Fuel Advances', type: 'driver' },
    { id: 'SERVICE_DISCOUNT', label: 'Vehicle Service Discounts', type: 'driver' },
    { id: 'LOAN_ACCESS', label: 'Big Ticket Loans Access', type: 'driver' },
    { id: 'ZERO_COMMISSION', label: '0% Commission Weeks', type: 'driver' },
    { id: 'FREE_TRIP', label: 'Monthly Free Trip', type: 'passenger' },
    { id: 'PRIORITY_DISPATCH', label: 'Priority Dispatch', type: 'driver' },
    { id: 'ZONE_SELECTION', label: 'Zone Selection', type: 'driver' },
    { id: 'COMMISSION_REBATE', label: 'Commission Rebate', type: 'driver' },
    { id: 'SACCO_BONUS', label: '3% Sacco Bonus', type: 'driver' },
    { id: 'SACCO_MATCH', label: 'Sacco Savings Match', type: 'driver' },
    { id: 'CREDIT_LIMIT_BOOST', label: 'Credit Limit Boost', type: 'driver' },
    { id: 'LOAN_RATE_REDUCTION', label: 'Loan Rate Reduction', type: 'driver' },
];

export const GamificationManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saccoLoading, setSaccoLoading] = useState(false);
    const [config, setConfig] = useState<GamificationConfig>({
        ratingRules: [
            { stars: 5, pointsAwarded: 2 },
            { stars: 4, pointsAwarded: 1 },
            { stars: 3, pointsAwarded: 0 },
            { stars: 2, pointsAwarded: -1 },
            { stars: 1, pointsAwarded: -3 },
        ],
        badges: [
            { id: 'BRONZE', name: 'Bronze', minPoints: 0, color: 'orange', privileges: [], loanDeductionRate: 0 },
            { id: 'SILVER', name: 'Silver', minPoints: 100, color: 'slate', privileges: ['PRIORITY_SUPPORT', 'ANALYTICS_ACCESS'], loanDeductionRate: 0 },
            { id: 'GOLD', name: 'Gold', minPoints: 500, color: 'yellow', privileges: ['PRIORITY_SUPPORT', 'ANALYTICS_ACCESS', 'PAY_LATER', 'CHOOSE_DRIVER', 'FUEL_ADVANCE', 'SERVICE_DISCOUNT'], loanDeductionRate: 15 },
            { id: 'PLATINUM', name: 'Platinum', minPoints: 2000, color: 'indigo', privileges: ['PRIORITY_SUPPORT', 'ANALYTICS_ACCESS', 'PAY_LATER', 'CHOOSE_DRIVER', 'FUEL_ADVANCE', 'SERVICE_DISCOUNT', 'LOAN_ACCESS', 'ZERO_COMMISSION', 'FREE_TRIP'], loanDeductionRate: 20 },
        ],
        passengerSpendRate: 100,
        spinWheelThreshold: 50,
    });

    const [saccoBadges, setSaccoBadges] = useState<any[]>([]);
    const [rewards, setRewards] = useState<any[]>([]);
    const [badgeStats, setBadgeStats] = useState<any>(null);

    useEffect(() => {
        fetchSaccoData();
    }, []);

    const fetchSaccoData = async () => {
        try {
            const [badgesRes, rewardsRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/badges`),
                fetch(`${API_BASE_URL}/admin/badges/rewards`),
                fetch(`${API_BASE_URL}/admin/badges/stats`),
            ]);

            const badgesData = await badgesRes.json();
            const rewardsData = await rewardsRes.json();
            const statsData = await statsRes.json();

            if (badgesData.success) {
                setSaccoBadges(badgesData.data.filter((b: any) => ['ROOKIE', 'STAR_DRIVER', 'ROAD_MASTER', 'ELITE'].includes(b.code)));
            }
            if (rewardsData.success) {
                setRewards(rewardsData.data);
            }
            if (statsData.success) {
                setBadgeStats(statsData.data);
            }
        } catch (error) {
            console.error('Failed to fetch sacco data:', error);
        }
    };

    const handleRatingChange = (stars: number, points: number) => {
        setConfig(prev => ({
            ...prev,
            ratingRules: prev.ratingRules.map(r => r.stars === stars ? { ...r, pointsAwarded: points } : r)
        }));
    };

    const handleBadgeChange = (badgeId: string, field: keyof BadgeLevel, value: any) => {
        setConfig(prev => ({
            ...prev,
            badges: prev.badges.map(b => b.id === badgeId ? { ...b, [field]: value } : b)
        }));
    };

    const togglePrivilege = (badgeId: string, privilegeId: string) => {
        setConfig(prev => ({
            ...prev,
            badges: prev.badges.map(b => {
                if (b.id === badgeId) {
                    const hasPrivilege = b.privileges.includes(privilegeId);
                    return {
                        ...b,
                        privileges: hasPrivilege
                            ? b.privileges.filter(p => p !== privilegeId)
                            : [...b.privileges, privilegeId]
                    };
                }
                return b;
            })
        }));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // In a real app, call API here
        }, 1500);
    };

    const getBadgeColorClass = (color: string) => {
        switch (color) {
            case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
            case 'slate': return 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
            case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
            case 'indigo': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <EmojiEvents className="text-amber-500" />
                        Gamification & Loyalty
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure rewards, tiers, and point systems.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save />}
                    Save Configuration
                </button>
            </div>

            <TabGroup>
                <TabList className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-1 mb-6">
                    <Tab className="ui-selected:border-indigo-500 ui-selected:text-indigo-600 dark:ui-selected:text-indigo-400 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent transition-colors outline-none">
                        Rating Rules
                    </Tab>
                    <Tab className="ui-selected:border-indigo-500 ui-selected:text-indigo-600 dark:ui-selected:text-indigo-400 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent transition-colors outline-none">
                        Badge Tiers
                    </Tab>
                    <Tab className="ui-selected:border-indigo-500 ui-selected:text-indigo-600 dark:ui-selected:text-indigo-400 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent transition-colors outline-none">
                        Privilege Matrix
                    </Tab>
                    <Tab className="ui-selected:border-indigo-500 ui-selected:text-indigo-600 dark:ui-selected:text-indigo-400 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent transition-colors outline-none">
                        Loan & Repayment
                    </Tab>
                    <Tab className="ui-selected:border-indigo-500 ui-selected:text-indigo-600 dark:ui-selected:text-indigo-400 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent transition-colors outline-none">
                        Sacco System
                    </Tab>
                </TabList>

                <TabPanels>
                    {/* RATING RULES */}
                    <TabPanel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Star className="text-yellow-400" /> Star Rating → Points
                                </h3>
                                <div className="space-y-3">
                                    {config.ratingRules.map((rule) => (
                                        <div key={rule.stars} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                                            <div className="flex items-center gap-3">
                                                <div className="flex">
                                                    {[...Array(rule.stars)].map((_, i) => <Star key={i} fontSize="small" className="text-yellow-400" />)}
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{rule.stars} Star</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={rule.pointsAwarded}
                                                    onChange={(e) => handleRatingChange(rule.stars, parseInt(e.target.value) || 0)}
                                                    className="w-20 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-center font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                                <span className="text-xs text-slate-500 uppercase font-bold">Pts</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-700 p-6">
                                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                                    <CardGiftcard /> Spin the Wheel Bonus
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                                    Incentivize consistency by offering a bonus chance game after a streak of perfect ratings.
                                </p>
                                <div className="flex flex-col gap-2 p-4 bg-white/60 dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trigger Threshold</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={config.spinWheelThreshold}
                                            onChange={(e) => setConfig({ ...config, spinWheelThreshold: parseInt(e.target.value) || 1 })}
                                            min={1}
                                            className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-slate-900 dark:text-white"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">consecutive 5-star ratings</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* BADGE TIERS */}
                    <TabPanel>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                            {config.badges.map((badge) => (
                                <div key={badge.id} className={`relative rounded-xl border-2 p-6 flex flex-col ${badge.id === 'PLATINUM' ? 'border-indigo-400 dark:border-indigo-500 shadow-lg' : 'border-slate-200 dark:border-slate-700'
                                    } bg-white dark:bg-slate-800`}>
                                    {badge.id === 'PLATINUM' && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Top Tier
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mb-4 mt-2">
                                        <div className={`p-2 rounded-lg ${getBadgeColorClass(badge.color).split(' ')[0]}`}>
                                            <MilitaryTech className={badge.color === 'yellow' ? 'text-yellow-600' : badge.color === 'orange' ? 'text-orange-600' : badge.color === 'slate' ? 'text-slate-600' : 'text-indigo-600'} />
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded border capitalize ${getBadgeColorClass(badge.color)}`}>
                                            {badge.name}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Entry Points</label>
                                        <input
                                            type="number"
                                            value={badge.minPoints}
                                            onChange={(e) => handleBadgeChange(badge.id, 'minPoints', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Privileges</label>
                                        <ul className="text-xs space-y-1">
                                            {badge.privileges.slice(0, 4).map(p => (
                                                <li key={p} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                    <CheckCircle fontSize="inherit" className="text-green-500" style={{ fontSize: 10 }} />
                                                    <span className="truncate">{AVAILABLE_PRIVILEGES.find(ap => ap.id === p)?.label}</span>
                                                </li>
                                            ))}
                                            {badge.privileges.length > 4 && (
                                                <li className="text-slate-400 italic pl-4">+ {badge.privileges.length - 4} more</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabPanel>

                    {/* PRIVILEGE MATRIX */}
                    <TabPanel>
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-200">Privilege</th>
                                            <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-200">Type</th>
                                            {config.badges.map(b => (
                                                <th key={b.id} className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-200">
                                                    <span className={`px-2 py-1 rounded text-xs ${getBadgeColorClass(b.color)}`}>{b.name}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {AVAILABLE_PRIVILEGES.map(priv => (
                                            <tr key={priv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{priv.label}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${priv.type === 'driver' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                            priv.type === 'passenger' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                        }`}>
                                                        {priv.type}
                                                    </span>
                                                </td>
                                                {config.badges.map(badge => (
                                                    <td key={badge.id} className="px-6 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={badge.privileges.includes(priv.id)}
                                                            onChange={() => togglePrivilege(badge.id, priv.id)}
                                                            className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-6 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <AccountBalanceWallet className="text-green-500" /> Passenger Loyalty
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Earn 1 Point for every</span>
                                <input
                                    type="number"
                                    value={config.passengerSpendRate}
                                    onChange={(e) => setConfig({ ...config, passengerSpendRate: parseInt(e.target.value) || 1 })}
                                    min={1}
                                    className="w-32 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded font-bold"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">KES spent</span>
                            </div>
                        </div>
                    </TabPanel>

                    {/* LOAN CONFIGURATION */}
                    <TabPanel>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="col-span-2 space-y-4">
                                {config.badges.map((badge) => (
                                    <div key={badge.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${getBadgeColorClass(badge.color).split(' ')[0]}`}>
                                                <MilitaryTech fontSize="large" className={badge.color === 'yellow' ? 'text-yellow-600' : 'text-slate-600'} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{badge.name} Tier</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Min Points: {badge.minPoints}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-2">
                                                <div className="text-xs font-semibold text-slate-500 uppercase">Deduction Rate</div>
                                                <div className="text-xs text-slate-400">from earnings</div>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={badge.loanDeductionRate}
                                                    onChange={(e) => handleBadgeChange(badge.id, 'loanDeductionRate', parseInt(e.target.value) || 0)}
                                                    className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded font-mono text-lg font-bold text-right pr-8"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-6 rounded-xl h-fit">
                                <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                                    <Info /> Safety Mechanism
                                </h3>
                                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-3 list-disc pl-4">
                                    <li>Repayment is automatic and deducted from each trip earning.</li>
                                    <li>Only legitimate earnings are processed for deduction.</li>
                                    <li>If a driver's rating drops below 3 stars, loan access is temporarily suspended.</li>
                                    <li>Deductions stop automatically once the loan principal + interest is fully paid.</li>
                                </ul>
                            </div>
                        </div>
                    </TabPanel>

                    {/* SACCO SYSTEM */}
                    <TabPanel>
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <DirectionsCar /> Gamified Sacco Ecosystem
                                </h3>
                                <p className="text-green-100 mt-1">
                                    Driver tiers with commission reallocation, priority dispatch, and integrated savings
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <EmojiEmotions className="text-orange-500" />
                                        <span className="font-bold text-orange-800200">ROOK dark:text-orange-IE</span>
                                    </div>
                                    <p className="text-sm text-orange-700 dark:text-orange-300">First 50 trips</p>
                                    <div className="mt-3 text-xs font-semibold text-orange-600 dark:text-orange-400">+3% Sacco Bonus</div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="text-blue-500" />
                                        <span className="font-bold text-blue-800 dark:text-blue-200">STAR DRIVER</span>
                                    </div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">100+ trips, 4.5+ rating</p>
                                    <div className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400">+Commission Rebate</div>
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <WorkspacePremium className="text-purple-500" />
                                        <span className="font-bold text-purple-800 dark:text-purple-200">ROAD MASTER</span>
                                    </div>
                                    <p className="text-sm text-purple-700 dark:text-purple-300">500+ trips, 4.7+ rating</p>
                                    <div className="mt-3 text-xs font-semibold text-purple-600 dark:text-purple-400">+Priority Dispatch</div>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <EmojiEvents className="text-amber-500" />
                                        <span className="font-bold text-amber-800 dark:text-amber-200">ELITE</span>
                                    </div>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">Top 10% performers</p>
                                    <div className="mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400">+All Benefits</div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-900 dark:text-white">Commission Structure</h4>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-red-600">20%</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Platform Commission</div>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">80%</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Driver Share</div>
                                        </div>
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">2%</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Sacco Admin</div>
                                        </div>
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-amber-600">3%</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Badge Bonus</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                                <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                                    <TrendingUp /> Safety Mechanisms
                                </h4>
                                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle fontSize="small" className="text-green-500" />
                                        50% cap on total deductions to protect driver earnings
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle fontSize="small" className="text-green-500" />
                                        Grace period (50 trips) for new drivers to earn first badge
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle fontSize="small" className="text-green-500" />
                                        Multi-metric validation to prevent badge gaming
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle fontSize="small" className="text-green-500" />
                                        Automatic tier review after every 50 completed trips
                                    </li>
                                </ul>
                            </div>

                            <div className="flex justify-end">
                                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold">
                                    <Save />
                                    Sync to Database
                                </button>
                            </div>
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};
