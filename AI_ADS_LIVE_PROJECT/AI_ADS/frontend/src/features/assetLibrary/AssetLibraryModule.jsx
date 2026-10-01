import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { downloadImageToDevice } from '../../utils/downloadHelper';
import {
  FolderKanban, Search, Download, ExternalLink, Image as ImageIcon,
  FileText, Layers, Check, ArrowUpRight, Sparkles, Film, BookOpen,
  Copy, Eye, X, Calendar, Tag, Clock, Trash2, FolderOpen, LayoutGrid,
  CheckCircle2, ArrowLeft, Share2, Twitter, Linkedin, Mail, MessageCircle, Send, Link2, ArrowRight
} from 'lucide-react';

import FullImageModal from '../../components/modals/FullImageModal';

// ━━━ Content Studio Aligned Asset Sections ━━━━━━━━━━━━━━━━━━━━━
const ASSET_SECTIONS = [
  {
    id: 'ALL',
    title: 'All Assets',
    subtitle: 'Complete Brand Vault & Cloud Repository',
    icon: FolderKanban,
    colorClass: 'from-indigo-500/10 to-purple-500/5',
    hoverBorder: 'hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    iconColor: 'text-indigo-500',
    studioTab: 'BLOG'
  },
  {
    id: 'BLOG',
    title: 'Blog',
    subtitle: 'Articles, Guides & SEO Copy',
    icon: FileText,
    colorClass: 'from-blue-500/10 to-cyan-500/5',
    hoverBorder: 'hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    iconColor: 'text-blue-500',
    studioTab: 'BLOG'
  },
  {
    id: 'SOCIAL',
    title: 'Social Media',
    subtitle: 'Posts, Carousels & Reels',
    icon: Share2,
    colorClass: 'from-purple-500/10 to-pink-500/5',
    hoverBorder: 'hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    iconColor: 'text-purple-500',
    studioTab: 'SOCIAL'
  },
  {
    id: 'EMAIL',
    title: 'Email / Letter',
    subtitle: 'Newsletters & Cold Outreach',
    icon: Mail,
    colorClass: 'from-emerald-500/10 to-teal-500/5',
    hoverBorder: 'hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    iconColor: 'text-emerald-500',
    studioTab: 'EMAIL'
  }
];

// ━━━ Format Date & Generation Time ━━━━━━━━━━━━━━━━━━━━━━━━━
const formatDate = (iso) => {
  if (!iso) return 'Recent';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Recent';
  const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const str = String(iso);
  if (str.length === 10 && str.indexOf(':') === -1 && str.indexOf('T') === -1) {
    return dateStr;
  }
  return `${dateStr}, ${timeStr}`;
};

// ━━━ Direct Device Download Helper ━━━━━━━━━━━━━━━━━━━━━━━━━
const triggerDirectDeviceDownload = async (asset) => {
  if (!asset) return false;
  const cleanName = (asset.name || 'asset').replace(/[^a-z0-9_\- ]/gi, '_').slice(0, 60);

  if (asset.url) {
    return await downloadImageToDevice(asset.url, `${cleanName}.jpg`, {
      brandName: asset.metadata?.brand || asset.brand
    });
  }

  const textContent = asset.content || asset.name || '';
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${cleanName}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
  return true;
};

// ━━━ Clean text for preview ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const cleanText = (raw) => {
  if (!raw) return '';
  return raw
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[*_]/g, '')
    .replace(/`{1,3}.*?`{1,3}/gs, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/undefined/g, '')
    .trim();
};

