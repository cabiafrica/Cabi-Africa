import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { CategoryPricingConfig } from '../../services/admin/types';
import { PageHeader } from '../common/PageHeader';
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
    Add,
    DeleteOutline,
    Palette,
} from '@mui/icons-material';

const MODERATE_COLOR_PALETTE = [
    { name: 'Terracotta Amber', hex: '#D97706' },
    { name: 'Petrol Teal', hex: '#0D9488' },
    { name: 'Champagne Gold', hex: '#D4AF37' },
    { name: 'Steel Navy', hex: '#2563EB' },
    { name: 'Emerald Forest', hex: '#059669' },
    { name: 'Executive Slate', hex: '#475569' },
    { name: 'Bronze Clay', hex: '#B45309' },
];

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
        colorCode: '#D97706',
        capacity: '1 Passenger',
        tag: 'FASTEST',
        iconType: 'boda',
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
        colorCode: '#0D9488',
        capacity: '4 Passengers',
        tag: 'ECONOMY',
        iconType: 'sedan',
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
        colorCode: '#0D9488',
        capacity: '4 Passengers',
        tag: 'POPULAR',
        iconType: 'sedan',
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
        colorCode: '#2563EB',
        capacity: '6 Passengers',
        tag: 'DELEGATION',
        iconType: 'suv',
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
        colorCode: '#D4AF37',
        capacity: '3 Passengers',
        tag: 'LUXURY',
        iconType: 'luxury',
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
    const [viewingCategory, setViewingCategory] = useState<CategoryPricingConfig | null>(null);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState<CategoryPricingConfig>({
        category: '',
        displayName: '',
        baseFare: 150,
        perKmRate: 45,
        perMinuteRate: 5,
        minimumFare: 150,
        roundingStep: 50,
        description: 'Executive on-demand transit tier.',
        isActive: true,
        colorCode: '#0D9488',
        capacity: '4 Passengers',
        tag: 'SPECIAL',
        iconType: 'sedan',
    });

    const handleCreateNewCategory = () => {
        if (!newCategory.category.trim() || !newCategory.displayName.trim()) {
            alert('Please provide a category code and display name.');
            return;
        }
        const key = newCategory.category.trim().toUpperCase().replace(/\s+/g, '_');
        if (categories.some((c) => c.category === key)) {
            alert(`Category code "${key}" already exists.`);
            return;
        }
        const created: CategoryPricingConfig = {
            ...newCategory,
            category: key,
            baseFare: Number(newCategory.baseFare) || 100,
            perKmRate: Number(newCategory.perKmRate) || 40,
            perMinuteRate: Number(newCategory.perMinuteRate) || 4,
            minimumFare: Number(newCategory.minimumFare) || 100,
            roundingStep: Number(newCategory.roundingStep) || 25,
        };
        const updated = [...categories, created];
        setCategories(updated);
        setIsCreatingCategory(false);
        setNewCategory({
            category: '',
            displayName: '',
            baseFare: 150,
            perKmRate: 45,
            perMinuteRate: 5,
            minimumFare: 150,
            roundingStep: 50,
            description: 'Executive on-demand transit tier.',
            isActive: true,
            colorCode: '#0D9488',
            capacity: '4 Passengers',
            tag: 'SPECIAL',
            iconType: 'sedan',
        });
        adminService.updatePricingCategories(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleDeleteCategory = (catKey: string) => {
        if (window.confirm(`Are you sure you want to remove category "${catKey}"?`)) {
            const updated = categories.filter((c) => c.category !== catKey);
            setCategories(updated);
            adminService.updatePricingCategories(updated);
        }
    };

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
            <PageHeader
                category="Growth & Platform"
                title="Fair Driver Pay & Real-Time Taximeter Rules"
                subtitle="Configure dynamic pay per kilometer and minute, minimum floors, and real-time nearest-figure rounding per vehicle category"
                icon={<Speed className="w-5 h-5 text-amber-500" />}
                action={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCreatingCategory(true)}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 py-1.5 rounded-[3px] text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                            <Add fontSize="small" />
                            <span>Create Service Tier</span>
                        </button>
                        <button
                            onClick={handleResetDefaults}
                            className="btn-secondary flex items-center gap-1.5"
                            title="Restore African standard market defaults"
                        >
                            <Refresh fontSize="small" />
                            <span>Reset Defaults</span>
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {saveSuccess ? (
                                <>
                                    <CheckCircle fontSize="small" /> <span>Saved to System!</span>
                                </>
                            ) : (
                                <>
                                    <Save fontSize="small" /> <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                                </>
                            )}
                        </button>
                    </div>
                }
            />

            {/* Quick Context Card */}
            <div className="bg-[#131722] border border-amber-500/30 rounded-[3px] p-4 flex items-start gap-3">
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
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="w-2 h-2 rounded-full inline-block"
                                                style={{ backgroundColor: c.colorCode || '#0D9488' }}
                                                title={`Category Color: ${c.colorCode || '#0D9488'}`}
                                            />
                                            <h3 className="font-bold text-white text-sm">
                                                {c.displayName}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/5 text-amber-400 border border-white/10 font-mono">
                                                {c.category}
                                            </span>
                                            {c.capacity && (
                                                <span className="text-[10px] text-slate-400 font-sans">
                                                    {c.capacity}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setViewingCategory(c)}
                                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                        title="View Service Details"
                                    >
                                        <InfoOutlined fontSize="small" />
                                    </button>
                                    <button
                                        onClick={() => setEditingCategory({ ...c })}
                                        className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                        title="Edit Category Rates"
                                    >
                                        <Edit fontSize="small" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(c.category)}
                                        className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                        title={`Delete Service "${c.displayName}"`}
                                    >
                                        <DeleteOutline fontSize="small" />
                                    </button>
                                </div>
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

                            {/* Moderate Color Scheme & Vehicle 3D Model */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Capacity
                                    </label>
                                    <input
                                        type="text"
                                        value={editingCategory.capacity || '4 Passengers'}
                                        onChange={(e) =>
                                            setEditingCategory({ ...editingCategory, capacity: e.target.value })
                                        }
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white focus:border-amber-500 outline-none text-xs"
                                        placeholder="e.g. 4 Passengers"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        3D Model Profile
                                    </label>
                                    <select
                                        value={editingCategory.iconType || 'sedan'}
                                        onChange={(e) =>
                                            setEditingCategory({ ...editingCategory, iconType: e.target.value as any })
                                        }
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white focus:border-amber-500 outline-none text-xs"
                                    >
                                        <option value="sedan">3D Executive Sedan</option>
                                        <option value="boda">3D Boda Motorcycle</option>
                                        <option value="suv">3D SUV / Van</option>
                                        <option value="luxury">3D Luxury Limousine</option>
                                    </select>
                                </div>
                            </div>

                            {/* Moderate Color Accent Picker */}
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1.5">
                                    Moderate Accent Color
                                </label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {MODERATE_COLOR_PALETTE.map((pal) => (
                                        <button
                                            key={pal.hex}
                                            type="button"
                                            onClick={() => setEditingCategory({ ...editingCategory, colorCode: pal.hex })}
                                            className={`w-7 h-7 rounded-[3px] border-2 transition-all cursor-pointer flex items-center justify-center ${
                                                editingCategory.colorCode === pal.hex
                                                    ? 'border-white scale-110 shadow-md'
                                                    : 'border-transparent opacity-75 hover:opacity-100'
                                            }`}
                                            style={{ backgroundColor: pal.hex }}
                                            title={pal.name}
                                        >
                                            {editingCategory.colorCode === pal.hex && (
                                                <CheckCircle style={{ fontSize: 14, color: '#FFFFFF' }} />
                                            )}
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

            {/* Create Brand-New Service Category Modal */}
            {isCreatingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#131722] rounded max-w-lg w-full p-6 border border-amber-500/30 shadow-2xl space-y-5 text-white animate-fade-in">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <Add />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">
                                        Create New Service Category
                                    </h3>
                                    <span className="text-xs text-slate-400">
                                        Define new on-demand transport tier with customized pay rules
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreatingCategory(false)}
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <Close fontSize="small" />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Category Code (Unique)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ECO_EV"
                                        value={newCategory.category}
                                        onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value.toUpperCase() })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white font-mono focus:border-amber-500 outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Cabi Eco EV"
                                        value={newCategory.displayName}
                                        onChange={(e) => setNewCategory({ ...newCategory, displayName: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white focus:border-amber-500 outline-none text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Base Fare (KES)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newCategory.baseFare}
                                        onChange={(e) => setNewCategory({ ...newCategory, baseFare: Number(e.target.value) })}
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
                                        value={newCategory.minimumFare}
                                        onChange={(e) => setNewCategory({ ...newCategory, minimumFare: Number(e.target.value) })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white font-mono focus:border-amber-500 outline-none text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Per KM Rate (KES)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newCategory.perKmRate}
                                        onChange={(e) => setNewCategory({ ...newCategory, perKmRate: Number(e.target.value) })}
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
                                        value={newCategory.perMinuteRate}
                                        onChange={(e) => setNewCategory({ ...newCategory, perMinuteRate: Number(e.target.value) })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white font-mono focus:border-amber-500 outline-none text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Capacity & Specs
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 4 Passengers"
                                        value={newCategory.capacity || ''}
                                        onChange={(e) => setNewCategory({ ...newCategory, capacity: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white focus:border-amber-500 outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        3D Moving Vehicle Shape
                                    </label>
                                    <select
                                        value={newCategory.iconType || 'sedan'}
                                        onChange={(e) => setNewCategory({ ...newCategory, iconType: e.target.value as any })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white focus:border-amber-500 outline-none text-xs"
                                    >
                                        <option value="sedan">3D Executive Sedan</option>
                                        <option value="boda">3D Boda Motorcycle</option>
                                        <option value="suv">3D SUV / Van</option>
                                        <option value="luxury">3D Luxury Limousine</option>
                                    </select>
                                </div>
                            </div>

                            {/* Moderate Color Selection */}
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1.5">
                                    Moderate Accent Color
                                </label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {MODERATE_COLOR_PALETTE.map((pal) => (
                                        <button
                                            key={pal.hex}
                                            type="button"
                                            onClick={() => setNewCategory({ ...newCategory, colorCode: pal.hex })}
                                            className={`w-7 h-7 rounded-[3px] border-2 transition-all cursor-pointer flex items-center justify-center ${
                                                newCategory.colorCode === pal.hex
                                                    ? 'border-white scale-110 shadow-md'
                                                    : 'border-transparent opacity-75 hover:opacity-100'
                                            }`}
                                            style={{ backgroundColor: pal.hex }}
                                            title={pal.name}
                                        >
                                            {newCategory.colorCode === pal.hex && (
                                                <CheckCircle style={{ fontSize: 14, color: '#FFFFFF' }} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">
                                    Category Description
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Short description of this transit tier..."
                                    value={newCategory.description || ''}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-1.5 text-white focus:border-amber-500 outline-none text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setIsCreatingCategory(false)}
                                className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateNewCategory}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4 py-1.5 rounded text-xs font-bold shadow-sm shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <Add fontSize="small" />
                                <span>Create Tier</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Service Details Modal */}
            {viewingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#131722] border border-white/10 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded bg-[#0a0a0a] border border-white/10">
                                    {getCategoryIcon(viewingCategory.category)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">{viewingCategory.displayName}</h3>
                                    <span className="text-xs font-mono text-amber-400">{viewingCategory.category}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewingCategory(null)}
                                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
                            >
                                <Close fontSize="small" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-xs">
                            <p className="text-slate-300 text-sm">{viewingCategory.description || 'No description provided.'}</p>

                            <div className="grid grid-cols-2 gap-3 p-4 rounded bg-[#0a0a0a] border border-white/5 font-mono">
                                <div>
                                    <span className="text-slate-400 uppercase text-[10px] font-sans block">Base Fare</span>
                                    <span className="font-bold text-white text-sm">KES {viewingCategory.baseFare}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase text-[10px] font-sans block">Per Kilometer Rate</span>
                                    <span className="font-bold text-white text-sm">KES {viewingCategory.perKmRate} / km</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase text-[10px] font-sans block">Per Minute Rate</span>
                                    <span className="font-bold text-white text-sm">KES {viewingCategory.perMinuteRate} / min</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase text-[10px] font-sans block">Minimum Fare Floor</span>
                                    <span className="font-bold text-white text-sm">KES {viewingCategory.minimumFare}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase text-[10px] font-sans block">Taximeter Rounding Step</span>
                                    <span className="font-bold text-amber-400 text-sm">Nearest KES {viewingCategory.roundingStep}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase text-[10px] font-sans block">Capacity</span>
                                    <span className="font-bold text-slate-200 text-sm font-sans">{viewingCategory.capacity || '4 Passengers'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded bg-white/[0.02] border border-white/5">
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Service Status</span>
                                    <span className="text-white font-bold">{viewingCategory.isActive ? 'Active in Dispatch' : 'Disabled'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: viewingCategory.colorCode || '#D97706' }} />
                                    <span className="font-mono text-slate-300">{viewingCategory.colorCode || '#D97706'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingCategory({ ...viewingCategory });
                                    setViewingCategory(null);
                                }}
                                className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                            >
                                Edit Service
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewingCategory(null)}
                                className="px-3.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white font-semibold text-xs"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
