import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  FolderKanban,
  ExternalLink,
  Globe,
  Clock,
  CheckCircle2,
  Plus,
  Mic,
  MicOff
} from 'lucide-react';

export const BuilderHomeView = ({
  prompt,
  setPrompt,
  onBuild,
  isBuilding,
  projects = [],
  loadingProjects,
  onOpenProject,
  onSelectCategory
}) => {
  const [isListening, setIsListening] = useState(false);

  const { showCustomAlert } = useWorkspace();
  const handleVoiceCommand = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (showCustomAlert) {
        showCustomAlert({ title: 'Voice Input Unsupported', message: 'Voice input is not supported in this browser. Please use Chrome or Edge.', type: 'info' });
      }
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const initialText = prompt || '';

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentSpeech = '';
        for (let i = 0; i < event.results.length; i++) {
          currentSpeech += event.results[i][0].transcript;
        }
        const cleanSpeech = currentSpeech.trim();
        if (cleanSpeech) {
          setPrompt(initialText ? `${initialText} ${cleanSpeech}` : cleanSpeech);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const starterCategories = [
    {
      id: 'website',
      label: 'Website',
      sample: 'Create a modern agency website for a digital growth studio called Apex Dynamics with client case studies and inquiry form.'
    },
    {
      id: 'saas',
      label: 'SaaS',
      sample: 'Build an AI-powered sales CRM platform called PipelinePulse with lead scoring, interactive pipeline kanban, and 3-tier pricing.'
    },
    {
      id: 'ecommerce',
      label: 'Ecommerce',
      sample: 'Create a luxury artisanal fragrance store called Lumina Paris with fragrance notes filter, cart drawer, and WhatsApp checkout.'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      sample: 'Build an executive marketing analytics dashboard with live KPI counters, revenue charts, channel attribution, and filter tabs.'
    },
    {
      id: 'booking',
      label: 'Booking',
      sample: 'Create an upscale wellness spa & retreat booking site called Solstice Haven with interactive calendar slot reservation and therapist profiles.'
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      sample: 'Build a boutique handcrafted furniture marketplace with designer profiles, category browsing, and customer reviews.'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      sample: 'Create a minimalist UI/UX designer portfolio with interactive project showcases, about section, and contact inquiry form.'
    },
    {
      id: 'webapp',
      label: 'Web App',
      sample: 'Build a productivity habits & goal tracking web app with streak visualizers, daily checklist, and milestone badges.'
    }
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (prompt.trim() && !isBuilding) {
        onBuild(prompt);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 md:px-8 space-y-10 animate-in fade-in">
      {/* ── HERO HEADER & COMPOSER ── */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700/60 text-white font-extrabold text-xs shadow-lg">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
            <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
            <span className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-red-500/20" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span className="w-2 h-2 rounded-full bg-purple-500 ring-2 ring-purple-500/20" />
          </span>
          <span className="bg-gradient-to-r from-amber-400 via-rose-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent font-black">
            AI ADS™ Application Studio
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Describe it. We'll build it.
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
          Give AI ADS™ a simple description of what you want. It will understand your business, shape the experience, create the right visuals, and turn your idea into a live application.
        </p>
      </div>

      {/* ── CENTRAL LARGE COMPOSER ── */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl dark:shadow-2xl p-4 md:p-6 space-y-4 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all relative">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="Describe the website or app you want to build..."
            className="w-full bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 pr-14 text-sm md:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium resize-none"
          />

          {/* Voice Command Microphone Button inside prompt box */}
          <button
            type="button"
            onClick={handleVoiceCommand}
            className={`absolute right-3.5 bottom-3.5 p-2.5 rounded-xl border transition-all flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-md shadow-red-500/30 scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
            }`}
            title={isListening ? 'Listening... Click to stop' : 'Voice Command: Speak your prompt'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 animate-bounce" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Active Speech Recognition Banner */}
        {isListening && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Listening to your voice command... Speak your website description now</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
          <button
            onClick={() => onBuild(prompt)}
            disabled={!prompt.trim() || isBuilding}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 hover:from-brand-500 hover:to-brand-300 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Building Application...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Build Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── STARTER CATEGORIES / INSPIRATION CHIPS ── */}
      <div className="space-y-3">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block text-center">
          Starter Inspirations &amp; Archetypes
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {starterCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setPrompt(cat.sample);
                if (onSelectCategory) onSelectCategory(cat);
              }}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-brand-50 dark:hover:bg-brand-600/20 hover:border-brand-500/40 text-slate-700 dark:text-slate-300 hover:text-brand-700 dark:hover:text-white border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── RECENT PROJECTS SECTION ── */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Recent Projects
            </h2>
          </div>
          {projects.length > 0 && (
            <span className="text-xs text-slate-500 font-semibold">
              {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
            </span>
          )}
        </div>

        {loadingProjects ? (
          <div className="py-12 text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-brand-400" />
            <span>Loading recent projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">No projects created yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
              Describe your idea above to generate your first complete web application.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((proj) => (
              <div
                key={proj.projectId}
                onClick={() => onOpenProject(proj)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-brand-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors truncate max-w-[180px]">
                      {proj.title || 'Untitled Application'}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                      {proj.status || 'Active'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                    {proj.businessType || 'Full-Stack Web Application'}
                    {proj.industry ? ` • ${proj.industry}` : ''}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Recently updated'}</span>
                  </span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Open Workspace &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
