import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    Discount,
    Add,
    Edit,
    Delete,
    ConfirmationNumber,
    CheckCircle,
    Cancel
} from '@mui/icons-material';
import { PageHeader } from '../common/PageHeader';

export const PromoCodeManagement: React.FC = () => {
    const [promos, setPromos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any | null>(null);

    // Form state
    const [formCode, setFormCode] = useState('');
    const [formType, setFormType] = useState<'PERCENTAGE' | 'FLAT_AMOUNT'>('PERCENTAGE');
    const [formValue, setFormValue] = useState<number>(20);
    const [formMaxUses, setFormMaxUses] = useState<number>(1000);
    const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

    useEffect(() => {
        adminService.getPromoCodes()
            .then(data => {
                if (data && data.length > 0) {
                    setPromos(data);
                } else {
                    setPromos([
                        { code: 'JAMHURI20', type: 'PERCENTAGE', value: 20, uses: 142, status: 'ACTIVE' },
                        { code: 'NAIROBI100', type: 'FLAT_AMOUNT', value: 100, uses: 89, status: 'ACTIVE' },
                        { code: 'BODAPASS', type: 'PERCENTAGE', value: 15, uses: 412, status: 'ACTIVE' },
                        { code: 'AIRPORT50', type: 'FLAT_AMOUNT', value: 250, uses: 34, status: 'INACTIVE' }
                    ]);
                }
            })
            .catch(() => {
                setPromos([
                    { code: 'JAMHURI20', type: 'PERCENTAGE', value: 20, uses: 142, status: 'ACTIVE' },
                    { code: 'NAIROBI100', type: 'FLAT_AMOUNT', value: 100, uses: 89, status: 'ACTIVE' },
                    { code: 'BODAPASS', type: 'PERCENTAGE', value: 15, uses: 412, status: 'ACTIVE' },
                    { code: 'AIRPORT50', type: 'FLAT_AMOUNT', value: 250, uses: 34, status: 'INACTIVE' }
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleOpenCreate = () => {
        setEditingPromo(null);
        setFormCode('');
        setFormType('PERCENTAGE');
        setFormValue(20);
        setFormMaxUses(500);
        setFormStatus('ACTIVE');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (p: any) => {
        setEditingPromo(p);
        setFormCode(p.code);
        setFormType(p.type);
        setFormValue(p.value);
        setFormMaxUses(p.uses || 500);
        setFormStatus(p.status);
        setIsModalOpen(true);
    };

    const handleDelete = (code: string) => {
        if (window.confirm(`Are you sure you want to delete promo code "${code}"?`)) {
            setPromos(prev => prev.filter(p => p.code !== code));
        }
    };

    const handleSavePromo = (e: React.FormEvent) => {
        e.preventDefault();
        const codeClean = formCode.trim().toUpperCase();
        if (!codeClean) return;

        if (editingPromo) {
            setPromos(prev => prev.map(p => p.code === editingPromo.code ? {
                ...p,
                code: codeClean,
                type: formType,
                value: formValue,
                status: formStatus
            } : p));
        } else {
            setPromos(prev => [
                {
                    code: codeClean,
                    type: formType,
                    value: formValue,
                    uses: 0,
                    status: formStatus
                },
                ...prev
            ]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                category="Growth & Platform"
                title="Promo Codes"
                subtitle="Manage marketing campaign codes, trip discount parameters, and redemption limits."
                icon={<Discount className="text-amber-500" />}
                actions={
                    <button
                        onClick={handleOpenCreate}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-3.5 py-1.5 rounded-[3px] text-xs font-semibold shadow-sm shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                        <Add fontSize="small" />
                        Create Promo Code
                    </button>
                }
            />

            <div className="bg-white dark:bg-card-dark shadow-sm rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-dark flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Active Campaign Codes</h3>
                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {promos.length} Active
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-surface-dark">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uses</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-card-dark divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading promo codes...</td></tr>
                            ) : promos.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No promo codes found.</td></tr>
                            ) : promos.map((p: any) => (
                                <tr key={p.code} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <ConfirmationNumber fontSize="small" className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-wide">{p.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                                            {p.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                                        {p.type === 'PERCENTAGE' ? `${p.value}%` : `KES ${p.value}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                        {p.uses} / <span className="text-slate-400">∞</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${p.status === 'ACTIVE'
                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                                            }`}>
                                            {p.status === 'ACTIVE' ? <CheckCircle style={{ fontSize: 12 }} /> : <Cancel style={{ fontSize: 12 }} />}
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(p)}
                                                className="text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                                                title="Edit Promo Code"
                                            >
                                                <Edit fontSize="small" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(p.code)}
                                                className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                                                title="Delete Promo Code"
                                            >
                                                <Delete fontSize="small" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Promo Code Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#131722] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up text-white">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <Discount className="text-amber-500" />
                                <h3 className="font-bold text-white text-base">
                                    {editingPromo ? `Edit Code ${editingPromo.code}` : 'Create New Promo Code'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSavePromo} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1">
                                    Promo Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. MASHUJAA20"
                                    value={formCode}
                                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded font-mono text-amber-400 font-bold focus:border-amber-500 outline-none uppercase text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1">
                                        Discount Type
                                    </label>
                                    <select
                                        value={formType}
                                        onChange={(e) => setFormType(e.target.value as any)}
                                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded text-white focus:border-amber-500 outline-none"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FLAT_AMOUNT">Flat Amount (KES)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1">
                                        {formType === 'PERCENTAGE' ? 'Discount %' : 'Discount KES'}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        placeholder="0"
                                        value={formValue || ''}
                                        onChange={(e) => {
                                            const clean = e.target.value.replace(/^0+(?=\d)/, '');
                                            setFormValue(Number(clean) || 0);
                                        }}
                                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded font-mono text-white focus:border-amber-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1">
                                        Max Redemptions
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formMaxUses || ''}
                                        onChange={(e) => {
                                            const clean = e.target.value.replace(/^0+(?=\d)/, '');
                                            setFormMaxUses(Number(clean) || 0);
                                        }}
                                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded font-mono text-white focus:border-amber-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1">
                                        Campaign Status
                                    </label>
                                    <select
                                        value={formStatus}
                                        onChange={(e) => setFormStatus(e.target.value as any)}
                                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded text-white focus:border-amber-500 outline-none"
                                    >
                                        <option value="ACTIVE">Active (Live)</option>
                                        <option value="INACTIVE">Inactive (Disabled)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formCode.trim()}
                                    className="btn-primary px-5 py-2 rounded text-xs font-bold disabled:opacity-50"
                                >
                                    {editingPromo ? 'Save Changes' : 'Create Code'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
