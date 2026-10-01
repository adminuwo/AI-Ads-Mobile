import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Users, UserPlus, ShieldCheck, Check, X, Eye } from 'lucide-react';

export const TeamRbacModule = () => {
  const { activeWorkspace, activeRole, setActiveRole } = useWorkspace();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const teamMembers = [
    { id: 1, name: 'Ritik Director', email: 'ritik@agency.com', role: 'AgencyAdmin', status: 'Active' },
    { id: 2, name: 'Sarah SEO Lead', email: 'sarah@agency.com', role: 'SEOSpecialist', status: 'Active' },
    { id: 3, name: 'Alex Copywriter', email: 'alex@agency.com', role: 'Writer', status: 'Active' },
    { id: 4, name: 'Client Marketing VP', email: 'vp@clientbrand.com', role: 'ClientReviewer', status: 'Active' }
  ];

  const rbacMatrix = [
    { action: 'Manage Billing & Credits', admin: true, strategist: false, compliance: false, client: false },
    { action: 'Edit Brand DNA Memory', admin: true, strategist: true, compliance: false, client: false },
    { action: 'Create & Draft Content', admin: true, strategist: true, compliance: false, client: false },
    { action: 'Fact & Claim Review', admin: true, strategist: true, compliance: true, client: false },
    { action: 'Approve Final Assets', admin: true, strategist: true, compliance: true, client: true },
    { action: 'Manage Team Access', admin: true, strategist: false, compliance: false, client: false }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" />
            <h1 className="text-xl font-extrabold text-white">Team Management & RBAC Permissions Matrix</h1>
          </div>
          <p className="text-xs text-slate-400">
            Multi-tenant member access & role governance for <strong className="text-white">{activeWorkspace.brandName}</strong>.
          </p>
        </div>

        <div className="flex gap-2">
          <select 
            value={activeRole} 
            onChange={(e) => setActiveRole(e.target.value)}
            className="glass-input text-xs py-2"
          >
            <option value="AgencyAdmin">Role View: Agency Admin</option>
            <option value="Strategist">Role View: Brand Strategist</option>
            <option value="Writer">Role View: Senior Copywriter</option>
            <option value="Compliance">Role View: Compliance Officer</option>
            <option value="ClientReviewer">Role View: Client Portal User</option>
          </select>

          <button onClick={() => setShowInviteModal(true)} className="btn-primary text-xs">
            <UserPlus className="w-4 h-4" /> Invite Team Member
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Workspace Members</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Name</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Assigned Role</th>
                <th className="pb-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {teamMembers.map(m => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{m.name}</td>
                  <td className="py-3 px-3 text-slate-300">{m.email}</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Matrix Table */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Canonical Role-Based Access Control (RBAC) Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Action / Module</th>
                <th className="pb-3 px-3 text-center">Agency Admin</th>
                <th className="pb-3 px-3 text-center">Strategist / Writer</th>
                <th className="pb-3 px-3 text-center">Compliance Lead</th>
                <th className="pb-3 px-3 text-center">Client Portal User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {rbacMatrix.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 font-semibold text-slate-300">{row.action}</td>
                  <td className="py-3 px-3 text-center">{row.admin ? <Check className="w-4 h-4 mx-auto text-emerald-400" /> : <X className="w-4 h-4 mx-auto text-slate-600" />}</td>
                  <td className="py-3 px-3 text-center">{row.strategist ? <Check className="w-4 h-4 mx-auto text-emerald-400" /> : <X className="w-4 h-4 mx-auto text-slate-600" />}</td>
                  <td className="py-3 px-3 text-center">{row.compliance ? <Check className="w-4 h-4 mx-auto text-emerald-400" /> : <X className="w-4 h-4 mx-auto text-slate-600" />}</td>
                  <td className="py-3 px-3 text-center">{row.client ? <span className="text-[10px] text-amber-400 font-bold">Restricted</span> : <X className="w-4 h-4 mx-auto text-slate-600" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
