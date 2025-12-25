import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export const CMSManagement: React.FC = () => {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [pages, setPages] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'FAQ' | 'PAGE'>('FAQ');

    const [editingItem, setEditingItem] = useState<any>(null); // For handling Add/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        adminService.getCMSContent('FAQ').then(setFaqs);
        adminService.getCMSContent('PAGE').then(setPages);
    }, []);

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem({}); // Empty means new
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        // Mock save logic
        if (activeTab === 'FAQ') {
            const newItem = {
                id: editingItem.id || `faq-${Date.now()}`,
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
                id: editingItem.id || `page-${Date.now()}`,
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
        <div className="bg-white shadow rounded-lg p-6 relative">
            <h2 className="text-xl font-bold mb-4">Content Management System</h2>

            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => { setActiveTab('FAQ'); setEditingItem(null); }} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'FAQ' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>FAQs</button>
                    <button onClick={() => { setActiveTab('PAGE'); setEditingItem(null); }} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'PAGE' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Pages</button>
                </nav>
            </div>

            {activeTab === 'FAQ' ? (
                <div>
                    {faqs.map((faq: any) => (
                        <div key={faq.id} className="mb-4 p-4 border rounded hover:bg-gray-50 group relative">
                            <div className="font-bold">{faq.question}</div>
                            <div className="text-gray-600">{faq.answer}</div>
                            <button onClick={() => handleEdit(faq)} className="absolute top-2 right-2 text-blue-600 opacity-0 group-hover:opacity-100">Edit</button>
                        </div>
                    ))}
                    <button onClick={handleAdd} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Add New FAQ</button>
                </div>
            ) : (
                <div>
                    {pages.map((p: any) => (
                        <div key={p.id} className="mb-4 p-4 border rounded flex justify-between items-center hover:bg-gray-50">
                            <span className="font-medium">{p.title}</span>
                            <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                        </div>
                    ))}
                    <button onClick={handleAdd} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Add New Page</button>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">{editingItem.id ? 'Edit' : 'Add'} {activeTab}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            {activeTab === 'FAQ' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium">Question</label>
                                        <input
                                            value={editingItem.question || ''}
                                            onChange={e => setEditingItem({ ...editingItem, question: e.target.value })}
                                            className="w-full border rounded p-2" required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Answer</label>
                                        <textarea
                                            value={editingItem.answer || ''}
                                            onChange={e => setEditingItem({ ...editingItem, answer: e.target.value })}
                                            className="w-full border rounded p-2 h-32" required
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium">Page Title</label>
                                        <input
                                            value={editingItem.title || ''}
                                            onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                            className="w-full border rounded p-2" required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Content (HTML allowed)</label>
                                        <textarea
                                            value={editingItem.content || ''}
                                            onChange={e => setEditingItem({ ...editingItem, content: e.target.value })}
                                            className="w-full border rounded p-2 h-48 font-mono text-sm" required
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
