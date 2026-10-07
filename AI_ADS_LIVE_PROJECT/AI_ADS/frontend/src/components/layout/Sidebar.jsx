import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  LayoutGrid, 
  Dna, 
  Search, 
  Target, 
  Layers, 
  Calendar, 
  PenTool, 
  CheckCircle2, 
  Palette, 
  FolderKanban, 
  Globe, 
  Settings, 
  Crown,
  CreditCard,
  Sliders,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronUp,
  Lock,
  Sparkles,
  PanelLeftClose,
  Menu
} from 'lucide-react';

export const Sidebar = ({ isMobileMenuOpen: propIsMobile, setIsMobileMenuOpen: propSetIsMobile }) => {
  const { language, activeModule, setActiveModule, setIsSettingsModalOpen, activeSettingsTab, setActiveSettingsTab, isMobileMenuOpen: contextIsMobile, setIsMobileMenuOpen: contextSetIsMobile, user, userAvatar, activeWorkspace, theme, toggleTheme, logout, t } = useWorkspace();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileCardRef = useRef(null);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('aisa_sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const isMobileMenuOpen = propIsMobile !== undefined ? propIsMobile : contextIsMobile;
  const setIsMobileMenuOpen = propSetIsMobile || contextSetIsMobile;

  // Detect mobile via resize listener
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobileMenuOpen && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      return;
    }
    if (isMobile) {
      if (setIsMobileMenuOpen) setIsMobileMenuOpen(true);
      return;
    }
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('aisa_sidebar_collapsed', String(next)); } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileCardRef.current && !profileCardRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const modules = [
    { 
      id: 'dashboard', 
      label: t('dashboard', 'Dashboard'), 
      icon: LayoutGrid, 
      color: '#EF4444', 
      gradient: 'from-rose-500 to-red-600 shadow-rose-500/30',
      iconBg: 'bg-rose-500/15 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400'
    },
    { 
      id: 'brands', 
      label: t('brands', 'Brand DNA'), 
      icon: Dna, 
      color: '#F59E0B', 
      gradient: 'from-amber-500 to-orange-600 shadow-amber-500/30',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
    },
    { 
      id: 'seo', 
      label: t('seo', 'SEO Intelligence'), 
      icon: Search, 
      color: '#10B981', 
      gradient: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
    },
    { 
      id: 'campaigns', 
      label: t('campaigns', 'Campaigns'), 
      icon: Layers, 
      color: '#3B82F6', 
      gradient: 'from-blue-500 to-indigo-600 shadow-blue-500/30',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
    },
    { 
      id: 'strategy', 
      label: t('strategy', 'Strategy'), 
      icon: Target, 
      color: '#8B5CF6', 
      gradient: 'from-violet-500 to-purple-600 shadow-violet-500/30',
      iconBg: 'bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400'
    },
    { 
      id: 'calendar', 
      label: t('calendar', 'Calendar'), 
      icon: Calendar, 
      color: '#22C55E', 
      gradient: 'from-green-500 to-emerald-600 shadow-green-500/30',
      iconBg: 'bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400'
    },
    { 
      id: 'studio', 
      label: t('studio', 'Content Studio'), 
      icon: PenTool, 
      color: '#F97316', 
      gradient: 'from-orange-500 to-rose-600 shadow-orange-500/30',
      iconBg: 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
    },
    { 
      id: 'approvals', 
      label: t('approvals', 'Approvals Desk'), 
      icon: CheckCircle2, 
      color: '#EAB308', 
      gradient: 'from-yellow-500 to-amber-600 shadow-yellow-500/30',
      iconBg: 'bg-yellow-500/15 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'
    },
    { 
      id: 'creative', 
      label: t('creative', 'Creative Studio'), 
      icon: Palette, 
      color: '#6366F1', 
      gradient: 'from-indigo-500 to-purple-600 shadow-indigo-500/30',
      iconBg: 'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
    },
    { 
      id: 'assets', 
      label: t('assets', 'Asset Library'), 
      icon: FolderKanban, 
      color: '#06B6D4', 
      gradient: 'from-cyan-500 to-blue-600 shadow-cyan-500/30',
      iconBg: 'bg-cyan-500/15 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400'
    },
    { 
      id: 'websiteBuilder', 
      label: t('websiteBuilder', 'AI Website Builder'), 
      icon: Globe, 
      color: 'spectrum', 
      gradient: 'from-pink-500 via-purple-500 to-indigo-500 shadow-purple-500/30',
      iconBg: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-purple-600 dark:text-pink-400'
    },
  ];

  const handleNavClick = (id) => {
    if (isMobile && setIsMobileMenuOpen) setIsMobileMenuOpen(false);
    if (id === 'settings') {
      setActiveModule('settings');
      if (setActiveSettingsTab) setActiveSettingsTab('account');
      setIsSettingsModalOpen(true);
    } else if (id === 'plan') {
      setActiveModule('settings');
      if (setActiveSettingsTab) setActiveSettingsTab('billing');
      setIsSettingsModalOpen(true);
    } else if (id === 'connectors') {
      setActiveModule('settings');
      if (setActiveSettingsTab) setActiveSettingsTab('personalization');
      setIsSettingsModalOpen(true);
    } else {
      setActiveModule(id);
    }
  };

  // Should we show the expanded sidebar?
  const showExpanded = isMobile ? isMobileMenuOpen : true;
  // Is it collapsed on desktop?
  const collapsed = !isMobile && isCollapsed;

  return (
    <>
      {/* ── MOBILE: Backdrop overlay when drawer is open ── */}
      {isMobile && isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-40 transition-opacity duration-300 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* ── MOBILE MINI-BAR: Always visible on mobile (Logo top + Profile bottom) ── */}
      {isMobile && !isMobileMenuOpen && (
        <div 
          className="fixed top-0 left-0 h-[100dvh] w-[52px] z-50 flex flex-col items-center justify-between py-2 bg-white/95 dark:bg-[#080B1A]/95 border-r border-purple-100/50 dark:border-slate-800/70 backdrop-blur-xl select-none"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] panch-tattva-ribbon z-40" />
          
          {/* Logo - tap to open */}
          <button 
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(true)}
            className="w-9 h-9 flex items-center justify-center cursor-pointer active:scale-90 transition-transform mt-1"
          >
            <img 
              src="/logo_icon_only.png?v=10" 
              alt="AI ADS™" 
              className="w-8 h-8 object-contain drop-shadow-sm" 
              onError={(e) => { e.target.onerror = null; e.target.src = '/logo_transparent.png?v=10'; }}
            />
          </button>

          {/* Quick nav icons in center */}
          <div className="flex flex-col items-center gap-1 flex-1 justify-center py-2">
            {modules.map((m) => {
              const Icon = m.icon;
              const isActive = activeModule === m.id;
              return (
                <button 
                  key={m.id}
                  onClick={() => handleNavClick(m.id)}
                  title={m.label}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 ${
                    isActive 
                      ? `bg-gradient-to-r ${m.gradient} text-white shadow-sm` 
                      : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          {/* Profile avatar at bottom - tap to open */}
          <button
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(true)} 
            className="w-8 h-8 rounded-lg p-0.5 bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 overflow-hidden cursor-pointer active:scale-90 transition-transform mb-1"
          >
            <div className="w-full h-full rounded-[6px] bg-slate-950 flex items-center justify-center overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                <img src="/ai_ads_logo_3d.png" alt="User" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/logo_icon_only.png'; }} />
              )}
            </div>
          </button>
        </div>
      )}

      {/* ── FULL SIDEBAR: Desktop (sticky) / Mobile (overlay drawer) ── */}
      <aside className={`h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-white via-purple-50/20 to-white dark:from-[#080B1A] dark:via-[#0B0F23] dark:to-[#080B1A] border-r border-purple-100/60 dark:border-slate-800/80 shadow-[8px_0_30px_rgba(139,92,246,0.06)] dark:shadow-[8px_0_30px_rgba(0,0,0,0.5)] flex flex-col justify-between select-none overflow-hidden transition-all duration-300 ease-in-out ${
        isMobile 
          ? `fixed top-0 left-0 z-50 w-[240px] max-w-[80vw] ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`
          : `sticky top-0 left-0 z-50 ${collapsed ? 'w-20' : 'w-[220px] lg:w-56 lg:2xl:w-[220px]'}`
      }`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Header / Logo */}
          <div className={`h-14 flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3'} shrink-0 border-b border-purple-100/50 dark:border-slate-800/60 bg-white dark:bg-[#070b19] relative transition-colors duration-200`}>
            <div className="absolute top-0 left-0 right-0 h-[3px] panch-tattva-ribbon z-40" />
            <div 
              onClick={toggleSidebar}
              className={`flex items-center ${collapsed ? 'justify-center w-full h-full py-1' : 'gap-2.5 min-w-0 flex-1'} cursor-pointer group select-none active:scale-95`}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <img 
                src="/logo_icon_only.png?v=10" 
                alt="AI ADS™ Logo" 
                className="w-9 h-9 object-contain shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform duration-200" 
                onError={(e) => { e.target.onerror = null; e.target.src = '/logo_transparent.png?v=10'; }}
              />
              <div className={`flex items-center font-black text-lg tracking-tight leading-none min-w-0 transition-opacity duration-200 ${
                collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}>
                <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 bg-clip-text text-transparent truncate">
                  AI Ads
                </span>
                <sup className="text-[9px] font-extrabold text-amber-500 ml-1 font-sans -mt-2 select-none shrink-0">—TM</sup>
              </div>
            </div>

            {/* Close / Collapse Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (isMobile) {
                  setIsMobileMenuOpen && setIsMobileMenuOpen(false);
                } else {
                  toggleSidebar();
                }
              }}
              className={`p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 active:scale-90 transition-transform duration-150 cursor-pointer shrink-0 ml-1 items-center justify-center ${
                collapsed ? 'hidden' : 'flex'
              }`}
              title={isMobile ? "Close Menu" : "Collapse Sidebar"}
            >
              {isMobile ? <X className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-2 pt-1.5 pb-1 flex-1 min-h-0 flex flex-col justify-start overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-0.5">
              {modules.map((m) => {
                const Icon = m.icon;
                const isActive = activeModule === m.id;
                const userPlanNorm = (user?.plan || activeWorkspace?.subscriptionTier || 'agency_pro').toLowerCase();
                const isStarterUser = userPlanNorm === 'starter' || userPlanNorm === 'base' || userPlanNorm === 'free';
                const isHighestPlan = userPlanNorm === 'enterprise' || userPlanNorm === 'unlimited';
                const isModuleLocked = (!isHighestPlan && ['approvals', 'websiteBuilder', 'websitebuilder', 'builder'].includes(m.id));

                return (
                  <button
                    key={m.id}
                    onClick={() => handleNavClick(m.id)}
                    title={m.label}
                    className={`w-full relative flex items-center ${collapsed ? 'justify-center px-2 py-1.5' : 'justify-between px-2.5 py-1.5'} rounded-xl text-[12px] transition-all duration-200 text-left group ${
                      isActive 
                        ? `bg-gradient-to-r ${m.gradient} text-white font-bold shadow-md scale-[1.01]` 
                        : 'bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800/90 border border-slate-200/50 dark:border-slate-800/60 shadow-xs hover:shadow-sm hover:border-purple-200 dark:hover:border-purple-800/50 hover:translate-x-0.5 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        isActive 
                          ? 'bg-white/20 text-white shadow-inner' 
                          : m.iconBg
                      }`}>
                        <Icon className="w-3 h-3" style={!isActive && m.color !== 'spectrum' ? { color: m.color } : {}} />
                      </div>
                      <span className={`truncate transition-opacity duration-200 whitespace-nowrap min-w-0 ${
                        collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                      }`}>
                        {m.label}
                      </span>
                    </div>

                    <div className={`transition-opacity duration-200 shrink-0 ${
                      collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}>
                      {isModuleLocked && (
                        <span className={`flex items-center gap-1 text-[9.5px] font-black px-2 py-0.5 rounded-full ml-1 shadow-xs ${
                          isActive
                            ? 'bg-white/25 text-white border border-white/40'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        }`}>
                          <Lock className="w-2.5 h-2.5" />
                          <span>PRO</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* PLAN & SETTINGS Buttons */}
            <div className={`mt-1 pt-1.5 pb-0.5 px-0.5 flex items-center ${collapsed ? 'flex-col gap-1' : 'gap-1.5'} shrink-0 border-t border-purple-100/50 dark:border-slate-800/50`}>
              <button
                key="plan_btn"
                onClick={() => handleNavClick('plan')}
                className={`w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-colors duration-150 shadow-xs cursor-pointer ${
                  activeModule === 'settings' && activeSettingsTab === 'billing'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-emerald-500/30 font-extrabold'
                    : 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25 dark:border-emerald-500/35'
                }`}
                title={t('plan', 'Subscription & Billing Plan')}
              >
                <Crown className="w-3 h-3 shrink-0 text-emerald-500 dark:text-emerald-400" />
                <span className={`transition-opacity duration-200 whitespace-nowrap ${
                  collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                  {t('PLAN', 'PLAN')}
                </span>
              </button>

              <button
                key="settings_btn"
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-colors duration-150 shadow-xs cursor-pointer ${
                  activeModule === 'settings' && activeSettingsTab === 'account'
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-cyan-500/30 font-extrabold'
                    : 'bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/25 dark:border-cyan-500/35'
                }`}
                title={t('settings', 'Account Settings')}
              >
                <Sliders className="w-3 h-3 shrink-0 text-cyan-500 dark:text-cyan-400" />
                <span className={`transition-opacity duration-200 whitespace-nowrap ${
                  collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                  {t('SETTINGS', 'SETTINGS')}
                </span>
              </button>
            </div>
          </nav>

          {/* Bottom Sidebar Container: User Profile Card */}
          <div className="p-2 bg-gradient-to-r from-white/95 via-purple-50/40 to-white/95 dark:from-slate-900/95 dark:via-purple-950/30 dark:to-slate-900/95 border-t border-purple-100/60 dark:border-slate-800/80 shrink-0 relative" ref={profileCardRef}>
            {/* Floating Profile & Account Dropdown Popover */}
            {showProfileMenu && (
              <div className="absolute bottom-full left-2 right-2 mb-2 bg-white/95 dark:bg-[#0b0f19]/95 rounded-2xl shadow-2xl border border-purple-200/80 dark:border-slate-800/80 p-3 z-50 animate-in fade-in slide-in-from-bottom-2 space-y-2.5 backdrop-blur-xl">
                <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-2">
                  <p className="text-[9.5px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider">{t('signedInAs', 'Signed In As')}</p>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                    {user?.name || user?.fullName || 'Sonali Gupta'}
                  </p>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email || 'admin@agency.ai'}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="inline-block text-[9px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wide">
                      {t(user?.plan || 'Enterprise Suite', 'Enterprise Suite')}
                    </span>
                    <span className="inline-block text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/25">
                      {t('activeAccount', 'Active')}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      if (setActiveSettingsTab) setActiveSettingsTab('account');
                      setIsSettingsModalOpen(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left py-1.5 px-2 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition-all text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 group/item cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-purple-500 transition-colors" />
                    {t('accountSettings', 'Account Settings')}
                  </button>

                  {logout && (
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left py-1.5 px-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all text-xs font-bold flex items-center gap-2 mt-0.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      {t('signOut', 'Sign Out')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Active User / Workspace Footer Card */}
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center ${collapsed ? 'justify-center p-1' : 'justify-between p-1.5 px-2'} rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-purple-300 dark:hover:border-purple-700/50 transition-colors duration-200 cursor-pointer select-none group`}
              title={user?.name || 'Account & Settings'}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg p-0.5 bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 shadow-xs shadow-purple-500/20 shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-[7px] bg-slate-950 flex items-center justify-center text-white font-bold text-[10px] overflow-hidden">
                    {userAvatar ? (
                       <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <img src="/ai_ads_logo_3d.png" alt="User Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/logo_icon_only.png'; }} />
                    )}
                  </div>
                </div>
                <div className={`min-w-0 flex-1 ml-1.5 transition-opacity duration-200 ${
                  collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {user?.name || user?.fullName || 'Sonali Gupta'}
                  </p>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate font-medium">
                    {t(user?.plan || activeWorkspace?.subscriptionTier || 'Agency / Scale')}
                  </p>
                </div>
              </div>

              <div className={`transition-opacity duration-200 shrink-0 ${
                collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTheme();
                  }}
                  className="w-7 h-7 rounded-lg bg-amber-50/80 dark:bg-violet-950/50 border border-amber-200/80 dark:border-violet-800/60 text-amber-500 dark:text-violet-300 hover:scale-105 transition-all flex items-center justify-center shrink-0 ml-1 cursor-pointer"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-300" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
