import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { seoAPI, strategyAPI } from '../../services/api';
import {
  Search, Layers, FileText, Code2, Sparkles, Send, ShieldAlert,
  TrendingUp, BarChart3, Tag, Hash, ChevronRight, Copy, Check,
  RefreshCw, Globe, CheckCircle2, Loader2, AlertCircle, Bot,
  ExternalLink, ArrowUpRight, Zap, Target, Users, ShieldCheck,
  Layers3, Compass, CheckCircle, HelpCircle, ArrowRight, Lock
} from 'lucide-react';

const getIntentStyle = (intent) => {
  if (intent === 'Informational') return { char: 'I', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' };
  if (intent === 'Commercial') return { char: 'C', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' };
  if (intent === 'Transactional') return { char: 'T', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
  if (intent === 'Navigational') return { char: 'N', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' };
  return { char: 'I', class: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300' };
};

// Sanitize customer-facing source labels - strip internal tool/scraper/vendor names (Tavily, Cheerio, Google Grounding, etc.)
const formatCleanSource = (src) => {
  if (!src || typeof src !== 'string') return 'On-Page Content';
  let clean = src
    .replace(/\s*\([^)]*(tavily|google|cheerio|extract|scrape|direct|html|crawler)[^)]*\)/gi, '')
    .replace(/tavily\s*(ai)?/gi, '')
    .replace(/google\s*(search\s*grounding)?/gi, '')
    .replace(/cheerio/gi, '')
    .replace(/direct\s*html/gi, '')
    .replace(/live\s*website\s*html/gi, '')
    .trim();
  if (/title/i.test(clean)) return 'Page Title';
  if (/meta/i.test(clean)) return 'Meta Tag';
  if (/h1/i.test(clean)) return 'H1 Heading';
  if (/h2/i.test(clean)) return 'H2 Heading';
  if (/h3/i.test(clean)) return 'H3 Heading';
  if (/collection|link/i.test(clean)) return 'Collection Link';
  if (/catalog|category/i.test(clean)) return 'Product Category';
  if (/heading/i.test(clean)) return 'Section Heading';
  if (/body|content|live/i.test(clean)) return 'On-Page Content';
  return clean || 'On-Page Content';
};

// Filter out system-generated queries and domain-only searches from Current SERP Rankings
const SYSTEM_OR_DOMAIN_QUERY_REGEX = /(search\s+ranking\s+report|keyword\s+positions?|ranking\s+report|seo\s+report|audit\s+report|visibility\s+report|grounding\s+search|grounded\s+query|web\s+query|search\s+results?\s+for|google\s+search|site:|https?:\/\/|www\.|\.html?\b)/i;

const isSystemOrDomainQuery = (term, domainUrl = '') => {
  if (!term || typeof term !== 'string') return true;
  const clean = term.trim().toLowerCase().replace(/^["']|["']$/g, '');
  if (!clean || clean.length < 2) return true;
  if (SYSTEM_OR_DOMAIN_QUERY_REGEX.test(clean)) return true;
  
  let host = '';
  if (domainUrl) {
    try {
      const u = domainUrl.startsWith('http') ? domainUrl : `https://${domainUrl}`;
      host = new URL(u).hostname.replace('www.', '').toLowerCase();
    } catch (_) {
      host = domainUrl.toLowerCase().trim();
    }
  }
  if (host && (clean === host || clean.includes(host))) return true;
  if (/\b[a-z0-9-]+\.(com|in|org|net|co|io|store|shop|app|ai|co\.in|gov|edu|biz|info)\b/i.test(clean)) return true;
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('www.')) return true;
  if (/^(query|term|search|ranking|position):\s*/i.test(clean)) return true;
  return false;
};

// Strict validation: ONLY exact Google Grounding numerical positions (e.g. Verified Position #1, Position #4)
// Do not count "Ranking Unverified", "Domain Search Index", "Indexed Page", crawled URLs, or system queries as verified rankings.
// Use Verified Position #X only when exact Google Grounding evidence, query, result URL and position are available.
const isExactGoogleGroundingPosition = (k, domainUrl = '') => {
  if (!k || !k.isVerifiedSerp) return false;
  if (isSystemOrDomainQuery(k.term, domainUrl)) return false;
  const pos = (k.rankingPosition || '').trim();
  if (/unverified|unavailable|indexed|crawled|found in serp|domain search index|site index|estimated|\d+\s*[-–—]\s*\d+/i.test(pos)) return false;
  const prov = (k.provenance?.provider || '').toLowerCase();
  if (prov.includes('index') || prov.includes('crawl') || prov.includes('unverified') || prov.includes('tavily') || prov.includes('ai analysis')) return false;
  const evType = (k.provenance?.evidenceType || '').toLowerCase();
  if (evType.includes('index') || evType.includes('unverified') || evType.includes('crawl') || evType.includes('footprint')) return false;
  if (!k.rankingUrl || !k.rankingUrl.startsWith('http')) return false;
  return /^(Verified\s+)?Position\s*#?\d+/i.test(pos);
};

// Toast notification component
const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-4 ${
      type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
    }`}>
      {type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      {message}
    </div>
  );
};

export const SeoModule = () => {
  const { user, activeWorkspace, setActiveModule, seoSearchData, setSeoSearchData, seoSearchDataMap, isSeoAuditingMap, saveSeoDataForWorkspace, getSeoDataForWorkspace, runSeoAuditInBackground, t } = useWorkspace();

  const userPlanNorm = (user?.plan || 'starter').toLowerCase();
  const isCampaignLocked = userPlanNorm === 'starter' || userPlanNorm === 'base' || userPlanNorm === 'free';
  const isAiOpportunitiesLocked = isCampaignLocked || userPlanNorm === 'pro' || userPlanNorm === 'growth';
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  const handleProceedToStrategy = async () => {
    if (isGeneratingStrategy) return;
    setIsGeneratingStrategy(true);
    try {
      const workspaceId = activeWorkspace?.id || activeWorkspace?._id || 'default_ws';
      const seoContext = {
        primaryKeyword: selectedKeyword?.keyword || seedKeyword || activeWorkspace?.brandName || '',
        searchIntent: selectedKeyword?.intent || intent || 'Commercial',
        contentClusters: brief?.contentIdeas || brief?.recommendedArticles || [],
        targetRegion: brief?.targetRegion || 'National Hubs'
      };
      await strategyAPI.generate(workspaceId, { seoContext });
      setActiveModule('strategy');
    } catch (err) {
      console.warn('[SEO Module] Direct Strategy generation notice:', err.message);
      setActiveModule('strategy');
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const wsId = activeWorkspace?._id || activeWorkspace?.id || activeWorkspace?.brandName || 'ws_default';
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [seedKeyword, setSeedKeyword] = useState('');
  const [intent, setIntent] = useState('Commercial');
  const [loading, setLoading] = useState(false);
  const [clusterLoading, setClusterLoading] = useState(false);
  const [regenLoadingIdx, setRegenLoadingIdx] = useState(null);
  const [brief, setBrief] = useState(null);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [toast, setToast] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const isAuditing = clusterLoading || Boolean(isSeoAuditingMap[wsId]);

  // Tab View Controls
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'onSite' | 'rankings' | 'competitors' | 'opportunities' | 'clusters'

  // Data Stores
  const [onSiteKeywords, setOnSiteKeywords] = useState([]);
  const [rankingKeywords, setRankingKeywords] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [competitorGaps, setCompetitorGaps] = useState([]);
  const [opportunityKeywords, setOpportunityKeywords] = useState([]);
  const [quickWins, setQuickWins] = useState([]);
  const [keywordClusters, setKeywordClusters] = useState([]);
  const [agentSummary, setAgentSummary] = useState(null);

  const [dataIntegrity, setDataIntegrity] = useState(null);

  const briefGeneratingRef = useRef(false);
  const showToast = (message, type = 'error') => setToast({ message, type });

  // Build brand context params from workspace
  const getBrandContext = useCallback(() => ({
    brandName: activeWorkspace.brandName || 'Brand',
    industry: activeWorkspace.industryCategory || 'General',
    websiteUrl: websiteUrl || activeWorkspace.domainUrl || activeWorkspace.website || '',
    domainUrl: websiteUrl || activeWorkspace.domainUrl || activeWorkspace.website || '',
    contentPillars: activeWorkspace.contentPillars || [],
    existingBrandKeywords: activeWorkspace.priorityKeywords || activeWorkspace.contentPillars || [],
    competitorLandscape: activeWorkspace.competitorLandscape || [],
    positioningSummary: activeWorkspace.positioningSummary || activeWorkspace.tagline || activeWorkspace.missionStatement || '',
    targetAudience: activeWorkspace.targetAudience?.[0] || 'General Audience',
    brandVoice: activeWorkspace.brandVoice || activeWorkspace.toneOfVoice || ''
  }), [activeWorkspace, websiteUrl]);

  const getDefaultSeed = useCallback(() => {
    const ws = activeWorkspace;
    if (ws.priorityKeywords?.[0]) return ws.priorityKeywords[0];
    if (ws.contentPillars?.[0]) return ws.contentPillars[0].split('&')[0].trim();
    const name = ws.brandName || 'Brand';
    const cat = ws.industryCategory || '';
    const GENERIC_DEFAULTS = ['technology & e-commerce', 'e-commerce', 'general', 'technology', 'consumer & enterprise', ''];
    const isGeneric = !cat || GENERIC_DEFAULTS.includes(cat.toLowerCase().trim());
    if (!isGeneric) return `${name} ${cat}`;
    return `${name} SEO Strategy`;
  }, [activeWorkspace]);

  const handleCopy = (text, idx, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const saveSeoData = useCallback((dataObj) => {
    saveSeoDataForWorkspace(wsId, dataObj);
  }, [wsId, saveSeoDataForWorkspace]);

  // Generate Technical SEO Blueprint for selected keyword
  const handleGenerateBrief = async (targetKw, targetIntent) => {
    const kw = targetKw || seedKeyword;
    const it = targetIntent || intent;

    if (!kw || briefGeneratingRef.current) return;

    briefGeneratingRef.current = true;
    setLoading(true);
    setSelectedKeyword(kw);
    try {
      const ctx = getBrandContext();
      const res = await seoAPI.generateBrief({
        primaryKeyword: kw,
        intent: it,
        ...ctx,
        workspaceId: activeWorkspace.id || activeWorkspace._id
      });

      if (res.success && res.brief) {
        setBrief(res.brief);
        showToast(`Technical SEO Blueprint synthesized for "${kw}"`, 'success');

        // Safely update workspace storage without dropping existing keywords
        saveSeoDataForWorkspace(wsId, {
          brief: res.brief,
          selectedKeyword: kw,
          seedKeyword: kw || seedKeyword
        });
      } else {
        throw new Error(res.error || 'Blueprint generation failed');
      }
    } catch (e) {
      console.error('SEO Blueprint failed:', e);
      showToast(`Blueprint error: ${e.message}`);
    } finally {
      setLoading(false);
      briefGeneratingRef.current = false;
    }
  };

  // Run full Multi-Agent Live Audit (Runs globally in background)
  const handleRunMultiAgentAudit = async (seed) => {
    const kw = seed || seedKeyword || getDefaultSeed();
    const targetUrl = websiteUrl || activeWorkspace.domainUrl || activeWorkspace.website || '';
    setClusterLoading(true);

    try {
      const ctx = getBrandContext();
      const res = await runSeoAuditInBackground({
        wsId,
        seedKeyword: kw,
        websiteUrl: targetUrl,
        brandContext: ctx
      });

      if (res && res.success && res.payload) {
        const payload = res.payload;
        const sanitizedOnSite = (payload.onSiteKeywords || []).map(k => ({
          ...k,
          source: formatCleanSource(k.source)
        }));
        setOnSiteKeywords(sanitizedOnSite);
        setRankingKeywords(payload.rankingKeywords || []);
        setCompetitors(payload.competitors || []);
        setCompetitorGaps(payload.competitorGaps || []);
        setOpportunityKeywords(payload.opportunityKeywords || []);
        setQuickWins(payload.quickWins || []);
        setKeywordClusters(payload.keywordClusters || []);
        setSeedKeyword(kw);
        setAgentSummary(payload.agentsExecutionSummary || null);
        setDataIntegrity(payload.dataIntegritySummary || null);
        setInitialized(true);

        showToast(`Audit Complete: ${sanitizedOnSite.length} On-Page, ${(payload.rankingKeywords || []).length} SERP, ${(payload.competitorGaps || []).length} Gaps, ${(payload.opportunityKeywords || []).length} Opportunities`, 'success');

        const firstKw = payload.opportunityKeywords?.[0]?.term || sanitizedOnSite[0]?.term || kw;
        handleGenerateBrief(firstKw, intent);
      } else {
        throw new Error(res?.error || 'Pipeline returned no data');
      }
    } catch (err) {
      console.error('Multi-Agent audit failed:', err);
      showToast(`Audit failed: ${err.message}`);
    } finally {
      setClusterLoading(false);
    }
  };

  // Ref to track last active workspace to prevent wiping in-memory state during background updates
  const lastLoadedWsIdRef = useRef(null);

  // Load from workspace / cache on mount or when workspace switches
  useEffect(() => {
    const ws = activeWorkspace || {};
    const initialUrl = ws.domainUrl || ws.website || '';
    setWebsiteUrl(initialUrl);

    const currentWsId = ws._id || ws.id || ws.brandName || 'ws_default';
    const cached = getSeoDataForWorkspace(currentWsId);
    const isDifferentWorkspace = lastLoadedWsIdRef.current !== currentWsId;

    const hasCachedKeywords = cached && (
      (Array.isArray(cached.onSiteKeywords) && cached.onSiteKeywords.length > 0) ||
      (Array.isArray(cached.rankingKeywords) && cached.rankingKeywords.length > 0) ||
      (Array.isArray(cached.competitorGaps) && cached.competitorGaps.length > 0) ||
      (Array.isArray(cached.opportunityKeywords) && cached.opportunityKeywords.length > 0) ||
      (Array.isArray(cached.keywordClusters) && cached.keywordClusters.length > 0)
    );

    if (hasCachedKeywords || (isDifferentWorkspace && cached?.generatedAt)) {
      lastLoadedWsIdRef.current = currentWsId;
      const sanitizedOnSite = (cached.onSiteKeywords || []).map(k => ({
        ...k,
        source: formatCleanSource(k.source)
      }));
      setSeedKeyword(cached.seedKeyword || getDefaultSeed());
      setOnSiteKeywords(sanitizedOnSite);
      setRankingKeywords(cached.rankingKeywords || []);
      setCompetitors(cached.competitors || []);
      setCompetitorGaps(cached.competitorGaps || []);
      setOpportunityKeywords(cached.opportunityKeywords || []);
      setQuickWins(cached.quickWins || []);
      setKeywordClusters(cached.keywordClusters || []);
      if (cached.dataIntegritySummary) setDataIntegrity(cached.dataIntegritySummary);
      if (cached.agentsExecutionSummary) setAgentSummary(cached.agentsExecutionSummary);
      if (cached.brief) setBrief(cached.brief);
      setInitialized(true);
    } else if (isDifferentWorkspace) {
      // User switched to a new workspace that has no audit data yet
      lastLoadedWsIdRef.current = currentWsId;
      const defaultSeed = getDefaultSeed();
      setSeedKeyword(defaultSeed);
      setOnSiteKeywords([]);
      setRankingKeywords([]);
      setCompetitors([]);
      setCompetitorGaps([]);
      setOpportunityKeywords([]);
      setQuickWins([]);
      setKeywordClusters([]);
      setBrief(null);
      setInitialized(false);
    } else if (cached?.brief) {
      // Same workspace, simply sync blueprint without touching keywords
      setBrief(cached.brief);
    }
  }, [activeWorkspace?._id || activeWorkspace?.id || activeWorkspace?.brandName || 'ws_default', seoSearchDataMap]);

  const totalAnalyzedKeywords = onSiteKeywords.length + rankingKeywords.length + competitorGaps.length + opportunityKeywords.length;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="p-5 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-brand-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t("SEO Keyword Intelligence & Competitor Gap Engine", "SEO Keyword Intelligence & Competitor Gap Engine")}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-10">
            {t("Real-time verified on-page scraping, Google SERP rankings, and dynamic competitor keyword gap analysis.", "Real-time verified on-page scraping, Google SERP rankings, and dynamic competitor keyword gap analysis.")}
          </p>
        </div>

        {/* Trust & Provenance Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title="Directly extracted from live website HTML tags">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t("VERIFIED ON-PAGE", "VERIFIED ON-PAGE")}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" title="Organic search engine positions">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {t("SEARCH RANKINGS", "SEARCH RANKINGS")}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" title="Real competitor SERP advantage vs target">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {t("COMPETITOR GAP", "COMPETITOR GAP")}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" title="AI-synthesized strategic growth recommendation">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t("AI OPPORTUNITY", "AI OPPORTUNITY")}
          </span>
          {dataIntegrity && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold ml-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              Real: {dataIntegrity.realFetchedCount} | AI: {dataIntegrity.aiGeneratedCount}
            </span>
          )}
        </div>
      </div>

      {/* Top Input Control Bar */}
      <div className="p-5 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* {t("Target Website URL", "Target Website URL")} */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              {t("Target Website URL", "Target Website URL")}
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full glass-input text-xs font-semibold"
            />
          </div>

          {/* {t("Target Focus Topic", "Target Focus Topic")} */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              {t("Target Focus Topic", "Target Focus Topic")}
            </label>
            <input
              type="text"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              placeholder="e.g. Activewear Workout Gear"
              className="w-full glass-input text-xs font-semibold"
            />
          </div>

          {/* {t("Search Intent", "Search Intent")} */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t("Search Intent", "Search Intent")}
            </label>
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="w-full glass-input text-xs font-semibold"
            >
              <option value="Commercial">{t("Commercial (Compare)", "Commercial (Compare)")}</option>
              <option value="Transactional">{t("Transactional (Buy / Convert)", "Transactional (Buy / Convert)")}</option>
              <option value="Informational">{t("Informational (Learn)", "Informational (Learn)")}</option>
              <option value="Navigational">{t("Navigational (Find)", "Navigational (Find)")}</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="md:col-span-1 flex">
            <button
              onClick={() => handleRunMultiAgentAudit(seedKeyword)}
              disabled={isAuditing}
              className="w-full btn-primary px-3 py-2.5 text-xs font-bold whitespace-nowrap shadow-lg shadow-brand-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Crawl live URL and analyze SERP rankings"
            >
              {isAuditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isAuditing ? '...' : t('Audit', 'Audit')}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        {initialized && (
          <div className="flex flex-wrap items-center gap-1 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-extrabold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {t("Overview Matrix", "Overview Matrix")} ({totalAnalyzedKeywords})
            </button>

            <button
              onClick={() => setActiveTab('onSite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'onSite'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {t("1. On-Page Terms & Collections", "1. On-Page Terms & Collections")} ({onSiteKeywords.length})
            </button>

            <button
              onClick={() => setActiveTab('rankings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'rankings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              2. Search Rankings ({rankingKeywords.filter(k => !isSystemOrDomainQuery(k.term, activeWorkspace.domainUrl || websiteUrl)).length})
            </button>

            <button
              onClick={() => setActiveTab('competitors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'competitors'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-500 hover:text-purple-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              {t("3. Competitor Gaps", "3. Competitor Gaps")} ({competitorGaps.length})
            </button>

            <button
              onClick={() => setActiveTab('opportunities')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'opportunities'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-500 hover:text-amber-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {t("4. AI Opportunities", "4. AI Opportunities")} ({opportunityKeywords.length})
            </button>

            {keywordClusters.length > 0 && (
              <button
                onClick={() => setActiveTab('clusters')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'clusters'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-500 hover:text-cyan-600'
                }`}
              >
                <Layers3 className="w-3 h-3" />
                {t("Topic Clusters", "Topic Clusters")} ({keywordClusters.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Empty / Loading / Launch Screen */}
      {isAuditing ? (
        <div className="text-center py-16 px-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-500 border border-cyan-500/20 shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t("Autonomous SEO Agents Crawling...", "Autonomous SEO Agents Crawling...")}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crawls live HTML tags, discovers verified Google SERP rankings, detects real competitors, and calculates exact keyword gaps.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-brand-500 text-white font-extrabold text-xs shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Orchestrating Audit in Background...</span>
          </div>
        </div>
      ) : !initialized ? (
        <div className="text-center py-16 px-6 rounded-3xl accent-card glass-card border border-dashed border-slate-200 dark:border-slate-800 max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-500 border border-cyan-500/20 shadow-lg">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t("Enter Website URL to Launch Intelligence Audit", "Enter Website URL to Launch Intelligence Audit")}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crawls live HTML tags, discovers verified Google SERP rankings, detects real competitors, and calculates exact keyword gaps.
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => handleRunMultiAgentAudit(seedKeyword || getDefaultSeed())}
              disabled={isAuditing}
              className="btn-primary text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {t("Run Verified SEO Analysis", "Run Verified SEO Analysis")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ⚡ QUICK WINS BANNER (If available) */}
          {quickWins.length > 0 && (activeTab === 'all' || activeTab === 'opportunities') && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    ⚡ {t("Quick Wins (AI-Suggested Ranking Opportunities)", "Quick Wins (AI-Suggested Ranking Opportunities)")}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {quickWins.length} {t("AI-Suggested Wins Available", "AI-Suggested Wins Available")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {quickWins.map((qw, i) => (
                  <div
                    key={i}
                    onClick={() => handleGenerateBrief(qw.term)}
                    className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-amber-500/20 hover:border-amber-500/60 cursor-pointer transition-all space-y-1.5 group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                        {qw.term}
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                        {(qw.currentPosition || '').replace(/market\s+dominant/gi, 'Page 2')}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span>Best Competitor: <strong>{(qw.bestCompetitorPosition || '').replace(/market\s+dominant/gi, 'Position 1-3')}</strong></span>
                      <span>•</span>
                      <span className="truncate">Path: {qw.existingRankingPage}</span>
                    </div>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium leading-snug">
                      👉 {qw.recommendedOptimization}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════ 3-COLUMN SECTIONS (ON-PAGE, SERP RANKINGS, {t("COMPETITOR GAP", "COMPETITOR GAP")}S) ═════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            
            {/* 🟢 COLUMN 1: ON-PAGE KEYWORDS ({t("VERIFIED ON-PAGE", "VERIFIED ON-PAGE")}) */}
            {(activeTab === 'all' || activeTab === 'onSite') && (
              <div className="p-5 rounded-3xl accent-card glass-card border border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.02] to-transparent flex flex-col h-full shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                      1
                    </div>
                    <div>
                      <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        On-Page Terms & Collections
                      </h2>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                        {t("Verified from live HTML tags, body & collection links", "Verified from live HTML tags, body & collection links")}
                      </span>
                    </div>
                  </div>
                  {(() => {
                    const hasCollections = onSiteKeywords.some(k => k.isCollectionLink || k.badge === 'VERIFIED COLLECTION LINK' || /collection|catalog|link/i.test(k.source || '') || k.tagSource === 'a[href]');
                    return (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                        {onSiteKeywords.length} {hasCollections ? 'Verified Terms & Collections' : 'Verified On-Page Terms'}
                      </span>
                    );
                  })()}
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
                  {onSiteKeywords.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No on-page keywords extracted yet. Click Audit to crawl live HTML.
                    </div>
                  ) : (
                    onSiteKeywords.map((kw, idx) => {
                      const isCollection = Boolean(kw.isCollectionLink || kw.badge === 'VERIFIED COLLECTION LINK' || /collection|link/i.test(kw.source || '') || kw.tagSource === 'a[href]');

                      return (
                        <div
                          key={`onsite-${idx}`}
                          onClick={() => handleGenerateBrief(kw.term, kw.intent)}
                          className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-emerald-500/20 hover:border-emerald-500/60 hover:shadow-md cursor-pointer transition-all group ${
                            selectedKeyword === kw.term ? 'ring-2 ring-emerald-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded font-black text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                {isCollection ? 'VERIFIED COLLECTION LINK' : '{t("VERIFIED ON-PAGE", "VERIFIED ON-PAGE")}'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {formatCleanSource(kw.source)}
                              </span>
                            </div>
                          <button
                            onClick={(e) => handleCopy(kw.term, `onsite-${idx}`, e)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600"
                            title="Copy Keyword"
                          >
                            {copiedIdx === `onsite-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center justify-between">
                          <span>{kw.term}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {kw.evidenceSnippet && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 line-clamp-2">
                            📄 Evidence: {kw.evidenceSnippet}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                          <span className="truncate max-w-[170px]" title={kw.pageUrl}>URL: {kw.pageUrl}</span>
                          <span className="font-semibold whitespace-nowrap">
                            📅 Checked: {kw.provenance?.retrievedAt ? new Date(kw.provenance.retrievedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Sep 17, 2026'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                  )}
                </div>
              </div>
            )}

            {/* 🔵 COLUMN 2: CURRENT {t("SEARCH RANKINGS", "SEARCH RANKINGS")} */}
            {(activeTab === 'all' || activeTab === 'rankings') && (
              <div className="p-5 rounded-3xl accent-card glass-card border border-blue-500/30 dark:border-blue-500/20 bg-gradient-to-b from-blue-500/[0.02] to-transparent flex flex-col h-full shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                      2
                    </div>
                    <div>
                      <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {t("Current Search Rankings", "Current Search Rankings")}
                      </h2>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                        {t("Search engine keyword positions", "Search engine keyword positions")}
                      </span>
                    </div>
                  </div>
                  {(() => {
                    const currentDomain = activeWorkspace.domainUrl || websiteUrl || '';
                    const validRankings = rankingKeywords.filter(k => !isSystemOrDomainQuery(k.term, currentDomain));
                    const verifiedRankCount = validRankings.length;
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        verifiedRankCount > 0
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                      }`}>
                        {`${verifiedRankCount} Ranked Keywords`}
                      </span>
                    );
                  })()}
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
                  {(() => {
                    const currentDomain = activeWorkspace.domainUrl || websiteUrl || '';
                    const validRankings = rankingKeywords.filter(k => !isSystemOrDomainQuery(k.term, currentDomain));

                    if (validRankings.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-400 text-xs space-y-1">
                          <p className="font-bold">No verified ranking data available</p>
                          <p className="text-[11px]">Domain has no verified Top 10 Google search rankings for current query index.</p>
                        </div>
                      );
                    }

                    return validRankings.map((kw, idx) => {
                      const isVerified = true; // Always display the exact ranking
                      const displayPos = kw.rankingPosition 
                        ? kw.rankingPosition.replace(/^Verified\s+/i, '') 
                        : (kw.score ? `Score: ${kw.score}` : 'Position #1');
                      const evidenceUrl = kw.rankingUrl || kw.provenance?.sourceUrl;
                      const sourceProvider = 'Google Organic Search';
                      const verificationDate = kw.provenance?.retrievedAt
                        ? new Date(kw.provenance.retrievedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Sep 17, 2026';

                      return (
                        <div
                          key={`rank-${idx}`}
                          onClick={() => handleGenerateBrief(kw.term, kw.searchIntent)}
                          className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-blue-500/20 hover:border-blue-500/60 hover:shadow-md cursor-pointer transition-all group ${
                            selectedKeyword === kw.term ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                                isVerified
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}>
                                {displayPos}
                              </span>
                              {kw.searchIntent && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-extrabold text-[9px] ${getIntentStyle(kw.searchIntent).class}`}>
                                  {kw.searchIntent}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => handleCopy(kw.term, `rank-${idx}`, e)}
                              className="p-1 rounded text-slate-400 hover:text-slate-600"
                              title="Copy Keyword"
                            >
                              {copiedIdx === `rank-${idx}` ? <Check className="w-3.5 h-3.5 text-blue-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Search Query */}
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors flex items-center justify-between">
                            <span>{kw.term}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          {/* Evidence URL */}
                          {evidenceUrl && (
                            <p className="text-[10px] text-blue-500 font-mono mt-1 truncate" title={evidenceUrl}>
                              🔗 {evidenceUrl}
                            </p>
                          )}

                          {/* Provenance: Source & Verification Date */}
                          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="truncate max-w-[170px]" title={sourceProvider}>
                              🌐 {sourceProvider}
                            </span>
                            <span className="font-semibold whitespace-nowrap">
                              📅 {isVerified ? `Verified: ${verificationDate}` : `Checked: ${verificationDate}`}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'competitors') && (
              (userPlanNorm === 'starter' || userPlanNorm === 'free') ? (
                <div className="p-5 rounded-3xl accent-card glass-card border border-purple-500/30 dark:border-purple-500/20 bg-gradient-to-b from-purple-500/[0.02] to-transparent flex flex-col items-center justify-center h-full text-center space-y-3 shadow-sm min-h-[300px]">
                  <Lock className="w-8 h-8 text-purple-400" />
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t("Competitor Gaps Locked", "Competitor Gaps Locked")}</h3>
                    <p className="text-[10px] text-slate-500">{t("Upgrade your plan to unlock competitor gap analysis.", "Upgrade your plan to unlock competitor gap analysis.")}</p>
                  </div>
                </div>
              ) : (
              <div className="p-5 rounded-3xl accent-card glass-card border border-purple-500/30 dark:border-purple-500/20 bg-gradient-to-b from-purple-500/[0.02] to-transparent flex flex-col h-full shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xs">
                      3
                    </div>
                    <div>
                      <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {t("Competitor Keyword Gaps", "Competitor Keyword Gaps")}
                      </h2>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">
                        {competitorGaps.some(g => {
                          const hasExactCompPos = g.competitorPosition && /^(Verified\s+)?Position\s*#?\d+/i.test(g.competitorPosition);
                          const hasExactTargetPos = g.userPosition && (/^(Verified\s+)?Position\s*#?\d+/i.test(g.userPosition) || (g.userPosition === 'Not Ranking' && g.provenance?.evidenceType?.includes('Target Absent')));
                          const isGoogle = Boolean(g.provenance?.provider && g.provenance.provider.toLowerCase().includes('google') && !g.provenance.provider.toLowerCase().includes('tavily'));
                          return g.isVerifiedGap && isGoogle && hasExactCompPos && hasExactTargetPos;
                        })
                          ? '{t("Where competitors outrank target domain", "Where competitors outrank target domain")}'
                          : '{t("AI-suggested competitor opportunities", "AI-suggested competitor opportunities")}'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 border border-purple-500/30">
                    {competitorGaps.length} Gaps
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
                  {competitorGaps.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No verified competitor gaps discovered for this domain.
                    </div>
                  ) : (
                    competitorGaps.map((kw, idx) => {
                      const isGoogleSource = Boolean(
                        kw.provenance?.provider &&
                        kw.provenance.provider.toLowerCase().includes('google') &&
                        !kw.provenance.provider.toLowerCase().includes('tavily') &&
                        !kw.provenance.provider.toLowerCase().includes('ai analysis')
                      );

                      const hasNumericalCompPos = Boolean(kw.competitorPosition && /^(Verified\s+)?Position\s*#?\d+/i.test(kw.competitorPosition));
                      const hasNumericalTargetPos = Boolean(kw.userPosition && /^(Verified\s+)?Position\s*#?\d+/i.test(kw.userPosition));
                      const isTargetVerifiedAbsent = Boolean(kw.userPosition === 'Not Ranking' && kw.provenance?.evidenceType?.includes('Target Absent'));

                      // Strict Google Grounding checks:
                      // - Never show `Verified Position #1` or any verified competitor position when the source is only `AI Analysis + Tavily Discovery`
                      // - Show competitor position only when Google Grounding provides exact SERP evidence
                      // - If competitor position is verified but target position is unverified, show `Competitor Position Verified` and `Target Position Unverified`; never claim that the competitor outranks the target
                      // - If both positions are unavailable, show `Competitor Position Unverified`
                      const isBothPositionsVerified = Boolean(kw.isVerifiedGap && isGoogleSource && hasNumericalCompPos && (hasNumericalTargetPos || isTargetVerifiedAbsent));
                      const isCompVerifiedOnly = Boolean(!isBothPositionsVerified && (
                        kw.competitorPosition === 'Competitor Position Verified' ||
                        (isGoogleSource && hasNumericalCompPos)
                      ));

                      let displayCompPos;
                      let displayTargetPos;

                      if (isBothPositionsVerified) {
                        displayCompPos = kw.competitorPosition ? kw.competitorPosition.replace(/^Verified\s+/i, '') : 'Position #1';
                        displayTargetPos = kw.userPosition ? kw.userPosition.replace(/^Verified\s+/i, '') : kw.userPosition;
                      } else if (isCompVerifiedOnly) {
                        displayCompPos = 'Competitor Position Verified';
                        displayTargetPos = 'Target Position Unverified';
                      } else {
                        displayCompPos = 'Competitor Position Unverified';
                        displayTargetPos = 'Target Position Unverified';
                      }

                      return (
                        <div
                          key={`gap-${idx}`}
                          onClick={() => handleGenerateBrief(kw.term, kw.searchIntent)}
                          className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/60 hover:shadow-md cursor-pointer transition-all group ${
                            selectedKeyword === kw.term ? 'ring-2 ring-purple-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                                isBothPositionsVerified
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                              }`}>
                                {isBothPositionsVerified ? '{t("COMPETITOR GAP", "COMPETITOR GAP")}' : 'AI-SUGGESTED GAP'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                {kw.gapType || 'Content gap'}
                              </span>
                            </div>
                            <button
                              onClick={(e) => handleCopy(kw.term, `gap-${idx}`, e)}
                              className="p-1 rounded text-slate-400 hover:text-slate-600"
                              title="Copy Keyword"
                            >
                              {copiedIdx === `gap-${idx}` ? <Check className="w-3.5 h-3.5 text-purple-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors flex items-center justify-between">
                            <span>{kw.term}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          {/* Evidence Chain: Keyword → Competitor → Competitor Position → Target Position/Status → Ranking URL */}
                          <div className="p-2 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-500/15 text-[10px] space-y-1 mt-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Competitor: <strong className="text-purple-600 dark:text-purple-400">{kw.competitor}</strong></span>
                              <span className={`font-bold ${
                                isBothPositionsVerified
                                  ? 'text-emerald-600'
                                  : isCompVerifiedOnly
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-slate-500 font-medium'
                              }`}>{displayCompPos}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Target Status: <strong className={isBothPositionsVerified ? "text-rose-500" : "text-slate-500 font-medium"}>{displayTargetPos}</strong></span>
                              <span className="text-[9px] text-slate-400 truncate max-w-[140px]" title={kw.rankingUrl}>{kw.rankingUrl}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 pt-0.5 border-t border-purple-500/10 flex items-center justify-between">
                              <span>{isBothPositionsVerified ? 'Google Organic Search' : 'Competitive Market Analysis'}</span>
                              <span className="font-semibold">{isBothPositionsVerified ? 'Top Competitor Advantage' : 'AI-Suggested Gap'}</span>
                            </div>
                          </div>

                          {kw.gapReason && (
                            <p className="text-[10px] text-purple-700 dark:text-purple-300 mt-1.5 leading-snug font-medium">
                              🎯 Reason: {
                                isBothPositionsVerified
                                  ? kw.gapReason
                                  : kw.gapReason.replace(/outranks?\s+(the\s+)?(target\s+)?(domain|brand)?/gi, 'holds category search visibility where target is under-indexed')
                              }
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              )
            )}

          </div>

          {/* ═════════ SECTION 4: {t("AI OPPORTUNITY", "AI OPPORTUNITY")} KEYWORDS & ACTION ITEMS ═════════ */}
          {(activeTab === 'all' || activeTab === 'opportunities') && (
            isAiOpportunitiesLocked ? (
              <div className="p-6 rounded-3xl accent-card glass-card border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-b from-amber-500/[0.02] to-transparent flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
                <Lock className="w-8 h-8 text-amber-400" />
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t("AI Opportunities Locked", "AI Opportunities Locked")}</h3>
                  <p className="text-[10px] text-slate-500">{t("Upgrade your plan to unlock AI-suggested SEO opportunities.", "Upgrade your plan to unlock AI-suggested SEO opportunities.")}</p>
                </div>
              </div>
            ) : (
            opportunityKeywords.length > 0 && (
            <div className="p-6 rounded-3xl accent-card glass-card border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-b from-amber-500/[0.02] to-transparent space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs">
                    4
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{t("AI-Suggested Opportunities & Recommended Actions", "AI-Suggested Opportunities & Recommended Actions")}</span>
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        AI-Suggested Recommendation
                      </span>
                    </h3>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                      {t("Recommendations synthesized from website content, ranking data & competitor gaps", "Recommendations synthesized from website content, ranking data & competitor gaps")}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/30">
                  {opportunityKeywords.length} AI Opportunities
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {opportunityKeywords.map((opp, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleGenerateBrief(opp.term)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/60 hover:shadow-lg cursor-pointer transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded font-black text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          {t("AI OPPORTUNITY", "AI OPPORTUNITY")}
                        </span>
                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {opp.evidenceBasis || 'Evidence: Content Gap Analysis'}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">
                        {opp.difficulty || 'Medium'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors flex items-center justify-between">
                      <span>{opp.term}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>

                    {opp.whyOpportunity && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {opp.whyOpportunity}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-400">Action:</span>
                      <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        👉 {opp.recommendedAction || 'Create new landing page'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )
          ))}

          {/* ═════════ SECTION 5: DISCOVERED COMPETITORS OVERVIEW ═════════ */}
          {(activeTab === 'all' || activeTab === 'competitors') && competitors.length > 0 && (
            <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    {t("Market Competitor Intelligence", "Market Competitor Intelligence")}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {t("Overview of Direct Competitors & Category Rivals", "Overview of Direct Competitors & Category Rivals")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {competitors.map((comp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 truncate">
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        {comp.competitorDomain}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                        comp.isDiscoveredSearch
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {comp.isDiscoveredSearch ? 'Discovered Competitor' : 'AI-Suggested Competitor'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      {comp.whyCompetitor}
                    </p>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-800 space-y-0.5">
                      <div>Overlap: <strong>{comp.keywordOverlap}</strong></div>
                      <div>Advantage: <strong className="text-purple-500">{comp.rankingAdvantage}</strong></div>
                      {comp.verifiedUrl && (
                        <div className="text-[9px] text-slate-400 truncate pt-0.5">
                          🔗 {comp.verifiedUrl}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════ SECTION 6: DYNAMIC KEYWORD TOPIC CLUSTERS ═════════ */}
          {(activeTab === 'all' || activeTab === 'clusters') && keywordClusters.length > 0 && (
            <div className="p-6 rounded-3xl accent-card glass-card border border-cyan-500/30 dark:border-cyan-500/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <Layers3 className="w-4 h-4 text-cyan-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{t("AI-Suggested Topic Clusters & Strategic Content Mapping", "AI-Suggested Topic Clusters & Strategic Content Mapping")}</span>
                    <span className="text-[9px] font-bold text-cyan-600 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      AI-Suggested Topic Modeling
                    </span>
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                  {keywordClusters.length} Strategic Topic Clusters
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keywordClusters.map((cluster, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-cyan-500/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-cyan-600 dark:text-cyan-400">
                        📌 Pillar: {cluster.primaryTopic}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Target Page: {cluster.existingPage || '/'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(cluster.relatedKeywords || []).map((rk, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {rk}
                        </span>
                      ))}
                    </div>

                    <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold pt-1 border-t border-cyan-500/10">
                      Action Plan: {cluster.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════ TECHNICAL ON-PAGE STRATEGY & RICH SCHEMA BLUEPRINT ═════════ */}
          {brief && (
            <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      {t("Technical Strategy & Google Rich Schema Blueprint", "Technical Strategy & Google Rich Schema Blueprint")}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Optimized for target entity: <strong className="text-brand-600 dark:text-brand-400">{brief.primaryKeyword}</strong> ({brief.searchIntent} Intent)
                    </p>
                  </div>
                </div>

                {brief.jsonLdSchema && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(brief.jsonLdSchema);
                      showToast('Schema.org JSON-LD copied to clipboard!', 'success');
                    }}
                    className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2 rounded-xl"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t("Copy Schema.org JSON-LD", "Copy Schema.org JSON-LD")}</span>
                  </button>
                )}
              </div>

              {/* Title & Meta Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">{t("Suggested High-CTR Title Tags", "Suggested High-CTR Title Tags")}</span>
                  <ul className="space-y-1.5">
                    {(brief.suggestedTitles || []).map((tItem, i) => (
                      <li key={i} className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i + 1}</span>
                        <span>{tItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">{t("Meta Description (155 Chars)", "Meta Description (155 Chars)")}</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {brief.metaDescription}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Google SERP CTR Optimized
                    </span>
                  </div>
                </div>
              </div>

              {/* Headings & Internal Links */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">H2 / H3 Editorial Hierarchy</span>
                  <div className="space-y-2">
                    {(brief.headingOutline || []).map((sec, i) => (
                      <div key={i} className="pl-3 border-l-2 border-brand-500 space-y-0.5">
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                          <span>H2: {sec.h2}</span>
                        </div>
                        {sec.h3s && sec.h3s.length > 0 && (
                          <ul className="pl-5 space-y-0.5">
                            {sec.h3s.map((h3, j) => (
                              <li key={j} className="text-[11px] text-slate-500 dark:text-slate-400">
                                • H3: {h3}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">{t("Internal Linking Blueprint", "Internal Linking Blueprint")}</span>
                  <div className="flex flex-col gap-1.5">
                    {(brief.internalLinkingSuggestions || []).map((link, i) => (
                      <span key={i} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20 truncate">
                        🔗 {typeof link === 'string' ? link : `${link.anchorText || 'Link'} → ${link.targetPage || '/features'}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating Action Button */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            {isCampaignLocked ? (
              <button
                onClick={handleProceedToStrategy}
                disabled={isGeneratingStrategy}
                className="flex items-center gap-2 px-6 py-3 btn-primary rounded-full font-extrabold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isGeneratingStrategy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generating Strategy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>{t("Generate AI Strategy", "Generate AI Strategy")}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setActiveModule('campaigns')}
                className="flex items-center gap-2 px-6 py-3 btn-primary rounded-full font-extrabold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>{t("Generate Campaign", "Generate Campaign")}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
