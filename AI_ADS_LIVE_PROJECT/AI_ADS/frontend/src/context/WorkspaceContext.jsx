import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { seoAPI } from '../services/api';
import i18n from '../config/i18n.js';
import { TRANSLATIONS } from '../config/translations.js';

const DEFAULT_WORKSPACE_CONTEXT = {
  activeModule: 'dashboard',
  setActiveModule: () => {},
  goBack: () => {},
  canGoBack: false,
  navigationHistory: [],
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  user: null,
  setUser: () => {},
  loginUser: () => {},
  logout: () => {},
  activeRole: 'AgencyAdmin',
  setActiveRole: () => {},
  workspaces: [],
  activeWorkspaceId: '',
  setActiveWorkspaceId: () => {},
  activeWorkspace: {
    id: 'ws_empty',
    brandName: 'Brand DNA',
    domainUrl: 'https://',
    logoUrl: '',
    brandColors: ['#6366F1', '#8B5CF6'],
    targetAudience: [],
    brandVoiceTone: { formalityScore: 3, toneKeywords: [] },
    competitorLandscape: [],
    contentPillars: [],
    socialMediaPresence: [],
    contactInfo: { email: '', phone: '', location: '' },
    industryCategory: 'General',
    missionStatement: '',
    tagline: '',
    approvedClaims: [],
    restrictedClaims: []
  },
  addWorkspace: () => {},
  updateWorkspace: () => {},
  deleteWorkspace: () => {},
  credits: { tier: 'Agency', balance: 120, history: [] },
  deductVisualCredits: () => true,
  topUpCredits: () => {},
  approvalsQueue: [],
  setApprovalsQueue: () => {},
  updateApprovalStatus: () => {},
  calendarEvents: [],
  setCalendarEvents: () => {},
  addCalendarEvent: () => {},
  bulkAddCalendarEvents: () => {},
  globalAssets: [],
  setGlobalAssets: () => {},
  addGlobalAsset: () => {},
  removeGlobalAsset: () => {},
  isQuickPostOpen: false,
  setIsQuickPostOpen: () => {},
  isScraperOpen: false,
  setIsScraperOpen: () => {},
  scraperMode: 'website',
  setScraperMode: () => {},
  openScraperModal: () => {},
  isCreditModalOpen: false,
  setIsCreditModalOpen: () => {},
  isAISAAssistantOpen: false,
  setIsAISAAssistantOpen: () => {},
  notifications: [],
  setNotifications: () => {},
  userAvatar: null,
  setUserAvatar: () => {},
  customAlert: { isOpen: false, title: '', message: '', type: 'warning' },
  showCustomAlert: () => {},
  closeCustomAlert: () => {},
  toast: { isVisible: false, text: '', type: 'success' },
  showToast: () => {},
  closeToast: () => {},
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: () => {},
  isSettingsModalOpen: false,
  setIsSettingsModalOpen: () => {},
  activeSettingsTab: 'account',
  setActiveSettingsTab: () => {},
  appearance: 'light',
  setAppearance: () => {},
  accentColor: 'default',
  setAccentColor: () => {},
  region: 'India',
  setRegion: () => {},
  language: 'English',
  setLanguage: () => {},
  t: (k, fb = '') => fb || k,
  multiScheduleReminder: 'Enabled',
  setMultiScheduleReminder: () => {},
  notificationPreferences: {},
  setNotificationPreferences: () => {},
  dataControlPreferences: {},
  setDataControlPreferences: () => {},
  studioTarget: null,
  setStudioTarget: () => {},
  generatedContent: null,
  setGeneratedContent: () => {},
  generatedPostsTracker: {},
  markPostAsGenerated: () => {},
  selectedAssetContext: null,
  setSelectedAssetContext: () => {},
  brandDnaData: null,
  setBrandDnaData: () => {},
  seoSearchData: null,
  setSeoSearchData: () => {},
  seoSearchDataMap: {},
  isSeoAuditingMap: {},
  saveSeoDataForWorkspace: () => {},
  getSeoDataForWorkspace: () => null,
  runSeoAuditInBackground: async () => ({ success: false }),
  generatedStrategy: null,
  setGeneratedStrategy: () => {},
  sendContentToApprovals: () => {},
  approveAndSendToCreative: () => {}
};

const WorkspaceContext = createContext(DEFAULT_WORKSPACE_CONTEXT);

const MODULE_TO_PATH = {
  landing: '/',
  landingpage: '/',
  login: '/sign-in-create-account',
  signin: '/sign-in-create-account',
  register: '/sign-in-create-account',
  createAccount: '/sign-in-create-account',
  dashboard: '/dashboard',
  brands: '/brand-dna',
  strategy: '/strategy',
  seo: '/seo-intelligence',
  calendar: '/calendar',
  studio: '/content-studio',
  websiteBuilder: '/website-builder',
  builder: '/website-builder',
  campaigns: '/campaigns',
  creative: '/creative-studio',
  assets: '/asset-library',
  approvals: '/approvals-desk',
  analytics: '/analytics',
  team: '/team-rbac',
  settings: '/settings-billing',
  adminDashboard: '/admin-dashboard',
};

const PATH_TO_MODULE = {
  '/': 'landing',
  '/landing': 'landing',
  '/landing-page': 'landing',
  '/landingpage': 'landing',
  '/sign-in-create-account': 'login',
  '/sign-in': 'login',
  '/signin': 'login',
  '/login': 'login',
  '/create-account': 'login',
  '/createaccount': 'login',
  '/register': 'login',
  '/dashboard': 'dashboard',
  '/brand-dna': 'brands',
  '/brands': 'brands',
  '/strategy': 'strategy',
  '/seo': 'seo',
  '/seo-intelligence': 'seo',
  '/calendar': 'calendar',
  '/content-studio': 'studio',
  '/studio': 'studio',
  '/website-builder': 'websiteBuilder',
  '/websitebuilder': 'websiteBuilder',
  '/builder': 'websiteBuilder',
  '/campaigns': 'campaigns',
  '/creative-studio': 'creative',
  '/creative': 'creative',
  '/asset-library': 'assets',
  '/assets': 'assets',
  '/approvals': 'approvals',
  '/approvals-desk': 'approvals',
  '/analytics': 'analytics',
  '/team-rbac': 'team',
  '/team': 'team',
  '/settings-billing': 'settings',
  '/settings': 'settings',
  '/admin-dashboard': 'adminDashboard',
  '/admin': 'adminDashboard',
};

function getModuleFromLocation() {
  if (typeof window === 'undefined') return 'landing';
  const cleanPath = window.location.pathname.split('?')[0].split('#')[0].toLowerCase().replace(/\/$/, '') || '/';
  return PATH_TO_MODULE[cleanPath] || 'landing';
}

