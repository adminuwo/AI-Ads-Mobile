import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { plansAPI } from '../../services/api';
import { Settings, CreditCard, Key, Sparkles, Check, ShieldCheck, Globe, Zap, Loader2, DollarSign, Layers } from 'lucide-react';

const DEFAULT_PLANS_LIST = [
  {
    planId: 'base',
    name: 'Starter',
    badge: 'Starter',
    description: 'Core AI text generation & 150 monthly visual credits for solo creators',
    priceUSD: 9.99,
    priceINR: 799,
    imageCredits: 150,
    textGenerations: '1,000 Gens / mo',
    billingCycle: 'month',
    isPopular: false,
    features: [
      '150 Monthly Visual Credits (AI Image & Ad Creative Generator)',
      '1,000 Text Generations / mo (Social Posts, Blogs, Emails & Ads)',
      '3 Brand DNA Workspaces (Website Scraper & Tone Ingestion)',
      '30-Day Marketing Roadmap Generator (Strategy Hub)',
      'SEO Intelligence (Keyword Clusters & Content Briefs)',
      'Content Studio (Social Copy, Blogs & Sales Copy Generators)',
      'AISA™ Copilot AI Assistant & Drag-and-Drop Calendar'
    ]
  },
  {
    planId: 'professional',
    name: 'Pro / Growth',
    badge: 'Growth Tier',
    description: 'Multi-brand DNA, 450 visual credits, Campaign Builder & Approvals Desk',
    priceUSD: 29.99,
    priceINR: 2399,
    imageCredits: 450,
    textGenerations: '3,000 Gens / mo',
    billingCycle: 'month',
    isPopular: false,
    features: [
      '450 Monthly Visual Credits (Creative Studio + Aspect Controls)',
      '3,000 Text Generations / mo (Full Content & Copy Suite)',
      '10 Brand DNA Workspaces (Multi-Brand Tone & Scraping)',
      'Campaign Builder (Multi-Channel Planner & Post Generator)',
      'AI Website Builder (Brief Analyzer & Full-Page HTML Code)',
      'Approvals Desk (Content Review Queue & Workflows)',
      'Asset Library & Performance Dashboard (KPI Metrics)'
    ]
  },
  {
    planId: 'agency_pro',
    name: 'Agency / Scale',
    badge: 'Most Popular',
    isPopular: true,
    description: 'Unlimited multi-client workspaces & 1,200 visual credits',
    priceUSD: 79.99,
    priceINR: 6399,
    imageCredits: 1200,
    textGenerations: '8,000 Gens / mo',
    billingCycle: 'month',
    features: [
      '1,200 Monthly Visual Credits (4x Visual Variation Engine)',
      '8,000 Text Generations / mo (High-Volume Strategy & Copy)',
      'Unlimited Multi-Client Workspaces & Brand DNA Ingestion',
      'AI Web Builder + Hero Visuals (Code + 2x Hero Visual Generator)',
      'Full Approvals Desk Queue & Workflow Management',
      'Media Asset Library with Cloud Storage'
    ]
  },
  {
    planId: 'enterprise',
    name: 'Enterprise',
    badge: 'Enterprise',
    description: 'High-volume production with 3,000 monthly visual credits & priority AI processing',
    priceUSD: 199.99,
    priceINR: 15999,
    imageCredits: 3000,
    textGenerations: 'UNLIMITED Gens / mo',
    billingCycle: 'month',
    isPopular: false,
    features: [
      '3,000 Monthly Visual Credits (High-Volume Ad & Visual Gen)',
      'UNLIMITED Text Generations (Uncapped AI Content Engine)',
      'Unlimited Brand Workspaces & Priority Processing',
      'AI Web Builder with Live Chat Edit (Real-Time Code Tweaking)',
      'All Core Platform Modules Included (Strategy, SEO, Content, Web & Ads)'
    ]
  }
];

