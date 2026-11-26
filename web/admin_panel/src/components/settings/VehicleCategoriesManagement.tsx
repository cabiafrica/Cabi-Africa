import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { CategoryPricingConfig } from '../../services/admin/types';
import {
    LocalTaxi,
    Speed,
    Save,
    Calculate,
    Refresh,
    Edit,
    CheckCircle,
    TwoWheeler,
    DirectionsCar,
    AirportShuttle,
    Stars,
    InfoOutlined,
    Close,
} from '@mui/icons-material';

const DEFAULT_CATEGORIES: CategoryPricingConfig[] = [
    {
        category: 'BODA',
        displayName: 'Boda Boda (Motorcycle)',
        baseFare: 50,
        perKmRate: 25,
        perMinuteRate: 2,
        minimumFare: 50,
        roundingStep: 10,
        description: 'Two-wheel motorcycle deliveries & fast commuter trips. Rounded to nearest KES 10.',
        isActive: true,
    },
    {
        category: 'BASIC',
        displayName: 'Cabi Basic (Economy)',
        baseFare: 100,
        perKmRate: 35,
        perMinuteRate: 3,
        minimumFare: 100,
        roundingStep: 25,
        description: 'Compact eco-hatchbacks for budget city travel. Rounded to nearest KES 25.',
        isActive: true,
    },
    {
        category: 'STANDARD',
        displayName: 'Cabi Standard (Sedan)',
        baseFare: 150,
        perKmRate: 45,
        perMinuteRate: 5,
        minimumFare: 150,
        roundingStep: 50,
        description: 'Comfortable sedans for everyday city and airport trips. Rounded to nearest KES 50.',
        isActive: true,
    },
    {
        category: 'XL',
        displayName: 'Cabi XL (SUV / 6-Seater)',
        baseFare: 250,
        perKmRate: 65,
        perMinuteRate: 7,
        minimumFare: 250,
        roundingStep: 50,
        description: 'High capacity 6-7 seaters for families & airport luggage. Rounded to nearest KES 50.',
        isActive: true,
    },
    {
        category: 'PREMIUM',
        displayName: 'Cabi Premium (Executive)',
        baseFare: 300,
        perKmRate: 85,
        perMinuteRate: 10,
        minimumFare: 300,
        roundingStep: 50,
        description: 'Luxury executive sedans with top-rated veteran drivers. Rounded to nearest KES 50.',
        isActive: true,
    },
];

