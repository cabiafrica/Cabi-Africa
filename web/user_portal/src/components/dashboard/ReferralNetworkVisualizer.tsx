import React, { useState } from 'react';
import { User, Car, Check, Copy, Link as LinkIcon, Users, MapPin, Star } from 'lucide-react';

interface NetworkMember {
    id: string;
    name: string;
    role: 'driver' | 'passenger';
    avatar: string;
    earnings: string;
    level: 0 | 1 | 2;
}

const networkData: NetworkMember[] = [
    { id: 'me', name: 'You', role: 'driver', avatar: '👤', earnings: 'KES 45,000', level: 0 },
    // Level 1
    { id: 'l1-1', name: 'John D.', role: 'driver', avatar: '🚗', earnings: 'KES 15,200', level: 1 },
    { id: 'l1-2', name: 'Alice K.', role: 'driver', avatar: '🚕', earnings: 'KES 8,900', level: 1 },
    { id: 'l1-3', name: 'Eve R.', role: 'passenger', avatar: '🙋‍♀️', earnings: 'KES 2,000', level: 1 },
    { id: 'l1-4', name: 'Mark S.', role: 'driver', avatar: '🚙', earnings: 'KES 5,400', level: 1 },
    // Level 2 (children of l1-1, l1-2, etc - shown as outer ring)
    { id: 'l2-1', name: 'Sarah M.', role: 'passenger', avatar: '🙋‍♀️', earnings: 'KES 450', level: 2 },
    { id: 'l2-2', name: 'Mike T.', role: 'passenger', avatar: '🙋‍♂️', earnings: 'KES 120', level: 2 },
    { id: 'l2-3', name: 'Bob W.', role: 'passenger', avatar: '🙋‍♂️', earnings: 'KES 1,200', level: 2 },
    { id: 'l2-4', name: 'Charlie', role: 'driver', avatar: '🚙', earnings: 'KES 4,500', level: 2 },
    { id: 'l2-5', name: 'Dave P.', role: 'passenger', avatar: '🙋‍♂️', earnings: 'KES 500', level: 2 },
    { id: 'l2-6', name: 'Anna J.', role: 'passenger', avatar: '🙋‍♀️', earnings: 'KES 300', level: 2 },
    { id: 'l2-7', name: 'Tom H.', role: 'driver', avatar: '🚗', earnings: 'KES 2,100', level: 2 },
    { id: 'l2-8', name: 'Lucy L.', role: 'passenger', avatar: '🙋‍♀️', earnings: 'KES 150', level: 2 },
];

interface VisualizerProps {
    referralCode?: string;
}

