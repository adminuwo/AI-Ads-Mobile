import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWorkspace } from '../../context/WorkspaceContext';
import { analyticsAPI, campaignAPI } from '../../services/api';

import {
  Search, PenTool, TrendingUp, Layers, Zap, Dna, FolderKanban, Sparkles, Globe,
  ArrowRight, Database, Image, Megaphone
} from 'lucide-react';

export const DashboardModule = () => {
  const {
    activeWorkspace,
    setActiveModule,
    setIsQuickPostOpen,
    setIsScraperOpen,
    openScraperModal,
    workspaces = [],
    globalAssets = [],
    user,
    t,
    showCustomAlert,
    setIsSettingsModalOpen,
    setActiveSettingsTab
  } = useWorkspace();
  const [analytics, setAnalytics] = useState(null);
  const [campaignsList, setCampaignsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const workspaceId = activeWorkspace?._id || activeWorkspace?.id;
  const userEmail = user?.email || localStorage.getItem('aisa_user_email') || activeWorkspace?.userEmail || '';

  const displayName = (() => {
    try {
      const savedName = localStorage.getItem('aisa_user_name');
      if (savedName && savedName.trim()) return savedName.trim();
      const savedUser = localStorage.getItem('aisa_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.name && parsed.name.trim()) return parsed.name.trim();
        if (parsed.fullName && parsed.fullName.trim()) return parsed.fullName.trim();
      }
    } catch(e) {}
    if (user?.name && user.name.trim()) return user.name.trim();
    if (user?.fullName && user.fullName.trim()) return user.fullName.trim();
    if (user?.email) {
      const prefix = user.email.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'Sonali';
  })();

  const timeGreeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const userPlanNorm = (user?.plan || activeWorkspace?.subscriptionTier || 'agency_pro').toLowerCase();
  const isStarter = userPlanNorm === 'starter' || userPlanNorm === 'base' || userPlanNorm === 'free';
  const isHighestPlan = userPlanNorm === 'enterprise' || userPlanNorm === 'unlimited';

  const handleWebsiteBuilderClick = () => {
    if (!isHighestPlan) {
      if (showCustomAlert) {
        showCustomAlert({
          title: 'AI Website Builder is Locked',
          message: 'AI Website Builder requires the Pro or higher subscription plan. Upgrade now to generate, customize, and deploy AI websites.',
          type: 'warning',
          confirmText: 'Upgrade to Pro',
          cancelText: 'Cancel',
          onConfirm: () => {
            setActiveModule('settings');
            if (setActiveSettingsTab) setActiveSettingsTab('billing');
            if (setIsSettingsModalOpen) setIsSettingsModalOpen(true);
          }
        });
      } else {
        setActiveModule('websiteBuilder');
      }
      return;
    }
    setActiveModule('websiteBuilder');
    if (window.location.pathname !== '/website-builder') {
      window.history.pushState({ module: 'websiteBuilder' }, '', '/website-builder');
    }
  };

  const handleAssetLibraryClick = () => {
    setActiveModule('assets');
    if (window.location.pathname !== '/asset-library') {
      window.history.pushState({ module: 'assets' }, '', '/asset-library');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, campaignsRes] = await Promise.all([
          analyticsAPI.getSummary({
            workspaceId: workspaceId || undefined,
            brandName: activeWorkspace?.brandName || undefined,
            userEmail: userEmail || undefined
          }),
          campaignAPI.list(workspaceId ? { workspaceId } : {}).catch(() => ({ campaigns: [], total: 0 })),
        ]);

        if (isMounted) {
          if (analyticsRes.analytics) setAnalytics(analyticsRes.analytics);
          if (campaignsRes?.campaigns) setCampaignsList(campaignsRes.campaigns);
        }
      } catch (err) {
        console.log('Dashboard fetch fallback:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();
    return () => { isMounted = false; };
  }, [workspaceId, activeWorkspace?.brandName, userEmail]);

  // Total Brands
  const totalBrandsCount = (workspaces && workspaces.length > 0)
    ? workspaces.length 
    : (analytics?.brands?.total || 4);

  // Total Generated Assets Count
  const totalGeneratedAssetsCount = analytics?.posts?.total !== undefined 
    ? analytics.posts.total 
    : (globalAssets?.length || 66);

  // Total Campaigns
  const brandRegex = activeWorkspace?.brandName ? new RegExp(activeWorkspace.brandName.trim(), 'i') : null;
  const brandCampaigns = campaignsList.filter(c => {
    if (workspaceId && (c.workspaceId === workspaceId || c.workspaceId?._id === workspaceId)) return true;
    if (brandRegex && (brandRegex.test(c.campaignName || '') || brandRegex.test(c.brandName || ''))) return true;
    return false;
  });

  const totalCampaignsCount = brandCampaigns.length > 0 
    ? brandCampaigns.length 
    : (analytics?.campaigns?.total || 0);

  const activeCampaignsCount = brandCampaigns.length > 0
    ? brandCampaigns.filter(c => ['Active', 'ACTIVE', 'running'].includes(c.status)).length
    : (analytics?.campaigns?.active || 0);

  return (
    <div className="space-y-5 animate-in fade-in w-full max-w-[1600px] mx-auto px-1 sm:px-3 pt-1 pb-8">
      {/* ── 1. LUXURY COLORFUL HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 shadow-sm relative overflow-hidden flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6"
      >
        {/* Soft Ambient Radial Background Glow */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-pink-400/30 via-purple-500/30 to-cyan-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-gradient-to-tr from-amber-300/30 via-pink-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Left Welcome Text & Chips */}
        <div className="relative z-10 space-y-3 max-w-2xl">


          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{t(timeGreeting)},</span>
              <span className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                {displayName}
              </span>
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ repeat: Infinity, repeatDelay: 2, duration: 1.8 }}
                className="inline-block origin-bottom-right"
              >
                👋
              </motion.span>
            </h1>
            <p className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {t('Turn ideas into impactful brands with AI.')}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed max-w-xl">
            {t('Currently governing')} <strong className="text-slate-900 dark:text-white font-bold">{activeWorkspace?.brandName || 'BATA'}</strong> ({activeWorkspace?.domainUrl || 'https://www.bata.com/'}). {t('All output is anchored to immutable Brand DNA.')}
          </p>

          {/* 4 Feature Pill Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-400/20 border border-amber-500/40 px-3 py-1 rounded-full shadow-2xs">
              <span>⚡</span> {t('Create Faster')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200 bg-blue-400/20 border border-blue-500/40 px-3 py-1 rounded-full shadow-2xs">
              <span>📊</span> {t('Better Content')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-900 dark:text-rose-200 bg-rose-400/20 border border-rose-500/40 px-3 py-1 rounded-full shadow-2xs">
              <span>🎯</span> {t('Smarter Campaigns')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-400/20 border border-emerald-500/40 px-3 py-1 rounded-full shadow-2xs">
              <span>🚀</span> {t('Higher ROI')}
            </span>
          </div>
        </div>

        {/* Right Action Buttons (Pill styling matching screenshot) */}
        <div className="relative z-10 flex items-center gap-2.5 w-full xl:w-auto shrink-0 justify-start sm:justify-end flex-wrap">
          <button
            onClick={() => openScraperModal ? openScraperModal() : setIsScraperOpen(true)}
            className="flex-1 sm:flex-initial bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 py-2.5 px-4 sm:px-5 rounded-full shadow-md border border-slate-100 dark:border-slate-800 cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <Sparkles className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
            <span className="truncate">{t('brandDna', 'Enter Your Brand')}</span>
          </button>

          <button
            onClick={() => setIsQuickPostOpen(true)}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 py-2.5 px-4 sm:px-5 rounded-full shadow-lg shadow-blue-500/25 cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <Zap className="w-4.5 h-4.5 text-amber-300 fill-amber-300 shrink-0" />
            <span className="truncate">{t('quickPost', 'Quick Post')}</span>
          </button>
        </div>
      </motion.div>

      {/* ── 2. KPI STATS GRID (3 CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Brands */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          onClick={() => setActiveModule('brands')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-t-4 border-t-amber-400 shadow-md border-x border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer"
        >
          <div className="space-y-1 z-10">
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 block tracking-tight">{t('Total Brands')}</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight block">
              {totalBrandsCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
              {totalBrandsCount} {totalBrandsCount === 1 ? t('brand profile in your account') : t('brand profiles in your account')}
            </span>
          </div>

          <div className="flex flex-col items-end justify-between h-full space-y-3 z-10">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              ↑ +33%
            </span>
            <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            {/* Micro mini bar chart visual */}
            <div className="flex items-end gap-1 h-5">
              <div className="w-1.5 h-3 rounded-xs bg-amber-300 dark:bg-amber-600" />
              <div className="w-1.5 h-4 rounded-xs bg-amber-400 dark:bg-amber-500" />
              <div className="w-1.5 h-5 rounded-xs bg-amber-500 dark:bg-amber-400" />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Total Generated Content */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          onClick={() => handleAssetLibraryClick()}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-t-4 border-t-cyan-400 shadow-md border-x border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer"
        >
          <div className="space-y-1 z-10">
            <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 block tracking-tight">{t('Total Generated Content')}</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight block">
              {totalGeneratedAssetsCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
              {t('Saved in Asset Library & DB (excl. calendar)')}
            </span>
          </div>

          <div className="flex flex-col items-end justify-between h-full space-y-3 z-10">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              ↑ +18%
            </span>
            <div className="p-3 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
              <Image className="w-6 h-6" />
            </div>
            {/* Micro mini bar chart visual */}
            <div className="flex items-end gap-1 h-5">
              <div className="w-1.5 h-2 rounded-xs bg-cyan-300 dark:bg-cyan-600" />
              <div className="w-1.5 h-3.5 rounded-xs bg-cyan-400 dark:bg-cyan-500" />
              <div className="w-1.5 h-5 rounded-xs bg-cyan-500 dark:bg-cyan-400" />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Total Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26 }}
          onClick={() => setActiveModule('campaigns')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-t-4 border-t-rose-400 shadow-md border-x border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer"
        >
          <div className="space-y-1 z-10">
            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 block tracking-tight">{t('Total Campaigns')}</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight block">
              {totalCampaignsCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
              {activeCampaignsCount} {t('currently active')}
            </span>
          </div>

          <div className="flex flex-col items-end justify-between h-full space-y-3 z-10">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
              —
            </span>
            <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            {/* Micro mini bar chart visual */}
            <div className="flex items-end gap-1 h-5">
              <div className="w-1.5 h-4 rounded-xs bg-rose-300 dark:bg-rose-600" />
              <div className="w-1.5 h-2 rounded-xs bg-rose-400 dark:bg-rose-500" />
              <div className="w-1.5 h-3 rounded-xs bg-rose-500 dark:bg-rose-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 3. END-TO-END CONTENT PIPELINE SECTION ── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>{t('TOOLKIT', 'TOOLKIT')}</span>
          </h2>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-serif italic flex items-center gap-1 hover:underline cursor-pointer">
            {t('From Strategy to Success →')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[
            {
              id: 'brands',
              label: '1. Brand DNA',
              sub: 'Positioning & Claims',
              icon: Dna,
              bg: 'bg-[#fffbeb] dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50',
              iconBg: 'bg-amber-400/20 text-amber-600',
              btnBg: 'bg-amber-500'
            },
            {
              id: 'seo',
              label: '2. SEO Briefs',
              sub: 'Topic Clusters & Intent',
              icon: Search,
              bg: 'bg-[#f0f9ff] dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/50',
              iconBg: 'bg-sky-400/20 text-sky-600',
              btnBg: 'bg-blue-600'
            },
            {
              id: 'studio',
              label: '3. Editorial Studio',
              sub: 'Multi-Channel Generation',
              icon: PenTool,
              bg: 'bg-[#fff1f2] dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50',
              iconBg: 'bg-rose-400/20 text-rose-600',
              btnBg: 'bg-rose-500'
            },
            {
              id: 'assets',
              label: '4. Asset Library',
              sub: 'Saved Media & Vault',
              icon: FolderKanban,
              bg: 'bg-[#f0fdf4] dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50',
              iconBg: 'bg-emerald-400/20 text-emerald-600',
              btnBg: 'bg-emerald-600'
            },
            {
              id: 'websiteBuilder',
              label: '5. Website Builder',
              sub: 'AI Pages & Sites',
              icon: Globe,
              bg: 'bg-[#f5f3ff] dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50',
              iconBg: 'bg-purple-400/20 text-purple-600',
              btnBg: 'bg-purple-600',
              isLocked: !isHighestPlan
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => {
                  if (step.id === 'websiteBuilder' && !isHighestPlan) {
                    handleWebsiteBuilderClick();
                    return;
                  }
                  if (step.id === 'assets') {
                    handleAssetLibraryClick();
                    return;
                  }
                  setActiveModule(step.id);
                  const pathMap = {
                    brands: '/brand-dna',
                    seo: '/seo-briefs',
                    studio: '/content-studio',
                    assets: '/asset-library',
                    websiteBuilder: '/website-builder',
                  };
                  if (pathMap[step.id]) {
                    window.history.pushState({ module: step.id }, '', pathMap[step.id]);
                  }
                }}
                className={`p-4 rounded-2xl ${step.bg} text-left group flex flex-col justify-between relative cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] min-h-[110px]`}
              >
                <div className="flex items-center justify-between mb-3 w-full">
                  <div className={`p-2 rounded-xl ${step.iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className={`w-7 h-7 rounded-full ${step.btnBg} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">{t(step.label)}</span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">{t(step.sub)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
