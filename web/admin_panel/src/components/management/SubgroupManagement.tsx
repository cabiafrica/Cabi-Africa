import React, { useState, useEffect, useCallback } from 'react';
import { adminService, Subgroup, PlatformUser } from '../../services/adminService';

interface Props {
    orgId: string;
    onBack: () => void;
}

interface TreeNode {
    item: Subgroup;
    children: TreeNode[];
}

export const SubgroupManagement: React.FC<Props> = ({ orgId, onBack }) => {
    const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingNode, setEditingNode] = useState<Subgroup | null>(null); // For edit/create
    const [isCreating, setIsCreating] = useState(false);
    const [parentIdForCreate, setParentIdForCreate] = useState<string | null>(null);

    // Member management
    const [selectedForMembers, setSelectedForMembers] = useState<Subgroup | null>(null);
    const [members, setMembers] = useState<PlatformUser[]>([]);
    const [memberLoading, setMemberLoading] = useState(false);

    const fetchSubgroups = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getSubgroups(orgId);
            setSubgroups(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchSubgroups();
    }, [fetchSubgroups]);

    const buildTree = (items: Subgroup[]): TreeNode[] => {
        const idMapping = items.reduce((acc, el, i) => {
            acc[el.id] = i;
            return acc;
        }, {} as Record<string, number>);

        const root: TreeNode[] = [];
        const itemMap: TreeNode[] = items.map(item => ({ item, children: [] }));

        items.forEach(item => {
            if (item.parentId === null) {
                root.push(itemMap[idMapping[item.id]]);
            } else {
                const parentEl = itemMap[idMapping[item.parentId]];
                if (parentEl) {
                    parentEl.children.push(itemMap[idMapping[item.id]]);
                } else {
                    // Orphaned or parent not in list, treat as root for safety
                    root.push(itemMap[idMapping[item.id]]);
                }
            }
        });
        return root;
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this subgroup?')) {
            await adminService.deleteSubgroup(id);
            fetchSubgroups();
        }
    };

    const handleSave = async (name: string) => {
        if (isCreating) {
            await adminService.createSubgroup(orgId, name, parentIdForCreate || undefined);
        } else if (editingNode) {
            await adminService.updateSubgroup(editingNode.id, { name });
        }
        setEditingNode(null);
        setIsCreating(false);
        fetchSubgroups();
    };

    const openMembers = async (group: Subgroup) => {
        setSelectedForMembers(group);
        setMemberLoading(true);
        const data = await adminService.getSubgroupMembers(group.id);
        setMembers(data);
        setMemberLoading(false);
    };

    const handleAddMember = async () => {
        const userId = prompt("Enter User ID to add:");
        if (userId && selectedForMembers) {
            await adminService.addMemberToSubgroup(selectedForMembers.id, userId);
            openMembers(selectedForMembers); // Refresh
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (selectedForMembers && confirm('Remove this user?')) {
            await adminService.removeMemberFromSubgroup(selectedForMembers.id, userId);
            openMembers(selectedForMembers); // Refresh
        }
    };

    const handleToggleResponder = async (userId: string, currentStatus: boolean) => {
        if (selectedForMembers) {
            try {
                // We assume there's a new API method for this
                await adminService.updateDistressResponder(selectedForMembers.orgId, userId, !currentStatus);
                // Refresh members locally or fetch
                setMembers(prev => prev.map(m => m.id === userId ? { ...m, isDistressResponder: !currentStatus } : m));
            } catch (err) {
                console.error("Failed to update responder status", err);
                alert("Failed to update distress responder status.");
            }
        }
    };

    const renderTree = (nodes: TreeNode[]) => {
        return (
            <ul className="pl-4 border-l border-gray-200">
                {nodes.map(node => (
                    <li key={node.item.id} className="mt-2">
                        <div className="flex items-center justify-between bg-white p-2 rounded shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{node.item.name}</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{node.item.memberCount} members</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openMembers(node.item)} className="text-xs text-blue-600 hover:text-blue-800">Members</button>
                                <button onClick={() => { setIsCreating(true); setParentIdForCreate(node.item.id); setEditingNode(null); }} className="text-xs text-green-600 hover:text-green-800">+ Subgroup</button>
                                <button onClick={() => { setEditingNode(node.item); setIsCreating(false); }} className="text-xs text-orange-600 hover:text-orange-800">Edit</button>
                                <button onClick={() => handleDelete(node.item.id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                            </div>
                        </div>
                        {node.children.length > 0 && renderTree(node.children)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="text-blue-600 hover:text-blue-800 flex items-center font-medium">&larr; Back to Orgs</button>
                <h2 className="text-xl font-bold text-gray-800">Subgroup Management</h2>
                <button
                    onClick={() => { setIsCreating(true); setParentIdForCreate(null); setEditingNode(null); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                    Create Root Subgroup
                </button>
            </div>

            {loading ? <div>Loading...</div> : (
                <div className="space-y-4">
                    {renderTree(buildTree(subgroups))}
                </div>
            )}

            {/* Simple Modal for Name Edit/Create */}
            {(editingNode || isCreating) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">{isCreating ? 'Create Subgroup' : 'Edit Subgroup'}</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleSave(formData.get('name') as string);
                        }}>
                            <input
                                name="name"
                                defaultValue={editingNode?.name || ''}
                                placeholder="Subgroup Name"
                                className="w-full border p-2 rounded mb-4"
                                autoFocus
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => { setEditingNode(null); setIsCreating(false); }} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Members View Modal */}
            {selectedForMembers && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Members of {selectedForMembers.name}</h3>
                            <button onClick={() => setSelectedForMembers(null)} className="text-gray-500 hover:text-gray-700">&times;</button>
                        </div>
                        <div className="mb-4">
                            <button onClick={handleAddMember} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">+ Add Member</button>
                        </div>
                        {memberLoading ? <div>Loading members...</div> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="text-center text-xs font-medium text-gray-500 uppercase">Distress Responder</th>
                                        <th className="text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {members.length === 0 ? <tr><td colSpan={4} className="py-4 text-center text-gray-500">No members found.</td></tr> : members.map(m => (
                                        <tr key={m.id}>
                                            <td className="py-2 text-sm">{m.name}</td>
                                            <td className="py-2 text-sm text-gray-500">{m.email}</td>
                                            <td className="py-2 text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer"
                                                        checked={!!m.isDistressResponder}
                                                        onChange={() => handleToggleResponder(m.id, !!m.isDistressResponder)}
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                                </label>
                                            </td>
                                            <td className="py-2 text-right">
                                                <button onClick={() => handleRemoveMember(m.id)} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
