import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    Article,
    Help,
    Add,
    Edit,
    Delete,
    Description,
    QuestionAnswer,
    Search
} from '@mui/icons-material';

export const CMSManagement: React.FC = () => {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [pages, setPages] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'FAQ' | 'PAGE'>('FAQ');

    const [editingItem, setEditingItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            adminService.getCMSContent('FAQ'),
            adminService.getCMSContent('PAGE')
        ])
            .then(([fetchedFaqs, fetchedPages]) => {
                setFaqs(fetchedFaqs);
                setPages(fetchedPages);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem({});
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        // Mock save logic with immediate state update for responsiveness
        const id = editingItem.id || (activeTab === 'FAQ' ? `faq-${Date.now()}` : `page-${Date.now()}`);

        if (activeTab === 'FAQ') {
            const newItem = {
                id,
                question: editingItem.question,
                answer: editingItem.answer,
                type: 'FAQ'
            };
            if (editingItem.id) {
                setFaqs(faqs.map(f => f.id === newItem.id ? newItem : f));
            } else {
                setFaqs([...faqs, newItem]);
            }
        } else {
            const newItem = {
                id,
                title: editingItem.title,
                content: editingItem.content,
                type: 'PAGE'
            };
            if (editingItem.id) {
                setPages(pages.map(p => p.id === newItem.id ? newItem : p));
            } else {
                setPages([...pages, newItem]);
            }
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Article className="text-amber-600 dark:text-amber-400" />
                        CMS Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage static pages, FAQs, and app content.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Add fontSize="small" />
                    Add New {activeTab === 'FAQ' ? 'FAQ' : 'Page'}
                </button>
            </div>

            <div className="bg-white dark:bg-card-dark shadow-sm rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden min-h-[500px]">
                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-white/10">
                    <div className="flex px-6 pt-4 gap-6">
                        <button
                            onClick={() => { setActiveTab('FAQ'); setEditingItem(null); }}
                            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'FAQ' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                        >
                            <Help fontSize="small" />
                            FAQs
                        </button>
                        <button
                            onClick={() => { setActiveTab('PAGE'); setEditingItem(null); }}
                            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'PAGE' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                        >
                            <Description fontSize="small" />
                            Legal & Pages
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-slate-400">Loading content...</div>
                    ) : (
                        <div className="space-y-4">
                            {/* FAQ SEARCH */}
                            {activeTab === 'FAQ' && (
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
                                    <input
                                        type="text"
                                        placeholder="Search FAQs..."
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                            )}

                            {/* CONTENT LIST */}
                            {(activeTab === 'FAQ' ? faqs : pages).length === 0 ? (
                                <div className="text-center py-12 text-slate-400">No content found.</div>
                            ) : (
                                (activeTab === 'FAQ' ? faqs : pages).map((item: any) => (
                                    <div key={item.id} className="group relative bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-lg p-4 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {activeTab === 'FAQ' ? <QuestionAnswer fontSize="small" className="text-amber-500" /> : <Article fontSize="small" className="text-cyan-500" />}
                                                    <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                                                        {activeTab === 'FAQ' ? item.question : item.title}
                                                    </h3>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 pl-7">
                                                    {activeTab === 'FAQ' ? item.answer : item.content?.substring(0, 150) + (item.content?.length > 150 ? '...' : '')}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 bg-slate-50 dark:bg-slate-700 rounded-md">
                                                    <Edit fontSize="small" />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-700 rounded-md">
                                                    <Delete fontSize="small" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-card-dark p-6 rounded-xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                            {editingItem.id ? <Edit fontSize="small" /> : <Add fontSize="small" />}
                            {editingItem.id ? 'Edit' : 'Add New'} {activeTab === 'FAQ' ? 'FAQ' : 'Page'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-5">
                            {activeTab === 'FAQ' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Question</label>
                                        <input
                                            value={editingItem.question || ''}
                                            onChange={e => setEditingItem({ ...editingItem, question: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" required
                                            placeholder="e.g., How do I reset my password?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Answer</label>
                                        <textarea
                                            value={editingItem.answer || ''}
                                            onChange={e => setEditingItem({ ...editingItem, answer: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none h-32 resize-none" required
                                            placeholder="Enter the answer..."
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Page Title</label>
                                        <input
                                            value={editingItem.title || ''}
                                            onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Content (HTML allowed)</label>
                                        <textarea
                                            value={editingItem.content || ''}
                                            onChange={e => setEditingItem({ ...editingItem, content: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none h-64 font-mono text-sm" required
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors shadow-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
