'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    avatar?: string;
    trips: number;
    fiveStarRatings: number;
    positiveFeedback: number;
    avgRating: number;
}

type LeaderboardType = 'trips' | 'ratings' | 'feedback';

export default function LeaderboardsPage({ params }: { params: { groupId: string } }) {
    const groupId = params.groupId;
    const [selectedBoard, setSelectedBoard] = useState<LeaderboardType>('trips');

    // Mock leaderboard data
    const leaderboards: Record<LeaderboardType, LeaderboardEntry[]> = {
        trips: [
            { rank: 1, userId: '1', name: 'John Kamau', trips: 342, fiveStarRatings: 298, positiveFeedback: 315, avgRating: 4.9 },
            { rank: 2, userId: '2', name: 'Sarah Mwangi', trips: 298, fiveStarRatings: 276, positiveFeedback: 285, avgRating: 4.8 },
            { rank: 3, userId: '3', name: 'Michael Ochieng', trips: 267, fiveStarRatings: 245, positiveFeedback: 251, avgRating: 4.7 },
            { rank: 4, userId: '4', name: 'Jane Doe', trips: 234, fiveStarRatings: 215, positiveFeedback: 220, avgRating: 4.8 },
            { rank: 5, userId: '5', name: 'Peter Njoroge', trips: 198, fiveStarRatings: 182, positiveFeedback: 189, avgRating: 4.6 },
        ],
        ratings: [
            { rank: 1, userId: '1', name: 'John Kamau', trips: 342, fiveStarRatings: 298, positiveFeedback: 315, avgRating: 4.9 },
            { rank: 2, userId: '2', name: 'Sarah Mwangi', trips: 298, fiveStarRatings: 276, positiveFeedback: 285, avgRating: 4.8 },
            { rank: 3, userId: '4', name: 'Jane Doe', trips: 234, fiveStarRatings: 215, positiveFeedback: 220, avgRating: 4.8 },
            { rank: 4, userId: '3', name: 'Michael Ochieng', trips: 267, fiveStarRatings: 245, positiveFeedback: 251, avgRating: 4.7 },
            { rank: 5, userId: '5', name: 'Peter Njoroge', trips: 198, fiveStarRatings: 182, positiveFeedback: 189, avgRating: 4.6 },
        ],
        feedback: [
            { rank: 1, userId: '1', name: 'John Kamau', trips: 342, fiveStarRatings: 298, positiveFeedback: 315, avgRating: 4.9 },
            { rank: 2, userId: '2', name: 'Sarah Mwangi', trips: 298, fiveStarRatings: 276, positiveFeedback: 285, avgRating: 4.8 },
            { rank: 3, userId: '3', name: 'Michael Ochieng', trips: 267, fiveStarRatings: 245, positiveFeedback: 251, avgRating: 4.7 },
            { rank: 4, userId: '4', name: 'Jane Doe', trips: 234, fiveStarRatings: 215, positiveFeedback: 220, avgRating: 4.8 },
            { rank: 5, userId: '5', name: 'Peter Njoroge', trips: 198, fiveStarRatings: 182, positiveFeedback: 189, avgRating: 4.6 },
        ],
    };

    const currentLeaderboard = leaderboards[selectedBoard];

    const getBoardTitle = (type: LeaderboardType) => {
        switch (type) {
            case 'trips': return 'Most Trips Completed';
            case 'ratings': return 'Most 5-Star Ratings';
            case 'feedback': return 'Most Positive Feedback';
        }
    };

    const getBoardMetric = (entry: LeaderboardEntry, type: LeaderboardType) => {
        switch (type) {
            case 'trips': return entry.trips;
            case 'ratings': return entry.fiveStarRatings;
            case 'feedback': return entry.positiveFeedback;
        }
    };

    const getRankBadgeColor = (rank: number) => {
        if (rank === 1) return 'bg-yellow-400 text-yellow-900';
        if (rank === 2) return 'bg-gray-300 text-gray-900';
        if (rank === 3) return 'bg-orange-400 text-orange-900';
        return 'bg-blue-100 text-blue-900';
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-800">Group Portal</h1>
                </div>
                <nav className="mt-6 px-6 space-y-2">
                    <Link href={`/dashboard/${groupId}`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Overview
                    </Link>
                    <Link href={`/dashboard/${groupId}/members`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Members
                    </Link>
                    <Link href={`/dashboard/${groupId}/leaderboards`} className="block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                        Leaderboards
                    </Link>
                    <Link href={`/dashboard/${groupId}/management`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Leadership Management
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Organization Leaderboards</h2>
                            <p className="text-gray-600 mt-2">
                                Recognize and celebrate your top performers
                            </p>
                        </div>

                        {/* Leaderboard Type Selector */}
                        <div className="flex gap-3 mb-6 overflow-x-auto">
                            <button
                                onClick={() => setSelectedBoard('trips')}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedBoard === 'trips'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                🚗 Most Trips
                            </button>
                            <button
                                onClick={() => setSelectedBoard('ratings')}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedBoard === 'ratings'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                ⭐ Most 5-Stars
                            </button>
                            <button
                                onClick={() => setSelectedBoard('feedback')}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedBoard === 'feedback'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                👍 Most Positive Feedback
                            </button>
                        </div>

                        {/* Leaderboard Title */}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{getBoardTitle(selectedBoard)}</h3>
                            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
                        </div>

                        {/* Top 3 Podium */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {currentLeaderboard.slice(0, 3).map((entry, index) => {
                                const positions = [1, 0, 2]; // Center 1st, left 2nd, right 3rd
                                const actualIndex = positions.indexOf(index);
                                const heights = ['h-32', 'h-40', 'h-28'];

                                return (
                                    <div key={entry.userId} className={`order-${actualIndex}`}>
                                        <div className="text-center mb-2">
                                            <div className="inline-block relative">
                                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <span className="text-2xl font-bold text-gray-600">
                                                        {entry.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold ${getRankBadgeColor(entry.rank)}`}>
                                                    {entry.rank}
                                                </div>
                                            </div>
                                            <div className="font-semibold text-gray-900">{entry.name}</div>
                                            <div className="text-2xl font-bold text-blue-600 mt-1">
                                                {getBoardMetric(entry, selectedBoard)}
                                            </div>
                                        </div>
                                        <div className={`${heights[index]} bg-gradient-to-t ${entry.rank === 1 ? 'from-yellow-400 to-yellow-300' :
                                                entry.rank === 2 ? 'from-gray-400 to-gray-300' :
                                                    'from-orange-400 to-orange-300'
                                            } rounded-t-lg flex items-end justify-center pb-4`}>
                                            <span className="text-4xl">
                                                {entry.rank === 1 ? '🏆' : entry.rank === 2 ? '🥈' : '🥉'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Full Leaderboard Table */}
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trips</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">5-Stars</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Feedback</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentLeaderboard.map((entry) => (
                                        <tr key={entry.userId} className={entry.rank <= 3 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${getRankBadgeColor(entry.rank)}`}>
                                                    {entry.rank}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-gray-600 font-medium">
                                                            {entry.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm font-semibold text-gray-900">{entry.trips}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm font-semibold text-gray-900">{entry.fiveStarRatings}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm font-semibold text-gray-900">{entry.positiveFeedback}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="text-yellow-400 mr-1">⭐</span>
                                                    <span className="text-sm font-semibold text-gray-900">{entry.avgRating.toFixed(1)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Info Banner */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>ℹ️ Leaderboards Update:</strong> Rankings are updated daily based on the last 30 days of activity. Keep up the great work!
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
