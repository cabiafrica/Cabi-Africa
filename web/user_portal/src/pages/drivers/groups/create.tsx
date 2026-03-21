import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/router';

export default function CreateDriverGroupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        rules: '',
        isPrivate: false,
        memberCapacity: 100,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/driver-org/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('Group created successfully!');
                router.push('/drivers/groups/browse');
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to create group');
            }
        } catch (error) {
            alert('An error occurred during creation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout title="Create Community Group | CABI Africa">
            <div className="min-h-screen bg-[#0A0A0A] text-white py-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            Start a Community Group
                        </h1>
                        <p className="text-gray-400 mt-2">Bring drivers together. Whether it's for regional coordination, safety, or just social support.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 bg-[#121212] p-8 rounded-3xl border border-white/5">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Group Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Westlands Express Squad"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Mission / Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="What is the purpose of this group?"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 transition-all"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Group Rules</label>
                                <textarea
                                    rows={3}
                                    placeholder="Set expectations for behavior and coordination..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 transition-all font-mono text-sm"
                                    value={formData.rules}
                                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Member Capacity</label>
                                    <input
                                        type="number"
                                        min={2}
                                        max={500}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 transition-all"
                                        value={formData.memberCapacity}
                                        onChange={(e) => setFormData({ ...formData, memberCapacity: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="flex items-center gap-4 h-full pt-6">
                                    <input
                                        type="checkbox"
                                        id="isPrivate"
                                        className="w-5 h-5 rounded border-white/10 text-yellow-500 focus:ring-yellow-500 bg-black/50"
                                        checked={formData.isPrivate}
                                        onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                                    />
                                    <label htmlFor="isPrivate" className="text-gray-300 cursor-pointer select-none">Make this a Private Group</label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-4 rounded-2xl transition-all text-lg shadow-[0_0_20px_rgba(234,179,8,0.2)] disabled:opacity-50"
                        >
                            {loading ? 'Creating Group...' : 'Launch Community Group'}
                        </button>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
