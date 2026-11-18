import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { ArrowDownLeft, ArrowUpRight, Wallet, Gift, Percent, Banknote, CheckCircle2 } from 'lucide-react';

type Purpose = 'PASSENGER_DEPOSIT' | 'REFERRAL_WITHDRAWAL' | 'DRIVER_COMMISSION' | 'DRIVER_EARNINGS';

export default function WalletPage() {
    const { user } = useAuth();
    const userId = user?.id || 'guest';

    const [wallet, setWallet] = useState({
        walletBalance: 0,
        referralBonusBalance: 500,
        commissionDue: 350,
        driverEarningsBalance: 2400,
        transactions: [] as any[],
    });
    const [purpose, setPurpose] = useState<Purpose>('PASSENGER_DEPOSIT');
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('500');
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

    const getAuthToken = () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('authToken') || localStorage.getItem('token');
    };

    const loadWallet = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`/api/payments/airtel-money?userId=${encodeURIComponent(userId)}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success && data.wallet) setWallet(data.wallet);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        loadWallet();
        if (user?.phone && !phone) setPhone(user.phone);
    }, [userId]);

    const handleExecute = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setFeedback(null);
        try {
            const token = getAuthToken();
            const res = await fetch('/api/payments/airtel-money', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    userId,
                    purpose,
                    phone,
                    amount: Number(amount),
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Transaction failed');
            if (data.wallet) setWallet(data.wallet);
            setFeedback({ ok: true, text: data.message });
        } catch (err: any) {
            setFeedback({ ok: false, text: err.message || 'Airtel Money transaction failed.' });
        } finally {
            setBusy(false);
        }
    };

    return (
        <MainLayout title="Airtel Money Wallet & Payouts | CABI Africa">
            <div className="min-h-screen bg-slate-50 dark:bg-surface-dark py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                            Airtel Money Wallet &amp; Payouts
                        </h1>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            Deposit ride credits, withdraw referral bonuses, settle driver commissions, or cash out driver earnings instantly via Airtel Money.
                        </p>
                    </div>

                    {/* 4 Live Balance Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10">
                            <Wallet className="w-5 h-5 text-[#D4AF37] mb-2" />
                            <p className="text-[10px] font-bold uppercase text-neutral-500">Passenger Ride Wallet</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">KES {wallet.walletBalance.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10">
                            <Gift className="w-5 h-5 text-emerald-500 mb-2" />
                            <p className="text-[10px] font-bold uppercase text-neutral-500">Referral Bonus</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">KES {wallet.referralBonusBalance.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10">
                            <Percent className="w-5 h-5 text-amber-500 mb-2" />
                            <p className="text-[10px] font-bold uppercase text-neutral-500">Driver Commission Due</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">KES {wallet.commissionDue.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10">
                            <Banknote className="w-5 h-5 text-[#D4AF37] mb-2" />
                            <p className="text-[10px] font-bold uppercase text-neutral-500">Driver Earnings</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">KES {wallet.driverEarningsBalance.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Airtel Money Action Form */}
                    <form
                        onSubmit={handleExecute}
                        className="rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 p-6 sm:p-8 shadow-xl space-y-5"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                                    Transaction Type
                                </label>
                                <select
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value as Purpose)}
                                    className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                                >
                                    <option value="PASSENGER_DEPOSIT">Passenger: Deposit for Future Rides</option>
                                    <option value="REFERRAL_WITHDRAWAL">Passenger: Withdraw Referral Bonus</option>
                                    <option value="DRIVER_COMMISSION">Driver: Pay Commission Due</option>
                                    <option value="DRIVER_EARNINGS">Driver: Withdraw Earnings (Instant)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                                    Airtel Money Phone
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+254 733 XXX XXX"
                                    className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                                    Amount (KES)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={10}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {feedback && (
                            <p className={`text-xs font-semibold flex items-center gap-1.5 ${feedback.ok ? 'text-emerald-500' : 'text-red-500'}`}>
                                <CheckCircle2 className="w-4 h-4" /> {feedback.text}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={busy}
                            className="px-8 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
                        >
                            {busy ? 'Processing Airtel Money...' : 'Confirm Airtel Money Transaction'}
                        </button>
                    </form>

                    {/* Transaction Ledger */}
                    {wallet.transactions.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                                Recent Airtel Money Transactions
                            </h2>
                            {wallet.transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        {tx.direction === 'IN' ? (
                                            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                            <ArrowUpRight className="w-5 h-5 text-[#D4AF37]" />
                                        )}
                                        <div>
                                            <p className="text-xs font-mono text-[#D4AF37]">{tx.id} &bull; {tx.purpose}</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.message}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">
                                        {tx.direction === 'IN' ? '+' : '-'}KES {tx.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