export const VehicleCategoriesManagement: React.FC = () => {
    const [categories, setCategories] = useState<CategoryPricingConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('BODA');

    // Live Simulator State
    const [simDistance, setSimDistance] = useState<number>(4.8);
    const [simDuration, setSimDuration] = useState<number>(14);

    // Modal Edit State
    const [editingCategory, setEditingCategory] = useState<CategoryPricingConfig | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPricingCategories();
            if (data && data.length > 0) {
                setCategories(data);
            } else {
                setCategories(DEFAULT_CATEGORIES);
            }
        } catch {
            setCategories(DEFAULT_CATEGORIES);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            await adminService.updatePricingCategories(categories);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            alert(`Error saving pricing rules: ${err.message || 'Please try again'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleResetDefaults = () => {
        if (window.confirm('Reset all categories to recommended baseline rates and rounding steps?')) {
            setCategories(DEFAULT_CATEGORIES);
        }
    };

    const handleUpdateCategoryInState = (updated: CategoryPricingConfig) => {
        setCategories((prev) =>
            prev.map((c) => (c.category === updated.category ? updated : c))
        );
        setEditingCategory(null);
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toUpperCase()) {
            case 'BODA':
                return <TwoWheeler className="text-amber-500" />;
            case 'BASIC':
                return <DirectionsCar className="text-emerald-500" />;
            case 'STANDARD':
                return <LocalTaxi className="text-amber-500" />;
            case 'XL':
                return <AirportShuttle className="text-amber-400" />;
            case 'PREMIUM':
                return <Stars className="text-amber-400" />;
            default:
                return <LocalTaxi className="text-amber-500" />;
        }
    };

    // Active Category for Simulation
    const activeSimConfig =
        categories.find((c) => c.category === selectedCategory) ||
        categories[0] ||
        DEFAULT_CATEGORIES[0];

    // Compute Simulation
    const simDistanceCost = simDistance * (activeSimConfig?.perKmRate || 0);
    const simTimeCost = simDuration * (activeSimConfig?.perMinuteRate || 0);
    const simRawTotal = Math.max(
        activeSimConfig?.minimumFare || 0,
        (activeSimConfig?.baseFare || 0) + simDistanceCost + simTimeCost
    );
    const simStep = activeSimConfig?.roundingStep > 0 ? activeSimConfig.roundingStep : 1;
    const simRoundedTotal = Math.round(simRawTotal / simStep) * simStep;
    const simRoundingDiff = simRoundedTotal - simRawTotal;

    return (
        <div className="space-y-6">
            {/* Header & Control Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Speed className="text-amber-500" />
                        Fair Driver Pay & Real-Time Taximeter Rules
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Configure dynamic pay per kilometer and minute, minimum floors, and real-time nearest-figure rounding per vehicle category.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleResetDefaults}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 active:scale-95"
                        title="Restore African standard market defaults"
                    >
                        <Refresh fontSize="small" />
                        Reset Defaults
                    </button>
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black px-3.5 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-amber-500/20 active:scale-95"
                    >
                        {saveSuccess ? (
                            <>
                                <CheckCircle fontSize="small" /> Saved to System!
                            </>
                        ) : (
                            <>
                                <Save fontSize="small" /> {saving ? 'Saving...' : 'Save Configuration'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Context Card */}
            <div className="bg-[#131722] border border-amber-500/30 rounded p-4 flex items-start gap-3">
                <InfoOutlined className="text-amber-400 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-white">Driver Meter Rounding Rule:</span> Fares are calculated in real time during the trip using <code className="font-mono bg-[#0a0a0a] text-amber-400 border border-white/10 px-1.5 py-0.5 rounded">Base + (KM × Rate) + (Minutes × Rate)</code>. At every second, the live taximeter rounds the figure mathematically to the configured category step (e.g. Boda Boda rounds to nearest KES 10; Basic to nearest KES 25; Standard, XL and Premium to nearest KES 50) guaranteeing fair, clear cash-change friendly earnings.
                </div>
            </div>

            {/* Category Configuration Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((c) => (
                    <div
                        key={c.category}
                        className={`bg-[#131722] rounded border transition-all shadow-sm overflow-hidden flex flex-col justify-between ${
                            selectedCategory === c.category
                                ? 'border-amber-500 ring-1 ring-amber-500/30'
                                : 'border-white/10 hover:border-white/20'
                        }`}
                    >
                        <div className="p-4 space-y-3">
                            {/* Card Top */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                                        {getCategoryIcon(c.category)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">
                                            {c.displayName}
                                        </h3>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-amber-400 border border-white/10 font-mono">
                                            {c.category}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditingCategory({ ...c })}
                                    className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                    title="Edit Category Rates"
                                >
                                    <Edit fontSize="small" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-2">
                                {c.description || 'Configured vehicle category'}
                            </p>

                            {/* Rates Breakdown */}
                            <div className="grid grid-cols-2 gap-2 text-xs bg-[#0a0a0a] p-3 rounded border border-white/10 font-mono">
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-sans">Base Fare</span>
                                    <span className="font-bold text-white">KES {c.baseFare}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-sans">Per KM</span>
                                    <span className="font-bold text-white">KES {c.perKmRate}</span>
                                </div>
                                <div className="mt-1">
                                    <span className="text-slate-400 block text-[10px] uppercase font-sans">Per Minute</span>
                                    <span className="font-bold text-white">KES {c.perMinuteRate}</span>
                                </div>
                                <div className="mt-1">
                                    <span className="text-slate-400 block text-[10px] uppercase font-sans">Min Fare</span>
                                    <span className="font-bold text-white">KES {c.minimumFare}</span>
                                </div>
                            </div>

                            {/* Rounding Step Badge */}
                            <div className="flex items-center justify-between p-2.5 rounded bg-amber-500/10 border border-amber-500/20">
                                <div>
                                    <span className="text-[11px] text-amber-400 font-semibold block">
                                        Taximeter Rounding:
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        Rounds to nearest figure
                                    </span>
                                </div>
                                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold px-2 py-0.5 rounded shadow-sm font-mono">
                                    KES {c.roundingStep}
                                </span>
                            </div>
                        </div>

                        {/* Simulator Selector Button */}
                        <div className="p-3 bg-[#0a0a0a] border-t border-white/10 flex justify-between items-center">
                            <span className="text-xs text-slate-400">
                                {c.isActive ? 'Active in Dispatch' : 'Inactive'}
                            </span>
                            <button
                                onClick={() => setSelectedCategory(c.category)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded transition-all active:scale-95 ${
                                    selectedCategory === c.category
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-sm shadow-amber-500/20'
                                        : 'text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10'
                                }`}
                            >
                                {selectedCategory === c.category ? 'Testing in Simulator' : 'Test in Simulator'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Interactive Live Taximeter Simulator */}
            <div className="bg-[#131722] rounded border border-white/10 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-white/10 bg-[#0a0a0a] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <Calculate className="text-amber-400" />
                            Live Taximeter Rounding Simulator
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Verify how the real-time driver mobile meter behaves under varying distance and duration values.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Testing Category:</span>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-[#131722] border border-white/10 rounded px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                        >
                            {categories.map((c) => (
                                <option key={c.category} value={c.category}>
                                    {c.displayName} (Round KES {c.roundingStep})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Controls (7 cols) */}
                    <div className="lg:col-span-7 space-y-5">
                        {/* Distance Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-semibold text-slate-300">
                                    Distance Covered (Kilometers)
                                </label>
                                <span className="font-mono text-sm font-bold text-amber-400">
                                    {simDistance.toFixed(1)} km
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="50"
                                step="0.1"
                                value={simDistance}
                                onChange={(e) => setSimDistance(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                                <span>0.1 km</span>
                                <span>25 km</span>
                                <span>50 km</span>
                            </div>
                        </div>

                        {/* Duration Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-semibold text-slate-300">
                                    Trip Duration (Minutes)
                                </label>
                                <span className="font-mono text-sm font-bold text-amber-400">
                                    {simDuration} mins
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="120"
                                step="1"
                                value={simDuration}
                                onChange={(e) => setSimDuration(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                                <span>1 min</span>
                                <span>60 mins</span>
                                <span>120 mins</span>
                            </div>
                        </div>

                        {/* Detailed Formula Steps */}
                        <div className="bg-[#0a0a0a] p-4 rounded border border-white/10 space-y-2 text-xs">
                            <h4 className="font-semibold text-white">
                                Math Breakdown for {activeSimConfig?.displayName}:
                            </h4>
                            <div className="flex justify-between py-1 border-b border-white/10 font-mono">
                                <span className="text-slate-400 font-sans">Base Pickup Fare</span>
                                <span className="text-white">KES {activeSimConfig?.baseFare.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/10 font-mono">
                                <span className="text-slate-400 font-sans">
                                    Distance ({simDistance.toFixed(1)} km × KES {activeSimConfig?.perKmRate})
                                </span>
                                <span className="text-white">KES {simDistanceCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/10 font-mono">
                                <span className="text-slate-400 font-sans">
                                    Time ({simDuration} min × KES {activeSimConfig?.perMinuteRate})
                                </span>
                                <span className="text-white">KES {simTimeCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 font-mono font-semibold">
                                <span className="text-slate-300 font-sans">
                                    Unrounded Raw Total
                                </span>
                                <span className="text-amber-400">
                                    KES {simRawTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Result Meter Box (5 cols) */}
                    <div className="lg:col-span-5 bg-[#0a0a0a] text-white rounded p-6 border border-white/10 flex flex-col justify-between shadow-lg">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                                    ● LIVE TAXIMETER OUTPUT
                                </span>
                                <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono text-slate-300">
                                    STEP: KES {simStep}
                                </span>
                            </div>

                            <div className="text-center py-4 bg-[#131722] rounded border border-white/10 mb-4">
                                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block mb-1">
                                    Expected Driver Fare
                                </span>
                                <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                                    KES {simRoundedTotal.toLocaleString()}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 inline-block">
                                    Rounded to nearest figure ({activeSimConfig?.displayName})
                                </span>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 text-slate-300 font-mono">
                                    <span className="text-slate-400 font-sans">Raw Computed Fare:</span>
                                    <span>KES {simRawTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-1 text-slate-300 font-mono">
                                    <span className="text-slate-400 font-sans">Rounding Adjustment:</span>
                                    <span className={simRoundingDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                                        {simRoundingDiff >= 0 ? `+KES ${simRoundingDiff.toFixed(2)}` : `-KES ${Math.abs(simRoundingDiff).toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 text-slate-300 font-mono">
                                    <span className="text-slate-400 font-sans">Driver Earnings Guarantee:</span>
                                    <span className="text-amber-400 font-bold">100% Fair & Transparent</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                            <span>Driver App HUD Sync</span>
                            <span className="text-amber-400 font-semibold font-mono">REALTIME ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Edit Modal */}
            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#131722] rounded max-w-lg w-full p-6 border border-white/10 shadow-2xl space-y-5 text-white">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-3">
                                {getCategoryIcon(editingCategory.category)}
                                <div>
                                    <h3 className="font-bold text-white text-base">
                                        Configure {editingCategory.displayName}
                                    </h3>
                                    <span className="text-xs text-slate-400 font-mono">
                                        ID: {editingCategory.category}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingCategory(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <Close fontSize="small" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={editingCategory.displayName}
                                    onChange={(e) =>
                                        setEditingCategory({ ...editingCategory, displayName: e.target.value })
                                    }
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white focus:border-amber-500 outline-none text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Base Fare (KES)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editingCategory.baseFare}
                                        onChange={(e) =>
                                            setEditingCategory({
                                                ...editingCategory,
                                                baseFare: Math.max(0, Number(e.target.value)),
                                            })
                                        }
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white font-mono focus:border-amber-500 outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Minimum Fare (KES)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editingCategory.minimumFare}
                                        onChange={(e) =>
                                            setEditingCategory({
                                                ...editingCategory,
                                                minimumFare: Math.max(0, Number(e.target.value)),
                                            })
                                        }
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white font-mono focus:border-amber-500 outline-none text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Per KM Rate (KES)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editingCategory.perKmRate}
                                        onChange={(e) =>
                                            setEditingCategory({
                                                ...editingCategory,
                                                perKmRate: Math.max(0, Number(e.target.value)),
                                            })
                                        }
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white font-mono focus:border-amber-500 outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Per Minute Rate (KES)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editingCategory.perMinuteRate}
                                        onChange={(e) =>
                                            setEditingCategory({
                                                ...editingCategory,
                                                perMinuteRate: Math.max(0, Number(e.target.value)),
                                            })
                                        }
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white font-mono focus:border-amber-500 outline-none text-xs"
                                    />
                                </div>
                            </div>

                            {/* Rounding Step Selector */}
                            <div className="bg-[#0a0a0a] p-3.5 rounded border border-white/10">
                                <label className="block text-white font-bold mb-1">
                                    Taximeter Rounding Figure (Nearest Step)
                                </label>
                                <p className="text-[11px] text-slate-400 mb-2.5">
                                    Choose the nearest figure step for drivers and passengers:
                                </p>
                                <div className="flex gap-2">
                                    {[10, 20, 25, 50, 100].map((step) => (
                                        <button
                                            key={step}
                                            type="button"
                                            onClick={() =>
                                                setEditingCategory({ ...editingCategory, roundingStep: step })
                                            }
                                            className={`px-3 py-1.5 rounded font-mono font-bold text-xs transition-colors ${
                                                editingCategory.roundingStep === step
                                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm'
                                                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                                            }`}
                                        >
                                            KES {step}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3.5 py-1.5 rounded text-xs font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleUpdateCategoryInState(editingCategory)}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-3.5 py-1.5 rounded text-xs font-bold shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
