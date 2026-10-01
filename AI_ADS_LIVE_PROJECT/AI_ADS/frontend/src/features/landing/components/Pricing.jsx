import React, { useState } from 'react';
import { Check, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const Pricing = () => {
  const { setActiveModule } = useWorkspace();
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'

  const handleSelectPlan = () => {
    setActiveModule('login');
  };

  return (
    <section id="pricing" className="py-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/60 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 text-xs font-extrabold text-amber-800 dark:text-amber-400 shadow-sm">
            <span>TRANSPARENT INR (₹) PRICING & PLANS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white leading-tight">
            Simple Billing. Zero Hidden Fees.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            All plans billed transparently in Indian Rupees (₹). Unused credits roll over automatically.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billed
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Yearly Billed</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: Starter Suite */}
          <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-8 flex flex-col justify-between space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xl">
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Starter Suite</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white">
                  ₹{billingCycle === 'yearly' ? '639' : '799'}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ideal for individual brand creators and solopreneurs scaling initial social media channels.
              </p>
              <hr className="border-slate-200 dark:border-slate-800" />
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 50 Visual AI Credits / mo</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 1 Brand DNA Workspace</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 30-Day Campaign Strategy</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Standard Resolution Ad Visuals</li>
              </ul>
            </div>
            <button
              onClick={handleSelectPlan}
              className="w-full py-3.5 rounded-xl font-extrabold text-xs text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Card 2: Growth Agency (Highlighted - Most Popular) */}
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-amber-500 via-purple-500 to-indigo-500 shadow-2xl shadow-indigo-500/10">
            <div className="rounded-[22px] bg-white dark:bg-slate-950 p-8 h-full flex flex-col justify-between space-y-6 text-slate-900 dark:text-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Growth Agency</span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-black border border-amber-300 dark:border-amber-500/40">
                    MOST POPULAR
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white">
                    ₹{billingCycle === 'yearly' ? '1,999' : '2,499'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Built for fast-growing digital marketing agencies managing multiple client brands.
                </p>
                <hr className="border-slate-200 dark:border-slate-800" />
                <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 250 Visual AI Credits / mo</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 5 Brand DNA Workspaces</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 8K Photorealistic Studio Renders</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> AI Website & Landing Page Builder</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Approvals Desk & Client Access</li>
                </ul>
              </div>
              <button
                onClick={handleSelectPlan}
                className="w-full btn-primary py-3.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: Enterprise Scale */}
          <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-8 flex flex-col justify-between space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xl">
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Enterprise Scale</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white">
                  ₹{billingCycle === 'yearly' ? '5,599' : '6,999'}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Unlimited multi-tenant governance, custom AI model fine-tuning, and dedicated SLA.
              </p>
              <hr className="border-slate-200 dark:border-slate-800" />
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 1,000 Visual AI Credits / mo</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Unlimited Workspaces</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Custom API & Webhook Integrations</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Dedicated Account Manager</li>
              </ul>
            </div>
            <button
              onClick={handleSelectPlan}
              className="w-full py-3.5 rounded-xl font-extrabold text-xs text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
            >
              Contact Sales
            </button>
          </div>

        </div>

        {/* Note under pricing cards */}
        <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Unused credits roll over automatically. Cancel or switch plans anytime.
        </p>

      </div>
    </section>
  );
};
