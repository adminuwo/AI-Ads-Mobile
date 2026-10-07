import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { websiteBuilderAPI } from '../../services/api';
import {
  Sparkles,
  FolderKanban,
  LayoutTemplate,
  Image as ImageIcon,
  Dna,
  PlugZap,
  Rocket,
  Settings,
  HelpCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Globe,
  Sun,
  Moon,
  ExternalLink,
  ShieldCheck,
  Search,
  X,
  Star,
  Plus,
  Command,
  Zap,
  Activity
} from 'lucide-react';

import { BuilderSidebar } from './BuilderSidebar';
import { BuilderHomeView } from './BuilderHomeView';
import { BuilderTemplatesView } from './BuilderTemplatesView';
import { BuilderProjectsView } from './BuilderProjectsView';
import { BuilderWorkspaceView } from './BuilderWorkspaceView';
import { ClarificationCard } from './ClarificationCard';
import { telemetry, initGlobalTelemetryListeners } from '../../services/telemetryClient';

export const AIWebsiteBuilderModule = () => {
  const { activeWorkspace, setActiveModule, theme, toggleTheme, t, user } = useWorkspace();

  const userPlanNorm = (user?.plan || 'starter').toLowerCase();
  const isCampaignLocked = userPlanNorm === 'starter' || userPlanNorm === 'base' || userPlanNorm === 'free';

  // Initialize global click tracker
  useEffect(() => {
    initGlobalTelemetryListeners();
  }, []);

  // Navigation: 'home' | 'dashboard' | 'projects' | 'templates' | 'assets' | 'brand_dna' | 'connectors' | 'deployments' | 'settings' | 'help'
  const [activeNav, setActiveNav] = useState('home');
  const [collapsed, setCollapsed] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));
  const [projectFilter, setProjectFilterState] = useState('all'); // 'all' | 'starred' | 'starred' | 'owned' | 'shared'
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');

  const handleSelectNav = (nav) => {
    telemetry.trackNavigation(activeNav, nav);
    setActiveProject(null);
    setActiveNav(nav);
    setPrompt('');
  };

  const handleSelectProjectFilter = (filter) => {
    setActiveProject(null);
    setActiveNav('projects');
    setProjectFilterState(filter);
    setPrompt('');
  };

  // Starred Projects Persistence
  const [starredProjectIds, setStarredProjectIds] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_ads_starred_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleStar = (projectId) => {
    setStarredProjectIds((prev) => {
      const next = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId];
      try {
        localStorage.setItem('ai_ads_starred_projects', JSON.stringify(next));
      } catch (err) {
        console.warn('Could not save starred projects:', err.message);
      }
      return next;
    });
  };

  // Global Ctrl+K / Cmd+K Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Projects State
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Active Project Workspace (3-Pane Workspace)
  const [activeProject, setActiveProject] = useState(null);

  // Conversational Creation Pipeline State
  // 'IDLE' | 'CLARIFYING' | 'BUILDING' | 'FAILED'
  const [builderState, setBuilderState] = useState('IDLE');
  const [prompt, setPrompt] = useState('');
  const [clarificationData, setClarificationData] = useState(null);
  const [progressStep, setProgressStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Active Live Chat Messages for Workspace
  const [chatMessages, setChatMessages] = useState([]);
  const [isUpdatingChat, setIsUpdatingChat] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [activeWorkspace]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await websiteBuilderAPI.listProjects({
        workspaceId: activeWorkspace?._id || activeWorkspace?.id
      });
      if (res && res.projects) {
        setProjects(res.projects);
      }
    } catch (err) {
      console.log('Fetch projects note:', err.message);
    } finally {
      setLoadingProjects(false);
    }
  };

  // ── BUILD PIPELINE INITIATION ──
  const handleStartBuild = async (inputPrompt) => {
    if (!inputPrompt || !inputPrompt.trim()) return;

    setErrorMsg('');
    setPrompt(inputPrompt.trim());
    setBuilderState('BUILDING');

    telemetry.trackBuildStart(inputPrompt.trim(), {
      workspaceId: activeWorkspace?._id || activeWorkspace?.id
    });

    // Direct build execution (bypassing clarification questions per user request)
    executeBuildPipeline(inputPrompt.trim(), {});
  };

  const executeBuildPipeline = async (userPromptText, answersObj = {}) => {
    setBuilderState('BUILDING');
    setProgressStep(1);

    const buildReqId = `wb_${Math.random().toString(36).substring(2, 8)}`;

    telemetry.trackEvent({
      component: 'AIWebsiteBuilder',
      action: 'EXECUTE_BUILD_PIPELINE',
      eventType: 'USER_ACTION',
      buildId: buildReqId,
      metadata: { answersCount: Object.keys(answersObj || {}).length }
    });

    try {
      // Progress simulation
      for (let step = 1; step <= 4; step++) {
        setProgressStep(step);
        await new Promise((r) => setTimeout(r, 350));
      }

      // Build requirement overrides from user clarification answers
      let finalPrompt = userPromptText;
      const answerEntries = Object.entries(answersObj || {}).filter(([_, v]) => Boolean(v));
      if (answerEntries.length > 0) {
        const formattedPreferences = answerEntries
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n');
        finalPrompt = `${userPromptText}\n\n[USER DESIGN PREFERENCES & FEATURES]:\n${formattedPreferences}`;
      }

      const brandContext = {
        brandName: activeWorkspace?.brandName || '',
        industryCategory: activeWorkspace?.industryCategory || '',
        userPreferences: answersObj
      };

      const res = await websiteBuilderAPI.buildWebsite({
        prompt: finalPrompt,
        brandContext,
        clarificationAnswers: answersObj,
        reqId: `wb_${Math.random().toString(36).substring(2, 8)}`
      });

      if (res && res.success && res.build) {
        setProgressStep(5);
        const build = res.build;

        // Collect all image URLs from approved asset pool + website sections
        const approvedPool = build.requirement?.approvedAssetPool || {};
        const imageUrls = Object.values(approvedPool).map((a) => a.imageUrl).filter(Boolean);

        const pages = build.website?.pages || [];
        pages.forEach((pg) => {
          (pg.sections || []).forEach((sec) => {
            if (sec.imageUrl) imageUrls.push(sec.imageUrl);
            (sec.items || []).forEach((it) => { if (it.imageUrl) imageUrls.push(it.imageUrl); });
            (sec.services || []).forEach((sv) => { if (sv.imageUrl) imageUrls.push(sv.imageUrl); });
          });
        });

        const uniqueUrls = [...new Set(imageUrls)];

        const preloadImage = (url) => new Promise((resolve) => {
          if (!url || typeof url !== 'string') return resolve(false);
          const img = new window.Image();
          const timer = setTimeout(() => resolve(false), 6000);
          img.onload = () => { clearTimeout(timer); resolve(true); };
          img.onerror = () => { clearTimeout(timer); resolve(false); };
          img.src = url;
        });

        if (uniqueUrls.length > 0) {
          await Promise.all(uniqueUrls.map(preloadImage));
        }

        setProgressStep(6);
        await new Promise((r) => setTimeout(r, 400));

        const projectPayload = {
          projectId: build.sourceProject?.projectId || build.website?.websiteId || `site_${Date.now()}`,
          title: build.requirement?.businessType || 'Generated Web Application',
          website: {
            ...build.website,
            runtime: build.runtime
          },
          blueprint: build.blueprint,
          requirement: build.requirement,
          runtime: build.runtime
        };

        setActiveProject(projectPayload);
        setProjects((prev) => [projectPayload, ...prev.filter((p) => p.projectId !== projectPayload.projectId)]);
        setBuilderState('IDLE');
        setPrompt('');
        fetchProjects();
      } else {
        throw new Error(res?.error || 'Build orchestrator failed to generate site.');
      }
    } catch (err) {
      console.error('Build pipeline error:', err.message);
      setErrorMsg(err.message || 'Build failed. Please retry.');
      setBuilderState('FAILED');
    }
  };

  // ── CHAT-BASED ITERATIVE EDITING INSIDE WORKSPACE ──
  const handleSendChatEdit = async (editRequestText) => {
    if (!activeProject) return;

    const projectId = activeProject.projectId || activeProject.website?.websiteId;
    const userMsg = {
      sender: 'user',
      text: editRequestText,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsUpdatingChat(true);

    try {
      const editRes = await websiteBuilderAPI.chatEditProject({
        projectId,
        userPrompt: editRequestText,
        activeRequirement: activeProject.requirement,
        activeBlueprint: activeProject.blueprint
      });

      if (editRes && editRes.success && editRes.result) {
        const aiMsg = {
          sender: 'ai',
          text:
            editRes.result.explanation ||
            `Done! Updated ${editRes.result.modifiedFiles?.length || 1} component file(s).`,
          modifiedFiles: editRes.result.modifiedFiles || [],
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages((prev) => [...prev, aiMsg]);

        if (editRes.result.runtime || editRes.result.updatedWebsite || editRes.result.updatedTitle) {
          const freshUrl = editRes.result.runtime ? `${editRes.result.runtime.url.split('?')[0]}?t=${Date.now()}` : null;
          const freshRuntime = freshUrl ? {
            ...(editRes.result.runtime || activeProject.runtime),
            url: freshUrl
          } : activeProject.runtime;

          const freshWebsite = editRes.result.updatedWebsite
            ? {
                ...editRes.result.updatedWebsite,
                runtime: freshRuntime
              }
            : activeProject.website
            ? {
                ...activeProject.website,
                websiteIdentity: {
                  ...activeProject.website.websiteIdentity,
                  title: editRes.result.updatedTitle || activeProject.website.websiteIdentity?.title
                },
                runtime: freshRuntime,
                designSpec: editRes.result.updatedDesignSpec || activeProject.website.designSpec
              }
            : activeProject.website;

          const newTitle = editRes.result.updatedTitle || freshWebsite?.websiteIdentity?.title || activeProject?.title;
          const updatedProjPayload = {
            ...activeProject,
            title: newTitle,
            website: freshWebsite,
            runtime: freshRuntime,
            updatedAt: new Date()
          };

          setActiveProject(updatedProjPayload);
          setProjects((prev) => [
            updatedProjPayload,
            ...prev.filter((p) => (p.projectId || p._id) !== (updatedProjPayload.projectId || updatedProjPayload._id))
          ]);
          // Sync all projects cards in the background
          fetchProjects();
        }
      } else {
        const failMsg = editRes?.result?.error || editRes?.error || 'Could not apply edit.';
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `❌ Edit request failed: ${failMsg}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (err) {
      console.error('Chat edit error:', err.message);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `❌ Edit error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsUpdatingChat(false);
    }
  };

  const handleOpenProject = async (project) => {
    setPrompt('');
    const pid = project.projectId || project._id;
    
    // Set initial state immediately
    const initialPayload = {
      projectId: pid,
      title: project.title,
      website: project.website || {
        websiteId: pid,
        websiteIdentity: { title: project.title, businessType: project.businessType },
        designSpec: project.designSpec || {},
        runtime: project.runtime || null
      },
      blueprint: project.blueprint || {
        websiteIdentity: { title: project.title },
        pages: [{ title: 'Home', path: '/' }],
        designSpec: project.designSpec || {}
      },
      requirement: project.requirement || { businessType: project.businessType, industry: project.industry },
      runtime: project.runtime || null
    };
    setActiveProject(initialPayload);

    // Fetch live project data and auto-started sandbox runtime from backend
    try {
      const res = await websiteBuilderAPI.getProject(pid);
      if (res && res.success && res.project) {
        const fullProj = res.project;
        const freshRuntime = res.runtime || fullProj.runtime || fullProj.website?.runtime;
        
        setActiveProject({
          projectId: fullProj.projectId || pid,
          title: fullProj.title,
          website: {
            ...(fullProj.website || initialPayload.website),
            runtime: freshRuntime
          },
          blueprint: fullProj.blueprint || initialPayload.blueprint,
          requirement: fullProj.requirement || initialPayload.requirement,
          runtime: freshRuntime
        });
      }
    } catch (e) {
      console.warn('Failed to refresh project runtime on open:', e.message);
    }
  };

  const handleBackToAIAds = () => {
    setActiveModule('dashboard');
  };

  const handleDeleteProject = async (projectId) => {
    if (!projectId) return;
    try {
      setProjects((prev) => prev.filter((p) => p.projectId !== projectId && p._id !== projectId));
      if (activeProject && (activeProject.projectId === projectId || activeProject._id === projectId)) {
        setActiveProject(null);
      }
      await websiteBuilderAPI.deleteProject(projectId);
    } catch (err) {
      console.warn('Delete project error:', err.message);
      fetchProjects();
    }
  };

  // Nav Title Helper
  const navTitles = {
    home: 'Creation Studio',
    projects: 'Projects Repository',
    templates: 'Application Templates',
    assets: 'Asset Repository',
    brand_dna: 'Brand DNA Context',
    connectors: 'Connectors & Integrations',
    deployments: 'Deployments & Hosting',
    settings: 'Builder Settings',
    help: 'Help & Documentation'
  };

  // ── BUILDING PROGRESS OVERLAY ──
  if (builderState === 'BUILDING') {
    const progressMessages = [
      '1. Understanding prompt & business intent...',
      '2. Planning & generating prompt-tailored visual assets...',
      '3. Formulating bespoke design tokens & multi-page architecture...',
      '4. Synthesizing standalone React application...',
      '5. Preloading & caching high-resolution website images into browser memory...',
      '6. Testing runtime sandbox & launching live website...'
    ];
    const currentMsg = progressMessages[Math.min(progressStep - 1, progressMessages.length - 1)];

    return (
      <div className="flex h-screen w-screen bg-[#F8F9FD] dark:bg-[#070A11] text-slate-900 dark:text-white items-center justify-center p-4 select-none">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center justify-center mx-auto shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
              AI Ads™ Website Builder
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentMsg}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Generating your standalone React application in real-time...
            </p>
          </div>

          <div className="p-4 accent-card rounded-2xl bg-white dark:bg-slate-900 text-left space-y-2.5 text-xs shadow-sm">
            {progressMessages.map((msg, idx) => {
              const isDone = progressStep > idx + 1;
              const isCurrent = progressStep === idx + 1;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 ${
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : isCurrent
                      ? 'text-brand-600 dark:text-white font-extrabold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-spin" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 block" />
                  )}
                  <span>{msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── CLARIFICATION QUESTIONS MODAL ──
  if (builderState === 'CLARIFYING' && clarificationData) {
    return (
      <div className="fixed inset-0 z-50 flex h-screen w-screen bg-slate-950/85 backdrop-blur-md items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <ClarificationCard
          questions={clarificationData.questions}
          onComplete={(answers) => executeBuildPipeline(prompt, answers)}
          onSkip={() => executeBuildPipeline(prompt, {})}
        />
      </div>
    );
  }

  // ── FAILED STATE ──
  if (builderState === 'FAILED') {
    return (
      <div className="flex h-screen w-screen bg-[#F8F9FD] dark:bg-[#070A11] items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-pink-500 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Build could not be completed</h3>
          <p className="text-xs text-rose-500 font-medium">{errorMsg || 'A build exception occurred.'}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setBuilderState('IDLE')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
            >
              Back to Home
            </button>
            <button
              onClick={() => executeBuildPipeline(prompt, {})}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Build
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PRIMARY DEDICATED FULL-SCREEN BUILDER SHELL ──
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FD] dark:bg-[#070A11] text-slate-900 dark:text-slate-100 select-none">
      {/* ── 1. DEDICATED BUILDER SIDEBAR (ALWAYS VISIBLE ON THE LEFT) ── */}
      <BuilderSidebar
        activeNav={activeProject ? 'projects' : activeNav}
        setActiveNav={handleSelectNav}
        projectFilter={projectFilter}
        setProjectFilter={handleSelectProjectFilter}
        projects={projects}
        starredProjectIds={starredProjectIds}
        onToggleStar={handleToggleStar}
        onOpenProject={handleOpenProject}
        onBackToAIAds={handleBackToAIAds}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onNewProject={() => {
          handleSelectNav('home');
          setPrompt('');
        }}
        onOpenSearchModal={() => setSearchModalOpen(true)}
        onToggleTelemetry={() => setIsTelemetryOpen(!isTelemetryOpen)}
        activeWorkspace={activeWorkspace}
      />

      {/* ── 2. MAIN AREA: EITHER ACTIVE PROJECT WORKSPACE OR BUILDER VIEWS ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeProject ? (
          /* ACTIVE 3-PANE PROJECT WORKSPACE */
          <BuilderWorkspaceView
            projectData={activeProject}
            onBackToProjects={() => {
              setActiveProject(null);
              setPrompt('');
            }}
            onSendChatEdit={handleSendChatEdit}
            isUpdatingChat={isUpdatingChat}
            chatMessages={chatMessages}
          />
        ) : (
          /* HIGH-LEVEL BUILDER SHELL VIEWS (HOME / PROJECTS / TEMPLATES / ETC.) */
          <>
            {/* ── DEDICATED BUILDER TOP BAR ── */}
            <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0 z-30">
              {/* Left: Premium Back to AI Ads™ Pill Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToAIAds}
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-all duration-200 active:scale-95"
                  title="Return to Main AI ADS™ Platform"
                >
                  <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-xs border border-slate-200/50 dark:border-slate-700/50 group-hover:-translate-x-0.5 transition-transform">
                    <ArrowLeft className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-extrabold tracking-tight">Back to AI ADS™</span>
                </button>
              </div>

              {/* Right: Light / Dark Theme Mode Pill Toggle & Actions */}
              <div className="flex items-center gap-3">
                {/* THEME SWITCHER: ☀ Light | ◐ Dark */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <button
                    onClick={() => {
                      if (theme === 'dark') toggleTheme();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      theme !== 'dark'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Switch to Light Mode"
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light</span>
                  </button>

                  <button
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-bold'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Switch to Dark Mode"
                  >
                    <Moon className="w-3.5 h-3.5 text-brand-400" />
                    <span>Dark</span>
                  </button>
                </div>

                {/* Brand DNA Indicator */}
                {activeWorkspace?.brandName && (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="truncate max-w-[120px]">{activeWorkspace.brandName}</span>
                  </div>
                )}
              </div>
            </header>

            {/* ── MAIN SCROLLABLE CONTENT AREA ── */}
            <main className="flex-1 overflow-y-auto relative bg-[#F8F9FD] dark:bg-[#070A11]">
              {/* 1. HOME / DASHBOARD VIEW */}
              {(activeNav === 'home' || activeNav === 'dashboard') && (
                <BuilderHomeView
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onBuild={handleStartBuild}
                  isBuilding={builderState === 'BUILDING'}
                  projects={projects}
                  loadingProjects={loadingProjects}
                  onOpenProject={handleOpenProject}
                  onSelectCategory={(cat) => setPrompt(cat.sample)}
                />
              )}

              {/* 2. PROJECTS VIEW */}
              {activeNav === 'projects' && (
                <BuilderProjectsView
                  projects={projects}
                  loadingProjects={loadingProjects}
                  onOpenProject={handleOpenProject}
                  onDeleteProject={handleDeleteProject}
                  projectFilter={projectFilter}
                  setProjectFilter={setProjectFilterState}
                  starredProjectIds={starredProjectIds}
                  onToggleStar={handleToggleStar}
                  onNewProject={() => {
                    handleSelectNav('home');
                    setPrompt('');
                  }}
                />
              )}

              {/* 3. TEMPLATES VIEW */}
              {activeNav === 'templates' && (
                <BuilderTemplatesView
                  onSelectTemplate={(tmpl) => {
                    setPrompt(tmpl.prompt);
                    setActiveNav('home');
                  }}
                />
              )}

              {/* 4. ASSETS VIEW */}
              {activeNav === 'assets' && (
                <div className="max-w-5xl mx-auto py-10 px-6 space-y-6">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Asset &amp; Media Repository</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage global images, logos, icons, and theme fonts for your generated websites.
                    </p>
                  </div>
                  <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-pink-500 text-center space-y-3 shadow-sm">
                    <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Brand Assets Synchronized</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      All assets, images, and brand palettes are automatically linked to your AI Ads™ workspace.
                    </p>
                  </div>
                </div>
              )}

              {/* 5. BRAND DNA VIEW */}
              {activeNav === 'brand_dna' && (
                <div className="max-w-5xl mx-auto py-10 px-6 space-y-6">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Brand DNA Configuration</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Customize your workspace branding, default typography, color themes, and voice tones.
                    </p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-pink-500 space-y-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Current Workspace Brand</span>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white">
                          {activeWorkspace?.brandName || 'Standalone Workspace'}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Industry Category</span>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white">
                          {activeWorkspace?.industryCategory || 'Universal Generation'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* 7. DEPLOYMENTS VIEW */}
              {activeNav === 'deployments' && (
                <div className="max-w-5xl mx-auto py-10 px-6 space-y-6">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Hosting &amp; Deployments</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Export, deploy, and host your generated websites with zero configuration.
                    </p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-pink-500 space-y-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Live Real-time Preview Engine</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Built-in Vite sandbox delivers instant responsive hot-reloads inside the workspace.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {/* ── QUICK COMMAND / SEARCH PALETTE (Ctrl+K) ── */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSearchModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Search projects, templates, or create new..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                autoFocus
              />
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  ESC
                </kbd>
                <button
                  onClick={() => setSearchModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Close Search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results & Quick Actions */}
            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              {/* Quick Actions */}
              <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  setSearchModalOpen(false);
                  setActiveProject(null);
                  setActiveNav('home');
                  setPrompt('');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Create New Application</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">&crarr;</span>
              </button>

              <button
                onClick={() => {
                  setSearchModalOpen(false);
                  setActiveProject(null);
                  setActiveNav('templates');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutTemplate className="w-4 h-4 text-brand-500" />
                  <span>Browse All 12+ Templates</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">&crarr;</span>
              </button>

              <button
                onClick={() => {
                  setSearchModalOpen(false);
                  handleBackToAIAds();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowLeft className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Return to AI Ads™ Platform</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">&crarr;</span>
              </button>

              {/* Matching Projects */}
              <div className="px-2.5 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Projects ({projects.length})
              </div>
              {projects
                .filter((p) => {
                  const q = paletteQuery.toLowerCase();
                  return (
                    (p.title || '').toLowerCase().includes(q) ||
                    (p.businessType || '').toLowerCase().includes(q) ||
                    (p.industry || '').toLowerCase().includes(q)
                  );
                })
                .slice(0, 6)
                .map((proj) => (
                  <button
                    key={proj.projectId || proj._id}
                    onClick={() => {
                      setSearchModalOpen(false);
                      handleOpenProject(proj);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderKanban className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                      <div className="truncate text-left">
                        <div className="font-bold truncate">{proj.title || 'Untitled'}</div>
                        <div className="text-[10px] text-slate-400 truncate">{proj.businessType || 'Website'}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Open &rarr;
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
