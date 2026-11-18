import React, { useEffect, useState } from 'react';
import { Building, Shield, ShieldAlert, Star, Users, ArrowLeft, Mail, Phone, Calendar, RefreshCw, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, Organization, Subgroup, OrgMember } from '../../services/adminService';

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
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in text-white font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/organizations')}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-white tracking-tighter">{org.name}</h2>
              <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                org.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                org.status === 'UNVERIFIED' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {org.status}
              </span>
            </div>
            <p className="text-gray-400 mt-1 font-mono text-sm">{org.registrationNumber || 'No Reg Number'}</p>
          </div>
        </div>
        
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'OVERVIEW' ? 'bg-brand-yellow text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Overview & Distress
          </button>
          <button
            onClick={() => setActiveTab('SUBGROUPS')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SUBGROUPS' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Subgroups
          </button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Info */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Organization Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{org.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{org.memberCount || 0} Total Members</span>
                </div>
                {org.founderName && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Star className="w-4 h-4 text-brand-yellow" />
                    <span className="text-sm">Founder: {org.founderName}</span>
                  </div>
                )}
                {org.createdAt && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Registered: {new Date(org.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Distress Responders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-yellow" />
                    Distress Response Team
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Designated members who receive instant SOS alerts.</p>
                </div>
                {isCompliant ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Compliant
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    Needs Attention ({distressResponders.length}/3)
                  </div>
                )}
              </div>

              {!isCompliant && (
                <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <strong>Warning:</strong> This organization has fewer than the required 3 distress responders. They must assign more delegates from the User Portal to ensure driver safety compliance.
                </div>
              )}

              {distressResponders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-brand-black/50 rounded-xl border border-white/5">
                  No distress responders have been assigned yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {distressResponders.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-brand-black/50 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 flex items-center justify-center text-brand-yellow font-bold">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{r.name}</p>
                          <p className="text-xs text-gray-400">{r.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Phone className="w-4 h-4" />
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
          <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div>
              <h3 className="text-xl font-bold text-white">Organization Subgroups</h3>
              <p className="text-sm text-gray-400 mt-1">Manage nested branches or functional groups (e.g. Welfare, Investment).</p>
            </div>
            <button
              onClick={() => setShowSubgroupModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Subgroup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(org.subgroups || []).map(sg => (
              <div key={sg.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{sg.name}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-1">{sg.registrationNumber}</p>
                  </div>
                  <button className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">Features</span>
                    <div className="flex flex-wrap gap-2">
                      {sg.features && sg.features.length > 0 ? sg.features.map(f => (
                        <span key={f} className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded uppercase tracking-wider">
                          {f}
                        </span>
                      )) : (
                        <span className="text-sm text-gray-500 italic">No special features</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                    <span className="text-gray-400">{sg.memberCount || 0} Members</span>
                    <button className="text-brand-yellow hover:underline">View Members</button>
                  </div>
                </div>
              </div>
            ))}
            
            {(org.subgroups || []).length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                <p>No subgroups configured yet.</p>
                <button onClick={() => setShowSubgroupModal(true)} className="text-amber-400 hover:underline mt-2">
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
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-4">Create New Subgroup</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Subgroup Name</label>
                <input
                  type="text"
                  placeholder="e.g. Welfare Committee"
                  value={newSubgroup.name}
                  onChange={e => setNewSubgroup({ ...newSubgroup, name: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Features (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. WELFARE, INVESTMENT"
                  value={newSubgroup.features}
                  onChange={e => setNewSubgroup({ ...newSubgroup, features: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowSubgroupModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubgroup}
                disabled={!newSubgroup.name}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
