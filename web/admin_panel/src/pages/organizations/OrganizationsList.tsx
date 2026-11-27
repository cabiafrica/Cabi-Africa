import React, { useEffect, useState } from 'react';
import { Building, Search, Plus, Shield, ShieldAlert, ArrowRight, Eye, RefreshCw, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService, Organization } from '../../services/adminService';
import { PageHeader } from '../../components/common/PageHeader';

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
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in text-white font-sans">
      <PageHeader
        category="Fleet & People"
        title="Partner Organizations & Fleets"
        subtitle="Manage fleets, driver associations, distress responders, and feature flags"
        icon={<Building className="w-5 h-5 text-amber-500" />}
        action={
          <button
            onClick={loadOrganizations}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizations by name or reg number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-[3px] py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
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
                className="group relative bg-[#131722] border border-white/10 hover:border-amber-500/30 rounded-[3px] p-5 cursor-pointer transition-all overflow-hidden"
              >
                {/* Background glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{org.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{org.registrationNumber || 'No Reg Number'}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-[3px] uppercase tracking-wider ${
                    org.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    org.status === 'UNVERIFIED' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {org.status || 'UNKNOWN'}
                  </span>
                </div>

                <div className="space-y-2.5 mb-5">
                  <div className="flex items-center text-xs text-gray-300">
                    <Users className="w-3.5 h-3.5 mr-2.5 text-gray-500" />
                    <span>{org.memberCount || 0} Members</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-300">
                    {isCompliant ? (
                      <Shield className="w-3.5 h-3.5 mr-2.5 text-green-400" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 mr-2.5 text-red-400" />
                    )}
                    <span className={isCompliant ? 'text-gray-300' : 'text-red-400 font-bold'}>
                      {distressCount} Distress Responders
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-300">
                    <Star className="w-3.5 h-3.5 mr-2.5 text-amber-500" />
                    <span>{(org.subgroups || []).length} Subgroups</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-amber-400 transition-colors">
                    Manage Organization
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-all group-hover:translate-x-1" />
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
