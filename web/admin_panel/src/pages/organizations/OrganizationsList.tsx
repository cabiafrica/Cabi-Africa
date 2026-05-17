import React, { useEffect, useState } from 'react';
import { Building, Search, Plus, Shield, ShieldAlert, ArrowRight, Eye, RefreshCw, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService, Organization } from '../../services/adminService';

export default function OrganizationsList() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrganizations();
      setOrganizations(data);
    } catch (err) {
      console.error('Failed to load organizations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.registrationNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-white font-sans">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <Building className="w-8 h-8 text-brand-yellow" />
            Organizations & SACCOs
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Manage fleets, driver associations, distress responders, and feature flags.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadOrganizations}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-bold hover:text-brand-yellow hover:border-brand-yellow/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizations by name or reg number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-brand-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-yellow/50 transition-colors"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map(org => {
            const distressCount = org.distressResponders?.filter(r => r.isDistressResponder).length || 0;
            const isCompliant = distressCount >= 3;

            return (
              <div 
                key={org.id}
                onClick={() => navigate(`/organizations/${org.id}`)}
                className="group relative bg-white/5 border border-white/10 hover:border-brand-yellow/30 rounded-2xl p-6 cursor-pointer transition-all overflow-hidden"
              >
                {/* Background glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{org.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{org.registrationNumber || 'No Reg Number'}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                    org.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    org.status === 'UNVERIFIED' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {org.status || 'UNKNOWN'}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-300">
                    <Users className="w-4 h-4 mr-3 text-gray-500" />
                    <span>{org.memberCount || 0} Members</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    {isCompliant ? (
                      <Shield className="w-4 h-4 mr-3 text-green-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 mr-3 text-red-400" />
                    )}
                    <span className={isCompliant ? 'text-gray-300' : 'text-red-400 font-bold'}>
                      {distressCount} Distress Responders
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Star className="w-4 h-4 mr-3 text-brand-purple" />
                    <span>{(org.subgroups || []).length} Subgroups</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-sm font-bold text-gray-500 group-hover:text-brand-yellow transition-colors">
                    Manage Organization
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-brand-yellow transition-all group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}

          {filteredOrgs.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No organizations found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
