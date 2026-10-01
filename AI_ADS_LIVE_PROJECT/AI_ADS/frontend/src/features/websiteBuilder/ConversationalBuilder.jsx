import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { websiteBuilderAPI } from '../../services/api';
import {
  Sparkles, Globe, ArrowRight, Loader2, RefreshCw, CheckCircle2,
  Settings, Bot, HelpCircle, Layers, Layout, Monitor
} from 'lucide-react';

import { ClarificationCard } from './ClarificationCard';
import { ConversationalChatDrawer } from './ConversationalChatDrawer';
import { WebsitePreviewEngine } from './WebsitePreviewEngine';

export const ConversationalBuilder = ({ developerMode = false }) => {
  const { activeWorkspace } = useWorkspace();

  // State Machine: IDLE | CLARIFYING | BUILDING | LIVE | UPDATING | FAILED
  const [builderState, setBuilderState] = useState('IDLE');

  const [prompt, setPrompt] = useState('');
  const [clarificationData, setClarificationData] = useState(null);
  const [userClarificationAnswers, setUserClarificationAnswers] = useState({});
  const [progressStep, setProgressStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Active build result & project references
  const [buildResult, setBuildResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isUpdatingChat, setIsUpdatingChat] = useState(false);

  // Starter prompts
  const starterPrompts = [
    "Create a premium fashion brand website called NOVA Atelier...",
    "Build a gourmet artisanal bakery website called SweetOven in Seattle...",
    "Create an AI accounting SaaS platform called LedgerAI with pricing tiers...",
    "Create a luxury eco-resort website called Casa Verde with villa booking..."
  ];

  // ── STEP 1: SUBMIT PROMPT & ANALYZE CLARIFICATION NEED ────────────────────
  const handlePromptSubmit = async (customPrompt = null) => {
    const inputPrompt = customPrompt || prompt;
    if (!inputPrompt || !inputPrompt.trim()) return;

    setErrorMsg('');
    setPrompt(inputPrompt.trim());
    setBuilderState('BUILDING');

    // Direct build execution (bypassing clarification questions per user request)
    executeBuildPipeline(inputPrompt.trim(), {});
  };

  // ── STEP 2: CLARIFICATION ANSWERED OR SKIPPED ──────────────────────────────
  const handleClarificationComplete = (answers) => {
    setUserClarificationAnswers(answers);
    executeBuildPipeline(prompt, answers);
  };

  const handleClarificationSkip = () => {
    executeBuildPipeline(prompt, {});
  };

  // ── STEP 3: EXECUTE BUILD PIPELINE ─────────────────────────────────────────
  const executeBuildPipeline = async (userPromptText, answersObj = {}) => {
    setBuilderState('BUILDING');
    setProgressStep(1);

    try {
      // Friendly progress simulation
      for (let step = 1; step <= 4; step++) {
        setProgressStep(step);
        await new Promise(r => setTimeout(r, 400));
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

      // Call end-to-end Build Orchestrator
      const res = await websiteBuilderAPI.buildWebsite({
        prompt: finalPrompt,
        brandContext,
        clarificationAnswers: answersObj,
        reqId: `wb_${Math.random().toString(36).substring(2, 8)}`
      });

      if (res && res.success && res.build) {
        setProgressStep(5);
        setBuildResult(res.build);
        setBuilderState('LIVE');
      } else {
        throw new Error(res?.error || 'Build orchestrator failed to generate site.');
      }
    } catch (err) {
      console.error('Build pipeline error:', err.message);
      setErrorMsg(err.message || 'Something went wrong while building. Retrying repair...');
      setBuilderState('FAILED');
    }
  };

  // ── STEP 5: CHAT-BASED ITERATIVE EDITING ──────────────────────────────────
  const handleSendChatEdit = async (editRequestText) => {
    if (!buildResult || !buildResult.sourceProject?.projectId) return;

    const projectId = buildResult.sourceProject.projectId || buildResult.website?.websiteId;
    const userMsg = { sender: 'user', text: editRequestText, timestamp: new Date().toLocaleTimeString() };
    setChatMessages(prev => [...prev, userMsg]);
    setIsUpdatingChat(true);

    try {
      const editRes = await websiteBuilderAPI.chatEditProject({
        projectId,
        userPrompt: editRequestText,
        activeRequirement: buildResult.requirement,
        activeBlueprint: buildResult.blueprint
      });

      if (editRes && editRes.success && editRes.result) {
        const aiMsg = {
          sender: 'ai',
          text: editRes.result.explanation || `Done! Updated ${editRes.result.modifiedFiles?.length || 1} file(s) and rebuilt the page.`,
          modifiedFiles: editRes.result.modifiedFiles || [],
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, aiMsg]);

        // Force runtime URL update with cache-busting timestamp so iframe reloads live app
        if (editRes.result.runtime) {
          const freshUrl = `${editRes.result.runtime.url.split('?')[0]}?t=${Date.now()}`;
          setBuildResult(prev => ({
            ...prev,
            runtime: {
              ...editRes.result.runtime,
              url: freshUrl
            },
            website: prev?.website ? {
              ...prev.website,
              designSpec: editRes.result.updatedDesignSpec || prev.website.designSpec
            } : prev?.website
          }));
        }
      } else {
        const failMsg = editRes?.result?.error || editRes?.error || 'Could not apply edit to project source files.';
        setChatMessages(prev => [
          ...prev,
          { sender: 'ai', text: `❌ Edit request failed: ${failMsg}`, timestamp: new Date().toLocaleTimeString() }
        ]);
      }
    } catch (err) {
      console.error('Chat edit error:', err.message);
      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: `❌ Edit request error: ${err.message}`, timestamp: new Date().toLocaleTimeString() }
      ]);
    } finally {
      setIsUpdatingChat(false);
    }
  };

  // ── RENDER STATE 1: IDLE PROMPT SCREEN ─────────────────────────────────────
  if (builderState === 'IDLE') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 font-extrabold text-xs">
            <Sparkles className="w-4 h-4" /> Next-Gen Conversational App Builder
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            What do you want to build?
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
            Describe your website or app idea in plain English. AI ADS™ will design, build, and run your real application automatically.
          </p>
        </div>

        <div className="p-4 md:p-6 accent-card rounded-3xl bg-white dark:bg-slate-900 shadow-2xl space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Describe your website or app (e.g. Create a luxury fashion brand website called NOVA Atelier with product catalog, lookbook, and cart...)"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 font-medium"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Zero technical setup required.</span>
            <button
              onClick={() => handlePromptSubmit()}
              disabled={!prompt.trim()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              Build Application <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Starter Prompts */}
        <div className="space-y-3">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block text-center">
            Or pick a starter inspiration
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {starterPrompts.map((st, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(st);
                  handlePromptSubmit(st);
                }}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center justify-between group"
              >
                <span className="truncate pr-2">"{st}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER STATE 2: CLARIFYING QUESTIONS ───────────────────────────────────
  if (builderState === 'CLARIFYING' && clarificationData) {
    return (
      <div className="py-8">
        <ClarificationCard
          questions={clarificationData.questions}
          onComplete={handleClarificationComplete}
          onSkip={handleClarificationSkip}
        />
      </div>
    );
  }

  // ── RENDER STATE 3: BUILDING PROGRESS ──────────────────────────────────────
  if (builderState === 'BUILDING') {
    const progressMessages = [
      'Understanding your idea...',
      'Designing the experience...',
      'Building your pages...',
      'Making interactions work...',
      'Checking responsive layouts...'
    ];

    const currentMsg = progressMessages[Math.min(progressStep - 1, progressMessages.length - 1)];

    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-pulse">
        <div className="w-16 h-16 rounded-3xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-brand-500 uppercase tracking-widest">AI Ads™ Website Builder</span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{currentMsg}</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">Building your real application, compiling code, and running runtime sandbox...</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2.5 max-w-md mx-auto text-xs">
          {progressMessages.map((msg, idx) => {
            const isDone = progressStep > idx + 1;
            const isCurrent = progressStep === idx + 1;
            return (
              <div key={idx} className={`flex items-center gap-2.5 ${isDone ? 'text-emerald-400 font-bold' : isCurrent ? 'text-white font-extrabold' : 'text-slate-500'}`}>
                {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : isCurrent ? <Loader2 className="w-4 h-4 text-brand-400 animate-spin" /> : <span className="w-4 h-4 rounded-full border border-slate-700 block" />}
                <span>{msg}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── RENDER STATE 4: FAILED / AUTO REPAIR ──────────────────────────────────
  if (builderState === 'FAILED') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Something went wrong while building.</h3>
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-1">{errorMsg || "I'm fixing it automatically..."}</p>
        </div>
        <button
          onClick={() => executeBuildPipeline(prompt, userClarificationAnswers)}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Building Application
        </button>
      </div>
    );
  }

  // ── RENDER STATE 5: LIVE APPLICATION + CONVERSATIONAL CHAT ───────────────
  if (builderState === 'LIVE' && buildResult) {
    const websiteData = {
      ...buildResult.website,
      runtime: buildResult.runtime
    };

    return (
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between bg-slate-900/90 dark:bg-slate-950/90 border border-slate-800 p-3 rounded-2xl text-white">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-extrabold text-white truncate max-w-xs">{buildResult.requirement?.businessType || 'Live Application'}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              ● Sandbox Live
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBuilderState('IDLE')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              + New App
            </button>
          </div>
        </div>

        {/* Live Preview Engine & Conversational Chat Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <WebsitePreviewEngine
              website={websiteData}
              blueprint={buildResult.blueprint}
              phaseState="PHASE_4_COMPLETE"
              progressStep={6}
              errorMsg=""
              onReset={() => setBuilderState('IDLE')}
            />
          </div>

          <div className="lg:col-span-1 h-[650px] sticky top-4">
            <ConversationalChatDrawer
              onSendChatEdit={handleSendChatEdit}
              isUpdating={isUpdatingChat}
              messages={chatMessages}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
