import React, { useState } from 'react';
import { FaCopy, FaCheck, FaWhatsapp, FaEnvelope, FaSms, FaQrcode, FaGift } from 'react-icons/fa';
import QRCode from 'qrcode';

interface ReferralCardProps {
    referralCode: string;
    referralUrl?: string;
    totalReferrals?: number;
    rewardsEarned?: number;
    userRole?: 'driver' | 'passenger' | 'organization';
}

export default function ReferralCard({
    referralCode,
    referralUrl,
    totalReferrals = 0,
    rewardsEarned = 0,
    userRole = 'passenger',
}: ReferralCardProps) {
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    const fullReferralUrl = referralUrl || `${window.location.origin}/register?ref=${referralCode}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const generateQRCode = async () => {
        try {
            const url = await QRCode.toDataURL(fullReferralUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            setQrCodeUrl(url);
            setShowQR(true);
        } catch (err) {
            console.error('Failed to generate QR code:', err);
        }
    };

    const shareViaWhatsApp = () => {
        const message = `Join Cabi Africa as a ${userRole} using my referral code: ${referralCode}. Sign up here: ${fullReferralUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const shareViaSMS = () => {
        const message = `Join Cabi Africa using my code: ${referralCode}. ${fullReferralUrl}`;
        window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    };

    const shareViaEmail = () => {
        const subject = 'Join Cabi Africa';
        const body = `I'd like to invite you to join Cabi Africa!\n\nUse my referral code: ${referralCode}\n\nSign up here: ${fullReferralUrl}\n\nLooking forward to having you on board!`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const getRoleColor = () => {
        switch (userRole) {
            case 'driver':
                return 'brand-accent';
            case 'organization':
                return 'brand-yellow';
            default:
                return 'brand-yellow';
        }
    };

    const roleColor = getRoleColor();

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-${roleColor}/20 flex items-center justify-center`}>
                        <FaGift className={`text-${roleColor} text-xl`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Your Referral Code</h3>
                        <p className="text-xs text-gray-400">Share and earn rewards</p>
                    </div>
                </div>
            </div>

            {/* Referral Code Display */}
            <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Referral Code</p>
                        <p className={`text-2xl font-bold text-${roleColor} tracking-wider`}>{referralCode}</p>
                    </div>
                    <button
                        type="button"
                        onClick={copyToClipboard}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                copyToClipboard();
                            }
                        }}
                        className={`px-4 py-2 rounded-lg transition-all ${copied
                                ? 'bg-green-600 text-white'
                                : `bg-${roleColor}/20 text-${roleColor} hover:bg-${roleColor}/30`
                            }`}
                    >
                        {copied ? (
                            <>
                                <FaCheck className="inline mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <FaCopy className="inline mr-2" />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Total Referrals</p>
                    <p className="text-2xl font-bold text-white">{totalReferrals}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Rewards Earned</p>
                    <p className="text-2xl font-bold text-green-500">KES {rewardsEarned.toLocaleString()}</p>
                </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Share via</p>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={shareViaWhatsApp}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium"
                    >
                        <FaWhatsapp className="text-lg" />
                        WhatsApp
                    </button>
                    <button
                        onClick={shareViaSMS}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#D4AF37] hover:bg-[#ffe088] text-black font-bold rounded-lg transition-all"
                    >
                        <FaSms className="text-lg" />
                        SMS
                    </button>
                    <button
                        onClick={shareViaEmail}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-dark border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#ffe088] rounded-lg transition-all font-medium"
                    >
                        <FaEnvelope className="text-lg" />
                        Email
                    </button>
                    <button
                        onClick={generateQRCode}
                        className={`flex items-center justify-center gap-2 px-4 py-3 bg-${roleColor}/20 hover:bg-${roleColor}/30 text-${roleColor} rounded-lg transition-all font-medium border border-${roleColor}/30`}
                    >
                        <FaQrcode className="text-lg" />
                        QR Code
                    </button>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQR && qrCodeUrl && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
                        <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">Scan to Register</h4>
                        <div className="bg-white p-4 rounded-xl border-4 border-gray-200 mb-4">
                            <img src={qrCodeUrl} alt={`CABI Africa referral invite QR code for invitation code ${referralCode}`} width={240} height={240} loading="lazy" decoding="async" className="w-full" />
                        </div>
                        <p className="text-sm text-gray-600 text-center mb-4">
                            Code: <span className="font-bold text-gray-900">{referralCode}</span>
                        </p>
                        <button
                            onClick={() => setShowQR(false)}
                            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
