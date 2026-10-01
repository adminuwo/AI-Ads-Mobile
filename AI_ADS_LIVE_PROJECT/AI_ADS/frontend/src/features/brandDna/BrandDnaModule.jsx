import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { brandAPI } from '../../services/api';
import { normalizeBrandDna, getProvenanceBadgeInfo } from '../../utils/normalizeBrandDna';
import {
  Dna, Globe, CheckCircle2, Save, RefreshCw, Sparkles, Loader2, Search,
  AlertCircle, ShieldCheck, Target, MessageSquare, Zap, Layers,
  Compass, AlertTriangle, FileText, BarChart2, Palette, Copy, Check, Edit3, Upload, ImageIcon,
  Maximize2, X, Download, ExternalLink
} from 'lucide-react';

const ProvenanceBadge = ({ provenanceObj }) => {
  return null;
};

export const BrandDnaModule = () => {
  const { activeWorkspace, updateWorkspace, setActiveModule, setIsScraperOpen, openScraperModal, setBrandDnaData, t } = useWorkspace();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [regenerating, setRegenerating] = useState(null);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');
  const [copiedColor, setCopiedColor] = useState(null);
  const [editState, setEditState] = useState({});
  const [colorDrafts, setColorDrafts] = useState(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [showLogoInput, setShowLogoInput] = useState(false);
  const [showLogoPreviewModal, setShowLogoPreviewModal] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState('');
  const [modalImgIndex, setModalImgIndex] = useState(0);
  const logoFileInputRef = useRef(null);

  const handleFieldChangeLocal = (fieldKey, newValue) => {
    const current = profile || effectiveProfile || {};
    let updatedValue = newValue;

    if (fieldKey === 'targetAudience' || fieldKey === 'coreProductsServices') {
      if (typeof newValue === 'string') {
        updatedValue = newValue.split('\n');
      }
    }

    const updatedProfile = {
      ...current,
      workspaceId: workspaceId || current.workspaceId,
      [fieldKey]: updatedValue,
      structuredIdentity: {
        ...(current.structuredIdentity || {}),
        ...(fieldKey === 'brandColors' ? { color_palette: updatedValue } : {})
      }
    };

    setProfile(updatedProfile);
  };

  const toggleEdit = async (fieldKey) => {
    const isClosing = editState[fieldKey];

    if (isClosing && workspaceId && effectiveProfile) {
      const currentVal = effectiveProfile[fieldKey];
      let sanitizedVal = currentVal;

      if (fieldKey === 'targetAudience' || fieldKey === 'coreProductsServices') {
        if (Array.isArray(currentVal)) {
          sanitizedVal = currentVal.map(s => typeof s === 'string' ? s.trim() : s).filter(Boolean);
        }
      }

      await updateProfileField(fieldKey, sanitizedVal);
    }

    // Reset logo upload UI when closing identity edit
    if (fieldKey === 'identity' && editState['identity']) {
      setShowLogoInput(false);
      setLogoUrlInput('');
    }

    setEditState(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const toggleEditBrandColors = async () => {
    if (!editState['brandColors']) {
      const current = [...brandColorsList];
      while (current.length < 4) {
        current.push(current.length === 0 ? '#3B82F6' : current.length === 1 ? '#1E40AF' : current.length === 2 ? '#60A5FA' : '#0F172A');
      }
      setColorDrafts(current.slice(0, 4));
    } else {
      if (colorDrafts) {
        const cleaned = colorDrafts.map(c => typeof c === 'string' ? c.trim() : '').filter(c => c.length > 0);
        await updateProfileField('brandColors', cleaned);
      }
      setColorDrafts(null);
    }
    setEditState(prev => ({ ...prev, brandColors: !prev['brandColors'] }));
  };

  const handleColorDraftChange = (index, newValue) => {
    const nextDrafts = colorDrafts ? [...colorDrafts] : [...brandColorsList];
    while (nextDrafts.length < 4) {
      nextDrafts.push('#000000');
    }
    nextDrafts[index] = newValue;
    setColorDrafts(nextDrafts);
  };

  const updateProfileField = async (fieldKey, newValue) => {
    if (!workspaceId) return;
    const current = profile || effectiveProfile || {};
    let updatedValue = newValue;

    if (fieldKey === 'targetAudience' || fieldKey === 'coreProductsServices') {
      if (typeof newValue === 'string') {
        updatedValue = newValue.split('\n').map(s => s.trim()).filter(Boolean);
      }
    }

    const updatedProfile = {
      ...current,
      workspaceId,
      [fieldKey]: updatedValue,
      structuredIdentity: {
        ...(current.structuredIdentity || {}),
        ...(fieldKey === 'brandColors' ? { color_palette: updatedValue } : {})
      }
    };

    setProfile(updatedProfile);

    try {
      await brandAPI.updateProfile(workspaceId, updatedProfile);
      if (updateWorkspace) {
        await updateWorkspace(workspaceId, updatedProfile);
      }
    } catch (err) {
      console.error('Failed to save Brand Profile field change:', err);
    }
  };

  const handleCopyColor = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Editable fields
  const [websiteUrl, setWebsiteUrl] = useState(activeWorkspace?.domainUrl || '');
  const [manualDesc, setManualDesc] = useState('');

  const workspaceId = activeWorkspace?._id || activeWorkspace?.id;

  const isBrandExist = Boolean(
    activeWorkspace &&
    activeWorkspace.id !== 'ws_empty' &&
    activeWorkspace._id !== 'ws_empty' &&
    activeWorkspace.brandName &&
    activeWorkspace.brandName !== 'No Brand Loaded'
  );

  const loadBrandProfile = useCallback(async () => {
    if (!workspaceId || workspaceId === 'ws_empty') {
      setLoading(false);
      return;
    }
    if (!isBrandExist) {
      setLoading(true);
    }
    setError('');
    try {
      const result = await brandAPI.getProfile(workspaceId);
      if (result && result.profile) {
        setProfile(prev => ({
          ...(isBrandExist ? activeWorkspace : {}),
          ...result.profile
        }));
      }
    } catch (err) {
      console.log('No brand profile found yet:', err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, isBrandExist, activeWorkspace]);

  useEffect(() => {
    if (isBrandExist) {
      setProfile(activeWorkspace);
    } else {
      setProfile(null);
    }
    loadBrandProfile();
    setWebsiteUrl(activeWorkspace?.domainUrl || '');
  }, [loadBrandProfile, activeWorkspace, isBrandExist]);

  const handleRunAiAnalysis = async () => {
    const targetUrl = websiteUrl || activeWorkspace?.domainUrl || '';
    const targetName = activeWorkspace?.brandName || 'your brand';

    if (!workspaceId) {
      if (openScraperModal) openScraperModal('ACTIVE_BRAND');
      return;
    }

    setAnalyzing(true);
    setError('');
    setSavedMsg(`⚡ Scraping live brand website (${targetUrl || targetName}) in detail...`);

    try {
      const result = await brandAPI.analyze({
        workspaceId,
        websiteUrl: targetUrl,
        companyName: activeWorkspace?.brandName || '',
        manualDescription: manualDesc,
      });

      if (result && result.profile) {
        setProfile(result.profile);
        setSavedMsg(`✨ Deep AI Brand Intelligence re-scraped and updated for ${targetName}!`);
        setTimeout(() => setSavedMsg(''), 5000);

        // Update workspace context
        if (updateWorkspace && result.profile?.structuredIdentity) {
          const id = result.profile.structuredIdentity;
          updateWorkspace(workspaceId, {
            brandVoiceTone: id.tone,
            targetAudience: id.target_audience,
            contentPillars: id.content_angles,
            brandColors: id.color_palette,
          });
        }
      }
    } catch (err) {
      console.error('Deep AI Brand Analysis error:', err);
      setError(err.message || 'Brand AI re-scraping analysis failed.');
      setSavedMsg('');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRegenerateSection = async (section) => {
    setRegenerating(section);
    try {
      const result = await brandAPI.regenerateSection({ workspaceId, section });
      setProfile((prev) => ({
        ...prev,
        [section]: result.data,
      }));
      setSavedMsg(`✅ Regenerated ${section} with AI`);
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(null);
    }
  };

  // Check if profile from API matches currently active workspace
  const isProfileMatching = profile && (
    profile.workspaceId === workspaceId ||
    profile.workspaceId === activeWorkspace?._id ||
    profile.workspaceId === activeWorkspace?.id ||
    profile._id === workspaceId ||
    profile.id === workspaceId ||
    profile.companyName?.toLowerCase() === activeWorkspace?.brandName?.toLowerCase() ||
    profile.brandName?.toLowerCase() === activeWorkspace?.brandName?.toLowerCase()
  );

  const matchedProfile = isProfileMatching ? profile : null;

  // Single-Ownership Source of Truth: BrandProfile (GET /api/brand/:workspaceId) merged with activeWorkspace
  const rawSource = matchedProfile || profile || (isBrandExist ? activeWorkspace : null);
  const canonicalSource = isBrandExist
    ? { ...activeWorkspace, ...(rawSource || {}) }
    : rawSource;

  const normalizedDna = canonicalSource ? normalizeBrandDna(canonicalSource) : null;
  const effectiveProfile = normalizedDna ? {
    ...normalizedDna,
    companyName: normalizedDna.companyName || activeWorkspace?.brandName || 'Brand Workspace',
    brandName: normalizedDna.brandName || activeWorkspace?.brandName || 'Brand Workspace',
    website: normalizedDna.domainUrl || activeWorkspace?.domainUrl || '',
    aiConfidence: normalizedDna.confidenceScore || 85,
    industryCategory: normalizedDna.industryCategory || activeWorkspace?.industryCategory || null,
    headquarters: normalizedDna.headquarters || activeWorkspace?.headquarters || activeWorkspace?.contactInfo?.location || null,
    tagline: normalizedDna.tagline || activeWorkspace?.tagline || null,
    missionStatement: normalizedDna.missionStatement || activeWorkspace?.missionStatement || null,
    vision: normalizedDna.vision || activeWorkspace?.vision || null,
    targetAudience: (normalizedDna.targetAudience && normalizedDna.targetAudience.length > 0) ? normalizedDna.targetAudience : (Array.isArray(activeWorkspace?.targetAudience) ? activeWorkspace.targetAudience : []),
    coreProductsServices: (normalizedDna.coreProductsServices && normalizedDna.coreProductsServices.length > 0) ? normalizedDna.coreProductsServices : (Array.isArray(activeWorkspace?.coreProductsServices) ? activeWorkspace.coreProductsServices : []),
    brandColors: (normalizedDna.brandColors && normalizedDna.brandColors.length > 0) ? normalizedDna.brandColors : (Array.isArray(activeWorkspace?.brandColors) && activeWorkspace.brandColors.length > 0 ? activeWorkspace.brandColors : ['#C13D4A', '#49171C', '#DF9AA1', '#0F172A'])
  } : null;

  useEffect(() => {
    if (showLogoPreviewModal && effectiveProfile) {
      const rawDom = (effectiveProfile.website || activeWorkspace?.domainUrl || effectiveProfile.companyName || 'google.com');
      const cleanDom = rawDom.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('?')[0];

      const candidates = [];
      if (effectiveProfile.logoUrl && !effectiveProfile.logoUrl.includes('picsum.photos')) {
        candidates.push(effectiveProfile.logoUrl);
      }
      candidates.push(`https://logo.clearbit.com/${cleanDom}`);
      candidates.push(`https://www.google.com/s2/favicons?domain=${cleanDom}&sz=256`);

      setModalImgSrc(candidates[0]);
      setModalImgIndex(0);
    }
  }, [showLogoPreviewModal, effectiveProfile]);

  const handleModalImgError = () => {
    if (!effectiveProfile) return;
    const rawDom = (effectiveProfile.website || activeWorkspace?.domainUrl || effectiveProfile.companyName || 'google.com');
    const cleanDom = rawDom.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('?')[0];

    const fallbackList = [
      `https://logo.clearbit.com/${cleanDom}`,
      `https://www.google.com/s2/favicons?domain=${cleanDom}&sz=256`,
      `https://www.google.com/s2/favicons?domain=${cleanDom}&sz=128`
    ];

    const nextIndex = modalImgIndex + 1;
    if (nextIndex < fallbackList.length) {
      setModalImgIndex(nextIndex);
      setModalImgSrc(fallbackList[nextIndex]);
    }
  };

  const handleSaveProfile = async () => {
    if (!workspaceId || !effectiveProfile) return;
    try {
      const cleanColor = (c) => typeof c === 'string' ? c : (c?.hex || c?.color);
      const sanitizedProfile = {
        ...effectiveProfile,
        brandColors: (effectiveProfile.brandColors || []).map(cleanColor).filter(Boolean)
      };
      if (updateWorkspace) {
        await updateWorkspace(workspaceId, sanitizedProfile);
      } else {
        await brandAPI.updateProfile(workspaceId, sanitizedProfile);
      }
      setSavedMsg('💾 Brand Profile saved! Redirecting to SEO Setup...');

      // First navigate to SEO (then SEO will redirect to Strategy)
      setTimeout(() => {
        setSavedMsg('');
        if (setActiveModule) {
          setActiveModule('seo');
        }
      }, 600);
    } catch (err) {
      setError(err.message || 'Failed to save Brand Profile');
    }
  };

  const brandColorsList = (effectiveProfile?.brandColors || []).map(c => typeof c === 'string' ? c : (c?.hex || c?.color)).filter(Boolean);

  // ── No Brand Gate ──────────────────────────────────────────────────────────
  const noBrand =
    !activeWorkspace ||
    activeWorkspace.id === 'ws_empty' ||
    activeWorkspace._id === 'ws_empty' ||
    !isBrandExist;

  if (noBrand) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        {/* Glowing DNA Icon */}
        <div className="relative mb-8">
          <div
            style={{ background: 'radial-gradient(circle, var(--brand-glow, rgba(99,102,241,0.35)) 0%, transparent 70%)' }}
            className="absolute inset-0 scale-150 rounded-full animate-pulse"
          />
          <div
            className="relative flex items-center justify-center w-24 h-24 rounded-3xl shadow-xl"
            style={{ background: 'linear-gradient(135deg, var(--brand-from, var(--brand-600, #6B5AED)), var(--brand-to, var(--brand-500, #7B61FF)))' }}
          >
            <Dna className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 text-center">
          Start Your Brand Journey
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-10 text-base leading-relaxed">
          Build your{' '}
          <span className="text-brand-600 dark:text-brand-400 font-semibold">Brand DNA</span>{' '}
          in under 60 seconds. Let AI ADS™ analyze your brand and generate an immutable memory
          that powers every module — strategy, SEO, content, and more.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
          {/* Enter URL */}
          <button
            onClick={() => openScraperModal('NEW_BRAND')}
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800/60 hover:border-brand-500/50 dark:hover:border-brand-500/50
                       hover:bg-brand-500/5 dark:hover:bg-brand-500/10 transition-all duration-200 text-left cursor-pointer shadow-sm hover:shadow-lg"
          >
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500/10
                             text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{t('enterBrandUrl', 'Enter Brand URL')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                {t('enterBrandUrlDesc', 'AI scrapes your website and builds Brand DNA automatically.')}
              </p>
            </div>
          </button>

          {/* Activate existing brand */}
          <button
            onClick={() => openScraperModal('NEW_BRAND')}
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800/60 hover:border-brand-500/50 dark:hover:border-brand-500/50
                       hover:bg-brand-500/5 dark:hover:bg-brand-500/10 transition-all duration-200 text-left cursor-pointer shadow-sm hover:shadow-lg"
          >
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500/10
                             text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{t('activateYourBrand', 'Activate Your Brand')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                {t('activateBrandDesc', 'Select and activate an existing brand from your workspace list.')}
              </p>
            </div>
          </button>

          {/* Upload PDF */}
          <button
            onClick={() => openScraperModal('NEW_BRAND')}
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800/60 hover:border-brand-500/50 dark:hover:border-brand-500/50
                       hover:bg-brand-500/5 dark:hover:bg-brand-500/10 transition-all duration-200 text-left cursor-pointer shadow-sm hover:shadow-lg"
          >
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500/10
                             text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{t('uploadBrandPdf', 'Upload Brand PDF')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                {t('uploadPdfDesc', 'Upload a brand guide or deck — AI extracts your identity.')}
              </p>
            </div>
          </button>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => openScraperModal('NEW_BRAND')}
          className="btn-primary flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
        >
          <Zap className="w-4 h-4" />
          Start Your Brand Journey Now
          <Compass className="w-4 h-4" />
        </button>

        <p className="mt-5 text-xs text-slate-400 dark:text-slate-600">
          Takes less than 60 seconds · Powered by AI ADS™ Intelligence Engine
        </p>
      </div>
    );
  }
  // ── End No Brand Gate ──────────────────────────────────────────────────────

  return (
    <div className="space-y-5 animate-in fade-in w-full max-w-[1600px] mx-auto px-1 sm:px-4 pt-1 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
              <Dna className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('brandDnaTitle', 'Brand Intelligence & Brand DNA')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold sm:pl-13">
            {t('Immutable brand memory governing voice, positioning, and content rules for')}{' '}
            <strong className="text-purple-600 dark:text-purple-400 font-black px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 rounded-md">
              {activeWorkspace?.brandName || t('yourBrand', 'your brand')}
            </strong>.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto shrink-0 z-10">
          <button
            onClick={handleRunAiAnalysis}
            disabled={analyzing}
            className="px-6 py-3 rounded-full text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            style={{ background: 'linear-gradient(to right, var(--brand-from), var(--brand-to))', boxShadow: '0 4px 20px rgba(var(--brand-500-rgb), 0.35)' }}
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0" />}
            <span>{analyzing ? t('reScrapingIntelligence', 'Re-Scraping Intelligence...') : t('runDeepAiAnalysis', 'Run Deep AI Analysis')}</span>
          </button>
          {effectiveProfile && (
            <button
              onClick={handleSaveProfile}
              className="px-6 py-3 rounded-full text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer whitespace-nowrap hover:opacity-90"
              style={{ background: 'linear-gradient(to right, var(--brand-from), var(--brand-to))', boxShadow: '0 4px 20px rgba(var(--brand-500-rgb), 0.35)' }}
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>{t('Save Profile')}</span>
            </button>
          )}
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold animate-in fade-in flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          {savedMsg}
        </div>
      )}

      {/* Input bar for URL / Description ONLY if no brand/workspace exists */}
      {!isBrandExist && !effectiveProfile && !loading && (
        <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4 shadow-md">
          <h2 className="text-sm font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">{t("Initialize Brand AI Analysis", "Initialize Brand AI Analysis")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t("Website URL", "Website URL")}</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourbrand.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t("Brand Overview / Description (optional)", "Brand Overview / Description (optional)")}</label>
              <input
                type="text"
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                placeholder={t("Describe what your brand does, key products, target audience...", "Describe what your brand does, key products, target audience...")}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>
          </div>
          <button
            onClick={handleRunAiAnalysis}
            disabled={analyzing}
            className="px-6 py-3 rounded-full text-white font-extrabold text-xs flex items-center gap-2 disabled:opacity-60 shadow-md hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(to right, var(--brand-from), var(--brand-to))' }}
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? 'Scraping & Analyzing...' : 'Analyze Brand with AI'}
          </button>
        </div>
      )}

      {/* Main Profile View */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        </div>
      ) : effectiveProfile ? (
        <div className="space-y-5">

          {/* TOP SECTION: 2-Column Side-by-Side Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* LEFT COLUMN: Brand Identity & Color Palette */}
            <div className="space-y-4 w-full">
              {/* Brand Identity Card */}
              <div className="w-full">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-400 flex flex-col justify-start space-y-2 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                    <Globe className="w-3 h-3" />
                  </div>
                  {t('brandIdentity', 'Brand Identity')}
                </h2>
                <button
                  type="button"
                  onClick={() => toggleEdit('identity')}
                  className="p-1 rounded-md text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px] font-bold"
                  title="Edit Brand Identity"
                >
                  {editState['identity'] ? <Check className="w-3.5 h-3.5 text-emerald-500 font-bold" /> : <Edit3 className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>

              {/* Hidden file input for logo upload */}
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const base64 = ev.target.result;
                    handleFieldChangeLocal('logoUrl', base64);
                    await updateProfileField('logoUrl', base64);
                    setShowLogoInput(false);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />

              <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 h-full shadow-2xs">
                <div className="flex items-center gap-2.5">
                  {/* Logo */}
                  <div 
                    className="relative shrink-0 group cursor-pointer"
                    onClick={() => setShowLogoPreviewModal(true)}
                    title="Click to view brand logo clearly"
                  >
                    <div className="p-0.5 rounded-xl bg-slate-200 dark:bg-slate-700 shadow-xs hover:scale-105 transition-transform duration-200">
                      <img
                        src={
                          (effectiveProfile.logoUrl && !effectiveProfile.logoUrl.includes('picsum.photos'))
                            ? effectiveProfile.logoUrl
                            : `https://www.google.com/s2/favicons?domain=${(effectiveProfile.website || activeWorkspace?.domainUrl || 'google.com').replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}&sz=128`
                        }
                        alt={effectiveProfile.companyName}
                        className="w-10 h-10 rounded-lg bg-white p-0.5 object-contain"
                        onError={(e) => {
                          const dom = (effectiveProfile.website || activeWorkspace?.domainUrl || 'google.com').replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
                          e.target.src = `https://www.google.com/s2/favicons?domain=${dom}&sz=128`;
                        }}
                      />
                    </div>
                    {/* Hover Zoom overlay when NOT editing */}
                    {!editState['identity'] && (
                      <div className="absolute inset-0 w-full h-full rounded-xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-md" />
                      </div>
                    )}
                    {/* Upload overlay when editing */}
                    {editState['identity'] && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLogoInput(prev => !prev);
                        }}
                        title="Change logo"
                        className="absolute inset-0 w-full h-full rounded-xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                      >
                        <Upload className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {editState['identity'] ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={effectiveProfile.companyName || ''}
                          onChange={(e) => handleFieldChangeLocal('companyName', e.target.value)}
                          placeholder="Company Name..."
                          className="w-full text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-purple-500/50 rounded-md px-2 py-0.5 outline-none"
                        />
                        <input
                          type="text"
                          value={effectiveProfile.website || ''}
                          onChange={(e) => handleFieldChangeLocal('website', e.target.value)}
                          placeholder="Website URL..."
                          className="w-full text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800 border border-purple-500/50 rounded-md px-2 py-0.5 outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-black text-slate-900 dark:text-white text-sm break-words tracking-tight">{effectiveProfile.companyName}</h3>
                        {effectiveProfile.website && (
                          <a href={effectiveProfile.website} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline break-all mt-0.5">
                            <Globe className="w-3 h-3 shrink-0" /> {effectiveProfile.website}
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Logo Upload Panel */}
                {editState['identity'] && showLogoInput && (
                  <div className="mt-1 p-2 rounded-xl border border-dashed border-purple-400/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
                    <p className="text-[9.5px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wide flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Upload or paste logo
                    </p>
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold transition-all"
                    >
                      <Upload className="w-3 h-3" /> Upload from device
                    </button>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={logoUrlInput}
                        onChange={(e) => setLogoUrlInput(e.target.value)}
                        placeholder="Paste image URL..."
                        className="flex-1 text-[11px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:border-purple-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!logoUrlInput.trim()) return;
                          handleFieldChangeLocal('logoUrl', logoUrlInput.trim());
                          await updateProfileField('logoUrl', logoUrlInput.trim());
                          setLogoUrlInput('');
                          setShowLogoInput(false);
                        }}
                        className="px-2.5 py-1 text-white text-[11px] font-bold rounded-lg hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(to right, var(--brand-from), var(--brand-to))' }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Theme Color Palette Card */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-purple-400 flex flex-col justify-start space-y-1.5 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                  <Palette className="w-3 h-3" />
                </div>
                {t('colorPalette', 'Theme Color Palette')}
              </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                    {brandColorsList.length} Fetched
                  </span>
                  <button
                    type="button"
                    onClick={toggleEditBrandColors}
                    className="p-1 rounded-md text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px] font-bold"
                    title="Edit Brand Colors"
                  >
                    {editState['brandColors'] ? <Check className="w-3.5 h-3.5 text-emerald-500 font-bold" /> : <Edit3 className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2 w-full">
                {(() => {
                  const isEditingColors = editState['brandColors'];
                  const rawList = isEditingColors && colorDrafts ? colorDrafts : (brandColorsList.length > 0 ? brandColorsList : ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#06B6D4']);
                  
                  const vibrantFallbackGradients = [
                    'from-slate-700 to-slate-900',
                    'from-slate-700 to-slate-900',
                    'from-slate-700 to-slate-900',
                    'from-slate-700 to-slate-900',
                    'from-slate-700 to-slate-900',
                    'from-slate-700 to-slate-900'
                  ];

                  return rawList.map((hex, idx) => {
                    const colorLabel = idx === 0 ? 'Primary' : idx === 1 ? 'Secondary' : idx === 2 ? 'Accent' : idx === 3 ? 'Neutral' : `Color #${idx + 1}`;
                    const isCopied = copiedColor === hex;
                    const fallbackGrad = vibrantFallbackGradients[idx % vibrantFallbackGradients.length];

                    return (
                      <div
                        key={idx}
                        className="group relative flex flex-col items-center p-1 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-400/60 transition-all text-center w-full min-w-0 shadow-2xs hover:shadow-sm"
                      >
                        <div
                          className={`w-full h-6 rounded-md mb-0.5 shadow-2xs border border-black/10 dark:border-white/10 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105 cursor-pointer ${
                            !hex ? `bg-gradient-to-r ${fallbackGrad}` : ''
                          }`}
                          style={hex ? { backgroundColor: hex } : {}}
                          onClick={() => !isEditingColors && handleCopyColor(hex)}
                        >
                          {isEditingColors ? (
                            <input
                              type="color"
                              value={typeof hex === 'string' && hex.startsWith('#') && hex.length === 7 ? hex : '#3B82F6'}
                              onChange={(e) => handleColorDraftChange(idx, e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              title="Click to choose custom color"
                            />
                          ) : (
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white rounded px-1 py-0.2 text-[7.5px] font-black backdrop-blur-xs flex items-center gap-0.5 shadow-xs">
                              {isCopied ? <Check className="w-2 h-2 text-emerald-400" /> : <Copy className="w-2 h-2" />}
                              {isCopied ? 'Copied' : 'Copy'}
                            </span>
                          )}
                        </div>

                        <div className="w-full flex flex-col items-center justify-center gap-0">
                          <span className="text-[7.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight text-center whitespace-nowrap leading-none">
                            {colorLabel}
                          </span>
                          {isEditingColors ? (
                            <input
                              type="text"
                              value={hex ?? ''}
                              onChange={(e) => handleColorDraftChange(idx, e.target.value)}
                              placeholder="#000000"
                              className="w-full text-[8.5px] font-mono font-bold text-center text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-purple-500/50 rounded px-0.5 py-0 outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          ) : (
                            <span className="text-[9.5px] font-mono font-black text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-center whitespace-nowrap leading-none mt-0.5">
                              {hex}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Quick Attributes Bar (2x2 Grid on Right Side) */}
          <div className="w-full h-full flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs w-full h-full min-h-full flex-1">
              {/* Industry */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-cyan-400 flex flex-col justify-between h-full shadow-2xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    {t('Industry', 'Industry')}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleEdit('industryCategory')}
                    className="p-1 rounded text-slate-400 hover:text-purple-600 transition-colors"
                    title="Edit Industry"
                  >
                    {editState['industryCategory'] ? <Check className="w-3.5 h-3.5 text-emerald-500 font-bold" /> : <Edit3 className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex-1 flex items-center mt-1">
                  {editState['industryCategory'] ? (
                    <input
                      type="text"
                      value={effectiveProfile?.industryCategory || ''}
                      onChange={(e) => handleFieldChangeLocal('industryCategory', e.target.value)}
                      placeholder="Enter industry category..."
                      className="w-full text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-purple-500/50 rounded-lg p-1 outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-white text-xs break-words leading-tight block">
                      {effectiveProfile?.industryCategory || <span className="text-slate-400 font-normal italic">Not specified</span>}
                    </span>
                  )}
                </div>
              </div>

              {/* Headquarters / Address */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-400 flex flex-col justify-between h-full shadow-2xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {t("Headquarters / Address", "Headquarters / Address")}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleEdit('headquarters')}
                    className="p-1 rounded text-slate-400 hover:text-purple-600 transition-colors"
                    title={t("Edit Headquarters", "Edit Headquarters")}
                  >
                    {editState['headquarters'] ? <Check className="w-3.5 h-3.5 text-emerald-500 font-bold" /> : <Edit3 className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex-1 flex items-center mt-1">
                  {editState['headquarters'] ? (
                    <input
                      type="text"
                      value={effectiveProfile?.headquarters || ''}
                      onChange={(e) => handleFieldChangeLocal('headquarters', e.target.value)}
                      placeholder="Enter headquarters address..."
                      className="w-full text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-purple-500/50 rounded-lg p-1 outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-white text-xs break-words leading-tight block">
                      {effectiveProfile?.headquarters || <span className="text-slate-400 font-normal italic">{t("Address not found", "Address not found")}</span>}
                    </span>
                  )}
                </div>
              </div>

              {/* Tagline */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-400 flex flex-col justify-between h-full shadow-2xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {t("Tagline / Slogan", "Tagline / Slogan")}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleEdit('tagline')}
                    className="p-1 rounded text-slate-400 hover:text-purple-600 transition-colors"
                    title={t("Edit Tagline", "Edit Tagline")}
                  >
                    {editState['tagline'] ? <Check className="w-3.5 h-3.5 text-emerald-500 font-bold" /> : <Edit3 className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex-1 flex items-center mt-1">
                  {editState['tagline'] ? (
                    <input
                      type="text"
                      value={effectiveProfile?.tagline || ''}
                      onChange={(e) => handleFieldChangeLocal('tagline', e.target.value)}
                      placeholder="Enter tagline / slogan..."
                      className="w-full text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-purple-500/50 rounded-lg p-1 outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-white text-xs break-words leading-tight block">
                      {effectiveProfile?.tagline ? `"${effectiveProfile.tagline}"` : <span className="text-slate-400 font-normal italic">{t("Not Specified", "Not Specified")}</span>}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-orange-400 flex flex-col justify-between h-full shadow-2xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {t("Contact Info", "Contact Info")}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleEdit('contactInfo')}
                    className="p-1 rounded text-slate-400 hover:text-purple-600 transition-colors"
                    title={t("Edit Contact Info", "Edit Contact Info")}
                  >
                    {editState['contactInfo'] ? <Check className="w-3.5 h-3.5 text-emerald-500 font-bold" /> : <Edit3 className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex-1 flex items-center mt-1">
                  {editState['contactInfo'] ? (
                    <input
                      type="text"
                      value={
                        typeof effectiveProfile?.contactInfo === 'string'
                          ? effectiveProfile.contactInfo
                          : (`${effectiveProfile?.contactInfo?.email || ''}${effectiveProfile?.contactInfo?.phone ? ' | Phone: ' + effectiveProfile.contactInfo.phone : ''}`)
                      }
                      onChange={(e) => handleFieldChangeLocal('contactInfo', e.target.value)}
                      placeholder="Enter contact email / phone..."
                      className="w-full text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-purple-500/50 rounded-lg p-1 outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-white text-xs break-words leading-tight block">
                      {typeof effectiveProfile?.contactInfo === 'string'
                        ? (effectiveProfile.contactInfo || <span className="text-slate-400 font-normal italic">{t("Not Specified", "Not Specified")}</span>)
                        : (
                            (effectiveProfile?.contactInfo?.email || effectiveProfile?.contactInfo?.phone)
                              ? `${effectiveProfile?.contactInfo?.email || ''}${effectiveProfile?.contactInfo?.phone ? ' | ' + effectiveProfile.contactInfo.phone : ''}`
                              : <span className="text-slate-400 font-normal italic">{t("Not Specified", "Not Specified")}</span>
                          )
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* ROW 3: Balanced 2-Column Grid for Core DNA Statements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* LEFT COLUMN: Mission & Target Audience */}
            <div className="space-y-5">
              {/* Mission Statement */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-violet-400 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                      <Compass className="w-4 h-4" /></div> {t("Mission Statement", "Mission Statement")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleEdit('missionStatement')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                    title={t("Edit Mission Statement", "Edit Mission Statement")}
                  >
                    {editState['missionStatement'] ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <Edit3 className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                {editState['missionStatement'] ? (
                  <textarea
                    rows={2}
                    value={effectiveProfile?.missionStatement || ''}
                    onChange={(e) => handleFieldChangeLocal('missionStatement', e.target.value)}
                    placeholder="Enter mission statement..."
                    className="w-full text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-purple-500/50 rounded-xl p-3 outline-none leading-relaxed"
                    autoFocus
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-extrabold leading-relaxed italic bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {effectiveProfile?.missionStatement ? `"${effectiveProfile.missionStatement}"` : <span className="text-slate-400 font-normal not-italic">{t("Mission statement not available", "Mission statement not available")}</span>}
                  </p>
                )}
              </div>

              {/* Target Audience Section */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-pink-400 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                      <Target className="w-4 h-4" /></div> {t("Target Audience", "Target Audience")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleEdit('targetAudience')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                    title={t("Edit Target Audience", "Edit Target Audience")}
                  >
                    {editState['targetAudience'] ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <Edit3 className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                {editState['targetAudience'] ? (
                  <textarea
                    rows={4}
                    value={Array.isArray(effectiveProfile?.targetAudience) ? effectiveProfile.targetAudience.join('\n') : (effectiveProfile?.targetAudience || '')}
                    onChange={(e) => handleFieldChangeLocal('targetAudience', e.target.value)}
                    placeholder="Enter target audience segments (one per line)..."
                    className="w-full text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-purple-500/50 rounded-xl p-3 outline-none leading-relaxed"
                    autoFocus
                  />
                ) : Array.isArray(effectiveProfile?.targetAudience) && effectiveProfile.targetAudience.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {effectiveProfile.targetAudience.map((aud, i) => (
                      <div 
                        key={i} 
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-2xs hover:scale-[1.01] transition-transform"
                      >
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        <span className="break-words leading-tight min-w-0">{aud}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-normal italic">
                    {t("Target audience not specified. Click edit icon to add.", "Target audience not specified. Click edit icon to add.")}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Vision & Core Products */}
            <div className="space-y-5">
              {/* Company Vision */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-teal-400 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" /></div> {t("Company Vision", "Company Vision")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleEdit('vision')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                    title={t("Edit Vision Statement", "Edit Vision Statement")}
                  >
                    {editState['vision'] ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <Edit3 className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                {editState['vision'] ? (
                  <textarea
                    rows={2}
                    value={effectiveProfile?.vision || ''}
                    onChange={(e) => handleFieldChangeLocal('vision', e.target.value)}
                    placeholder="Enter vision statement..."
                    className="w-full text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-purple-500/50 rounded-xl p-3 outline-none leading-relaxed"
                    autoFocus
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-extrabold leading-relaxed italic bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {effectiveProfile?.vision ? `"${effectiveProfile.vision}"` : <span className="text-slate-400 font-normal not-italic">{t("Vision statement not available", "Vision statement not available")}</span>}
                  </p>
                )}
              </div>

              {/* Core Products & Services */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-400 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" /></div> {t("Core Products & Services", "Core Products & Services")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleEdit('coreProductsServices')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                    title={t("Edit Products & Services", "Edit Products & Services")}
                  >
                    {editState['coreProductsServices'] ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <Edit3 className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                {editState['coreProductsServices'] ? (
                  <textarea
                    rows={4}
                    value={Array.isArray(effectiveProfile?.coreProductsServices) ? effectiveProfile.coreProductsServices.join('\n') : (effectiveProfile?.coreProductsServices || '')}
                    onChange={(e) => handleFieldChangeLocal('coreProductsServices', e.target.value)}
                    placeholder="Enter core products & services (one per line)..."
                    className="w-full text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-purple-500/50 rounded-xl p-3 outline-none leading-relaxed"
                    autoFocus
                  />
                ) : Array.isArray(effectiveProfile?.coreProductsServices) && effectiveProfile.coreProductsServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {effectiveProfile.coreProductsServices.map((prod, i) => (
                      <div 
                        key={i} 
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200 shadow-2xs hover:scale-[1.02] transition-transform"
                      >
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        <span className="break-words leading-tight">{prod}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-normal italic">{t("No core products specified. Click edit icon to add.", "No core products specified. Click edit icon to add.")}</p>
                )}
              </div>
            </div>

          </div>

          {/* {t("Extracted Marketing Claims (Unverified)", "Extracted Marketing Claims (Unverified)")} */}
          {Array.isArray(effectiveProfile?.extractedClaims) && effectiveProfile.extractedClaims.length > 0 && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-400 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  {t("Extracted Marketing Claims (Unverified)", "Extracted Marketing Claims (Unverified)")}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {effectiveProfile.extractedClaims.map((claim, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-0.5 shadow-2xs">
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">"{claim.claimText || claim}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fixed Bottom Center Action Button (Theme Glassmorphism Effect) */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => {
                if (setBrandDnaData) setBrandDnaData(effectiveProfile);
                if (setActiveModule) setActiveModule('seo');
              }}
              className="flex items-center gap-3 px-8 py-3.5 text-white rounded-full font-black text-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap border-2 border-white/30 backdrop-blur-xl group"
              style={{ background: 'linear-gradient(to right, var(--brand-from), var(--brand-to))', boxShadow: '0 8px 32px rgba(var(--brand-500-rgb), 0.4)' }}
              title={t("Continue to SEO Intelligence", "Continue to SEO Intelligence")}
            >
              <Search className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span>{t("Continue to SEO", "Continue to SEO")}</span>
            </button>
          </div>

          {/* Brand Logo High-Res Preview Modal */}
          {showLogoPreviewModal && effectiveProfile && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowLogoPreviewModal(false)}
        >
          <div 
            className="relative max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {effectiveProfile.companyName || 'Brand'} Logo
                  </h3>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    High resolution brand image preview
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoPreviewModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close preview"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Logo Image Display Area */}
            <div className="relative w-full h-64 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 overflow-hidden shadow-inner">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-xl border border-slate-200/90 dark:border-slate-800/90 flex items-center justify-center group transition-transform hover:scale-105">
                <img
                  src={modalImgSrc || (effectiveProfile.logoUrl && !effectiveProfile.logoUrl.includes('picsum.photos') ? effectiveProfile.logoUrl : `https://www.google.com/s2/favicons?domain=${(effectiveProfile.website || activeWorkspace?.domainUrl || 'google.com').replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}&sz=256`)}
                  alt={effectiveProfile.companyName || 'Brand Logo'}
                  className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                  onError={handleModalImgError}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                Click outside or press Esc to close
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Upload high-res custom logo"
                >
                  <Upload className="w-3.5 h-3.5" /> Replace Logo
                </button>
                {modalImgSrc && (
                  <a
                    href={modalImgSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Full URL
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const src = modalImgSrc || effectiveProfile.logoUrl || `https://www.google.com/s2/favicons?domain=${(effectiveProfile.website || activeWorkspace?.domainUrl || 'google.com').replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}&sz=256`;
                    const a = document.createElement('a');
                    a.href = src;
                    a.download = `${effectiveProfile.companyName || 'brand'}-logo`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  style={{ background: 'linear-gradient(to right, var(--brand-from), var(--brand-to))' }}
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null}
  </div>
  );
};

export default BrandDnaModule;
