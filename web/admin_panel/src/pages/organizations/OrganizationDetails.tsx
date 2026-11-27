import React, { useEffect, useState } from 'react';
import { Building, Shield, ShieldAlert, Star, Users, ArrowLeft, Mail, Phone, Calendar, RefreshCw, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, Organization, Subgroup, OrgMember } from '../../services/adminService';
import { PageHeader } from '../../components/common/PageHeader';

export default function OrganizationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SUBGROUPS'>('OVERVIEW');

  // Subgroup Management State
  const [showSubgroupModal, setShowSubgroupModal] = useState(false);
  const [newSubgroup, setNewSubgroup] = useState({ name: '', features: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      // In a real app, you might have `getOrganizationDetails(id)`
      // Here we assume getOrganizations returns all and we find it, or we have a specific endpoint.
      // For this implementation, we will use getOrganizations and find.
      const orgs = await adminService.getOrganizations();
      const found = orgs.find(o => o.id === id);
      if (found) {
        setOrg(found);
      }
    } catch (err) {
      console.error('Failed to load org details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateSubgroup = async () => {
    if (!id || !newSubgroup.name) return;
    try {
      const featuresArray = newSubgroup.features.split(',').map(f => f.trim()).filter(Boolean);
      await adminService.createSubgroup(id, newSubgroup.name, featuresArray);
      setShowSubgroupModal(false);
      setNewSubgroup({ name: '', features: '' });
      loadData();
    } catch (err) {
      console.error('Failed to create subgroup', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8 text-center text-gray-400">
        Organization not found.
        <br />
        <button onClick={() => navigate('/organizations')} className="text-brand-yellow hover:underline mt-4">
          Back to list
        </button>
      </div>
    );
  }

  const distressResponders = org.distressResponders?.filter(r => r.isDistressResponder) || [];
  const isCompliant = distressResponders.length >= 3;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in text-white font-sans">
      
      {/* Header */}
      <PageHeader
        category="Fleet & People"
        title={org.name}
        subtitle={org.registrationNumber ? `Registration: ${org.registrationNumber}` : 'Fleet Partner & Organization Details'}
        icon={<Building className="w-5 h-5 text-amber-500" />}
        action={
          <button 
            onClick={() => navigate('/organizations')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-400" />
            Back to Organizations
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm shadow-amber-500/20 font-bold border-amber-500 rounded-[3px] px-3.5 py-1.5 text-xs'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-[3px] px-3.5 py-1.5 text-xs font-semibold'
          }`}
        >
          Overview & Distress
        </button>
        <button
          onClick={() => setActiveTab('SUBGROUPS')}
          className={`flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'SUBGROUPS'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm shadow-amber-500/20 font-bold border-amber-500 rounded-[3px] px-3.5 py-1.5 text-xs'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-[3px] px-3.5 py-1.5 text-xs font-semibold'
          }`}
        >
          Subgroups
        </button>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Info */}
          <div className="space-y-6">
            <div className="bg-[#131722] border border-white/10 rounded-[3px] p-5">
              <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Organization Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-xs">{org.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-300">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-xs">{org.memberCount || 0} Total Members</span>
                </div>
                {org.founderName && (
                  <div className="flex items-center gap-2.5 text-gray-300">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-xs">Founder: {org.founderName}</span>
                  </div>
                )}
                {org.createdAt && (
                  <div className="flex items-center gap-2.5 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs">Registered: {new Date(org.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Distress Responders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#131722] border border-white/10 rounded-[3px] p-5">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    Distress Response Team
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Designated members who receive instant SOS alerts.</p>
                </div>
                {isCompliant ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-[3px] text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Compliant
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-[3px] text-xs font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Needs Attention ({distressResponders.length}/3)
                  </div>
                )}
              </div>

              {!isCompliant && (
                <div className="p-3 mb-5 bg-red-500/10 border border-red-500/30 rounded-[3px] text-red-400 text-xs">
                  <strong>Warning:</strong> This organization has fewer than the required 3 distress responders. They must assign more delegates from the User Portal to ensure driver safety compliance.
                </div>
              )}

              {distressResponders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-[#0a0a0a] rounded-[3px] border border-white/5 text-xs">
                  No distress responders have been assigned yet.
                </div>
              ) : (
                <div className="grid gap-3">
                  {distressResponders.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3.5 bg-[#0a0a0a] rounded-[3px] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-xs">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{r.name}</p>
                          <p className="text-[11px] text-gray-400">{r.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Phone className="w-3.5 h-3.5" />
                        {r.contact}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SUBGROUPS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#131722] border border-white/10 p-5 rounded-[3px]">
            <div>
              <h3 className="text-sm font-bold text-white">Organization Subgroups</h3>
              <p className="text-xs text-gray-400 mt-1">Manage nested branches or functional groups (e.g. Welfare, Investment).</p>
            </div>
            <button
              onClick={() => setShowSubgroupModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subgroup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(org.subgroups || []).map(sg => (
              <div key={sg.id} className="bg-[#131722] border border-white/10 rounded-[3px] p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">{sg.name}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-1">{sg.registrationNumber}</p>
                  </div>
                  <button className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Features</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sg.features && sg.features.length > 0 ? sg.features.map(f => (
                        <span key={f} className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-[3px] uppercase tracking-wider">
                          {f}
                        </span>
                      )) : (
                        <span className="text-xs text-gray-500 italic">No special features</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                    <span className="text-gray-400">{sg.memberCount || 0} Members</span>
                    <button className="text-amber-500 hover:underline font-semibold">View Members</button>
                  </div>
                </div>
              </div>
            ))}
            
            {(org.subgroups || []).length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-[#131722] rounded-[3px] border border-white/10 border-dashed text-xs">
                <p>No subgroups configured yet.</p>
                <button onClick={() => setShowSubgroupModal(true)} className="text-amber-400 hover:underline mt-2 font-semibold">
                  Create the first subgroup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Subgroup Modal */}
      {showSubgroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#131722] border border-white/10 rounded-[3px] w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-base font-bold text-white mb-4">Create New Subgroup</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Subgroup Name</label>
                <input
                  type="text"
                  placeholder="e.g. Welfare Committee"
                  value={newSubgroup.name}
                  onChange={e => setNewSubgroup({ ...newSubgroup, name: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-[3px] py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Features (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. WELFARE, INVESTMENT"
                  value={newSubgroup.features}
                  onChange={e => setNewSubgroup({ ...newSubgroup, features: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-[3px] py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => setShowSubgroupModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubgroup}
                disabled={!newSubgroup.name}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Subgroup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