export default function ReferralNetworkVisualizer({ referralCode = 'CABI-REF-2024' }: VisualizerProps) {
    const [hoveredMember, setHoveredMember] = useState<NetworkMember | null>(null);

    const renderCircleMember = (member: NetworkMember, index: number, total: number, radius: number) => {
        // Calculate position on circle
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
            <div
                key={member.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 cursor-pointer group"
                style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                }}
                onMouseEnter={() => setHoveredMember(member)}
                onMouseLeave={() => setHoveredMember(null)}
            >
                <div className={`
                    w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl
                    border-2 transition-all duration-300
                    ${member.level === 1 ? 'bg-brand-yellow/20 border-brand-yellow shadow-[0_0_15px_rgba(255,191,0,0.3)]' : 'bg-brand-accent/20 border-brand-accent shadow-[0_0_15px_rgba(0,242,254,0.3)]'}
                    group-hover:scale-125 group-hover:z-50 overflow-hidden
                `}>
                    {member.role === 'driver' ? <Car className="w-5 h-5 md:w-7 md:h-7 text-white" /> : <User className="w-5 h-5 md:w-7 md:h-7 text-white" />}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] min-w-[120px]">
                    <div className="bg-slate-900 border border-white/10 p-3 rounded-md shadow-2xl backdrop-blur-xl">
                        <div className="font-bold text-white text-xs">{member.name}</div>
                        <div className="text-[10px] text-brand-yellow whitespace-nowrap">{member.earnings} contrib.</div>
                    </div>
                </div>
            </div>
        );
    };

    const level1Members = networkData.filter(m => m.level === 1);
    const level2Members = networkData.filter(m => m.level === 2);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Referral Network</h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm">Visualizing your multi-level growth</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Total Network Value</div>
                    <div className="text-2xl font-bold text-brand-yellow">KES 72,170</div>
                </div>
            </div>

            {/* Referral Info Section */}
            <div className="glass p-8 rounded-xl border border-slate-200 dark:border-white/5 bg-gradient-to-br from-white to-slate-50 dark:from-white/5 dark:to-transparent">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Grow Your Network</h3>
                            <p className="text-slate-500 dark:text-gray-400 text-sm max-w-md">
                                Share your personal referral code with others to join your network. You earn 2-level recurring shares from driver earnings and passenger usage across your direct and secondary network!
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center md:justify-start">
                            <div className="px-6 py-4 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl font-mono text-2xl font-black tracking-widest text-brand-yellow select-all">
                                {referralCode}
                            </div>
                            <button className="px-6 py-4 bg-brand-accent text-brand-black font-bold rounded-2xl hover:opacity-80 transition-all flex items-center gap-2 shadow-lg shadow-brand-accent/20">
                                <Copy className="w-4 h-4" /> Copy Link
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl">
                        <div className="p-3 bg-white rounded-lg">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://cabi.com/register?ref=${referralCode}`}
                                alt="CABI Africa Driver Referral Program unique QR registration code"
                                width={150}
                                height={150}
                                loading="lazy"
                                decoding="async"
                                className="w-32 h-32 md:w-40 md:h-40"
                            />
                        </div>
                        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-gray-500">Scan to Register</div>
                    </div>
                </div>
            </div>

            <div className="glass p-8 rounded-[1.25rem] border border-slate-200 dark:border-white/5 relative bg-white dark:bg-brand-black/40 overflow-hidden min-h-[500px] flex items-center justify-center">
                {/* Decorative background orbits */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] border border-brand-yellow/20 rounded-full"></div>
                    <div className="w-[340px] h-[340px] md:w-[460px] md:h-[460px] border border-brand-accent/10 rounded-full"></div>
                </div>

                {/* Level 0: You (Center) */}
                <div className="relative z-20 z-10">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-brand-yellow to-brand-accent p-1 shadow-[0_0_30px_rgba(255,191,0,0.4)] animate-pulse-slow">
                        <div className="w-full h-full rounded-full bg-slate-100 dark:bg-brand-dark flex items-center justify-center border-4 border-white dark:border-brand-black">
                            <User className="w-8 h-8 md:w-12 md:h-12 text-slate-400" />
                        </div>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center">
                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-sm">You</div>
                        <div className="text-xs text-brand-yellow font-bold">KES 45,000</div>
                    </div>
                </div>

                {/* Level 1: Outer Circle */}
                {level1Members.map((member, i) => renderCircleMember(member, i, level1Members.length, typeof window !== 'undefined' && window.innerWidth < 768 ? 90 : 120))}

                {/* Level 2: Most Outer Circle */}
                {level2Members.map((member, i) => renderCircleMember(member, i, level2Members.length, typeof window !== 'undefined' && window.innerWidth < 768 ? 170 : 230))}
            </div>

            {/* Legend / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-brand-yellow/5 border border-brand-yellow/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-brand-yellow"></div>
                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300">Level 1 Referrals</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{level1Members.length} Partners</span>
                </div>
                <div className="p-4 rounded-lg bg-brand-accent/5 border border-brand-accent/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-brand-accent"></div>
                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300">Level 2 Network</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{level2Members.length} Partners</span>
                </div>
            </div>
        </div>
    );
}
