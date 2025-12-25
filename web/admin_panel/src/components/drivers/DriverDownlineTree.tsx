import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

interface TreeNodeProps {
    node: any;
    defaultExpanded?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, defaultExpanded }) => {
    const [expanded, setExpanded] = useState(defaultExpanded || false);

    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="ml-4 border-l pl-4 border-gray-200">
            <div className="flex items-center gap-2 py-1">
                {hasChildren ? (
                    <button onClick={() => setExpanded(!expanded)} className="text-gray-500 w-4 font-mono">
                        {expanded ? '-' : '+'}
                    </button>
                ) : <span className="w-4"></span>}

                <span className={`font-medium ${node.status === 'ACTIVE' ? 'text-gray-900' : 'text-gray-500'}`}>
                    {node.name}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">{node.id}</span>
                <span className={`text-xs px-1 rounded ${node.status === 'ACTIVE' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                    {node.status}
                </span>
                <span className="text-xs text-gray-400 ml-auto">L{node.level}</span>
            </div>

            {expanded && hasChildren && (
                <div>
                    {node.children.map((child: any) => (
                        <TreeNode key={child.id} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const DriverDownlineTree: React.FC<{ driverId: string }> = ({ driverId }) => {
    const [tree, setTree] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        adminService.getDriverDownline(driverId).then(data => {
            setTree(data);
            setLoading(false);
        });
    }, [driverId]);

    if (loading) return <div className="p-4 text-center">Loading downline structure...</div>;
    if (!tree) return <div className="p-4 text-center text-gray-500">No downline found.</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">Downline Hierarchy</h3>
            <div className="overflow-x-auto">
                <TreeNode node={tree} defaultExpanded={true} />
            </div>
        </div>
    );
};
