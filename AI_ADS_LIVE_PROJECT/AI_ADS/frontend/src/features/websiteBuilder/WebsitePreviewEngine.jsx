import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import {
  Monitor, Tablet, Smartphone, CheckCircle2, XCircle, ShieldCheck,
  Sparkles, Loader2, ArrowRight, RefreshCw, Send, PhoneCall, ExternalLink,
  MessageSquare, ChevronDown, ChevronUp, Search, Layers, Layout, AlertCircle, Globe
} from 'lucide-react';

class Phase4ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Phase4ErrorBoundary] Caught rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mt-6 p-8 rounded-3xl bg-slate-950 border border-rose-500/40 text-center space-y-4 text-white">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Phase 4 Website Rendering Error</h3>
            <p className="text-xs text-rose-300 mt-1 max-w-lg mx-auto font-medium">
              {this.state.error?.message || 'A runtime rendering exception occurred.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Re-rendering
            </button>
            <button
              onClick={this.props.onReset}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
            >
              Back to Phase 3 Blueprint &rarr;
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const WebsitePreviewEngine = ({ website, blueprint, phaseState, progressStep, errorMsg, onGenerateWebsite, onReset }) => {
  return (
    <Phase4ErrorBoundary onReset={onReset}>
      <WebsitePreviewContent
        website={website}
        blueprint={blueprint}
        phaseState={phaseState}
        progressStep={progressStep}
        errorMsg={errorMsg}
        onGenerateWebsite={onGenerateWebsite}
        onReset={onReset}
      />
    </Phase4ErrorBoundary>
  );
};

const WebsitePreviewContent = ({ website, blueprint, phaseState, progressStep, errorMsg, onGenerateWebsite, onReset }) => {
  const [deviceViewport, setDeviceViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [activePageIndex, setActivePageIndex] = useState(0);

  const runtime = website?.runtime || null;
  const projectId = website?.projectId || website?.id || blueprint?.projectId;
  const isProductionHost = typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  let effectivePreviewUrl = runtime?.previewUrl
    ? `${API_BASE.replace(/\/api$/, '')}${runtime.previewUrl}`
    : runtime?.url;

  if (projectId && (isProductionHost || !runtime?.url || runtime?.url?.includes('127.0.0.1'))) {
    effectivePreviewUrl = `${API_BASE}/website-builder/projects/${projectId}/preview/index.html`;
  }

  const isRuntimeRunning = (runtime && runtime.status === 'RUNNING') || Boolean(effectivePreviewUrl);

  const [viewMode, setViewMode] = useState(isRuntimeRunning ? 'live_sandbox' : 'model_preview');

  useEffect(() => {
    if (isRuntimeRunning && viewMode !== 'live_sandbox') {
      setViewMode('live_sandbox');
    }
  }, [isRuntimeRunning]);

  // Interactive Form States
  const [formSubmitted, setFormSubmitted] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState(0);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // ── STATE C: GENERATION FAILED (VISIBLE ERROR STATE) ──────────────────────
  if (phaseState === 'PHASE_4_VALIDATION_FAILED' || (errorMsg && !website)) {
    return (
      <div className="mt-6 p-8 rounded-3xl bg-slate-950 border border-rose-500/40 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-white">Website Generation Failed</h3>
          <p className="text-xs text-rose-300 max-w-md mx-auto font-medium">
            {errorMsg || 'Failed to generate website from Phase 3 Blueprint. Please try again.'}
          </p>
        </div>
        <button
          onClick={onGenerateWebsite}
          className="btn-primary px-6 py-3 rounded-xl font-extrabold text-xs shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Retry Website Generation
        </button>
      </div>
    );
  }

  // ── STATE B: GENERATION & VALIDATION PROGRESS STATE ────────────────────────
  if (phaseState === 'PHASE_4_GENERATING' || phaseState === 'PHASE_4_VALIDATING') {
    const steps = [
      'Preparing website configuration & theme...',
      'Building pages, navigation, sections and interactions from the approved Blueprint.',
      'Generating component layouts & section cards...',
      'Applying design palette & typography...',
      'Connecting interactive features & CTAs...',
      'Validating responsive layout & feature isolation...'
    ];

    const currentMsg = steps[Math.min(progressStep - 1, steps.length - 1)] || 'Generating Website...';
    const percent = Math.round((progressStep / steps.length) * 100);

    return (
      <div className="mt-6 p-8 rounded-3xl bg-slate-950 border border-brand-500/40 text-center space-y-6 animate-pulse">
        <div className="w-16 h-16 rounded-3xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/40">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-brand-400 uppercase tracking-widest block">
            {phaseState === 'PHASE_4_VALIDATING' ? 'Validating Website...' : 'Generating Website...'}
          </span>
          <h3 className="text-sm font-extrabold text-white">{currentMsg}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">Building pages, navigation, sections and interactions from the approved Blueprint.</p>
          <div className="w-full max-w-md bg-slate-900 rounded-full h-2 mx-auto overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 font-mono">{percent}% Complete • 100% Deterministic Engine</p>
        </div>
      </div>
    );
  }

  // ── STATE A / E: BEFORE GENERATION / FALLBACK STATE ──────────────────────
  if (!website) {
    return (
      <div className="mt-6 p-6 rounded-3xl bg-slate-950 border border-brand-500/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white">Phase 3 Blueprint Confirmed</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
            Ready to generate the full functional website from your approved Blueprint. Zero new AI calls will be made.
          </p>
        </div>
        <button
          onClick={onGenerateWebsite}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" /> Generate Phase 4 Website Now &rarr;
        </button>
      </div>
    );
  }

  // ── STATE D: GENERATION SUCCESSFUL (RENDER FULL PREVIEW) ───────────────────
  const activePage = website?.pages?.[activePageIndex] || website?.pages?.[0] || null;
  const validation = website?.validationResult || { status: 'PASS', score: 100, checks: [] };
  const theme = getWebsiteTheme(website);

  const siteTitleSlug = (website?.websiteIdentity?.title || 'app').toLowerCase().replace(/[^a-z0-9]/g, '');
  const pageNameSlug = (activePage?.name || 'home').toLowerCase().replace(/[^a-z0-9]/g, '-');

  return (
    <div className="mt-6 space-y-6 animate-fadeIn">
      {/* ── TOAST NOTIFICATION ─────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" /> {toastMsg}
        </div>
      )}

      {/* ── WEBSITE PREVIEW HEADER & VIEWPORT SWITCHER ────────────────── */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold text-white">{website.websiteIdentity?.title || 'Generated Website'}</h3>
              {isRuntimeRunning && (
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse flex items-center gap-1">
                  ● Live
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {website.pages?.length || 0} pages • {website.designSpec?.theme || 'Custom'} theme
            </p>
          </div>
        </div>

        {/* Viewport Selector */}
        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setDeviceViewport('desktop')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                deviceViewport === 'desktop' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              onClick={() => setDeviceViewport('tablet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                deviceViewport === 'tablet' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" /> Tablet
            </button>
            <button
              onClick={() => setDeviceViewport('mobile')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                deviceViewport === 'mobile' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>
        </div>
      </div>

      {/* ── MULTI-PAGE NAVIGATION BAR ────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {website.pages?.map((pg, idx) => (
          <button
            key={pg.id || idx}
            onClick={() => setActivePageIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all border ${
              activePageIndex === idx
                ? 'bg-slate-800 text-white border-brand-500/50 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-brand-400" />
            {pg.name}
          </button>
        ))}
      </div>

      {/* ── INTERACTIVE WEBSITE VIEWPORT PREVIEW CANVAS ────────────────── */}
      <div className="flex justify-center w-full">
        <div
          className={`transition-all duration-300 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden ${
            deviceViewport === 'desktop'
              ? 'w-full'
              : deviceViewport === 'tablet'
              ? 'w-[768px] max-w-full'
              : 'w-[375px] max-w-full border-4 border-slate-800 rounded-[40px]'
          }`}
        >
          {/* Simulated Browser Bar */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="bg-slate-950 px-3 py-1 rounded-lg text-[10px] font-mono text-slate-400 border border-slate-800/80 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">● LIVE</span>
                <span className="text-slate-200 font-semibold">{effectivePreviewUrl || runtime?.url || 'http://127.0.0.1:4112'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {effectivePreviewUrl && (
                <a
                  href={effectivePreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 transition-all hover:bg-emerald-500/20"
                >
                  <ExternalLink className="w-3 h-3" /> Open App in New Tab
                </a>
              )}
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">{deviceViewport.toUpperCase()} PREVIEW</span>
            </div>
          </div>

          {effectivePreviewUrl ? (
            <div className="w-full bg-slate-950 relative min-h-[750px] flex flex-col">
              <iframe
                key={effectivePreviewUrl}
                src={effectivePreviewUrl}
                title="Live Application"
                className="w-full flex-1 border-none min-h-[750px] bg-white dark:bg-slate-950"
                style={{ width: '100%', height: '750px', display: 'block' }}
              />
            </div>
          ) : (
            <div className="w-full min-h-[750px] flex flex-col items-center justify-center p-12 bg-slate-950 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/40">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-white">Starting Live Application...</h4>
              <p className="text-xs text-slate-400 max-w-sm">Compiling React components and launching sandbox preview server.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── PHASE 4 AUTOMATED VALIDATION CHECKLIST CARD ──────────────────── */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-extrabold text-white">Phase 4 Automated Validation Checklist</h4>
              <p className="text-[10px] text-slate-400">10 Compliance Rules Evaluated Automatically</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
            {validation.passedCount} / {validation.totalCount} Checks Passed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {validation.checks?.map((check) => (
            <div key={check.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
              {check.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">{check.name}</span>
                <span className="text-[10px] text-slate-400 block">{check.details}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURE IMPLEMENTATION ISOLATION SUMMARY CARD ────────────────── */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-400" /> Feature Ownership & Isolation Summary
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* User Requested Implemented */}
          <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1.5">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> User Requested ({website.featureImplementationSummary?.userRequestedCount || 0})
            </span>
            <div className="flex flex-wrap gap-1">
              {website.featureImplementationSummary?.userRequestedList?.map((f, i) => (
                <span key={i} className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>

          {/* Approved Recommendations Implemented */}
          <div className="p-3 rounded-xl bg-slate-900 border border-brand-500/30 space-y-1.5">
            <span className="text-[10px] font-extrabold text-brand-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Approved Recs ({website.featureImplementationSummary?.approvedCount || 0})
            </span>
            <div className="flex flex-wrap gap-1">
              {website.featureImplementationSummary?.approvedList?.length > 0 ? (
                website.featureImplementationSummary?.approvedList?.map((f, i) => (
                  <span key={i} className="text-[9px] bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2 py-0.5 rounded">
                    ✓ {f}
                  </span>
                ))
              ) : (
                <span className="text-[9px] text-slate-500 italic">None accepted</span>
              )}
            </div>
          </div>

          {/* AI Unapproved Strictly Excluded */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-slate-500" /> AI Unapproved ({website.featureImplementationSummary?.excludedCount || 0})
            </span>
            <div className="flex flex-wrap gap-1">
              {website.featureImplementationSummary?.excludedList?.map((f, i) => (
                <span key={i} className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded line-through opacity-70">
                  ✕ {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getWebsiteTheme(website) {
  if (website?.generatedTheme) return website.generatedTheme;
  const spec = website?.designSpec || {};
  const primaryColor = spec.primaryColor || '#6366F1';
  const secondaryColor = spec.secondaryColor || '#4F46E5';
  const themeName = (spec.theme || 'Modern Light').toLowerCase();

  const isDark = themeName.includes('dark');
  const isNatural = themeName.includes('botanical') || themeName.includes('natural') || themeName.includes('green') || primaryColor === '#064E3B';
  const isPastelWarm = themeName.includes('warm') || themeName.includes('pastel') || themeName.includes('cream') || themeName.includes('bakery');

  let bg = '#FFFFFF';
  let surface = '#F8FAFC';
  let cardBg = '#FFFFFF';
  let cardBorder = '#E2E8F0';
  let text = '#0F172A';
  let mutedText = '#64748B';
  let headerBg = primaryColor;
  let headerText = '#FFFFFF';
  let buttonBg = primaryColor;
  let buttonText = '#FFFFFF';
  let secondaryButtonBg = secondaryColor;
  let secondaryButtonText = primaryColor;
  let inputBg = '#FFFFFF';
  let inputBorder = '#CBD5E1';
  let tableHeaderBg = '#F1F5F9';

  if (isDark) {
    bg = isNatural ? '#022C22' : '#0F172A';
    surface = isNatural ? '#064E3B' : '#1E293B';
    cardBg = isNatural ? '#064E3B' : '#1E293B';
    cardBorder = isNatural ? '#047857' : '#334155';
    text = '#F8FAFC';
    mutedText = '#94A3B8';
    inputBg = isNatural ? '#065F46' : '#0F172A';
    inputBorder = isNatural ? '#047857' : '#334155';
    tableHeaderBg = isNatural ? '#065F46' : '#0F172A';
  } else if (isPastelWarm) {
    bg = '#FFFBEB';
    surface = '#FEF3C7';
    cardBg = '#FFFFFF';
    cardBorder = '#FDE68A';
    text = '#451A03';
    mutedText = '#78350F';
    headerBg = primaryColor;
    headerText = '#FFFFFF';
    inputBg = '#FFFFFF';
    inputBorder = '#FCD34D';
    tableHeaderBg = '#FEF3C7';
  } else if (isNatural) {
    bg = '#F0FDF4';
    surface = '#DCFCE7';
    cardBg = '#FFFFFF';
    cardBorder = '#BBF7D0';
    text = '#064E3B';
    mutedText = '#047857';
    headerBg = primaryColor;
    headerText = '#FFFFFF';
    inputBg = '#FFFFFF';
    inputBorder = '#86EFAC';
    tableHeaderBg = '#DCFCE7';
  }

  return {
    themeName: spec.theme || 'Custom Theme',
    primaryColor,
    secondaryColor,
    isDark,
    bg,
    surface,
    cardBg,
    cardBorder,
    text,
    mutedText,
    headerBg,
    headerText,
    buttonBg,
    buttonText,
    secondaryButtonBg,
    secondaryButtonText,
    inputBg,
    inputBorder,
    tableHeaderBg
  };
}

/**
 * Section Component Renderer with real interactive controls consuming dynamic theme
 */
function RenderWebsiteSection({
  section,
  website,
  theme,
  catalogSearch,
  setCatalogSearch,
  expandedAccordion,
  setExpandedAccordion,
  formSubmitted,
  setFormSubmitted,
  triggerToast,
  onCTAClick
}) {
  const { type, title, headline, subheadline, items, categories, plans, features, steps, testimonials, services, columns, rows, fields, address, operatingHours, phone, email, actionLabel, primaryCTA, secondaryCTA } = section;
  const currentTheme = theme || getWebsiteTheme(website);

  const [activeCategory, setActiveCategory] = useState('All');

  switch (type) {
    case 'HeroBanner':
    case 'HeroSplit':
    case 'HeroMinimal':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-8 rounded-3xl border shadow-md transition-all" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <div className="space-y-4 text-left">
            <h2 className="text-xl sm:text-3xl font-black leading-tight">{headline || title}</h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: currentTheme.mutedText }}>{subheadline}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onCTAClick ? onCTAClick(primaryCTA || 'Action') : triggerToast(`Clicked CTA: "${primaryCTA || 'Action'}"`)}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: currentTheme.buttonBg, color: currentTheme.buttonText }}
              >
                {primaryCTA || 'Get Started'} &rarr;
              </button>
              {secondaryCTA && (
                <button
                  onClick={() => onCTAClick ? onCTAClick(secondaryCTA) : triggerToast(`Clicked Secondary CTA: "${secondaryCTA}"`)}
                  className="px-5 py-2.5 rounded-xl font-extrabold text-xs transition-transform hover:scale-105 border"
                  style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.text, borderColor: currentTheme.cardBorder }}
                >
                  {secondaryCTA}
                </button>
              )}
            </div>
          </div>
          {section.imageUrl && (
            <div className="relative rounded-2xl overflow-hidden shadow-lg border h-60 md:h-72" style={{ borderColor: currentTheme.cardBorder }}>
              <img src={section.imageUrl} alt={headline || title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      );

    case 'RestaurantMenuCard':
      const menuCats = categories || ['Appetizers & Starters', 'Artisan Main Courses', 'Handcrafted Desserts', 'Wines & Beverages'];
      const menuItems = items || [];
      const currentCat = activeCategory === 'All' ? menuCats[0] : activeCategory;
      const visibleMenuItems = menuItems.filter((i) => i.category === currentCat || activeCategory === 'All');

      return (
        <div className="space-y-4 p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold">{title}</h3>
            <p className="text-xs mt-0.5" style={{ color: currentTheme.mutedText }}>Authentic culinary selections crafted with organic seasonal ingredients</p>
          </div>

          {/* Menu Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {menuCats.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  currentCat === cat ? 'shadow-md border-transparent' : 'opacity-80 hover:opacity-100'
                }`}
                style={
                  currentCat === cat
                    ? { backgroundColor: currentTheme.buttonBg, color: currentTheme.buttonText }
                    : { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.cardBorder }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {visibleMenuItems.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl border flex flex-col justify-between space-y-2 shadow-xs" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.cardBorder }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold">{item.name}</span>
                      {item.tag && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: currentTheme.primaryColor + '20', color: currentTheme.primaryColor }}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: currentTheme.mutedText }}>{item.description}</p>
                  </div>
                  <span className="text-xs font-black shrink-0" style={{ color: currentTheme.primaryColor }}>{item.price}</span>
                </div>
                <button
                  onClick={() => triggerToast(`Added "${item.name}" to reservation order!`)}
                  className="px-3 py-1 rounded-lg text-[10px] font-bold border self-end hover:opacity-90"
                  style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.text, borderColor: currentTheme.cardBorder }}
                >
                  Order / Reserve Dish
                </button>
              </div>
            ))}
          </div>
        </div>
      );

    case 'PortfolioGallery':
      const galCats = categories || ['All Works', 'Editorial', 'Weddings', 'Portraits', 'Architecture'];
      const galItems = items || [];
      const filteredGalItems = galItems.filter((i) => activeCategory === 'All Works' || activeCategory === 'All' || i.category === activeCategory);

      return (
        <div className="space-y-4 p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold">{title}</h3>
            <p className="text-xs mt-0.5" style={{ color: currentTheme.mutedText }}>Selected commercial and personal creative projects</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {galCats.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat || (activeCategory === 'All' && idx === 0) ? 'shadow-md border-transparent' : 'opacity-80'
                }`}
                style={
                  activeCategory === cat || (activeCategory === 'All' && idx === 0)
                    ? { backgroundColor: currentTheme.buttonBg, color: currentTheme.buttonText }
                    : { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.cardBorder }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {filteredGalItems.map((item, idx) => (
              <div key={idx} className="rounded-2xl border overflow-hidden flex flex-col justify-between shadow-xs space-y-3" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.cardBorder }}>
                {item.imageUrl && (
                  <div className="w-full h-48 overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                )}
                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">{item.title}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.mutedText }}>
                      {item.year || '2025'}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: currentTheme.mutedText }}>{item.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: currentTheme.cardBorder }}>
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: currentTheme.primaryColor }}>{item.category}</span>
                    <button
                      onClick={() => triggerToast(`Viewing full gallery series for "${item.title}"`)}
                      className="text-[10px] font-bold hover:underline flex items-center gap-1"
                      style={{ color: currentTheme.primaryColor }}
                    >
                      View Project &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'PricingPlansGrid':
      const planItems = plans || [];

      return (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-sm sm:text-base font-extrabold">{title}</h3>
            <p className="text-xs" style={{ color: currentTheme.mutedText }}>Transparent pricing with zero hidden fees</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {planItems.map((plan, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm relative ${
                  plan.isPopular ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: currentTheme.cardBg,
                  borderColor: plan.isPopular ? currentTheme.primaryColor : currentTheme.cardBorder,
                  color: currentTheme.text
                }}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase px-3 py-1 rounded-full shadow" style={{ backgroundColor: currentTheme.primaryColor, color: currentTheme.buttonText }}>
                    Most Popular
                  </span>
                )}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider">{plan.name}</h4>
                    <p className="text-[10px] mt-1" style={{ color: currentTheme.mutedText }}>{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black" style={{ color: currentTheme.primaryColor }}>{plan.price}</span>
                    <span className="text-[10px]" style={{ color: currentTheme.mutedText }}>{plan.period}</span>
                  </div>
                  <ul className="space-y-1.5 pt-2 border-t text-[11px]" style={{ borderColor: currentTheme.cardBorder }}>
                    {plan.features?.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: currentTheme.primaryColor }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => triggerToast(`Selected plan: "${plan.name}"`)}
                  className="w-full py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-transform hover:scale-[1.02]"
                  style={
                    plan.isPopular
                      ? { backgroundColor: currentTheme.buttonBg, color: currentTheme.buttonText }
                      : { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.cardBorder }
                  }
                >
                  Choose {plan.name} &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      );

    case 'FeatureGrid':
    case 'ValuePropositionGrid':
      const featList = features || [];

      return (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featList.map((feat, idx) => (
              <div key={idx} className="p-4 rounded-2xl border space-y-2 shadow-xs" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs" style={{ backgroundColor: currentTheme.surface, color: currentTheme.primaryColor }}>
                  ⚡
                </div>
                <h4 className="text-xs font-extrabold">{feat.title}</h4>
                <p className="text-[11px] leading-relaxed" style={{ color: currentTheme.mutedText }}>{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'HowItWorksGrid':
    case 'ProcessSteps':
      const stepList = steps || [];

      return (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stepList.map((st, idx) => (
              <div key={idx} className="p-5 rounded-2xl border space-y-2 shadow-xs relative" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
                <span className="text-xs font-mono font-black" style={{ color: currentTheme.primaryColor }}>{st.step}</span>
                <h4 className="text-xs font-extrabold">{st.title}</h4>
                <p className="text-[11px] leading-relaxed" style={{ color: currentTheme.mutedText }}>{st.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'TestimonialsCarousel':
    case 'ReviewsGrid':
      const testList = testimonials || [];

      return (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testList.map((t, idx) => (
              <div key={idx} className="p-5 rounded-2xl border flex flex-col justify-between space-y-3 shadow-xs" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {'★'.repeat(t.rating || 5)}
                  </div>
                  <p className="text-[11px] italic leading-relaxed" style={{ color: currentTheme.mutedText }}>"{t.quote}"</p>
                </div>
                <div className="pt-2 border-t" style={{ borderColor: currentTheme.cardBorder }}>
                  <span className="text-xs font-extrabold block">{t.author}</span>
                  <span className="text-[10px] block" style={{ color: currentTheme.mutedText }}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'BookingForm':
    case 'DemoRequestForm':
      return (
        <div className="p-6 rounded-3xl border space-y-4 shadow-sm w-full max-w-4xl mx-auto" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <div>
            <h3 className="text-sm font-extrabold">{title}</h3>
            <p className="text-xs mt-0.5" style={{ color: currentTheme.mutedText }}>Select your preferred schedule and complete your request</p>
          </div>
          {formSubmitted === section.id ? (
            <div className="p-4 rounded-2xl border text-xs font-bold text-center space-y-1" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.cardBorder, color: currentTheme.primaryColor }}>
              <CheckCircle2 className="w-5 h-5 mx-auto" style={{ color: currentTheme.primaryColor }} />
              <p>Booking Confirmed! We look forward to connecting with you.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFormSubmitted(section.id);
                triggerToast('Booking submitted successfully!');
              }}
              className="space-y-3"
            >
              {(fields || []).map((f, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-[10px] font-bold uppercase" style={{ color: currentTheme.mutedText }}>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      placeholder={f.placeholder}
                      required
                      className="w-full p-2.5 border rounded-xl text-xs focus:outline-none"
                      style={{ backgroundColor: currentTheme.inputBg, borderColor: currentTheme.inputBorder, color: currentTheme.text }}
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      required
                      className="w-full p-2.5 border rounded-xl text-xs focus:outline-none"
                      style={{ backgroundColor: currentTheme.inputBg, borderColor: currentTheme.inputBorder, color: currentTheme.text }}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: currentTheme.buttonBg, color: currentTheme.buttonText }}
              >
                <Send className="w-3.5 h-3.5" /> {section.submitLabel || 'Confirm Schedule'} &rarr;
              </button>
            </form>
          )}
        </div>
      );

    case 'ServicesGrid':
      const servList = services || [];

      return (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {servList.map((s, idx) => (
              <div key={idx} className="rounded-2xl border overflow-hidden flex flex-col justify-between space-y-3 shadow-xs" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
                {s.imageUrl && (
                  <div className="w-full h-40 overflow-hidden">
                    <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold">{s.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: currentTheme.surface, color: currentTheme.primaryColor }}>
                      {s.price}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: currentTheme.mutedText }}>{s.description}</p>
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => onCTAClick ? onCTAClick('Book Session') : triggerToast(`Booked service: "${s.title}"`)}
                    className="w-full py-2 rounded-xl text-[10px] font-bold border"
                    style={{ backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.cardBorder }}
                  >
                    Book Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'ItemCatalogGrid':
    case 'FeaturedItemsGrid':
      const filteredItems = (items || []).filter((it) =>
        (it.name || '').toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (it.description || '').toLowerCase().includes(catalogSearch.toLowerCase())
      );

      return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold">{title}</h3>
              <p className="text-[11px]" style={{ color: currentTheme.mutedText }}>Interactive product/service catalog view</p>
            </div>
            {/* Interactive Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5" style={{ color: currentTheme.mutedText }} />
              <input
                type="text"
                placeholder="Search catalog items..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs focus:outline-none"
                style={{ backgroundColor: currentTheme.inputBg, borderColor: currentTheme.inputBorder, color: currentTheme.text }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id || item.name} className="rounded-2xl border space-y-3 flex flex-col justify-between shadow-sm overflow-hidden" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                {item.imageUrl && (
                  <div className="w-full h-44 overflow-hidden border-b" style={{ borderColor: currentTheme.cardBorder }}>
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  </div>
                )}
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">{item.name}</span>
                    {item.badge && (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded" style={{ backgroundColor: currentTheme.surface, color: currentTheme.primaryColor }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: currentTheme.mutedText }}>{item.description}</p>
                </div>
                <div className="p-4 pt-0 border-t flex items-center justify-between" style={{ borderColor: currentTheme.cardBorder }}>
                  <span className="text-xs font-extrabold" style={{ color: currentTheme.primaryColor }}>{item.price}</span>
                  {item.hasPaymentButton ? (
                    <button
                      onClick={() => triggerToast(`Added "${item.name}" to order!`)}
                      className="px-3.5 py-1.5 rounded-lg font-bold text-[10px]"
                      style={{ backgroundColor: currentTheme.buttonBg, color: currentTheme.buttonText }}
                    >
                      Buy Now
                    </button>
                  ) : (
                    <button
                      onClick={() => onCTAClick ? onCTAClick(website.ctaRequirements?.primaryCTA || 'View Item') : triggerToast(`Selected item: "${item.name}"`)}
                      className="px-3.5 py-1.5 rounded-lg font-bold text-[10px] border"
                      style={{ backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.cardBorder }}
                    >
                      {website.ctaRequirements?.primaryCTA || 'View Details'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'ComparisonTable':
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="overflow-x-auto rounded-2xl border bg-slate-900" style={{ borderColor: currentTheme.cardBorder }}>
            <table className="w-full text-left text-xs">
              <thead className="font-extrabold border-b" style={{ backgroundColor: currentTheme.tableHeaderBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
                <tr>
                  {(columns || []).map((col, idx) => (
                    <th key={idx} className="p-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
                {(rows || []).map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: currentTheme.cardBg }}>
                    <td className="p-3 font-bold">{row.feature}</td>
                    <td className="p-3">{row.a || row.starter || '✓'}</td>
                    <td className="p-3 font-extrabold" style={{ color: currentTheme.primaryColor }}>{row.b || row.pro || '✓'}</td>
                    <td className="p-3 font-extrabold" style={{ color: currentTheme.primaryColor }}>{row.c || row.deluxe || '✓'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'GuideAccordion':
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="space-y-2">
            {(items || []).map((faq, idx) => (
              <div key={idx} className="rounded-2xl border overflow-hidden shadow-sm" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}>
                <button
                  onClick={() => setExpandedAccordion(expandedAccordion === idx ? -1 : idx)}
                  className="w-full p-3 text-left font-bold text-xs flex items-center justify-between transition-colors"
                  style={{ color: currentTheme.text }}
                >
                  <span>{faq.question}</span>
                  {expandedAccordion === idx ? <ChevronUp className="w-4 h-4" style={{ color: currentTheme.primaryColor }} /> : <ChevronDown className="w-4 h-4" style={{ color: currentTheme.mutedText }} />}
                </button>
                {expandedAccordion === idx && (
                  <div className="p-3 pt-0 text-[11px] border-t leading-relaxed" style={{ borderColor: currentTheme.cardBorder, backgroundColor: currentTheme.surface, color: currentTheme.mutedText }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'ContactInquiryForm':
    case 'CustomOrderForm':
      return (
        <div className="p-6 rounded-3xl border space-y-4 shadow-sm" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <h3 className="text-sm font-extrabold">{title}</h3>
          {formSubmitted === section.id ? (
            <div className="p-4 rounded-2xl border text-xs font-bold text-center space-y-1" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.cardBorder, color: currentTheme.primaryColor }}>
              <CheckCircle2 className="w-5 h-5 mx-auto" style={{ color: currentTheme.primaryColor }} />
              <p>Thank you! Your submission has been received.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFormSubmitted(section.id);
                triggerToast('Form submitted successfully!');
              }}
              className="space-y-3"
            >
              {(fields || []).map((f, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-[10px] font-bold uppercase" style={{ color: currentTheme.mutedText }}>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      placeholder={f.placeholder}
                      required
                      className="w-full p-2.5 border rounded-xl text-xs focus:outline-none"
                      style={{ backgroundColor: currentTheme.inputBg, borderColor: currentTheme.inputBorder, color: currentTheme.text }}
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      required
                      className="w-full p-2.5 border rounded-xl text-xs focus:outline-none"
                      style={{ backgroundColor: currentTheme.inputBg, borderColor: currentTheme.inputBorder, color: currentTheme.text }}
                    />
                  )}
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-lg"
                  style={{ backgroundColor: currentTheme.buttonBg, color: currentTheme.buttonText }}
                >
                  <Send className="w-3.5 h-3.5" /> {section.submitLabel || 'Submit'}
                </button>
                {section.hasWhatsAppButton && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast('Opening WhatsApp chat...');
                      try {
                        window.open('https://wa.me/?text=Hello', '_blank', 'noopener,noreferrer');
                      } catch (e) {
                        console.warn('WhatsApp external navigation blocked by browser environment:', e.message);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 border"
                    style={{ backgroundColor: '#059669', color: '#FFFFFF' }}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat on WhatsApp
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      );

    case 'LocationHoursCard':
      return (
        <div className="p-5 rounded-3xl border space-y-3 text-xs shadow-sm" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase block" style={{ color: currentTheme.mutedText }}>Address</span>
              <p className="font-medium">{address}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase block" style={{ color: currentTheme.mutedText }}>Operating Hours</span>
              <p className="font-medium" style={{ color: currentTheme.primaryColor }}>{operatingHours}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase block" style={{ color: currentTheme.mutedText }}>Phone Contact</span>
              <p className="font-mono">{phone}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase block" style={{ color: currentTheme.mutedText }}>Email Address</span>
              <p className="font-mono">{email}</p>
            </div>
          </div>
        </div>
      );

    case 'CallToActionBanner':
      return (
        <div className="p-6 rounded-3xl border text-center space-y-3 shadow-md" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <h3 className="text-base font-extrabold">{headline || title}</h3>
          <p className="text-xs" style={{ color: currentTheme.mutedText }}>{subheadline}</p>
          <button
            onClick={() => onCTAClick ? onCTAClick(actionLabel || 'Contact Us Now') : triggerToast(`Triggered Call To Action: "${actionLabel}"`)}
            className="px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-lg"
            style={{ backgroundColor: currentTheme.buttonBg, color: currentTheme.buttonText }}
          >
            {actionLabel || 'Contact Us Now'} &rarr;
          </button>
        </div>
      );

    case 'StatsCounter':
      const statList = section.stats || [];
      return (
        <div className="p-6 rounded-3xl border shadow-xs text-center space-y-4" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.mutedText }}>{title}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statList.map((st, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black block" style={{ color: currentTheme.primaryColor }}>{st.value}</span>
                <span className="text-[11px] font-medium block" style={{ color: currentTheme.mutedText }}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'AmenitiesGrid':
      const amenityList = section.amenities || [];
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {amenityList.map((am, idx) => (
              <div key={idx} className="p-4 rounded-2xl border space-y-2 shadow-xs" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs" style={{ backgroundColor: currentTheme.surface, color: currentTheme.primaryColor }}>
                  ✨
                </div>
                <h4 className="text-xs font-extrabold">{am.name}</h4>
                <p className="text-[11px] leading-relaxed" style={{ color: currentTheme.mutedText }}>{am.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'ContentSectionCard':
      return (
        <div className="p-6 sm:p-8 rounded-3xl border space-y-3 shadow-xs" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <h3 className="text-base sm:text-lg font-extrabold" style={{ color: currentTheme.text }}>{section.headline || title}</h3>
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line" style={{ color: currentTheme.mutedText }}>{section.body}</p>
        </div>
      );

    case 'PropertyGrid':
      const propList = section.properties || [];
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {propList.map((prop, idx) => (
              <div key={idx} className="rounded-2xl border overflow-hidden flex flex-col justify-between space-y-3 shadow-xs" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
                {prop.imageUrl && (
                  <div className="w-full h-44 overflow-hidden border-b" style={{ borderColor: currentTheme.cardBorder }}>
                    <img src={prop.imageUrl} alt={prop.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  </div>
                )}
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">{prop.name}</span>
                    {prop.badge && <span className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: currentTheme.surface, color: currentTheme.primaryColor }}>{prop.badge}</span>}
                  </div>
                  <p className="text-[11px]" style={{ color: currentTheme.mutedText }}>{prop.description}</p>
                </div>
                <div className="p-4 pt-0 border-t flex items-center justify-between" style={{ borderColor: currentTheme.cardBorder }}>
                  <span className="text-xs font-extrabold" style={{ color: currentTheme.primaryColor }}>{prop.priceDisplay || 'Contact for pricing'}</span>
                  <button onClick={() => onCTAClick ? onCTAClick('Contact an Agent') : triggerToast(`Inquired about "${prop.name}"`)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold border" style={{ backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.cardBorder }}>
                    Enquire &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'TeamGrid':
      const memberList = section.members || [];
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {memberList.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl border space-y-3 text-center shadow-xs overflow-hidden" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
                {m.imageUrl ? (
                  <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 shadow-xs" style={{ borderColor: currentTheme.primaryColor }}>
                    <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold text-sm" style={{ backgroundColor: currentTheme.surface, color: currentTheme.primaryColor }}>
                    {m.name?.[0] || 'T'}
                  </div>
                )}
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold">{m.name}</h4>
                  <span className="text-[10px] font-medium block" style={{ color: currentTheme.primaryColor }}>{m.role}</span>
                </div>
                <p className="text-[11px]" style={{ color: currentTheme.mutedText }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'TimelineSection':
      const eventList = section.events || [];
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold">{title}</h3>
          <div className="space-y-3 border-l-2 pl-4" style={{ borderColor: currentTheme.primaryColor }}>
            {eventList.map((ev, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-xs font-mono font-black" style={{ color: currentTheme.primaryColor }}>{ev.year}</span>
                <h4 className="text-xs font-extrabold">{ev.title}</h4>
                <p className="text-[11px]" style={{ color: currentTheme.mutedText }}>{ev.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'NewsletterSignup':
      return (
        <div className="p-6 rounded-3xl border text-center space-y-3 w-full max-w-4xl mx-auto shadow-sm" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <h3 className="text-sm font-extrabold">{section.headline || title}</h3>
          <p className="text-xs" style={{ color: currentTheme.mutedText }}>{section.subheadline || 'Stay informed with our latest news and updates.'}</p>
          <form onSubmit={(e) => { e.preventDefault(); triggerToast('Subscribed to newsletter!'); }} className="flex items-center gap-2 max-w-md mx-auto pt-1">
            <input type="email" placeholder="Enter your email" required className="flex-1 p-2.5 border rounded-xl text-xs focus:outline-none" style={{ backgroundColor: currentTheme.inputBg, borderColor: currentTheme.inputBorder, color: currentTheme.text }} />
            <button type="submit" className="px-4 py-2.5 rounded-xl font-extrabold text-xs shrink-0" style={{ backgroundColor: currentTheme.buttonBg, color: currentTheme.buttonText }}>
              {section.submitLabel || 'Subscribe'}
            </button>
          </form>
        </div>
      );

    default:
      return (
        <div className="p-5 rounded-2xl border space-y-2" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder, color: currentTheme.text }}>
          <h3 className="text-xs font-extrabold">{title}</h3>
          <p className="text-[11px]" style={{ color: currentTheme.mutedText }}>{section.purpose || 'Section content placeholder.'}</p>
        </div>
      );
  }
}