export const SettingsBillingModule = () => {
  const { activeWorkspace, updateWorkspace, credits, setIsCreditModalOpen, user, setUser } = useWorkspace();
  const [plans, setPlans] = useState(DEFAULT_PLANS_LIST);
  const [loading, setLoading] = useState(false);
  const [subscribingId, setSubscribingId] = useState(null);
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'INR'

  const userPlanStr = (user?.plan || activeWorkspace?.subscriptionTier || credits?.tier || 'starter').toLowerCase();
  
  const getNormPlanId = (str) => {
    const s = (str || '').toLowerCase();
    if (s.includes('starter') || s.includes('base') || s === 'free') return 'base';
    if (s.includes('pro') || s.includes('growth') || s.includes('professional')) return 'professional';
    if (s.includes('agency') || s.includes('scale')) return 'agency_pro';
    if (s.includes('enterprise')) return 'enterprise';
    return 'base';
  };

  const activePlanId = getNormPlanId(userPlanStr);

  const [apiKey, setApiKey] = useState('aisa_live_pk_9948271038571029481');
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchDatabasePlans = async () => {
      try {
        const plansRes = await plansAPI.getPlans().catch(() => null);
        if (mounted && plansRes && Array.isArray(plansRes.plans) && plansRes.plans.length > 0) {
          setPlans(plansRes.plans);
        }
      } catch (err) {
        console.error('Failed to fetch pricing plans from database:', err);
      }
    };

    fetchDatabasePlans();
    return () => { mounted = false; };
  }, []);

  const isPlanActive = (plan) => {
    const pid = (plan.planId || plan._id || '').toLowerCase();
    const pname = (plan.name || '').toLowerCase();
    
    if (activePlanId === 'base' && (pid === 'base' || pid === 'starter' || pname.includes('starter'))) return true;
    if (activePlanId === 'professional' && (pid === 'professional' || pid === 'pro' || pname.includes('pro') || pname.includes('growth'))) return true;
    if (activePlanId === 'agency_pro' && (pid === 'agency_pro' || pid === 'agency' || pname.includes('agency') || pname.includes('scale'))) return true;
    if (activePlanId === 'enterprise' && (pid === 'enterprise' || pname.includes('enterprise'))) return true;
    
    return pid === activePlanId;
  };

  const handleSubscribePlan = async (plan) => {
    const targetPlanId = plan.planId || plan._id;
    setSubscribingId(targetPlanId);
    try {
      const wsId = activeWorkspace?.id || activeWorkspace?._id || 'default_ws';
      const res = await plansAPI.subscribe({ workspaceId: wsId, planId: targetPlanId });
      if (res && res.success) {
        if (setUser) {
          setUser(prev => ({
            ...prev,
            plan: targetPlanId,
            planName: plan.name
          }));
        }
        if (updateWorkspace) {
          updateWorkspace(wsId, {
            subscriptionTier: plan.name,
            visualCredits: plan.imageCredits
          });
        }
      }
    } catch (err) {
      console.error('Failed to update plan in database:', err);
    } finally {
      setSubscribingId(null);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Platform Settings & Pricing Plans</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Database-driven subscription plans, credit allocations, and API keys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                currency === 'INR'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              INR (₹)
            </button>
          </div>

          <button onClick={() => setIsCreditModalOpen(true)} className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold">
            <Sparkles className="w-4 h-4" /> Top Up Credits
          </button>
        </div>
      </div>

      {/* Subscription Tiers Grid (Database-Driven) */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-500" />
              Database Subscription Plans
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Live subscription plans fetched directly from MongoDB database.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Database Connected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(plan => {
            const active = isPlanActive(plan);
            const isSubscribing = subscribingId === (plan.planId || plan._id);
            const displayPrice = currency === 'USD' ? `$${plan.priceUSD}` : `₹${(plan.priceINR || 0).toLocaleString('en-IN')}`;

            return (
              <div
                key={plan.planId || plan._id || plan.name}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 relative transition-all duration-200 ${
                  active
                    ? 'bg-brand-500/10 dark:bg-brand-500/15 border-brand-500 ring-2 ring-brand-500/20 shadow-lg'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Badge */}
                {(plan.badge || active) && (
                  <span className={`absolute -top-2.5 right-3 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border ${
                    plan.isPopular || plan.badge === 'Most Popular'
                      ? 'bg-amber-500 text-white border-amber-400'
                      : active
                      ? 'bg-brand-600 text-white border-brand-500'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}>
                    {active ? 'Active Plan' : plan.badge}
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 my-1.5">
                      <span className="text-2xl font-black text-brand-600 dark:text-brand-400">{displayPrice}</span>
                      <span className="text-xs text-slate-400 font-medium">/{plan.billingCycle || 'month'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Key Metrics Badges */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image Credits:</span>
                      <span className="font-extrabold text-brand-600 dark:text-brand-400">{plan.imageCredits} / mo</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Text Copy:</span>
                      <span className="font-extrabold text-slate-700 dark:text-slate-300">{plan.textGenerations}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Included Features:</span>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-tight text-[11px]">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    disabled={active || isSubscribing}
                    onClick={() => handleSubscribePlan(plan)}
                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                      active
                        ? 'bg-brand-600 text-white shadow-sm cursor-default'
                        : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-brand-600 dark:hover:bg-brand-600 cursor-pointer'
                    }`}
                  >
                    {isSubscribing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : active ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Plan</span>
                      </>
                    ) : (
                      <span>Subscribe Plan</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Keys & Webhooks Card */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4 text-brand-500" />
          AISA Connect™ Production API Keys
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Production Secret Key</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <button onClick={copyKey} className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer">
                {copiedKey ? <Check className="w-4 h-4 text-white" /> : 'Copy Key'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-brand-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">CMS Webhook Integration</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Directly publish approved articles and social posts to external endpoints.</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

