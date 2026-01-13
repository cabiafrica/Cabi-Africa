import React, { useState, useEffect } from 'react';
import { Card, Title, Tab, TabList, TabGroup, TabPanels, TabPanel, Text, NumberInput, TextInput, Badge } from '@tremor/react';

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
    { id: 'LOAN_ACCESS', label: 'Big Ticket Loans (Insurance, Mechanic)', type: 'driver' },
    { id: 'ZERO_COMMISSION', label: '0% Commission Weeks', type: 'driver' },
    { id: 'FREE_TRIP', label: 'Monthly Free Trip', type: 'passenger' },
];

export const GamificationManagement: React.FC = () => {
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
            { id: 'SILVER', name: 'Silver', minPoints: 100, color: 'gray', privileges: ['PRIORITY_SUPPORT', 'ANALYTICS_ACCESS'], loanDeductionRate: 0 },
            { id: 'GOLD', name: 'Gold', minPoints: 500, color: 'yellow', privileges: ['PRIORITY_SUPPORT', 'ANALYTICS_ACCESS', 'PAY_LATER', 'CHOOSE_DRIVER', 'FUEL_ADVANCE', 'SERVICE_DISCOUNT'], loanDeductionRate: 15 },
            { id: 'PLATINUM', name: 'Platinum', minPoints: 2000, color: 'indigo', privileges: ['PRIORITY_SUPPORT', 'ANALYTICS_ACCESS', 'PAY_LATER', 'CHOOSE_DRIVER', 'FUEL_ADVANCE', 'SERVICE_DISCOUNT', 'LOAN_ACCESS', 'ZERO_COMMISSION', 'FREE_TRIP'], loanDeductionRate: 20 },
        ],
        passengerSpendRate: 100,
        spinWheelThreshold: 50,
    });

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
        console.log('Saving gamification config:', config);
        alert('Configuration saved successfully!');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Gamification & Loyalty Management</h1>
                <Text className="mt-1">Configure rating points, badge levels, privileges, and loan repayment settings.</Text>
            </div>

            <TabGroup>
                <TabList className="mt-4">
                    <Tab>Rating Rules</Tab>
                    <Tab>Badge Levels</Tab>
                    <Tab>Privileges & Rewards</Tab>
                    <Tab>Loan Configuration</Tab>
                </TabList>

                <TabPanels>
                    {/* RATING RULES TAB */}
                    <TabPanel>
                        <Card className="mt-6">
                            <Title>Star Rating to Points Conversion</Title>
                            <Text className="mb-6">Configure how many points users earn or lose based on their star ratings.</Text>

                            <div className="space-y-4">
                                {config.ratingRules.map((rule) => (
                                    <div key={rule.stars} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{'⭐'.repeat(rule.stars)}</span>
                                            <span className="font-semibold text-gray-700">{rule.stars} Star{rule.stars > 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={rule.pointsAwarded}
                                                onChange={(e) => handleRatingChange(rule.stars, parseInt(e.target.value) || 0)}
                                                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <span className="text-gray-500 font-medium">Points</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <Title>Spin the Wheel Bonus</Title>
                                <Text className="mb-3">Trigger a bonus game after accumulating perfect ratings.</Text>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700">Trigger after</span>
                                    <input
                                        type="number"
                                        value={config.spinWheelThreshold}
                                        onChange={(e) => setConfig({ ...config, spinWheelThreshold: parseInt(e.target.value) || 1 })}
                                        min={1}
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">consecutive 5-star ratings</span>
                                </div>
                            </div>
                        </Card>
                    </TabPanel>

                    {/* BADGE LEVELS TAB */}
                    <TabPanel>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {config.badges.map((badge) => (
                                <Card key={badge.id} decoration="top" decorationColor={badge.color as any}>
                                    <div className="flex items-center justify-between mb-4">
                                        <Title>{badge.name}</Title>
                                        <Badge color={badge.color as any} size="lg">{badge.id}</Badge>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-2">Minimum Points Required</label>
                                            <input
                                                type="number"
                                                value={badge.minPoints}
                                                onChange={(e) => handleBadgeChange(badge.id, 'minPoints', parseInt(e.target.value) || 0)}
                                                min={0}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-2">Assigned Privileges</label>
                                            <div className="text-xs text-gray-500 space-y-1">
                                                {badge.privileges.length === 0 ? (
                                                    <p className="italic">No privileges assigned</p>
                                                ) : (
                                                    badge.privileges.map(p => (
                                                        <div key={p} className="flex items-center gap-1">
                                                            <span className="text-green-600">✓</span>
                                                            <span>{AVAILABLE_PRIVILEGES.find(ap => ap.id === p)?.label}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabPanel>

                    {/* PRIVILEGES TAB */}
                    <TabPanel>
                        <Card className="mt-6">
                            <Title>Privilege Assignment Matrix</Title>
                            <Text className="mb-6">Assign specific privileges to each badge level.</Text>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Privilege</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                                            {config.badges.map(b => (
                                                <th key={b.id} className="px-4 py-3 text-center font-semibold text-gray-700">{b.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {AVAILABLE_PRIVILEGES.map(priv => (
                                            <tr key={priv.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{priv.label}</td>
                                                <td className="px-4 py-3">
                                                    <Badge color={priv.type === 'driver' ? 'blue' : priv.type === 'passenger' ? 'green' : 'gray'} size="xs">
                                                        {priv.type}
                                                    </Badge>
                                                </td>
                                                {config.badges.map(badge => (
                                                    <td key={badge.id} className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={badge.privileges.includes(priv.id)}
                                                            onChange={() => togglePrivilege(badge.id, priv.id)}
                                                            className="h-5 w-5 text-indigo-600 rounded cursor-pointer"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <Card className="mt-6">
                            <Title>Passenger Loyalty Points</Title>
                            <Text className="mb-4">Configure how passengers earn points from spending.</Text>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Earn 1 Point for every</span>
                                <input
                                    type="number"
                                    value={config.passengerSpendRate}
                                    onChange={(e) => setConfig({ ...config, passengerSpendRate: parseInt(e.target.value) || 1 })}
                                    min={1}
                                    className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">KES spent</span>
                            </div>
                        </Card>
                    </TabPanel>

                    {/* LOAN CONFIGURATION TAB */}
                    <TabPanel>
                        <Card className="mt-6">
                            <Title>Automated Loan Repayment Settings</Title>
                            <Text className="mb-6">Configure automatic deduction rates from driver earnings for loan repayment.</Text>

                            <div className="space-y-6">
                                {config.badges.map((badge) => (
                                    <div key={badge.id} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <Badge color={badge.color as any}>{badge.name}</Badge>
                                                <span className="text-sm text-gray-600">({badge.minPoints}+ points)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700">Deduction Rate:</span>
                                                <input
                                                    type="number"
                                                    value={badge.loanDeductionRate}
                                                    onChange={(e) => handleBadgeChange(badge.id, 'loanDeductionRate', parseInt(e.target.value) || 0)}
                                                    min={0}
                                                    max={50}
                                                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">%</span>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                                            <strong>Example:</strong> If a {badge.name} driver earns KES 1,000, the system will automatically deduct{' '}
                                            <strong>KES {(1000 * badge.loanDeductionRate / 100).toFixed(0)}</strong> towards loan repayment before settling their wallet.
                                        </div>

                                        {badge.privileges.includes('LOAN_ACCESS') && (
                                            <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded flex items-center gap-2">
                                                <span>✓</span>
                                                <span>This badge level has access to Big Ticket Loans (Insurance, Mechanic Services)</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <Title>Safety Mechanism</Title>
                                <Text>
                                    • Only Gold and Platinum badge holders can access big loans.<br />
                                    • Repayment is automatic and deducted from each trip earning.<br />
                                    • If a driver's rating drops significantly, their account may be restricted until manual payment is made.
                                </Text>
                            </div>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </TabGroup>

            <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                    Save Configuration
                </button>
            </div>
        </div>
    );
};
