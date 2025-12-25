'use client';

import { useState } from 'react';

interface ReferralMetrics {
    totalReferralsSent: number;
    signupsFromReferrals: number;
    conversionRate: number;
    totalCreditsPaid: number;
    totalBonusesPaid: number;
}

interface TrendData {
    date: string;
    referrals: number;
    signups: number;
}

export default function ReferralAnalyticsPage() {
    const [dateRange, setDateRange] = useState('30days');
    const [programType, setProgramType] = useState('all');

    // Mock data
    const metrics: ReferralMetrics = {
        totalReferralsSent: 1247,
        signupsFromReferrals: 523,
        conversionRate: 41.9,
        totalCreditsPaid: 15690,
        totalBonusesPaid: 7845,
    };

    const trendData: TrendData[] = [
        { date: 'Week 1', referrals: 280, signups: 115 },
        { date: 'Week 2', referrals: 310, signups: 132 },
        { date: 'Week 3', referrals: 325, signups: 138 },
        { date: 'Week 4', referrals: 332, signups: 138 },
    ];

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Referral Analytics</h1>
                    <p className="text-gray-600 mt-2">
                        Track and analyze referral program performance
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Date Range
                            </label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            >
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="90days">Last 90 Days</option>
                                <option value="1year">Last Year</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Program Type
                            </label>
                            <select
                                value={programType}
                                onChange={(e) => setProgramType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            >
                                <option value="all">All Programs</option>
                                <option value="passenger">Passenger Referrals</option>
                                <option value="driver">Driver Referrals</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Total Referrals</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalReferralsSent.toLocaleString()}</p>
                        <p className="text-xs text-green-600 mt-2">↑ 12% vs last period</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Sign-ups</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.signupsFromReferrals.toLocaleString()}</p>
                        <p className="text-xs text-green-600 mt-2">↑ 8% vs last period</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Conversion Rate</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.conversionRate}%</p>
                        <p className="text-xs text-green-600 mt-2">↑ 2.3% vs last period</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Credits Paid</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${metrics.totalCreditsPaid.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">Total rewards</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Bonuses Paid</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${metrics.totalBonusesPaid.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">Referrer rewards</p>
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Referral Trends</h2>

                    <div className="space-y-4">
                        {trendData.map((data, index) => (
                            <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700">{data.date}</span>
                                    <div className="flex space-x-4 text-sm">
                                        <span className="text-blue-600">
                                            {data.referrals} referrals
                                        </span>
                                        <span className="text-green-600">
                                            {data.signups} sign-ups
                                        </span>
                                    </div>
                                </div>

                                {/* Referrals Bar */}
                                <div className="mb-2">
                                    <div className="flex items-center">
                                        <span className="text-xs text-gray-500 w-20">Referrals</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${(data.referrals / 350) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sign-ups Bar */}
                                <div>
                                    <div className="flex items-center">
                                        <span className="text-xs text-gray-500 w-20">Sign-ups</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-green-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${(data.signups / 350) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Referrers */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Top Referrers</h2>
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrals</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sign-ups</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rewards Earned</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[
                                { rank: 1, name: 'John Smith', type: 'Driver', referrals: 45, signups: 23, rewards: 690 },
                                { rank: 2, name: 'Sarah Johnson', type: 'Passenger', referrals: 38, signups: 19, rewards: 570 },
                                { rank: 3, name: 'Mike Davis', type: 'Driver', referrals: 32, signups: 16, rewards: 480 },
                                { rank: 4, name: 'Emily Brown', type: 'Passenger', referrals: 28, signups: 14, rewards: 420 },
                                { rank: 5, name: 'David Wilson', type: 'Driver', referrals: 25, signups: 12, rewards: 360 },
                            ].map((referrer) => (
                                <tr key={referrer.rank} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {referrer.rank === 1 && <span className="text-2xl mr-2">🥇</span>}
                                            {referrer.rank === 2 && <span className="text-2xl mr-2">🥈</span>}
                                            {referrer.rank === 3 && <span className="text-2xl mr-2">🥉</span>}
                                            <span className="text-sm font-semibold text-gray-900">#{referrer.rank}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{referrer.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${referrer.type === 'Driver' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {referrer.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referrer.referrals}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referrer.signups}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                        ${referrer.rewards}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
