import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { autopilotAPI } from '../../services/api';
import {
  Rocket, Globe, Search, Target, Calendar, PenTool, CheckCircle2, Palette,
  Loader2, X, Sparkles, Zap, ChevronRight, ExternalLink, ArrowRight,
  BarChart3, Hash, TrendingUp, Clock, AlertCircle
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Brand Analysis', icon: Globe, color: 'from-blue-500 to-cyan-500', description: 'Scraping & analyzing brand identity' },
  { id: 2, label: 'SEO Intelligence', icon: Search, color: 'from-cyan-500 to-teal-500', description: 'Keyword clusters & topic mapping' },
  { id: 3, label: 'Strategy', icon: Target, color: 'from-teal-500 to-emerald-500', description: 'Content pillars & channel strategy' },
  { id: 4, label: 'Calendar', icon: Calendar, color: 'from-emerald-500 to-green-500', description: 'Scheduling posts across platforms' },
  { id: 5, label: 'Content Studio', icon: PenTool, color: 'from-green-500 to-lime-500', description: 'AI writing captions & hashtags' },
  { id: 6, label: 'Creative Studio', icon: Palette, color: 'from-lime-500 to-amber-500', description: 'Preparing visual image prompts' },
  { id: 7, label: 'Complete', icon: CheckCircle2, color: 'from-amber-500 to-brand-500', description: 'All done!' },
];

