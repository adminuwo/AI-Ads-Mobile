import React from 'react';
import { ShieldCheck, CheckSquare, Users, Lock, ShieldAlert } from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const Governance = () => {
  const { setActiveModule } = useWorkspace();

  const pillars = [
    {
      title: 'Approvals Desk Review Queue',
      desc: 'Human-in-the-loop review queue for digital agencies and clients to inspect, edit, or approve generated post captions and visual assets before publishing.',
      icon: CheckSquare,
      color: 'text-indigo-400'
    },
    {
      title: 'Automated Brand Claim Verification',
      desc: 'Built-in verification engine checks AI-generated text against locked Brand DNA memory to prevent unverified claims or false promises.',
      icon: ShieldAlert,
      color: 'text-amber-400'
    },
    {
      title: '4 Granular RBAC Roles',
      desc: 'Super Admin, Agency Admin, Content Creator/Editor, and Client Viewer permissions ensure team members only access what they need.',
      icon: Users,
      color: 'text-purple-400'
    },
    {
      title: 'Cryptographically Isolated Workspaces',
      desc: 'Multi-tenant brand data architecture guarantees complete data isolation between different client brand accounts.',
      icon: Lock,
      color: 'text-emerald-400'
    }
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 text-xs font-extrabold text-emerald-800 dark:text-emerald-400 shadow-sm">
            <span>ENTERPRISE GOVERNANCE & BRAND SAFETY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white leading-tight">
            Built for agencies. Safe for brands.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Maintain strict control over brand reputation with built-in human-in-the-loop gates and multi-tenant security.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((p, idx) => {
            const IconComp = p.icon;
            return (
              <div 
                key={idx}
                className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-8 space-y-4 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all shadow-lg flex items-start gap-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                  <IconComp className={`w-6 h-6 ${p.color}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
