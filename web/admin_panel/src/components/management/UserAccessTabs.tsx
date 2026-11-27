import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCog, ShieldCheck } from 'lucide-react';

interface Props {
  activeTab: 'platform-users' | 'users' | 'roles';
}

export const UserAccessTabs: React.FC<Props> = ({ activeTab }) => {
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'platform-users',
      label: 'All Platform Users',
      description: 'Riders & Drivers',
      path: '/platform-users',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'users',
      label: 'Admin Users & Staff',
      description: 'Internal Team & Operators',
      path: '/users',
      icon: <UserCog className="w-4 h-4" />
    },
    {
      id: 'roles',
      label: 'Roles & Permissions',
      description: 'Security & Access Matrices',
      path: '/roles',
      icon: <ShieldCheck className="w-4 h-4" />
    }
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 mb-6 pb-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className={isActive ? 'text-amber-500' : 'text-slate-500'}>
              {tab.icon}
            </span>
            <div className="text-left">
              <span className="block font-bold">{tab.label}</span>
              <span className="block text-[10px] opacity-70 font-normal">{tab.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