export const AutoPilotWizard = ({ isOpen, onClose }) => {
  const { activeWorkspace, setActiveModule } = useWorkspace();
  const [brandUrl, setBrandUrl] = useState(activeWorkspace?.domainUrl || '');
  const [days, setDays] = useState(30);
  const [frequency, setFrequency] = useState('daily');
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const logsEndRef = useRef(null);

  const workspaceId = activeWorkspace?._id || activeWorkspace?.id;

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (activeWorkspace?.domainUrl) {
      setBrandUrl(activeWorkspace.domainUrl);
    }
  }, [activeWorkspace?.domainUrl]);

  const handleStart = () => {
    if (!brandUrl.trim()) return;
    setRunning(true);
    setCurrentStep(1);
    setLogs([]);
    setSummary(null);
    setError(null);

    const url = brandUrl.startsWith('http') ? brandUrl : `https://${brandUrl}`;

    controllerRef.current = autopilotAPI.generate(
      { workspaceId, brandUrl: url, days, frequency },
      // onMessage
      (payload) => {
        setLogs(prev => [...prev, payload]);
        if (payload.step) setCurrentStep(payload.step);
        if (payload.status === 'complete' && payload.data?.summary) {
          setSummary(payload.data);
        }
        if (payload.status === 'error') {
          setError(payload.message);
        }
      },
      // onError
      (err) => {
        setError(err.message);
        setRunning(false);
      },
      // onComplete
      () => {
        setRunning(false);
      }
    );
  };

  const handleCancel = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    setRunning(false);
  };

  if (!isOpen) return null;

  const progressPercent = summary ? 100 : Math.round((Math.max(0, currentStep - 1) / 6) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] mx-4 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="relative px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-brand-500/5 via-purple-500/5 to-cyan-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Auto-Pilot Pipeline
                  <span className="text-[10px] bg-gradient-to-r from-brand-500 to-purple-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">1-Click Magic</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Brand URL → SEO → Strategy → Calendar → Content → Creative — All automated
                </p>
              </div>
            </div>
            <button onClick={running ? handleCancel : onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Progress Bar */}
          {running || summary ? (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                <span>Pipeline Progress</span>
                <span className={summary ? 'text-emerald-500' : 'text-brand-500'}>{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${summary ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-brand-500 via-purple-500 to-cyan-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Input Form (only shown before running) */}
          {!running && !summary && (
            <div className="space-y-5 animate-in fade-in">
              {/* Brand URL Input */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-500" />
                  <label className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Brand Website URL</label>
                </div>
                <input
                  type="url"
                  value={brandUrl}
                  onChange={(e) => setBrandUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full glass-input text-sm py-3"
                />
                <p className="text-[10px] text-slate-400">We'll scrape this URL to extract brand identity, tone, colors, and industry automatically.</p>
              </div>

              {/* Config Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    <label className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Campaign Duration</label>
                  </div>
                  <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full glass-input text-sm">
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days (Recommended)</option>
                    <option value={60}>60 Days</option>
                    <option value={90}>90 Days</option>
                  </select>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <label className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Posting Frequency</label>
                  </div>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full glass-input text-sm">
                    <option value="daily">Daily (7x/week)</option>
                    <option value="5x/week">5x per Week</option>
                    <option value="3x/week">3x per Week</option>
                    <option value="weekly">Weekly (1x/week)</option>
                  </select>
                </div>
              </div>

              {/* Pipeline Preview */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-500/5 via-purple-500/5 to-cyan-500/5 border border-brand-500/20 dark:border-brand-500/30 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-500" /> What Auto-Pilot Will Do
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {STEPS.slice(0, 6).map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Launch Button */}
              <button
                onClick={handleStart}
                disabled={!brandUrl.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket className="w-5 h-5" />
                Launch Auto-Pilot Pipeline
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Running / Step Progress */}
          {(running || summary) && (
            <div className="space-y-4 animate-in fade-in">
              {/* Step Indicators */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isDone = currentStep > step.id || summary;
                  const isPending = currentStep < step.id && !summary;
                  return (
                    <div key={step.id} className="flex items-center gap-1 shrink-0">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all text-[10px] font-bold ${
                        isDone ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                        isActive ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30 shadow-sm' :
                        'bg-slate-100 dark:bg-slate-800/60 text-slate-400 border border-slate-200 dark:border-slate-700/50'
                      }`}>
                        {isDone ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : isActive ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Icon className="w-3 h-3" />
                        )}
                        {step.label}
                      </div>
                      {step.id < 7 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Live Logs */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 ml-2">auto-pilot-pipeline.log</span>
                  {running && <Loader2 className="w-3 h-3 animate-spin text-brand-400 ml-auto" />}
                </div>
                <div className="p-4 max-h-48 overflow-y-auto font-mono text-xs space-y-1.5">
                  {logs.map((log, i) => (
                    <div key={i} className={`flex items-start gap-2 ${
                      log.status === 'error' ? 'text-red-400' :
                      log.status === 'done' ? 'text-emerald-400' :
                      log.status === 'complete' ? 'text-amber-300' :
                      'text-slate-300'
                    }`}>
                      <span className="text-slate-600 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Pipeline Error</h4>
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                    <button onClick={() => { setRunning(false); setSummary(null); setError(null); setCurrentStep(0); setLogs([]); }}
                      className="mt-2 text-xs font-bold text-brand-500 hover:text-brand-400 underline">
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Success Summary */}
              {summary && summary.summary && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-brand-500/5 border border-emerald-500/30 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Pipeline Complete! 🎉</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Your entire campaign has been generated end-to-end</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Brand', value: summary.summary.brandName, icon: Globe, color: 'text-blue-500' },
                        { label: 'Strategy', value: summary.summary.strategyName?.substring(0, 25), icon: Target, color: 'text-teal-500' },
                        { label: 'Posts Planned', value: summary.summary.totalPostsPlanned, icon: Calendar, color: 'text-emerald-500' },
                        { label: 'Content Ready', value: summary.summary.contentGenerated, icon: PenTool, color: 'text-purple-500' },
                      ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 space-y-1">
                            <Icon className={`w-4 h-4 ${stat.color}`} />
                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
                            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{stat.value}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* SEO Keywords */}
                    {summary.seoBrief?.secondaryKeywords && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">SEO Keywords Targeted</span>
                        <div className="flex flex-wrap gap-1.5">
                          {summary.seoBrief.secondaryKeywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Shortcuts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { module: 'brands', label: 'View Brand DNA', icon: Globe, color: 'from-blue-500 to-cyan-500' },
                      { module: 'strategy', label: 'View Strategy', icon: Target, color: 'from-teal-500 to-emerald-500' },
                      { module: 'calendar', label: 'View Calendar', icon: Calendar, color: 'from-emerald-500 to-green-500' },
                      { module: 'approvals', label: 'Review Content', icon: CheckCircle2, color: 'from-brand-500 to-purple-500' },
                    ].map((nav) => {
                      const Icon = nav.icon;
                      return (
                        <button
                          key={nav.module}
                          onClick={() => { onClose(); setActiveModule(nav.module); }}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 hover:border-brand-500/50 transition-all text-left group"
                        >
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${nav.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            {nav.label} <ExternalLink className="w-3 h-3 text-slate-400" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {running && (
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Pipeline running... This may take 1-3 minutes depending on the number of posts.
            </span>
            <button onClick={handleCancel} className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors">
              Cancel Pipeline
            </button>
          </div>
        )}

        {summary && (
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex justify-end">
            <button onClick={onClose} className="btn-primary text-xs">
              <CheckCircle2 className="w-4 h-4" /> Done — Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoPilotWizard;