export const WorkspaceProvider = ({ children }) => {
  // Navigation & History Tracking (Synced with Browser URL Routes)
  const [activeModule, setActiveModuleState] = useState(getModuleFromLocation);
  const [navigationHistory, setNavigationHistory] = useState([]);

  const setActiveModule = (newModule) => {
    setNavigationHistory(prev => [...prev, activeModule]);
    setActiveModuleState(newModule);

    const targetPath = MODULE_TO_PATH[newModule] || '/dashboard';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ module: newModule }, '', targetPath);
    }
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const prevModule = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setActiveModuleState(prevModule);
      const targetPath = MODULE_TO_PATH[prevModule] || '/dashboard';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ module: prevModule }, '', targetPath);
      }
    } else if (activeModule !== 'dashboard') {
      setActiveModuleState('dashboard');
      if (window.location.pathname !== '/dashboard') {
        window.history.pushState({ module: 'dashboard' }, '', '/dashboard');
      }
    }
  };

  // Sync state on browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const currentMod = getModuleFromLocation();
      setActiveModuleState(currentMod);
    };

    window.addEventListener('popstate', handlePopState);

    // Set clean URL on initial load
    const initialPath = MODULE_TO_PATH[activeModule] || '/landing-page';
    if (window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname === '/landing') {
      window.history.replaceState({ module: activeModule }, '', initialPath);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const canGoBack = navigationHistory.length > 0 || activeModule !== 'dashboard';

  // Settings Modal & Personalization Preferences State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('account');

  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('aisa_theme') || localStorage.getItem('aisa_appearance') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const [appearance, setAppearanceState] = useState(() => {
    try {
      return localStorage.getItem('aisa_appearance') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const setTheme = (val) => {
    setThemeState(val);
    setAppearanceState(val);
    try {
      localStorage.setItem('aisa_theme', val);
      localStorage.setItem('aisa_appearance', val);
    } catch (e) {}
  };

  const setAppearance = (val) => {
    setAppearanceState(val);
    try {
      localStorage.setItem('aisa_appearance', val);
    } catch (e) {}
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      setAppearanceState(nextTheme);
      try {
        localStorage.setItem('aisa_theme', nextTheme);
        localStorage.setItem('aisa_appearance', nextTheme);
      } catch (e) {}
      return nextTheme;
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let effectiveTheme = appearance;
      if (appearance === 'system') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        effectiveTheme = prefersDark ? 'dark' : 'light';
      } else {
        effectiveTheme = theme;
      }

      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  }, [theme, appearance]);


  const [accentColor, setAccentColorState] = useState(() => {
    try {
      return localStorage.getItem('aisa_accent_color') || 'default';
    } catch (e) {
      return 'default';
    }
  });

  const [region, setRegionState] = useState(() => {
    try {
      return localStorage.getItem('aisa_region') || 'India';
    } catch (e) {
      return 'India';
    }
  });

  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('aisa_language') || 'English';
    } catch (e) {
      return 'English';
    }
  });

  const setLanguage = (val) => {
    setLanguageState(val);
    try {
      localStorage.setItem('aisa_language', val);
    } catch (e) { }

    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(val);
    }


    document.documentElement.dir = 'ltr';
  };

  useEffect(() => {
    if (i18n && typeof i18n.changeLanguage === 'function' && language) {
      i18n.changeLanguage(language);
    }

    document.documentElement.dir = 'ltr';
  }, [language]);

  const t = (key, fallback = '') => {
    if (!key) return fallback || '';
    if (typeof key !== 'string') return key;

    // 1. Direct dictionary lookup
    if (false) {
      const i18nResult = i18n.t(key, { defaultValue: '' });
      if (i18nResult && i18nResult !== key) return i18nResult;
    }

    // 2. Direct dictionary lookup
    // Fast-path for English language selection
    const isEnglish = !language || language.toLowerCase().includes('english') || language.toLowerCase().startsWith('en');
    if (isEnglish) {
      const enDict = TRANSLATIONS['English (IN)'] || TRANSLATIONS.English || {};
      if (enDict[key] && !/[\u0D00-\u0D7F]/.test(enDict[key])) return enDict[key];
      if (fallback && enDict[fallback] && !/[\u0D00-\u0D7F]/.test(enDict[fallback])) return enDict[fallback];
      const lowerKey = key.trim().toLowerCase();
      const matchedKey = Object.keys(enDict).find(k => k.toLowerCase() === lowerKey);
      if (matchedKey && enDict[matchedKey] && !/[\u0D00-\u0D7F]/.test(enDict[matchedKey])) return enDict[matchedKey];
      return fallback || key;
    }

    const langDict = TRANSLATIONS[language] || TRANSLATIONS[language?.split(' ')[0]] || TRANSLATIONS.English || {};
    if (langDict[key]) return langDict[key];
    if (fallback && langDict[fallback]) return langDict[fallback];

    // 3. Case-insensitive dictionary lookup
    const lowerKey = key.trim().toLowerCase();
    const dictKeys = Object.keys(langDict);
    const matchedKey = dictKeys.find(k => k.toLowerCase() === lowerKey);
    if (matchedKey && langDict[matchedKey]) return langDict[matchedKey];

    const enDict = TRANSLATIONS.English || {};
    const enKeyMatch = Object.keys(enDict).find(k => k.toLowerCase() === lowerKey || (enDict[k] && String(enDict[k]).toLowerCase() === lowerKey));
    if (enKeyMatch && langDict[enKeyMatch]) return langDict[enKeyMatch];

    // 5. Dynamic phrase prefix translation for generated AI content
    let str = key;
    let modified = false;
    const prefixes = [
      { regex: /^Persona\s+(\d+)\s*:/i, prefix: 'Persona' },
      { regex: /^Phase\s+(\d+)\s*:/i, prefix: 'Phase' },
      { regex: /^Milestone\s+(\d+)\s*:/i, prefix: 'Milestone' },
      { regex: /^KPI\s*:/i, prefix: 'KPI' },
      { regex: /^Total Budget\s*:/i, prefix: 'Total Budget' },
      { regex: /^Campaign Focus\s*:/i, prefix: 'Campaign Focus' },
      { regex: /^Goal\s*:/i, prefix: 'Goal' },
      { regex: /^Channel\s*:/i, prefix: 'Channel' },
      { regex: /^Frequency\s*:/i, prefix: 'Frequency' },
      { regex: /^Directives\s*:/i, prefix: 'Directives' },
      { regex: /^Visual Directives\s*:/i, prefix: 'Visual Directives' }
    ];

    for (const p of prefixes) {
      const m = str.match(p.regex);
      if (m) {
        const transPrefix = langDict[p.prefix] || p.prefix;
        if (m[1]) {
          str = str.replace(p.regex, `${transPrefix} ${m[1]}:`);
        } else {
          str = str.replace(p.regex, `${transPrefix}:`);
        }
        modified = true;
      }
    }

    if (modified) return str;

    return fallback || key;
  };

  const [multiScheduleReminder, setMultiScheduleReminderState] = useState(() => {
    try {
      return localStorage.getItem('aisa_multi_schedule_reminder') || 'Enabled';
    } catch (e) {
      return 'Enabled';
    }
  });

  // Target data for redirecting from Calendar or other modules directly into Content Studio
  const [studioTarget, setStudioTarget] = useState(null);

  // Pipeline Shared States — persisted to localStorage so they survive reload
  const [brandDnaData, setBrandDnaDataState] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_brand_dna_data');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  const setBrandDnaData = (data) => {
    setBrandDnaDataState(data);
    try {
      if (data) localStorage.setItem('aisa_brand_dna_data', JSON.stringify(data));
      else localStorage.removeItem('aisa_brand_dna_data');
    } catch (e) {}
  };

  const [seoSearchData, setSeoSearchDataState] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_seo_search_data');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  const setSeoSearchData = (data) => {
    setSeoSearchDataState(data);
    try {
      if (data) localStorage.setItem('aisa_seo_search_data', JSON.stringify(data));
      else localStorage.removeItem('aisa_seo_search_data');
    } catch (e) {}
  };

  const [generatedStrategy, setGeneratedStrategyState] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_generated_strategy');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  const setGeneratedStrategy = (data) => {
    setGeneratedStrategyState(data);
    try {
      if (data) localStorage.setItem('aisa_generated_strategy', JSON.stringify(data));
      else localStorage.removeItem('aisa_generated_strategy');
    } catch (e) {}
  };

  // Global SEO Intelligence Data Map per Workspace (Persistent across tab & module changes)
  const [seoSearchDataMap, setSeoSearchDataMap] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_seo_data_map');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [isSeoAuditingMap, setIsSeoAuditingMap] = useState({});

  const saveSeoDataForWorkspace = (wsId, dataObj) => {
    if (!wsId || !dataObj) return;
    setSeoSearchDataMap(prev => {
      let existingStorage = {};
      try {
        const raw = localStorage.getItem(`aisa_seo_${wsId}`);
        if (raw) existingStorage = JSON.parse(raw) || {};
      } catch (e) {}

      const existing = prev[wsId] || existingStorage || {};
      const merged = {
        ...existing,
        ...dataObj,
        // Crucial: Preserve previous verified arrays if dataObj does not contain them or is empty
        onSiteKeywords: (Array.isArray(dataObj.onSiteKeywords) && dataObj.onSiteKeywords.length > 0) ? dataObj.onSiteKeywords : (existing.onSiteKeywords || []),
        rankingKeywords: (Array.isArray(dataObj.rankingKeywords) && dataObj.rankingKeywords.length > 0) ? dataObj.rankingKeywords : (existing.rankingKeywords || []),
        competitors: (Array.isArray(dataObj.competitors) && dataObj.competitors.length > 0) ? dataObj.competitors : (existing.competitors || []),
        competitorGaps: (Array.isArray(dataObj.competitorGaps) && dataObj.competitorGaps.length > 0) ? dataObj.competitorGaps : (existing.competitorGaps || []),
        opportunityKeywords: (Array.isArray(dataObj.opportunityKeywords) && dataObj.opportunityKeywords.length > 0) ? dataObj.opportunityKeywords : (existing.opportunityKeywords || []),
        quickWins: (Array.isArray(dataObj.quickWins) && dataObj.quickWins.length > 0) ? dataObj.quickWins : (existing.quickWins || []),
        keywordClusters: (Array.isArray(dataObj.keywordClusters) && dataObj.keywordClusters.length > 0) ? dataObj.keywordClusters : (existing.keywordClusters || []),
        dataIntegritySummary: dataObj.dataIntegritySummary || existing.dataIntegritySummary || null,
        agentsExecutionSummary: dataObj.agentsExecutionSummary || existing.agentsExecutionSummary || null,
        brief: dataObj.brief || existing.brief || null,
        selectedKeyword: dataObj.selectedKeyword || existing.selectedKeyword || '',
        seedKeyword: dataObj.seedKeyword || existing.seedKeyword || '',
        websiteUrl: dataObj.websiteUrl || existing.websiteUrl || '',
        generatedAt: dataObj.generatedAt || existing.generatedAt || new Date().toISOString()
      };

      const updated = { ...prev, [wsId]: merged };
      try {
        localStorage.setItem('aisa_seo_data_map', JSON.stringify(updated));
        localStorage.setItem(`aisa_seo_${wsId}`, JSON.stringify(merged));
      } catch (e) {}
      return updated;
    });
    setSeoSearchData(prev => ({ ...(prev || {}), ...dataObj }));
  };

  const getSeoDataForWorkspace = (wsId) => {
    if (!wsId) return null;
    if (seoSearchDataMap && seoSearchDataMap[wsId]) return seoSearchDataMap[wsId];
    try {
      const raw = localStorage.getItem(`aisa_seo_${wsId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) return parsed;
      }
    } catch (e) {}
    try {
      const mapRaw = localStorage.getItem('aisa_seo_data_map');
      if (mapRaw) {
        const parsedMap = JSON.parse(mapRaw);
        if (parsedMap && parsedMap[wsId]) return parsedMap[wsId];
      }
    } catch (e) {}
    return null;
  };

  const runSeoAuditInBackground = async ({ wsId, seedKeyword, websiteUrl, brandContext }) => {
    if (!wsId) return { success: false, error: 'Workspace ID required' };
    setIsSeoAuditingMap(prev => ({ ...prev, [wsId]: true }));
    try {
      const result = await seoAPI.clusterKeywords({
        seedKeyword: seedKeyword,
        websiteUrl: websiteUrl || '',
        ...brandContext,
        count: 12
      });

      if (result.success) {
        const onSite = (result.onSiteKeywords || []).map(k => ({
          ...k,
          source: k.source || 'On-Page Content'
        }));
        const currentDomain = websiteUrl || '';
        const rawRankings = result.rankingKeywords || [];
        const sanitizedRankings = rawRankings.map(k => ({
          ...k,
          isVerifiedSerp: Boolean(k.isVerifiedSerp),
          badge: k.isVerifiedSerp ? 'VERIFIED RANK' : 'RANKING UNVERIFIED',
          rankingPosition: k.rankingPosition || 'Ranking Unverified'
        }));
        const comps = result.competitors || [];
        const gaps = result.competitorGaps || [];
        const opps = result.opportunityKeywords || [];
        const qWins = result.quickWins || [];
        const clusters = result.keywordClusters || [];

        const existing = getSeoDataForWorkspace(wsId) || {};

        const storagePayload = {
          ...existing,
          websiteUrl: websiteUrl || '',
          seedKeyword: seedKeyword,
          onSiteKeywords: onSite,
          rankingKeywords: sanitizedRankings,
          competitors: comps,
          competitorGaps: gaps,
          opportunityKeywords: opps,
          quickWins: qWins,
          keywordClusters: clusters,
          dataIntegritySummary: result.dataIntegritySummary || null,
          agentsExecutionSummary: result.agentsExecutionSummary || null,
          generatedAt: new Date().toISOString()
        };

        saveSeoDataForWorkspace(wsId, storagePayload);
        return { success: true, payload: storagePayload };
      } else {
        throw new Error(result.error || 'Audit returned no data');
      }
    } catch (err) {
      console.error('Background SEO Audit Error:', err);
      return { success: false, error: err.message };
    } finally {
      setIsSeoAuditingMap(prev => ({ ...prev, [wsId]: false }));
    }
  };

  // Active Generated Content payload shared between Content Studio and Creative Studio
  const [generatedContent, setGeneratedContentState] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_last_generated_content');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const setGeneratedContent = (data) => {
    setGeneratedContentState(data);
    try {
      if (data) localStorage.setItem('aisa_last_generated_content', JSON.stringify(data));
      else localStorage.removeItem('aisa_last_generated_content');
    } catch (e) { }
  };

  const [notificationPreferences, setNotificationPreferencesState] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_notification_prefs');
      return saved ? JSON.parse(saved) : { emailDigest: true, desktopPush: true, soundEffects: true, productUpdates: false };
    } catch (e) { return { emailDigest: true, desktopPush: true, soundEffects: true, productUpdates: false }; }
  });
  const setNotificationPreferences = (val) => {
    setNotificationPreferencesState(val);
    try { localStorage.setItem('aisa_notification_prefs', JSON.stringify(val)); } catch (e) {}
  };

  const [dataControlPreferences, setDataControlPreferencesState] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_data_control_prefs');
      return saved ? JSON.parse(saved) : { saveChatHistory: true, shareWorkspaceLinks: true, allowAnalytics: true };
    } catch (e) { return { saveChatHistory: true, shareWorkspaceLinks: true, allowAnalytics: true }; }
  });
  const setDataControlPreferences = (val) => {
    setDataControlPreferencesState(val);
    try { localStorage.setItem('aisa_data_control_prefs', JSON.stringify(val)); } catch (e) {}
  };



  const setAccentColor = (val) => {
    setAccentColorState(val);
    try {
      localStorage.setItem('aisa_accent_color', val);
    } catch (e) { }

    const palette = ACCENT_COLOR_MAP[val] || ACCENT_COLOR_MAP.purple;
    applyPaletteToCSS(palette);
  };

  const setRegion = (val) => {
    setRegionState(val);
    try {
      localStorage.setItem('aisa_region', val);
    } catch (e) { }
  };

  const setMultiScheduleReminder = (val) => {
    setMultiScheduleReminderState(val);
    try {
      localStorage.setItem('aisa_multi_schedule_reminder', val);
    } catch (e) { }
  };

  const ACCENT_COLOR_MAP = {
    default: {
      brand500: '#6366f1',
      brand600: '#4f46e5',
      brand400: '#818cf8',
      brand300: '#a5b4fc',
      brand100: '#e0e7ff',
      brand50: '#eef2ff',
      glow: 'rgba(99, 102, 241, 0.35)',
      from: '#4f46e5',
      to: '#6366f1',
      rgb: '99, 102, 241',
      rgb600: '79, 70, 229',
      rgb400: '129, 140, 248',
      rgb300: '165, 180, 252',
    },
    purple: {
      brand500: '#7B61FF',
      brand600: '#6B5AED',
      brand400: '#A882FF',
      brand300: '#B388FF',
      brand100: '#E8E3FF',
      brand50: '#F8F9FD',
      glow: 'rgba(123, 97, 255, 0.35)',
      from: '#6B5AED',
      to: '#7B61FF',
      rgb: '123, 97, 255',
      rgb600: '107, 90, 237',
      rgb400: '168, 130, 255',
      rgb300: '179, 136, 255',
    },
    blue: {
      brand500: '#0284c7',
      brand600: '#0369a1',
      brand400: '#38bdf8',
      brand300: '#7dd3fc',
      brand100: '#e0f2fe',
      brand50: '#f0f9ff',
      glow: 'rgba(2, 132, 199, 0.35)',
      from: '#0369a1',
      to: '#0284c7',
      rgb: '2, 132, 199',
      rgb600: '3, 105, 161',
      rgb400: '56, 189, 248',
      rgb300: '125, 211, 252',
    },
    emerald: {
      brand500: '#10b981',
      brand600: '#059669',
      brand400: '#34d399',
      brand300: '#6ee7b7',
      brand100: '#d1fae5',
      brand50: '#ecfdf5',
      glow: 'rgba(16, 185, 129, 0.35)',
      from: '#059669',
      to: '#10b981',
      rgb: '16, 185, 129',
      rgb600: '5, 150, 105',
      rgb400: '52, 211, 153',
      rgb300: '110, 231, 183',
    },
    amber: {
      brand500: '#f59e0b',
      brand600: '#d97706',
      brand400: '#fbbf24',
      brand300: '#fcd34d',
      brand100: '#fef3c7',
      brand50: '#fffbeb',
      glow: 'rgba(245, 158, 11, 0.35)',
      from: '#d97706',
      to: '#f59e0b',
      rgb: '245, 158, 11',
      rgb600: '217, 119, 6',
      rgb400: '251, 191, 36',
      rgb300: '252, 211, 77',
    },
    rose: {
      brand500: '#f43f5e',
      brand600: '#e11d48',
      brand400: '#fb7185',
      brand300: '#fca5a5',
      brand100: '#ffe4e6',
      brand50: '#fff1f2',
      glow: 'rgba(244, 63, 94, 0.35)',
      from: '#e11d48',
      to: '#f43f5e',
      rgb: '244, 63, 94',
      rgb600: '225, 29, 72',
      rgb400: '251, 113, 133',
      rgb300: '252, 165, 165',
    },
  };

  const applyPaletteToCSS = (palette) => {
    if (!palette || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--brand-500', palette.brand500);
    root.style.setProperty('--brand-600', palette.brand600);
    root.style.setProperty('--brand-400', palette.brand400);
    root.style.setProperty('--brand-300', palette.brand300);
    root.style.setProperty('--brand-100', palette.brand100);
    root.style.setProperty('--brand-50', palette.brand50);
    root.style.setProperty('--brand-glow', palette.glow);
    root.style.setProperty('--brand-from', palette.from);
    root.style.setProperty('--brand-to', palette.to);
    root.style.setProperty('--brand-500-rgb', palette.rgb);
    root.style.setProperty('--brand-600-rgb', palette.rgb600 || palette.rgb);
    root.style.setProperty('--brand-400-rgb', palette.rgb400 || palette.rgb);
    root.style.setProperty('--brand-300-rgb', palette.rgb300 || palette.rgb);
  };

  useEffect(() => {
    const palette = ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.purple;
    applyPaletteToCSS(palette);
  }, [accentColor]);

  // User & Role State
  const [user, setUserState] = useState(() => {
    try {
      const savedName = localStorage.getItem('aisa_user_name');
      const saved = localStorage.getItem('aisa_user');
      const savedEmail = localStorage.getItem('aisa_user_email');
      const savedToken = localStorage.getItem('aisa_token') || localStorage.getItem('token') || localStorage.getItem('uwo_access_token');
      if (saved && savedToken) {
        const u = JSON.parse(saved);
        if (savedName) u.name = savedName;
        if (!u.avatar && savedEmail) {
          const cleanEmail = savedEmail.toLowerCase().trim();
          const savedAvatar = localStorage.getItem(`aisa_user_avatar_${cleanEmail}`);
          if (savedAvatar) u.avatar = savedAvatar;
        }
        return u;
      } else if (savedEmail && savedToken) {
        const cleanEmail = savedEmail.toLowerCase().trim();
        const savedAvatar = localStorage.getItem(`aisa_user_avatar_${cleanEmail}`);
        return { email: savedEmail, name: savedName || savedEmail.split('@')[0], avatar: savedAvatar || '', role: 'AgencyAdmin' };
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const setUser = (update) => {
    setUserState(prev => {
      const updated = typeof update === 'function' ? update(prev) : update;
      if (updated) {
        try {
          if (updated.name) localStorage.setItem('aisa_user_name', updated.name);
          localStorage.setItem('aisa_user', JSON.stringify(updated));
        } catch (e) { }
      }
      return updated;
    });
  };

  const [activeRole, setActiveRole] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.role || 'AgencyAdmin';
      }
    } catch (e) { }
    return 'AgencyAdmin';
  });

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('aisa_user', JSON.stringify(userData));
    if (userData.role) {
      setActiveRole(userData.role);
    }
  };

  const logout = () => {
    setUser(null);
    setUserAvatarState(null);
    localStorage.removeItem('aisa_user');
    localStorage.removeItem('aisa_user_name');
    localStorage.removeItem('aisa_user_email');
    localStorage.removeItem('aisa_user_avatar');
    localStorage.removeItem('aisa_token');
    localStorage.removeItem('token');
    localStorage.removeItem('uwo_access_token');
    localStorage.removeItem('uwo_user');
    setIsSettingsModalOpen(false);
    setActiveModuleState('dashboard');
  };




  // Workspace & Brand DNA Memory
  // Workspace & Brand DNA Memory - Persistent User State
  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_workspaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return [];
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    try {
      return localStorage.getItem('aisa_active_ws_id') || '';
    } catch (e) {
      return '';
    }
  });

  // Keep localStorage synced whenever workspaces state changes
  useEffect(() => {
    try {
      localStorage.setItem('aisa_workspaces', JSON.stringify(workspaces));
    } catch (e) { }
  }, [workspaces]);

  useEffect(() => {
    try {
      if (activeWorkspaceId) {
        localStorage.setItem('aisa_active_ws_id', activeWorkspaceId);
      }
    } catch (e) { }
  }, [activeWorkspaceId]);

  // Sync workspaces from MongoDB Atlas Database on Page Load / Refresh / User Login
  useEffect(() => {
    const fetchWorkspacesFromDb = async () => {
      try {
        const email = user?.email || localStorage.getItem('aisa_user_email') || '';
        const url = email
          ? `${API_BASE}/workspace/list?userEmail=${encodeURIComponent(email)}`
          : `${API_BASE}/workspace/list`;

        const res = await fetch(url, {
          headers: email ? { 'x-user-email': email } : {}
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.workspaces)) {
          if (data.workspaces.length > 0) {
            const formatted = data.workspaces.map(w => ({
              ...w,
              id: w._id || w.id,
              brandVoiceTone: w.brandVoiceTone || { formalityScore: 4, toneKeywords: ['Professional', 'Innovative', 'Reliable'] },
              voiceGuidelines: w.voiceGuidelines || { formalityScore: 4, toneKeywords: w.brandVoiceTone?.toneKeywords || ['Professional', 'Innovative'] }
            }));
            setWorkspaces(formatted);
            setActiveWorkspaceId(prevId => {
              const exists = formatted.some(item => (item.id === prevId || item._id === prevId));
              return exists ? prevId : (formatted[0].id || formatted[0]._id);
            });
          } else {
            // DB is empty for this user account (user has created no brands yet)
            setWorkspaces([]);
            setActiveWorkspaceId('');
            try {
              localStorage.removeItem('aisa_workspaces');
              localStorage.removeItem('aisa_active_ws_id');
            } catch (e) { }
          }
        }
      } catch (err) {
        console.log('Workspace DB Fetch Note:', err.message);
      }
    };

    fetchWorkspacesFromDb();
  }, [user]);



  // Credits & Subscriptions
  const [credits, setCredits] = useState({
    tier: 'Agency',
    balance: 120,
    history: [
      { id: 'tx_001', type: 'MONTHLY_ALLOCATION', credits: 150, timestamp: '2026-07-01T00:00:00Z', note: 'Agency Plan Monthly Renewal' },
      { id: 'tx_002', type: 'DEDUCTION', credits: -10, timestamp: '2026-07-15T10:30:00Z', note: 'AI Carousel Visual Generation' }
    ]
  });

  const [approvalsQueue, setApprovalsQueue] = useState([
    {
      id: 'cnt_101',
      workspaceId: 'ws_001',
      title: 'How AI Ads Transforms Agency Content Production Velocity',
      type: 'BLOG',
      platform: 'Website Blog',
      status: 'APPROVED',
      wordCount: 2150,
      author: 'Senior Copywriter',
      approver: 'Client Marketing Director',
      factCheck: { passed: true, score: 100, status: 'VERIFIED', flags: [] },
      checks: {
        brandDna: { passed: true, score: 98, message: 'Strong alignment with brand voice.' },
        seo: { passed: true, score: 92, message: 'Keywords optimized correctly.' },
        strategy: { passed: true, score: 95, message: 'Matches Q3 campaign goals.' },
        fact: { passed: true, score: 100, message: 'All claims verified.' }
      },
      content: `# How AI Ads Transforms Agency Content Production Velocity\n\nIn today's fast-paced digital ecosystem, agencies are under immense pressure to deliver high-quality content at unprecedented speeds. Enter AI Ads, a game-changing platform designed to supercharge your content production workflow...\n\nBy leveraging advanced machine learning algorithms, AI Ads not only automates repetitive tasks but also ensures that every piece of content remains perfectly aligned with your unique Brand DNA.`,
      history: [
        { id: 'h1', action: 'Submitted for Review', by: 'Senior Copywriter', date: '2026-07-22T09:00:00Z' },
        { id: 'h2', action: 'Approved', by: 'Client Marketing Director', date: '2026-07-22T10:00:00Z', note: 'Looks great, ready to publish.' }
      ],
      createdAt: '2026-07-22T10:00:00Z',
      scheduledDate: '2026-07-28'
    },
    {
      id: 'cnt_102',
      workspaceId: 'ws_001',
      title: '5 Steps to Build Bulletproof Brand DNA in 2026',
      type: 'SOCIAL',
      platform: 'LinkedIn',
      status: 'PENDING',
      author: 'Brand Strategist',
      factCheck: { passed: true, score: 95, status: 'VERIFIED', flags: [] },
      checks: {
        brandDna: { passed: true, score: 95, message: 'Tone is professional and engaging.' },
        seo: { passed: true, score: 88, message: 'Good use of hashtags.' },
        strategy: { passed: false, score: 70, message: 'Missing CTA for the upcoming webinar.' },
        fact: { passed: true, score: 100, message: 'No factual claims made.' }
      },
      content: `Is your Brand DNA ready for the challenges of 2026? 🚀\n\nBuilding a bulletproof brand identity requires more than just a logo and a color palette. It demands a deep understanding of your core values, your target audience's evolving needs, and a consistent voice across all channels.\n\nHere are 5 actionable steps you can take today to fortify your brand's foundation:\n1. Revisit your core mission statement...\n\nSwipe through our latest carousel to learn more!`,
      history: [
        { id: 'h1', action: 'Submitted for Review', by: 'Brand Strategist', date: '2026-07-24T14:30:00Z' }
      ],
      createdAt: '2026-07-24T14:30:00Z',
      scheduledDate: '2026-07-29'
    },
    {
      id: 'cnt_103',
      workspaceId: 'ws_001',
      title: 'Unlocking 400% ROI With Multi-Tenant Campaign Operations',
      type: 'BLOG',
      platform: 'Medium',
      status: 'RED_FLAG_CITATION_NEEDED',
      wordCount: 1800,
      author: 'Gemini 3.5 Editorial Engine',
      factCheck: {
        passed: false,
        score: 60,
        status: 'RED_FLAG_CITATION_NEEDED',
        flags: [{ type: 'UNSUPPORTED_STATISTIC', severity: 'HIGH', message: 'Unverified statistical claim found: "400% ROI". Requires verified source citation.' }]
      },
      checks: {
        brandDna: { passed: true, score: 90, message: 'Tone is authoritative.' },
        seo: { passed: true, score: 96, message: 'Excellent keyword density.' },
        strategy: { passed: true, score: 94, message: 'Matches ROI focus.' },
        fact: { passed: false, score: 60, message: 'Unverified statistic: "400% ROI".' }
      },
      content: `# Unlocking 400% ROI With Multi-Tenant Campaign Operations\n\nManaging multiple client campaigns simultaneously has traditionally been a logistical nightmare for large-scale agencies. However, recent data suggests that adopting a multi-tenant operational model can increase your overall return on investment by a staggering 400%.\n\nThis article explores the architectural shifts required to achieve such unprecedented growth, focusing on unified dashboards, centralized asset management, and AI-driven automation.`,
      history: [
        { id: 'h1', action: 'Generated via AI', by: 'Gemini 3.5', date: '2026-07-25T08:00:00Z' },
        { id: 'h2', action: 'Requested Revision', by: 'Agency Admin', date: '2026-07-25T09:15:00Z', note: 'We need to cite the source for the 400% ROI claim before publishing.' }
      ],
      createdAt: '2026-07-25T09:15:00Z',
      scheduledDate: '2026-08-05'
    }
  ]);

  // Calendar State
  const [calendarEvents, setCalendarEventsState] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_calendar_events');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const setCalendarEvents = (eventsOrFn) => {
    setCalendarEventsState(prev => {
      const next = typeof eventsOrFn === 'function' ? eventsOrFn(prev) : eventsOrFn;
      try { localStorage.setItem('aisa_calendar_events', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const [isQuickPostOpen, setIsQuickPostOpen] = useState(false);
  const [isScraperOpen, setIsScraperOpen] = useState(false);
  const [scraperMode, setScraperMode] = useState('NEW_BRAND'); // 'ACTIVE_BRAND' or 'NEW_BRAND'
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isAISAAssistantOpen, setIsAISAAssistantOpen] = useState(false);

  const getWorkspaceLimit = (plan) => {
    const p = (plan || 'starter').toLowerCase();
    if (p === 'starter' || p === 'base' || p === 'free') return 3;
    if (p === 'pro' || p === 'growth' || p === 'professional') return 10;
    return 9999;
  };

  // Custom Popup Alert Modal & Toast System State
  const [customAlert, setCustomAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'OK',
    cancelText: null,
    onConfirm: null,
    onCancel: null
  });

  const [toast, setToast] = useState({
    isVisible: false,
    text: '',
    type: 'success'
  });

  const showCustomAlert = ({ title, message, type = 'warning', confirmText = 'OK', cancelText = null, onConfirm = null, onCancel = null }) => {
    setCustomAlert({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm,
      onCancel
    });
  };

  const closeCustomAlert = () => {
    setCustomAlert(prev => ({ ...prev, isOpen: false }));
  };

  const showToast = (text, type = 'success') => {
    setToast({ isVisible: true, text, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const openScraperModal = (mode = 'NEW_BRAND') => {
    if (mode === 'NEW_BRAND') {
      const limit = getWorkspaceLimit(user?.plan);
      const createdCount = Math.max(workspaces.length, user?.workspacesCreatedCount || 0);

      if (createdCount >= limit) {
        showCustomAlert({
          title: 'Workspace Limit Reached!',
          message: 'You have already used the number of limit of your brand workspace. Upgrade your plan for more brand space.',
          type: 'warning',
          confirmText: 'Upgrade Plan',
          cancelText: 'OK',
          onConfirm: () => {
            setActiveModule('settings');
            if (setActiveSettingsTab) setActiveSettingsTab('billing');
            setIsSettingsModalOpen(true);
          }
        });
        return;
      }
    }
    setScraperMode(mode);
    setIsScraperOpen(true);
  };

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Brand DNA synced for UWO AI Ads', time: '10m ago', unread: true },
    { id: 2, text: 'Blog draft flagged: Citation Needed', time: '1h ago', unread: true }
  ]);
  const [userAvatar, setUserAvatarState] = useState(() => {
    try {
      // Clean up legacy generic un-scoped avatar key
      localStorage.removeItem('aisa_user_avatar');
      const savedEmail = localStorage.getItem('aisa_user_email');
      if (savedEmail) {
        const cleanEmail = savedEmail.toLowerCase().trim();
        const perUserAvatar = localStorage.getItem(`aisa_user_avatar_${cleanEmail}`);
        if (perUserAvatar) return perUserAvatar;
      }
      const savedUser = localStorage.getItem('aisa_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.avatar) return parsed.avatar;
      }
    } catch (e) { }
    return null;
  });

  // Automatically sync avatar state whenever active logged-in user changes
  useEffect(() => {
    if (!user || !user.email) {
      setUserAvatarState(null);
      return;
    }
    const cleanEmail = user.email.toLowerCase().trim();
    const savedScopedAvatar = localStorage.getItem(`aisa_user_avatar_${cleanEmail}`);
    if (savedScopedAvatar) {
      setUserAvatarState(savedScopedAvatar);
    } else if (user.avatar) {
      setUserAvatarState(user.avatar);
    } else {
      setUserAvatarState(null);
    }
  }, [user?.email, user?.avatar]);

  const setUserAvatar = async (avatarData) => {
    let finalAvatar = avatarData;
    // Compress base64 data URL to ~20KB to avoid browser localStorage quota limits
    if (avatarData && typeof avatarData === 'string' && avatarData.startsWith('data:image')) {
      try {
        finalAvatar = await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const targetSize = 256;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > targetSize) {
                height = Math.round((height * targetSize) / width);
                width = targetSize;
              }
            } else {
              if (height > targetSize) {
                width = Math.round((width * targetSize) / height);
                height = targetSize;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.onerror = () => resolve(avatarData);
          img.src = avatarData;
        });
      } catch (e) {
        finalAvatar = avatarData;
      }
    }

    setUserAvatarState(finalAvatar);
    const activeEmail = (user?.email || localStorage.getItem('aisa_user_email') || '').toLowerCase().trim();

    try {
      localStorage.removeItem('aisa_user_avatar');
      if (finalAvatar) {
        if (activeEmail) {
          try {
            localStorage.setItem(`aisa_user_avatar_${activeEmail}`, finalAvatar);
          } catch (err) {
            console.warn("localStorage quota warning for avatar:", err);
          }
        }
        setUser(prev => {
          const updated = prev ? { ...prev, avatar: finalAvatar } : { avatar: finalAvatar };
          try { localStorage.setItem('aisa_user', JSON.stringify(updated)); } catch (e) { }
          return updated;
        });

        if (activeEmail) {
          fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: activeEmail, avatar: finalAvatar })
          }).catch(err => console.warn("Failed to sync avatar to database:", err));
        }
      } else {
        if (activeEmail) {
          try {
            localStorage.removeItem(`aisa_user_avatar_${activeEmail}`);
          } catch (e) { }
        }
        setUser(prev => {
          if (!prev) return prev;
          const { avatar, ...rest } = prev;
          try { localStorage.setItem('aisa_user', JSON.stringify(rest)); } catch (e) { }
          return rest;
        });

        if (activeEmail) {
          fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: activeEmail, avatar: '' })
          }).catch(err => console.warn("Failed to clear avatar in database:", err));
        }
      }
    } catch (e) {
      console.error("Error saving user avatar to localStorage:", e);
    }
  };

  const rawWs = workspaces.find(w => w.id === activeWorkspaceId || w._id === activeWorkspaceId) || workspaces[0];
  const activeWorkspace = rawWs ? {
    ...rawWs,
    logoUrl: rawWs.logoUrl || rawWs.profile?.logoUrl || rawWs.brandDnaProfile?.logoUrl || rawWs.faviconUrl || '',
    domainUrl: rawWs.domainUrl || rawWs.profile?.website || rawWs.website || ''
  } : {
    id: 'ws_empty',
    brandName: 'No Brand Loaded',
    domainUrl: 'https://',
    logoUrl: '',
    brandColors: ['#6366F1', '#8B5CF6'],
    targetAudience: [],
    brandVoiceTone: { formalityScore: 3, toneKeywords: [] },
    competitorLandscape: [],
    contentPillars: [],
    socialMediaPresence: [],
    contactInfo: { email: '', phone: '', location: '' },
    industryCategory: 'General',
    missionStatement: '',
    tagline: '',
    approvedClaims: [],
    restrictedClaims: []
  };

  const addWorkspace = async (newWs) => {
    const limit = getWorkspaceLimit(user?.plan);
    const createdCount = Math.max(workspaces.length, user?.workspacesCreatedCount || 0);

    if (createdCount >= limit) {
      showCustomAlert({
        title: 'Workspace Limit Reached!',
        message: 'You have already used the number of limit of your brand workspace. Upgrade your plan for more brand space.',
        type: 'warning',
        confirmText: 'Upgrade Plan',
        cancelText: 'OK',
        onConfirm: () => {
          setActiveModule('settings');
          if (setActiveSettingsTab) setActiveSettingsTab('billing');
          setIsSettingsModalOpen(true);
        }
      });
      return null;
    }
    try {
      const email = user?.email || localStorage.getItem('aisa_user_email') || '';
      const payload = { ...newWs, userEmail: email };

      // Persist workspace to MongoDB Atlas ONLY when user clicks "Save & Lock Brand DNA Memory"
      const res = await fetch(`${API_BASE}/workspace/save-dna`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.workspace) {
        const savedDoc = {
          ...data.workspace,
          id: data.workspace._id || data.workspace.id || `ws_${Date.now()}`
        };
        setWorkspaces(prev => {
          const exists = prev.some(w => (w.id === savedDoc.id || w._id === savedDoc.id));
          if (exists) return prev.map(w => (w.id === savedDoc.id || w._id === savedDoc.id) ? savedDoc : w);
          return [savedDoc, ...prev];
        });
        setActiveWorkspaceId(savedDoc.id);
        
        // Optimistically increment locally
        setUser(prev => prev ? { ...prev, workspacesCreatedCount: (prev.workspacesCreatedCount || 0) + 1 } : prev);

        return savedDoc;
      }
    } catch (e) {
      console.log('Workspace Save DNA Error:', e.message);
    }

    // Local Fallback if offline
    const formatted = {
      ...newWs,
      id: newWs._id || newWs.id || `ws_${Date.now()}`,
      brandVoiceTone: newWs.brandVoiceTone || { formalityScore: 4, toneKeywords: ['Professional', 'Innovative', 'Reliable'] },
      voiceGuidelines: newWs.voiceGuidelines || { formalityScore: 4, toneKeywords: ['Professional', 'Innovative'] }
    };
    setWorkspaces(prev => {
      const exists = prev.some(w => (w.id === formatted.id || w._id === formatted.id));
      if (exists) return prev;
      return [formatted, ...prev];
    });
    setActiveWorkspaceId(formatted.id);
    return formatted;
  };


  const updateWorkspace = async (id, updatedData) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/workspace/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (data.success && data.workspace) {
        const updatedDoc = { ...data.workspace, id: data.workspace._id || data.workspace.id || id };
        setWorkspaces(prev => prev.map(w => (w.id === id || w._id === id) ? updatedDoc : w));
        return;
      }
    } catch (e) {
      console.log('Workspace Update Note:', e.message);
    }
    setWorkspaces(prev => prev.map(w => (w.id === id || w._id === id) ? { ...w, ...updatedData } : w));
  };



  const deleteWorkspace = async (idToDelete) => {
    if (!idToDelete) return;

    // Optimistic Update: Update UI instantly
    const updated = workspaces.filter(w => w.id !== idToDelete && w._id !== idToDelete);
    setWorkspaces(updated);

    if (activeWorkspaceId === idToDelete || activeWorkspace?._id === idToDelete) {
      if (updated.length > 0) {
        setActiveWorkspaceId(updated[0].id || updated[0]._id);
      } else {
        setActiveWorkspaceId('ws_empty');
      }
    }

    // Perform API call in background
    try {
      await fetch(`${API_BASE}/workspace/${idToDelete}`, { method: 'DELETE' });
    } catch (e) {
      console.log('Workspace Delete Note:', e.message);
    }
  };


  const deductVisualCredits = (cost = 5, reason = 'AI Visual Synthesis') => {
    if (credits.balance < cost) {
      showCustomAlert({
        title: 'Insufficient Visual Credits',
        message: `Current balance: ${credits.balance}, required: ${cost} credits. Please top up to generate more visual assets.`,
        type: 'warning',
        confirmText: 'Top Up Credits',
        cancelText: 'Cancel',
        onConfirm: () => setIsCreditModalOpen(true)
      });
      return false;
    }
    setCredits(prev => ({
      ...prev,
      balance: prev.balance - cost,
      history: [{ id: `tx_${Date.now()}`, type: 'DEDUCTION', credits: -cost, timestamp: new Date().toISOString(), note: reason }, ...prev.history]
    }));
    return true;
  };

  const topUpCredits = (amount = 50, packName = '50 Credit Pack') => {
    setCredits(prev => ({
      ...prev,
      balance: prev.balance + amount,
      history: [{ id: `tx_${Date.now()}`, type: 'PURCHASE', credits: amount, timestamp: new Date().toISOString(), note: `Razorpay: ${packName}` }, ...prev.history]
    }));
  };

  const updateApprovalStatus = (id, newStatus, comment = '') => {
    setApprovalsQueue(prev => prev.map(item => item.id === id ? { ...item, status: newStatus, reviewerComment: comment } : item));
  };

  const addCalendarEvent = (event) => {
    setCalendarEvents(prev => [{ id: `cal_${Date.now()}_${Math.random()}`, ...event }, ...prev]);
  };

  const bulkAddCalendarEvents = (events) => {
    const newEvents = events.map((event, i) => ({
      id: `cal_${Date.now()}_${i}_${Math.random()}`,
      ...event
    }));
    setCalendarEvents(prev => [...newEvents, ...prev]);
  };

  // ─── Global Asset Management & Deduplication ──────────────────────────────────
  const dedupeAssetsList = (assetsList) => {
    if (!Array.isArray(assetsList)) return [];
    const result = [];
    const seenMap = new Map();

    for (const a of assetsList) {
      if (!a) continue;

      const name = (a.name || a.title || '').trim();
      const cleanName = name.toLowerCase();
      const type = (a.type || a.category || 'DOCUMENT').trim().toUpperCase();
      const platform = (a.metadata?.platform || '').trim().toLowerCase();
      const url = (a.url || '').trim();
      const id = (a.id || '').toString().trim();

      // Build uniqueness signatures
      const keys = [];
      if (id) keys.push(`id:${id}`);
      if (url && url.length > 15 && !url.includes('picsum.photos')) keys.push(`url:${url}`);
      if (cleanName && cleanName !== 'brand asset') keys.push(`name:${cleanName}:${type}:${platform}`);

      let existingIndex = -1;
      for (const k of keys) {
        if (seenMap.has(k)) {
          existingIndex = seenMap.get(k);
          break;
        }
      }

      if (existingIndex >= 0) {
        // Merge fields with existing entry, preserving rich data like database ID and generated image URL
        const existing = result[existingIndex];
        const merged = {
          ...existing,
          ...a,
          url: a.url || existing.url,
          content: a.content || existing.content,
          id: (existing.id && !existing.id.startsWith('asset_') ? existing.id : a.id) || existing.id,
          metadata: {
            ...(existing.metadata || {}),
            ...(a.metadata || {})
          }
        };
        result[existingIndex] = merged;
        for (const k of keys) {
          seenMap.set(k, existingIndex);
        }
      } else {
        const newIndex = result.length;
        result.push(a);
        for (const k of keys) {
          seenMap.set(k, newIndex);
        }
      }
    }

    return result;
  };

  const saveAssetsToLocalStorage = (assetsList, wsId) => {
    try {
      const deduped = dedupeAssetsList(assetsList);
      const serialized = JSON.stringify(deduped);
      if (wsId) localStorage.setItem(`aisa_assets_${wsId}`, serialized);
      localStorage.setItem('aisa_global_assets', serialized);
    } catch (quotaErr) {
      console.warn('LocalStorage quota notice - caching stripped asset payload:', quotaErr.message);
      try {
        const deduped = dedupeAssetsList(assetsList);
        const stripped = deduped.map(a => ({
          ...a,
          content: a.content && a.content.length > 5000 ? a.content.slice(0, 1000) + '...' : a.content
        }));
        const strippedSerialized = JSON.stringify(stripped);
        if (wsId) localStorage.setItem(`aisa_assets_${wsId}`, strippedSerialized);
        localStorage.setItem('aisa_global_assets', strippedSerialized);
      } catch (e2) {}
    }
  };

  const [globalAssets, setGlobalAssets] = useState(() => {
    try {
      const savedGlobal = localStorage.getItem('aisa_global_assets');
      const savedWs = activeWorkspaceId ? localStorage.getItem(`aisa_assets_${activeWorkspaceId}`) : null;
      const wsArr = savedWs ? JSON.parse(savedWs) : [];
      const globalArr = savedGlobal ? JSON.parse(savedGlobal) : [];
      return dedupeAssetsList([...wsArr, ...globalArr]);
    } catch {
      return [];
    }
  });

  // Sync assets from DB whenever workspace or user changes
  useEffect(() => {
    const syncAssetsFromDb = async () => {
      try {
        const currentWs = activeWorkspaceId || activeWorkspace?._id || activeWorkspace?.id;
        const url = currentWs
          ? `${API_BASE}/content/list-assets?workspaceId=${currentWs}`
          : `${API_BASE}/content/list-assets`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.assets) && data.assets.length > 0) {
          setGlobalAssets(prev => {
            const merged = dedupeAssetsList([...data.assets, ...prev]);
            saveAssetsToLocalStorage(merged, currentWs);
            return merged;
          });
        }
      } catch (err) {
        console.log('Asset DB sync notice:', err.message);
      }
    };

    syncAssetsFromDb();
  }, [activeWorkspaceId, user]);

  const addGlobalAsset = (asset) => {
    const currentWs = activeWorkspaceId || activeWorkspace?._id || activeWorkspace?.id || 'ws_001';
    const currentBrand = activeWorkspace?.brandName || '';

    const newAsset = {
      id: asset.id || `asset_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: asset.name || asset.title || 'Brand Asset',
      type: (asset.type || 'DOCUMENT').toUpperCase(), // 'IMAGE' | 'CAROUSEL' | 'DOCUMENT' | 'SOCIAL' | 'BLOG' | 'EMAIL'
      url: asset.url || '',
      date: asset.date || new Date().toISOString(),
      credits: asset.credits || 0,
      workspaceId: asset.workspaceId || currentWs,
      content: asset.content || asset.caption || '',
      metadata: {
        brand: currentBrand,
        ...(asset.metadata || {})
      },
      category: asset.category || asset.type || 'DOCUMENT'
    };

    // Dispatch backend API request to persist asset in database
    try {
      const apiUrl = `${API_BASE}/content/save-asset`;
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      }).catch(() => { });
    } catch (e) { }

    setGlobalAssets(prev => {
      const updated = dedupeAssetsList([newAsset, ...prev]);
      saveAssetsToLocalStorage(updated, currentWs);
      return updated;
    });

    return newAsset;
  };

  const removeGlobalAsset = (id) => {
    const currentWs = activeWorkspaceId || activeWorkspace?._id || activeWorkspace?.id;
    setGlobalAssets(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveAssetsToLocalStorage(updated, currentWs);
      return updated;
    });
  };


  // Real-Time Generated Posts Tracker per Workspace
  const [generatedPostsTracker, setGeneratedPostsTracker] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_generated_posts_tracker');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const markPostAsGenerated = (key, details = {}) => {
    if (!key) return;
    const wsId = activeWorkspaceId || activeWorkspace?._id || activeWorkspace?.id || 'ws_default';
    const cleanKey = String(key).trim();

    setGeneratedPostsTracker(prev => {
      const currentWsMap = prev[wsId] || {};
      const updated = {
        ...prev,
        [wsId]: {
          ...currentWsMap,
          [cleanKey]: {
            generatedAt: new Date().toISOString(),
            platform: details.platform || 'social',
            topic: details.topic || details.title || cleanKey,
            ...details
          }
        }
      };
      try {
        localStorage.setItem('aisa_generated_posts_tracker', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Asset Library Deep-Link Context: navigate to specific asset from calendar
  const [selectedAssetContext, setSelectedAssetContext] = useState(null);

  return (
    <WorkspaceContext.Provider value={{
      activeModule, setActiveModule, goBack, canGoBack, navigationHistory,
      theme, setTheme, toggleTheme,
      user, setUser, loginUser, logout,
      activeRole, setActiveRole,
      workspaces, activeWorkspaceId, setActiveWorkspaceId, activeWorkspace, addWorkspace, updateWorkspace, deleteWorkspace,

      credits, deductVisualCredits, topUpCredits,
      approvalsQueue, setApprovalsQueue, updateApprovalStatus,
      calendarEvents, setCalendarEvents, addCalendarEvent, bulkAddCalendarEvents,
      globalAssets, setGlobalAssets, addGlobalAsset, removeGlobalAsset,
      isQuickPostOpen, setIsQuickPostOpen,
      isScraperOpen, setIsScraperOpen, scraperMode, setScraperMode, openScraperModal,

      isCreditModalOpen, setIsCreditModalOpen,
      isAISAAssistantOpen, setIsAISAAssistantOpen,
      notifications, setNotifications,
      userAvatar, setUserAvatar,

      // Custom Alert & Toast System
      customAlert, showCustomAlert, closeCustomAlert,
      toast, showToast, closeToast,

      // Mobile Navigation Drawer State & Account Settings
      isMobileMenuOpen, setIsMobileMenuOpen,
      isSettingsModalOpen, setIsSettingsModalOpen,
      activeSettingsTab, setActiveSettingsTab,
      appearance, setAppearance,
      accentColor, setAccentColor,
      region, setRegion,
      language, setLanguage, t,
      multiScheduleReminder, setMultiScheduleReminder,
      notificationPreferences, setNotificationPreferences,
      dataControlPreferences, setDataControlPreferences,
      studioTarget, setStudioTarget,
      generatedContent, setGeneratedContent,
      generatedPostsTracker, markPostAsGenerated,
      selectedAssetContext, setSelectedAssetContext,

      // End-to-End Pipeline State & Actions
      brandDnaData, setBrandDnaData,
      seoSearchData, setSeoSearchData,
      seoSearchDataMap, isSeoAuditingMap,
      saveSeoDataForWorkspace, getSeoDataForWorkspace, runSeoAuditInBackground,
      generatedStrategy, setGeneratedStrategy,
      sendContentToApprovals: (payload) => {
        const newItem = {
          id: `cnt_${Date.now()}`,
          workspaceId: activeWorkspaceId || 'ws_001',
          title: payload.topic || payload.title || payload.subject || payload.headline || 'Generated Marketing Post',
          type: (payload.type || payload.postType || 'SOCIAL').toUpperCase(),
          platform: payload.platform || 'instagram',
          status: 'PENDING',
          author: 'Content Studio AI',
          content: payload.caption || payload.longCaption || payload.body || payload.leadParagraph || '',
          payload: payload,
          createdAt: new Date().toISOString(),
          scheduledDate: payload.scheduledDate || new Date().toISOString().split('T')[0],
          checks: {
            brandDna: { passed: true, score: 98, message: 'Aligned with Brand DNA.' },
            seo: { passed: true, score: 95, message: 'Optimized keywords.' },
            strategy: { passed: true, score: 96, message: 'Campaign goal matched.' },
            fact: { passed: true, score: 100, message: 'No citations needed.' }
          }
        };
        setApprovalsQueue(prev => [newItem, ...prev]);
        setActiveModule('approvals');
      },
      approveAndSendToCreative: (item) => {
        const updatedQueue = approvalsQueue.map(i =>
          (i.id === item.id || i._id === item._id) ? { ...i, status: 'APPROVED' } : i
        );
        setApprovalsQueue(updatedQueue);

        let cleanText = item.content || item.payload?.content || item.payload?.caption || item.payload?.body || '';
        let cleanTitle = item.title || item.payload?.title || 'Brand Content';
        let cleanMeta = '';

        if (typeof cleanText === 'string' && (cleanText.trim().startsWith('{') || cleanText.trim().startsWith('```json'))) {
          try {
            const rawClean = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
            const parsed = JSON.parse(rawClean);
            if (parsed.data && typeof parsed.data === 'object') {
              cleanText = parsed.data.content || parsed.data.body || cleanText;
              cleanTitle = parsed.data.title || cleanTitle;
              cleanMeta = parsed.data.metaDescription || '';
            } else {
              cleanText = parsed.content || parsed.body || cleanText;
              cleanTitle = parsed.title || cleanTitle;
              cleanMeta = parsed.metaDescription || '';
            }
          } catch (e) { }
        }

        const contentPayload = item.payload || {
          topic: cleanTitle,
          title: cleanTitle,
          type: item.type,
          platform: item.platform || 'blog',
          hook: cleanTitle,
          content: cleanText,
          metaDescription: cleanMeta,
          caption: cleanText,
          shortCaption: cleanMeta || cleanText?.slice(0, 120),
          longCaption: cleanText,
          cta: 'Read full article',
          hashtags: ['#SEO', '#BrandDNA', '#Growth']
        };

        setGeneratedContent(contentPayload);
        setStudioTarget(contentPayload);
        setActiveModule('creative');
      }
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  return context || DEFAULT_WORKSPACE_CONTEXT;
};