// ━━━ Asset Detail Drawer Modal ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AssetDetailDrawer = ({ asset, onClose, onDelete, onOpenFullImage }) => {
  const [copiedContent, setCopiedContent] = useState(false);
  const [downloadedDrawer, setDownloadedDrawer] = useState(false);

  if (!asset) return null;

  const typeColors = {
    BLOG: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    SOCIAL: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    EMAIL: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    NEWSPAPER: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    CAROUSEL: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
  };

  const handleCopyContent = () => {
    const textToCopy = asset.content || asset.url || asset.name;
    navigator.clipboard.writeText(textToCopy);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const handleDrawerDownload = async () => {
    await triggerDirectDeviceDownload(asset);
    setDownloadedDrawer(true);
    setTimeout(() => setDownloadedDrawer(false), 2500);
  };

  const isVisual = asset.url && (asset.url.startsWith('http') || asset.url.startsWith('data:image'));
  const cleanedBody = cleanText(asset.content);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        
        <div 
          className="relative aspect-video max-h-[260px] bg-slate-950 shrink-0 overflow-hidden group cursor-pointer"
          onClick={() => {
            if (isVisual && onOpenFullImage) {
              onOpenFullImage({ url: asset.url, title: asset.name });
            }
          }}
        >
          {isVisual ? (
            <>
              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-extrabold text-xs">
                <Eye className="w-4 h-4 text-emerald-400" /> 
                <span>View Full Resolution Image</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 p-6 text-center">
              <FileText className="w-12 h-12 text-brand-400 mb-2 opacity-80" />
              <p className="text-sm font-extrabold text-white line-clamp-2 max-w-md">{asset.name}</p>
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-colors z-10" title="Close Preview">
            <X className="w-4 h-4" />
          </button>
          <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${typeColors[asset.type] || 'bg-brand-500/10 text-brand-400 border-brand-500/30'}`}>
            {asset.type || 'DOCUMENT'}
          </span>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto font-sans flex-1">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{asset.name}</h2>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300"><Clock className="w-3 h-3 text-brand-500 shrink-0" /> {formatDate(asset.date)}</span>
                <span>&bull;</span>
                <span>Type: <strong className="text-slate-700 dark:text-slate-300">{asset.type}</strong></span>
              </div>
            </div>
            {onDelete && (
              <button
                onClick={() => { onDelete(asset.id); onClose(); }}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Delete Asset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {cleanedBody && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Asset Content</span>
                <button
                  onClick={handleCopyContent}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
                >
                  <Copy className="w-3 h-3" /> {copiedContent ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-sans">
                {cleanedBody}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCopyContent}
              className="flex-1 btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" /> {copiedContent ? 'Copied Text!' : 'Copy Content'}
            </button>
            <button
              onClick={handleDrawerDownload}
              className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              {downloadedDrawer ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Download className="w-3.5 h-3.5" />}
              {downloadedDrawer ? 'Downloaded!' : 'Download to Device'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ━━━ Main Asset Library Module ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const AssetLibraryModule = () => {
  const { activeWorkspace, t, globalAssets = [], removeGlobalAsset, selectedAssetContext, setSelectedAssetContext, setActiveModule, studioTarget } = useWorkspace();
  const [activeSection, setActiveSection] = useState(() => {
    return studioTarget?.assetTab || studioTarget?.targetTab || 'ALL';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [downloadedId, setDownloadedId] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [fullImageModal, setFullImageModal] = useState(null);
  const [sharePopoverId, setSharePopoverId] = useState(null);
  const sharePopoverRef = useRef(null);
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    if (studioTarget?.assetTab || studioTarget?.targetTab) {
      setActiveSection(studioTarget.assetTab || studioTarget.targetTab);
    }
  }, [studioTarget]);

  const currentWsId = activeWorkspace?._id || activeWorkspace?.id;
  const currentBrand = activeWorkspace?.brandName;

  const dedupeAssets = (assetsList) => {
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
        const existing = result[existingIndex];
        result[existingIndex] = {
          ...existing,
          ...a,
          url: a.url || existing.url,
          content: a.content || existing.content,
          id: (existing.id && !existing.id.startsWith('asset_') ? existing.id : a.id) || existing.id,
        };
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

  const rawAssets = globalAssets.filter(a => {
    if (!a) return false;
    // If active workspace is still initializing / loading on page reload, keep all global assets visible
    if (!currentWsId && !currentBrand) return true;

    const isCurrentDefault = !currentWsId || currentWsId.startsWith('ws_empty') || currentWsId === 'ws_001' || currentWsId === 'ws_default';
    const isAssetDefault = !a.workspaceId || a.workspaceId.startsWith('ws_empty') || a.workspaceId === 'ws_001' || a.workspaceId === 'ws_default';

    let matchWs = false;
    if (isCurrentDefault) {
      matchWs = isAssetDefault;
    } else {
      matchWs = Boolean(a.workspaceId && a.workspaceId === currentWsId);
    }

    const matchBrand = Boolean(a.metadata?.brand && currentBrand && a.metadata.brand.trim().toLowerCase() === currentBrand.trim().toLowerCase());

    // Only show assets explicitly matching the active brand/workspace
    return matchWs || matchBrand;
  });

  const assets = dedupeAssets(rawAssets);

  const isSameDayAsset = (assetDate, calDate) => {
    if (!assetDate || !calDate) return false;
    const a = new Date(assetDate);
    const b = new Date(calDate);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  useEffect(() => {
    if (!selectedAssetContext || hasAutoOpenedRef.current) return;
    hasAutoOpenedRef.current = true;

    const match = assets.find(a => {
      const dateMatch = isSameDayAsset(a.date, selectedAssetContext.calendarDate);
      if (dateMatch) return true;
      if (selectedAssetContext.title && a.name) {
        const kw = selectedAssetContext.title.toLowerCase().split(' ')[0];
        if (kw && kw.length > 3 && a.name.toLowerCase().includes(kw)) return true;
      }
      return false;
    });

    if (match) {
      setSelectedAsset(match);
      if (match.type && match.type !== activeSection) {
        setActiveSection(match.type);
      }
    }
  }, [selectedAssetContext, assets]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sharePopoverRef.current && !sharePopoverRef.current.contains(e.target)) {
        setSharePopoverId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const copyUrl = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAsset = async (e, asset) => {
    e.stopPropagation();
    await triggerDirectDeviceDownload(asset);
    setDownloadedId(asset.id);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  const sectionCounts = {
    ALL: assets.length,
    BLOG: assets.filter(a => a.type === 'BLOG').length,
    SOCIAL: assets.filter(a => a.type === 'SOCIAL' || a.type === 'CAROUSEL' || a.type === 'IMAGE').length,
    EMAIL: assets.filter(a => a.type === 'EMAIL' || a.type === 'NEWSPAPER').length,
  };

  const filteredAssets = assets.filter(a => {
    const matchesSection =
      activeSection === 'ALL' ||
      a.type === activeSection ||
      (activeSection === 'SOCIAL' && (a.type === 'CAROUSEL' || a.type === 'SOCIAL' || a.type === 'IMAGE')) ||
      (activeSection === 'EMAIL' && (a.type === 'NEWSPAPER' || a.type === 'EMAIL'));

    const matchesSearch =
      !searchTerm ||
      (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.content || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSection && matchesSearch;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (selectedAssetContext) {
      const aIsMatch = isSameDayAsset(a.date, selectedAssetContext.calendarDate);
      const bIsMatch = isSameDayAsset(b.date, selectedAssetContext.calendarDate);
      if (aIsMatch && !bIsMatch) return -1;
      if (!aIsMatch && bIsMatch) return 1;
    }
    return new Date(b.date || 0) - new Date(a.date || 0);
  });

  const typeColors = {
    BLOG: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    SOCIAL: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    EMAIL: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    NEWSPAPER: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    CAROUSEL: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
  };

  const getShareTargets = (asset) => {
    const title = encodeURIComponent(asset.name || 'Check out this marketing asset');
    const text = encodeURIComponent(cleanText(asset.content).slice(0, 200));
    const url = encodeURIComponent(asset.url || window.location.href);

    return [
      {
        label: 'Twitter / X',
        icon: <Twitter className="w-3.5 h-3.5 text-sky-400" />,
        bg: 'hover:bg-sky-500/10 hover:text-sky-400',
        href: `https://twitter.com/intent/tweet?text=${title}&url=${url}`
      },
      {
        label: 'LinkedIn',
        icon: <Linkedin className="w-3.5 h-3.5 text-blue-500" />,
        bg: 'hover:bg-blue-500/10 hover:text-blue-500',
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
      },
      {
        label: 'Email',
        icon: <Mail className="w-3.5 h-3.5 text-emerald-400" />,
        bg: 'hover:bg-emerald-500/10 hover:text-emerald-400',
        href: `mailto:?subject=${title}&body=${text}%20${url}`
      },
      {
        label: 'Copy Share Link',
        icon: <Link2 className="w-3.5 h-3.5 text-brand-400" />,
        bg: 'hover:bg-brand-500/10 hover:text-brand-400',
        action: () => {
          navigator.clipboard.writeText(asset.url || window.location.href);
          setCopiedId(asset.id);
          setSharePopoverId(null);
          setTimeout(() => setCopiedId(null), 2000);
        }
      }
    ];
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-[1600px] mx-auto pb-10">
      
      {selectedAssetContext && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-brand-500/15 border border-emerald-500/30 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Calendar Filter Active</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {selectedAssetContext.dateLabel}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                Filtering vault assets for scheduled topic: <strong className="text-brand-600 dark:text-brand-400">{selectedAssetContext.title}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedAssetContext(null)}
            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" /> Clear Filter
          </button>
        </div>
      )}

      <div className="p-6 accent-card rounded-3xl bg-white dark:bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Central Asset Library & Cloud Storage Vault</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Stores every generated visual, document, carousel, and repurposed variant for <strong className="text-slate-900 dark:text-white">{currentBrand || 'your workspace'}</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assets..."
            className="glass-input text-xs pl-4 pr-10 py-2.5 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 font-medium w-64 rounded-xl"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ASSET_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isSelected = activeSection === sec.id;
          const count = sectionCounts[sec.id] || 0;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`p-5 rounded-3xl text-left transition-all duration-300 border flex flex-col justify-between group relative overflow-hidden bg-white dark:bg-slate-900/60 shadow-sm ${
                isSelected
                  ? 'border-brand-500 dark:border-brand-500 ring-2 ring-brand-500/20 bg-brand-500/5 dark:bg-brand-500/10 shadow-md'
                  : `border-slate-200 dark:border-slate-800 ${sec.hoverBorder}`
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${sec.colorClass} opacity-30 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${sec.badgeBg} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`w-5 h-5 ${sec.iconColor}`} />
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {count}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">{sec.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">{sec.subtitle}</p>
                </div>
              </div>

              <div className="relative z-10 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span className={isSelected ? 'text-brand-600 dark:text-brand-400 font-extrabold' : ''}>
                  {isSelected ? 'Active Vault' : 'Filter Section'}
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-brand-600 dark:text-brand-400 font-bold">
                  View Assets <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {sortedAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedAssets.map(asset => {
            const isHighlighted = selectedAssetContext && isSameDayAsset(asset.date, selectedAssetContext?.calendarDate);
            return (
              <div
                key={asset.id}
                className={`p-4 rounded-3xl glass-card border transition-all duration-300 space-y-3 group cursor-pointer hover:shadow-lg ${
                  isHighlighted
                    ? 'border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10 hover:border-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-brand-500/40 hover:shadow-brand-500/5'
                }`}
                onClick={() => setSelectedAsset(asset)}
              >
                {isHighlighted && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Downloaded · {selectedAssetContext.dateLabel}
                    </span>
                  </div>
                )}
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                  {asset.url && (asset.url.startsWith('http') || asset.url.startsWith('data:image')) ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <FileText className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${typeColors[asset.type] || 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
                    {asset.type}
                  </span>
                  <div 
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                    onClick={(e) => {
                      if (asset.url && (asset.url.startsWith('http') || asset.url.startsWith('data:image'))) {
                        e.stopPropagation();
                        setFullImageModal({ url: asset.url, title: asset.name });
                      }
                    }}
                  >
                    <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center gap-1.5 text-white font-extrabold text-xs">
                      <Eye className="w-5 h-5 text-white" />
                      <span className="text-[11px] font-extrabold">View Full Image</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xs line-clamp-2 leading-snug">{asset.name}</h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3 h-3 text-brand-500 shrink-0" />
                      {formatDate(asset.date)}
                    </span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold">{asset.metadata?.platform ? asset.metadata.platform.toUpperCase() : (asset.type || 'ASSET')}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(asset.id, asset.content || asset.url || asset.name);
                    }}
                    className="w-full btn-secondary py-1.5 text-[11px] font-bold flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300"
                  >
                    {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === asset.id ? 'Copied Content!' : 'Copy Text'}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <button
                    title="Download asset"
                    onClick={(e) => downloadAsset(e, asset)}
                    className={`flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
                      downloadedId === asset.id
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-brand-500/10 hover:bg-brand-600/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:border-brand-500/40'
                    }`}
                  >
                    {downloadedId === asset.id
                      ? <><Check className="w-3.5 h-3.5" />&nbsp;Saved!</>
                      : <><Download className="w-3.5 h-3.5" />&nbsp;Download</>}
                  </button>

                  <div
                    className="relative"
                    ref={sharePopoverId === asset.id ? sharePopoverRef : null}
                  >
                    <button
                      title="Share this asset"
                      onClick={(e) => { e.stopPropagation(); setSharePopoverId(prev => prev === asset.id ? null : asset.id); }}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {sharePopoverId === asset.id && (
                      <div
                        className="absolute bottom-full right-0 mb-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 w-44 animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Share via</p>
                        <div className="space-y-0.5">
                          {getShareTargets(asset).map((target) => (
                            target.href ? (
                              <a
                                key={target.label}
                                href={target.href}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setSharePopoverId(null)}
                                className={`flex items-center gap-2.5 px-2 py-2 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 ${target.bg} transition-colors cursor-pointer`}
                              >
                                {target.icon}
                                {target.label}
                              </a>
                            ) : (
                              <button
                                key={target.label}
                                onClick={() => { target.action(); }}
                                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 ${target.bg} transition-colors`}
                              >
                                {target.icon}
                                {target.label}
                              </button>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center accent-card rounded-3xl bg-white dark:bg-slate-900 space-y-4 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              No {activeSection === 'ALL' ? '' : activeSection} Assets in Vault
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              You haven't saved any {activeSection.toLowerCase()} assets for <strong>{activeWorkspace?.brandName || 'this brand'}</strong> yet. Generate high-velocity content in Content Studio and save it here.
            </p>
          </div>
          <button
            onClick={() => {
              if (setActiveModule) setActiveModule('content');
              if (window.location.pathname !== '/content-studio') {
                window.history.pushState({ module: 'content' }, '', '/content-studio');
              }
            }}
            className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Open Content Studio
          </button>
        </div>
      )}

      {selectedAsset && (
        <AssetDetailDrawer 
          asset={selectedAsset} 
          onClose={() => setSelectedAsset(null)} 
          onDelete={removeGlobalAsset}
          onOpenFullImage={(img) => setFullImageModal(img)}
        />
      )}

      {fullImageModal && (
        <FullImageModal
          imageUrl={fullImageModal.url}
          title={fullImageModal.title}
          brandName={activeWorkspace?.brandName}
          onClose={() => setFullImageModal(null)}
        />
      )}
    </div>
  );
};
