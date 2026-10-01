import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const PlanGate = ({ children, moduleName, moduleId, requiredTier = 'Pro / Growth' }) => {
  const { user, activeWorkspace, setIsSettingsModalOpen, setActiveSettingsTab, setActiveModule } = useWorkspace();
  const planNorm = (user?.plan || activeWorkspace?.subscriptionTier || 'agency_pro').toLowerCase();

  const isStarter = planNorm === 'starter' || planNorm === 'free';
  const isBase = planNorm === 'base';
  
  // Modules locked for Starter tier: campaigns
  const isLockedForStarter = isStarter && ['campaigns'].includes(moduleId);
  
  const isHighestPlan = planNorm === 'enterprise' || planNorm === 'unlimited';
  // Approvals and Website Builder are locked for ALL plans EXCEPT the highest
  const isLockedForAll = !isHighestPlan && ['approvals', 'websiteBuilder', 'websitebuilder', 'builder'].includes(moduleId);

  const isLocked = isLockedForStarter || isLockedForAll;

  if (!isLocked) {
    return children;
  }

  const handleOpenBilling = () => {
    setActiveModule('settings');
    if (setActiveSettingsTab) setActiveSettingsTab('billing');
    setIsSettingsModalOpen(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-[#0c111d] to-slate-950 border border-brand-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 mb-4 shadow-lg shadow-brand-500/20">
            <Lock className="w-8 h-8 text-brand-400" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full border border-brand-500/40 shadow-xs mb-2">
            Subscription Tier Locked
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {moduleName || 'This Feature'} is Locked on Starter Plan
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mt-2 leading-relaxed">
            {moduleName} requires the <span className="text-brand-400 font-bold">{requiredTier}</span> subscription plan or higher. Upgrade now to unlock full access and scale your marketing.
          </p>
        </div>

        {/* Feature Highlights included in Pro/Growth */}
        <div className="relative z-10 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-left space-y-2.5 max-w-lg mx-auto">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Included when you upgrade to {requiredTier}:
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Access to {moduleName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>450 Monthly Visual Credits (3x more than Starter)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3,000 Text Generations & 10 Brand Workspaces</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleOpenBilling}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Upgrade to {requiredTier}
          </button>
          
          <button
            onClick={handleOpenBilling}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Explore All Subscription Tiers <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
