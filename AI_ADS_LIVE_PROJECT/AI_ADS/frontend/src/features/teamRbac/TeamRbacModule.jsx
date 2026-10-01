import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Users, UserPlus, ShieldCheck, Check, X, Mail, Plus } from 'lucide-react';

export const TeamRbacModule = () => {
  const {activeWorkspace, activeRole, setActiveRole, t } = useWorkspace();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState([
    { id: 1, name: 'Ritik Director', email: 'ritik@agency.com', role: 'AgencyAdmin', status: 'Active' },
    { id: 2, name: 'Sarah SEO Lead', email: 'sarah@agency.com', role: 'SEOSpecialist', status: 'Active' },
    { id: 3, name: 'Alex Copywriter', email: 'alex@agency.com', role: 'Writer', status: 'Active' },
    { id: 4, name: 'Client Marketing VP', email: 'vp@clientbrand.com', role: 'ClientReviewer', status: 'Active' }
  ]);

  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Writer' });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteForm.email) return;
    const newMember = {
      id: Date.now(),
      name: inviteForm.name || inviteForm.email.split('@')[0],
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'Active',
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteForm({ name: '', email: '', role: 'Writer' });
    setShowInviteModal(false);
  };

  const rbacMatrix = [
    { action: 'Manage Billing & Credits', admin: true, strategist: false, compliance: false, client: false },
    { action: 'Edit Brand DNA Memory', admin: true, strategist: true, compliance: false, client: false },
    { action: 'Create & Draft Content', admin: true, strategist: true, compliance: false, client: false },
    { action: 'Fact & Claim Review', admin: true, strategist: true, compliance: true, client: false },
    { action: 'Approve Final Assets', admin: true, strategist: true, compliance: true, client: true },
    { action: 'Manage Team Access', admin: true, strategist: false, compliance: false, client: false }
  ];

  return (
    <div className="space-y-6 animate-in fade-in w-full max-w-[1600px] mx-auto p-6">
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="jane@company.com"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role Assignment</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="AgencyAdmin">Agency Admin</option>
                  <option value="SEOSpecialist">SEO Specialist</option>
                  <option value="Writer">Senior Writer</option>
                  <option value="Compliance">Compliance Officer</option>
                  <option value="ClientReviewer">Client Reviewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Team Management & RBAC Permissions Matrix</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Multi-tenant member access & role governance for <strong className="text-slate-900 dark:text-white">{activeWorkspace?.brandName || 'your brand'}</strong>.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100"
          >
            <option value="AgencyAdmin">Role View: Agency Admin</option>
            <option value="Strategist">Role View: Brand Strategist</option>
            <option value="Writer">Role View: Senior Copywriter</option>
            <option value="Compliance">Role View: Compliance Officer</option>
            <option value="ClientReviewer">Role View: Client Portal User</option>
          </select>

          <button onClick={() => setShowInviteModal(true)} className="btn-primary text-xs flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Active Workspace Members ({members.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Name</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Assigned Role</th>
                <th className="pb-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{m.name}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">{m.email}</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Matrix Table */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Canonical Role-Based Access Control (RBAC) Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Action / Module</th>
                <th className="pb-3 px-3 text-center">Agency Admin</th>
                <th className="pb-3 px-3 text-center">Strategist / Writer</th>
                <th className="pb-3 px-3 text-center">Compliance Lead</th>
                <th className="pb-3 px-3 text-center">Client Portal User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {rbacMatrix.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 font-semibold text-slate-600 dark:text-slate-300">{row.action}</td>
                  <td className="py-3 px-3 text-center">{row.admin ? <Check className="w-4 h-4 mx-auto text-emerald-600" /> : <X className="w-4 h-4 mx-auto text-slate-400" />}</td>
                  <td className="py-3 px-3 text-center">{row.strategist ? <Check className="w-4 h-4 mx-auto text-emerald-600" /> : <X className="w-4 h-4 mx-auto text-slate-400" />}</td>
                  <td className="py-3 px-3 text-center">{row.compliance ? <Check className="w-4 h-4 mx-auto text-emerald-600" /> : <X className="w-4 h-4 mx-auto text-slate-400" />}</td>
                  <td className="py-3 px-3 text-center">{row.client ? <span className="text-[10px] text-amber-600 font-bold">Restricted</span> : <X className="w-4 h-4 mx-auto text-slate-400" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
