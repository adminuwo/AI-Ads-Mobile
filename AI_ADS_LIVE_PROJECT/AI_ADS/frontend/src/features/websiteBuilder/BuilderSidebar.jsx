import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  Compass,
  PlugZap,
  FolderKanban,
  Star,
  User,
  Users,
  Clock,
  Gift,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Plus,
  ArrowLeft,
  Bell,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Check,
  Globe,
  Activity
} from 'lucide-react';

export const BuilderSidebar = ({
  activeNav,
  setActiveNav,
  projectFilter = 'all',
  setProjectFilter,
  projects = [],
  starredProjectIds = [],
  onToggleStar,
  onOpenProject,
  onBackToAIAds,
  collapsed,
  setCollapsed,
  onNewProject,
  onOpenSearchModal,
  onToggleTelemetry,
  activeWorkspace
}) => {
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);

  // Derive recent projects (top 5 sorted by updatedAt or createdAt)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 5);

  const starredCount = projects.filter((p) => starredProjectIds.includes(p.projectId || p._id)).length;

  const workspaceName = activeWorkspace?.name || activeWorkspace?.brandName || "Sonali's AI Ads™";
  const userInitial = (workspaceName[0] || 'S').toUpperCase();

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#FBFBFC] dark:bg-[#0B0F19] border-r border-slate-200/90 dark:border-slate-800/90 flex flex-col justify-between transition-all duration-300 z-40 select-none shrink-0 ${
        collapsed ? 'w-14 sm:w-16' : 'w-64 max-w-[80vw]'
      }`}
    >
      <div className="flex flex-col h-full justify-between overflow-hidden">
        {/* ── TOP SECTION & SCROLLABLE NAV ── */}
        <div className="overflow-y-auto flex-1 scrollbar-none space-y-4 p-3">
          {/* ── 1. WORKSPACE SELECTOR & SIDEBAR COLLAPSE ── */}
          <div className="flex items-center justify-between gap-1.5 relative">
            {!collapsed ? (
              <div className="relative flex-1 min-w-0">
                <button
                  onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-black text-xs flex items-center justify-center shadow-sm flex-shrink-0">
                      {userInitial}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {workspaceName}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 flex-shrink-0 transition-transform" />
                </button>

                {/* Workspace Dropdown Menu */}
                {workspaceDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setWorkspaceDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1.5 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Workspaces
                      </div>
                      <button
                        onClick={() => setWorkspaceDropdownOpen(false)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-pink-500 text-white text-[10px] font-black flex items-center justify-center">
                            {userInitial}
                          </div>
                          <span className="truncate">{workspaceName}</span>
                        </div>
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setWorkspaceDropdownOpen(false);
                          setActiveNav('brand_dna');
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                      >
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span>Workspace Settings</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-black text-xs flex items-center justify-center mx-auto shadow-sm">
                {userInitial}
              </div>
            )}

            {/* Collapse Toggle Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors flex-shrink-0"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* ── 2. TOP MAIN NAVIGATION ── */}
          <div className="space-y-0.5 pt-1">
            {/* Dashboard / Creation Studio */}
            <button
              onClick={() => setActiveNav('home')}
              title={collapsed ? 'Dashboard' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                activeNav === 'home' || activeNav === 'dashboard'
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/40 shadow-glow font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-brand-500/10 dark:hover:bg-brand-500/10'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${activeNav === 'home' || activeNav === 'dashboard' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-brand-500'}`} />
              {!collapsed && <span>Dashboard</span>}
            </button>

            {/* Search */}
            <button
              onClick={onOpenSearchModal}
              title={collapsed ? 'Search' : undefined}
              className="w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-brand-500/10 dark:hover:bg-brand-500/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-brand-500" />
                {!collapsed && <span>Search</span>}
              </div>
            </button>

            {/* Templates */}
            <button
              onClick={() => setActiveNav('templates')}
              title={collapsed ? 'Templates' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                activeNav === 'templates'
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/40 shadow-glow font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-brand-500/10 dark:hover:bg-brand-500/10'
              }`}
            >
              <Compass className={`w-4 h-4 flex-shrink-0 ${activeNav === 'templates' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-brand-500'}`} />
              {!collapsed && <span>Templates</span>}
            </button>
          </div>

          {/* ── 3. PROJECTS SECTION ── */}
          <div className="space-y-0.5 pt-2">
            {!collapsed && (
              <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Projects
              </div>
            )}

            {/* All Projects */}
            <button
              onClick={() => setProjectFilter('all')}
              title={collapsed ? 'All projects' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'projects' && projectFilter === 'all'
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/40 shadow-glow font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-brand-500/10 dark:hover:bg-brand-500/10'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <FolderKanban className={`w-4 h-4 flex-shrink-0 ${activeNav === 'projects' && projectFilter === 'all' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">All projects</span>}
              </div>
              {!collapsed && projects.length > 0 && (
                <span className="text-[10px] text-slate-400 font-bold">
                  {projects.length}
                </span>
              )}
            </button>

            {/* Starred */}
            <button
              onClick={() => setProjectFilter('starred')}
              title={collapsed ? 'Starred' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'projects' && projectFilter === 'starred'
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/40 shadow-glow font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-brand-500/10 dark:hover:bg-brand-500/10'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Star className={`w-4 h-4 flex-shrink-0 ${activeNav === 'projects' && projectFilter === 'starred' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">Starred</span>}
              </div>
              {!collapsed && starredCount > 0 && (
                <span className="text-[10px] text-amber-500 font-bold">
                  {starredCount}
                </span>
              )}
            </button>

            {/* Owned by me */}
            <button
              onClick={() => setProjectFilter('owned')}
              title={collapsed ? 'Owned by me' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'projects' && projectFilter === 'owned'
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/40 shadow-glow font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-brand-500/10 dark:hover:bg-brand-500/10'
              }`}
            >
              <User className={`w-4 h-4 flex-shrink-0 ${activeNav === 'projects' && projectFilter === 'owned' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
              {!collapsed && <span>Owned by me</span>}
            </button>

            {/* Shared with me */}
            <button
              onClick={() => setProjectFilter('shared')}
              title={collapsed ? 'Shared with me' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'projects' && projectFilter === 'shared'
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/40 shadow-glow font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-brand-500/10 dark:hover:bg-brand-500/10'
              }`}
            >
              <Users className={`w-4 h-4 flex-shrink-0 ${activeNav === 'projects' && projectFilter === 'shared' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
              {!collapsed && <span>Shared with me</span>}
            </button>
          </div>

          {/* ── 4. RECENTS SECTION ── */}
          {!collapsed && recentProjects.length > 0 && (
            <div className="space-y-0.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Recents
              </div>
              {recentProjects.map((proj) => (
                <button
                  key={proj.projectId || proj._id}
                  onClick={() => onOpenProject(proj)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all text-left truncate group"
                  title={proj.title}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500/60 group-hover:bg-brand-500 flex-shrink-0" />
                  <span className="truncate">{proj.title || 'Untitled Project'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── BOTTOM SECTION: USER BAR ── */}
        <div className="p-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 bg-[#FBFBFC] dark:bg-[#0B0F19] sticky bottom-0">
          {/* User Profile Bar */}
          <div className="flex items-center justify-between px-1.5 pt-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs flex items-center justify-center">
                  {userInitial}
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border border-white dark:border-slate-900" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {workspaceName.split(' ')[0] || 'User'}
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveNav('help')}
                  className="relative p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Messages & Notifications"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
                </button>
              </div>
            )}
          </div>

          {/* PROMINENT BACK TO AI ADS™ BUTTON */}
          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
            <button
              onClick={onBackToAIAds}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition-all shadow-xs group active:scale-95 ${
                collapsed ? 'px-0' : ''
              }`}
              title="Return to Main AI ADS™ Platform"
            >
              <div className="w-4 h-4 rounded-md bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-xs group-hover:-translate-x-0.5 transition-transform flex-shrink-0">
                <ArrowLeft className="w-2.5 h-2.5" />
              </div>
              {!collapsed && <span className="truncate">Back to AI ADS™</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

