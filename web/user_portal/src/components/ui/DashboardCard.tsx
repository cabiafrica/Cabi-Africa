import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: string; // Tailwind color class e.g. 'bg-yellow-500'
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color = 'bg-yellow-600' }) => {
    return (
        <div className={`rounded-xl shadow-lg p-6 flex items-center space-x-4 ${color} text-black`}>
            {icon && <div className="text-3xl">{icon}</div>}
            <div>
                <div className="text-sm font-medium uppercase opacity-75">{title}</div>
                <div className="text-2xl font-bold">{value}</div>
            </div>
        </div>
    );
};
