import React, { useState, useEffect } from 'react';
import { dispatchFetch } from '../../services/dispatchApiClient';
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
import { PageHeader } from '../common/PageHeader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.cabi.africa/api';

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
    { id: 'Sacco_BONUS', label: '3% Sacco Bonus', type: 'driver' },
    { id: 'Sacco_MATCH', label: 'Sacco Savings Match', type: 'driver' },
    { id: 'CREDIT_LIMIT_BOOST', label: 'Credit Limit Boost', type: 'driver' },
    { id: 'LOAN_RATE_REDUCTION', label: 'Loan Rate Reduction', type: 'driver' },
];

export const GamificationManagement: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState(0);
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
            { id: 'PLATINUM', name: 'Platinum', minPoints: 2000, color: 'emerald', privileges: ['PRIORITY_SUPPORT', 'ANALYTICS_ACCESS', 'PAY_LATER', 'CHOOSE_DRIVER', 'FUEL_ADVANCE', 'SERVICE_DISCOUNT', 'LOAN_ACCESS', 'ZERO_COMMISSION', 'FREE_TRIP'], loanDeductionRate: 20 },
        ],
        passengerSpendRate: 100,
        spinWheelThreshold: 50,
    });

    const [saccoBadges, setSaccoBadges] = useState<any[]>([]);
    const [rewards, setRewards] = useState<any[]>([]);
    const [badgeStats, setBadgeStats] = useState<any>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        fetchSaccoData();
    }, []);

    const fetchSaccoData = async () => {
        try {
            // Load saved gamification settings from database if available
            try {
                const configRes = await dispatchFetch('/settings/system/gamification_config');
                if (configRes.ok) {
                    const configData = await configRes.json();
                    if (configData?.value) {
                        const parsed = typeof configData.value === 'string' ? JSON.parse(configData.value) : configData.value;
                        if (parsed && typeof parsed === 'object') {
                            setConfig(prev => ({ ...prev, ...parsed }));
                        }
                    }
                }
            } catch (e) {
                console.warn('Could not load persistent gamification config:', e);
            }

            const [badgesRes, rewardsRes, statsRes] = await Promise.allSettled([
                dispatchFetch('/badges'),
                dispatchFetch('/admin/badges/rewards'),
                dispatchFetch('/admin/badges/stats'),
            ]);

            if (badgesRes.status === 'fulfilled' && badgesRes.value.ok) {
                const badgesData = await badgesRes.value.json();
                if (badgesData.success && Array.isArray(badgesData.data)) {
                    setSaccoBadges(badgesData.data.filter((b: any) => ['ROOKIE', 'STAR_DRIVER', 'ROAD_MASTER', 'ELITE'].includes(b.code)));
                }
            }
            if (rewardsRes.status === 'fulfilled' && rewardsRes.value.ok) {
                const rewardsData = await rewardsRes.value.json();
                if (rewardsData.success) {
                    setRewards(rewardsData.data);
                }
            }
            if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                const statsData = await statsRes.value.json();
                if (statsData.success) {
                    setBadgeStats(statsData.data);
                }
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

    const handleSave = async () => {
        setLoading(true);
        setSaveError(null);
        try {
            const res = await dispatchFetch('/settings/system/gamification_config', {
                method: 'PUT',
                body: JSON.stringify({ value: config }),
            });
            if (!res.ok) throw new Error(`Save failed (${res.status})`);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Failed to save gamification config:', err);
            setSaveError(err.message || 'Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const getBadgeColorClass = (color: string) => {
        switch (color) {
            case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
            case 'slate': return 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
            case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
            case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <PageHeader
                category="Growth & Platform"
                title="Gamification & Driver Motivation"
                subtitle="Configure loyalty rewards, performance tiers, Sacco integration, and points matrix."
                icon={<EmojiEvents />}
                actions={
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`flex items-center gap-1.5 ${saveSuccess ? 'bg-emerald-600 text-white' : 'btn-primary'} disabled:opacity-50 px-3.5 py-1.5 rounded-[3px] text-xs font-semibold shadow-sm transition-all active:scale-95`}
                    >
                        {loading ? <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : saveSuccess ? <CheckCircle fontSize="small" /> : <Save fontSize="small" />}
                        {saveSuccess ? 'Configuration Saved!' : 'Save Configuration'}
                    </button>
                }
            />

            {saveSuccess && (
                <div className="p-4 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Gamification and loyalty rules saved successfully to the system database.</span>
                </div>
            )}

            {saveError && (
                <div className="p-4 rounded-[3px] bg-rose-500/10 border border-rose-500/30 text-sm text-rose-300">
                    ⚠️ {saveError}
                </div>
            )}

            <TabGroup index={selectedTab} onIndexChange={setSelectedTab}>
                <TabList className="flex gap-2 border-b border-white/10 overflow-x-auto pb-2 mb-6">
                    {[
                        { label: 'Rating Rules', icon: <Star sx={{ fontSize: 16 }} /> },
                        { label: 'Badge Tiers', icon: <MilitaryTech sx={{ fontSize: 16 }} /> },
                        { label: 'Privilege Matrix', icon: <WorkspacePremium sx={{ fontSize: 16 }} /> },
                        { label: 'Loan & Repayment', icon: <AccountBalanceWallet sx={{ fontSize: 16 }} /> },
                        { label: 'Sacco System', icon: <DirectionsCar sx={{ fontSize: 16 }} /> },
                    ].map((tab, idx) => (
                        <Tab
                            key={tab.label}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-[3px] flex items-center gap-1.5 transition-all outline-none cursor-pointer border ${
                                selectedTab === idx
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm shadow-amber-500/20 font-bold border-amber-500'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-white/10'
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </Tab>
                    ))}
                </TabList>

                <TabPanels>
                    {/* RATING RULES */}
                    <TabPanel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#131722] rounded-[3px] shadow-sm border border-white/10 p-6">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Star className="text-amber-400" /> Star Rating → Points Conversion
                                </h3>
                                <div className="space-y-3">
                                    {config.ratingRules.map((rule) => (
                                        <div key={rule.stars} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-[3px] border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex">
                                                    {[...Array(rule.stars)].map((_, i) => <Star key={i} fontSize="small" className="text-amber-400" />)}
                                                </div>
                                                <span className="font-medium text-slate-200">{rule.stars} Star</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={rule.pointsAwarded}
                                                    onChange={(e) => handleRatingChange(rule.stars, parseInt(e.target.value) || 0)}
                                                    className="w-20 px-2 py-1 bg-[#131722] border border-white/10 rounded-[3px] text-center font-bold text-white focus:outline-none"
                                                />
                                                <span className="text-xs text-slate-400 uppercase font-bold">Pts</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#131722] rounded-[3px] shadow-sm border border-white/10 p-6">
                                <h3 className="font-bold text-amber-400 mb-4 flex items-center gap-2">
                                    <CardGiftcard /> Spin the Wheel Bonus
                                </h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    Incentivize consistency by offering a bonus chance game after a streak of perfect ratings.
                                </p>
                                <div className="flex flex-col gap-2 p-4 bg-[#0a0a0a] rounded-[3px] border border-white/5">
                                    <label className="text-sm font-semibold text-slate-300">Trigger Threshold</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={config.spinWheelThreshold}
                                            onChange={(e) => setConfig({ ...config, spinWheelThreshold: parseInt(e.target.value) || 1 })}
                                            min={1}
                                            className="w-24 px-3 py-2 bg-[#131722] border border-white/10 rounded-[3px] font-bold text-white"
                                        />
                                        <span className="text-sm text-slate-400">consecutive 5-star ratings</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* BADGE TIERS */}
                    <TabPanel>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                            {config.badges.map((badge) => (
                                <div key={badge.id} className={`relative rounded-[3px] border p-6 flex flex-col ${badge.id === 'PLATINUM' ? 'border-amber-500/80 shadow-lg shadow-amber-500/10' : 'border-white/10'
                                    } bg-[#131722]`}>
                                    {badge.id === 'PLATINUM' && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-[3px] uppercase tracking-wider">
                                            Top Tier
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mb-4 mt-2">
                                        <div className={`p-2 rounded-[3px] ${getBadgeColorClass(badge.color).split(' ')[0]}`}>
                                            <MilitaryTech className={badge.color === 'yellow' ? 'text-yellow-500' : badge.color === 'orange' ? 'text-orange-500' : badge.color === 'slate' ? 'text-slate-400' : 'text-amber-400'} />
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-[3px] border capitalize ${getBadgeColorClass(badge.color)}`}>
                                            {badge.name}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Entry Points</label>
                                        <input
                                            type="number"
                                            value={badge.minPoints}
                                            onChange={(e) => handleBadgeChange(badge.id, 'minPoints', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-[3px] font-mono font-bold text-white"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Privileges</label>
                                        <ul className="text-xs space-y-1">
                                            {badge.privileges.slice(0, 4).map(p => (
                                                <li key={p} className="flex items-center gap-1.5 text-slate-300">
                                                    <CheckCircle fontSize="inherit" className="text-amber-400" style={{ fontSize: 10 }} />
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
                        <div className="bg-[#131722] rounded-[3px] border border-white/10 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#0a0a0a] border-b border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-bold text-slate-200">Privilege</th>
                                            <th className="px-6 py-4 text-left font-bold text-slate-200">Type</th>
                                            {config.badges.map(b => (
                                                <th key={b.id} className="px-6 py-4 text-center font-bold text-slate-200">
                                                    <span className={`px-2 py-1 rounded-[3px] text-xs ${getBadgeColorClass(b.color)}`}>{b.name}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {AVAILABLE_PRIVILEGES.map(priv => (
                                            <tr key={priv.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-3 font-medium text-white">{priv.label}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-2 py-0.5 rounded-[3px] text-[10px] uppercase font-bold tracking-wide ${priv.type === 'driver' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                            priv.type === 'passenger' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
                                                            className="w-4 h-4 text-amber-500 rounded-[2px] border-white/20 focus:ring-amber-500 cursor-pointer accent-amber-500 bg-[#0a0a0a]"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-6 bg-[#131722] p-6 rounded-[3px] shadow-sm border border-white/10">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <AccountBalanceWallet className="text-amber-400" /> Passenger Loyalty Points
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-300">Earn 1 Point for every</span>
                                <input
                                    type="number"
                                    value={config.passengerSpendRate}
                                    onChange={(e) => setConfig({ ...config, passengerSpendRate: parseInt(e.target.value) || 1 })}
                                    min={1}
                                    className="w-32 px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-[3px] font-bold text-white"
                                />
                                <span className="text-sm font-medium text-slate-300">KES spent</span>
                            </div>
                        </div>
                    </TabPanel>

                    {/* LOAN CONFIGURATION */}
                    <TabPanel>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="col-span-2 space-y-4">
                                {config.badges.map((badge) => (
                                    <div key={badge.id} className="p-4 bg-[#131722] border border-white/10 rounded-[3px] flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-[3px] ${getBadgeColorClass(badge.color).split(' ')[0]}`}>
                                                <MilitaryTech fontSize="large" className={badge.color === 'yellow' ? 'text-amber-400' : 'text-slate-400'} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">{badge.name} Tier</h4>
                                                <p className="text-xs text-slate-400">Min Points: {badge.minPoints}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-2">
                                                <div className="text-xs font-semibold text-slate-400 uppercase">Deduction Rate</div>
                                                <div className="text-xs text-slate-500">from earnings</div>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={badge.loanDeductionRate}
                                                    onChange={(e) => handleBadgeChange(badge.id, 'loanDeductionRate', parseInt(e.target.value) || 0)}
                                                    className="w-20 px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-[3px] font-mono text-lg font-bold text-right pr-8 text-white"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-[#131722] border border-amber-500/20 p-6 rounded-[3px] h-fit">
                                <h3 className="font-bold text-amber-400 mb-4 flex items-center gap-2">
                                    <Info /> Safety Mechanism
                                </h3>
                                <ul className="text-sm text-slate-300 space-y-3 list-disc pl-4">
                                    <li>Repayment is automatic and deducted from each trip earning.</li>
                                    <li>Only legitimate earnings are processed for deduction.</li>
                                    <li>If a driver's rating drops below 3 stars, loan access is temporarily suspended.</li>
                                    <li>Deductions stop automatically once the loan principal + interest is fully paid.</li>
                                </ul>
                            </div>
                        </div>
                    </TabPanel>

                    {/* Sacco SYSTEM */}
                    <TabPanel>
                        <div className="space-y-6">
                            <div className="bg-[#131722] border border-amber-500/30 rounded-[3px] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-amber-400">
                                        <DirectionsCar /> Gamified Sacco Ecosystem
                                    </h3>
                                    <p className="text-slate-400 mt-1 text-sm">
                                        Driver tiers with commission reallocation, priority dispatch, and integrated savings
                                    </p>
                                </div>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-[3px] bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0 self-start md:self-auto">
                                    SACCO TIER ENGINE ACTIVE
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-[#131722] border border-white/10 rounded-[3px] p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <EmojiEmotions className="text-amber-400" />
                                        <span className="font-bold text-white text-sm">ROOKIE</span>
                                    </div>
                                    <p className="text-sm text-slate-400">First 50 trips</p>
                                    <div className="mt-3 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-[3px] w-fit">+3% Sacco Bonus</div>
                                </div>

                                <div className="bg-[#131722] border border-white/10 rounded-[3px] p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="text-amber-400" />
                                        <span className="font-bold text-white text-sm">STAR DRIVER</span>
                                    </div>
                                    <p className="text-sm text-slate-400">100+ trips, 4.5+ rating</p>
                                    <div className="mt-3 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-[3px] w-fit">+Commission Rebate</div>
                                </div>

                                <div className="bg-[#131722] border border-amber-500/30 rounded-[3px] p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <WorkspacePremium className="text-amber-400" />
                                        <span className="font-bold text-amber-400 text-sm">ROAD MASTER</span>
                                    </div>
                                    <p className="text-sm text-slate-300">500+ trips, 4.7+ rating</p>
                                    <div className="mt-3 text-xs font-semibold text-black bg-amber-400 px-2 py-0.5 rounded-[3px] w-fit font-bold">+Priority Dispatch</div>
                                </div>

                                <div className="bg-[#131722] border border-amber-500/40 rounded-[3px] p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <EmojiEvents className="text-amber-400" />
                                        <span className="font-bold text-amber-300 text-sm">ELITE</span>
                                    </div>
                                    <p className="text-sm text-slate-300">Top 10% performers</p>
                                    <div className="mt-3 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-[3px] w-fit">+All Benefits</div>
                                </div>
                            </div>

                            <div className="bg-[#131722] rounded-[3px] border border-white/10 overflow-hidden">
                                <div className="p-4 bg-[#0a0a0a] border-b border-white/10">
                                    <h4 className="font-bold text-white text-sm">Commission Structure & Sacco Reallocation</h4>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-[3px]">
                                            <div className="text-2xl font-bold text-rose-400">20%</div>
                                            <div className="text-xs text-slate-400 mt-1">Platform Commission</div>
                                        </div>
                                        <div className="p-4 bg-[#0a0a0a] border border-amber-500/20 rounded-[3px]">
                                            <div className="text-2xl font-bold text-amber-400">80%</div>
                                            <div className="text-xs text-slate-400 mt-1">Driver Share</div>
                                        </div>
                                        <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-[3px]">
                                            <div className="text-2xl font-bold text-emerald-400">2%</div>
                                            <div className="text-xs text-slate-400 mt-1">Sacco Admin Fund</div>
                                        </div>
                                        <div className="p-4 bg-[#0a0a0a] border border-amber-500/20 rounded-[3px]">
                                            <div className="text-2xl font-bold text-amber-300">3%</div>
                                            <div className="text-xs text-slate-400 mt-1">Badge Bonus Pool</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#131722] border border-amber-500/20 rounded-[3px] p-6">
                                <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2 text-sm">
                                    <TrendingUp fontSize="small" /> Sacco Guardrails & Safety Mechanisms
                                </h4>
                                <ul className="text-sm text-slate-300 space-y-2.5">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle fontSize="small" className="text-amber-400 shrink-0" />
                                        50% cap on total deductions to protect driver net take-home earnings
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle fontSize="small" className="text-amber-400 shrink-0" />
                                        Grace period (50 trips) for newly onboarded drivers to earn first badge
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle fontSize="small" className="text-amber-400 shrink-0" />
                                        Multi-metric telemetry validation to prevent synthetic trip gaming
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle fontSize="small" className="text-amber-400 shrink-0" />
                                        Automatic SACCO tier review audit after every 50 completed trips
                                    </li>
                                </ul>
                            </div>

                            <div className="flex justify-end">
                                <button onClick={handleSave} className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] text-xs font-semibold">
                                    <Save fontSize="small" />
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
