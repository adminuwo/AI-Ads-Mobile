import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { approvalsAPI } from '../../services/api';
import { CheckCircle2, ShieldCheck, ShieldAlert, XCircle, UserCheck, Loader2, Lock } from 'lucide-react';

const getCleanItemTitle = (item) => {
  if (!item) return 'Untitled Content';
  if (item.title && typeof item.title === 'string' && !item.title.trim().startsWith('{')) return item.title;
  try {
    const raw = item.rawPayload || item.payload || (typeof item.content === 'string' && item.content.trim().startsWith('{') ? JSON.parse(item.content) : null);
    const data = raw?.data || raw;
    if (data?.hook) return data.hook;
    if (data?.title) return data.title;
    if (data?.caption) return data.caption.slice(0, 60) + '...';
  } catch(e){}
  return item.type ? `${item.type} Campaign` : 'Approval Item';
};

const renderParsedContentPreview = (selectedItem) => {
  if (!selectedItem) return null;
  let parsed = null;

  if (selectedItem.rawPayload) parsed = selectedItem.rawPayload;
  else if (selectedItem.payload) parsed = selectedItem.payload;
  else if (typeof selectedItem.content === 'string' && selectedItem.content.trim().startsWith('{')) {
    try { parsed = JSON.parse(selectedItem.content); } catch(e){}
  }

  const data = parsed?.data || parsed;

  if (data && (data.hook || data.caption || data.shortCaption || data.longCaption || data.cta || data.creativeVariations || data.imagePrompt)) {
    const hookText = data.hook || data.headline || data.title;
    const captionText = data.caption || data.longCaption || data.shortCaption || selectedItem.content;
    const ctaText = data.cta || data.callToAction;
    const hashtags = Array.isArray(data.hashtags) ? data.hashtags : [];
    const variations = Array.isArray(data.creativeVariations) ? data.creativeVariations : [];
    const imagePrompt = data.imagePrompt;

    const imgUrl = data.imageUrl || selectedItem.imageUrl;

    return (
      <div className="space-y-4">
        {/* Visual Asset Preview */}
        {imgUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-[320px] flex items-center justify-center relative group shadow-md">
            <img
              src={imgUrl}
              alt={hookText || 'AI Marketing Visual'}
              className="w-full h-full max-h-[300px] object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-wider border border-white/10">
              📷 AI Visual Asset
            </div>
          </div>
        )}

        {/* Hook / Headline */}
        {hookText && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-indigo-500/10 border border-brand-500/30">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 block mb-1">📌 Hook & Headline</span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{hookText}</p>
          </div>
        )}

        {/* Caption */}
        {captionText && (
          <div className="p-4 accent-card rounded-2xl bg-white dark:bg-slate-900 space-y-2 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">📝 Caption & Copy</span>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">{captionText}</p>
          </div>
        )}

        {/* Call To Action */}
        {ctaText && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0">🎯 CTA:</span>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{ctaText}</p>
          </div>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">🏷️ Hashtags</span>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Creative Variations */}
        {variations.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">💡 Creative Angle Variations</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {variations.map((v, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-brand-500 block">{v.type || `Variation ${idx+1}`}</span>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] font-medium leading-normal">{v.text || v.caption}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Prompt */}
        {imagePrompt && (
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block">🖼️ AI Image Prompt</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic">{imagePrompt}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback to plain text formatting
  const rawText = typeof selectedItem.content === 'string' ? selectedItem.content : JSON.stringify(selectedItem.content, null, 2);
  const cleanDisplay = rawText
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
      {cleanDisplay || 'No content preview available for this item.'}
    </div>
  );
};

export const ApprovalsDeskModule = () => {
  const { approvalsQueue, setApprovalsQueue, activeRole, activeWorkspace, setActiveModule, setGeneratedContent, setStudioTarget, t, user } = useWorkspace();
  const [selectedItem, setSelectedItem] = useState(approvalsQueue[0] || null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const userPlanNorm = (user?.plan || 'starter').toLowerCase();
  const isCampaignLocked = userPlanNorm === 'starter' || userPlanNorm === 'base' || userPlanNorm === 'free';

  useEffect(() => {
    if (approvalsQueue.length > 0 && !selectedItem) {
      setSelectedItem(approvalsQueue[0]);
    }
  }, [approvalsQueue, selectedItem]);

  const isClientPortal = activeRole === 'ClientReviewer';

  const handleUpdateStatus = async (status, defaultNote) => {
    if (!selectedItem) return;
    setLoading(true);
    const itemComment = comment.trim() || defaultNote;

    try {
      await approvalsAPI.updateStatus({
        contentId: selectedItem._id || selectedItem.id,
        status,
        reviewerComment: itemComment,
      });
    } catch (err) {
      console.warn('Backend update failed (optimistic UI update will proceed):', err.message);
    }

    const updatedQueue = approvalsQueue.map((item) =>
      (item._id || item.id) === (selectedItem._id || selectedItem.id)
        ? { ...item, status, reviewerComment: itemComment }
        : item
    );

    setApprovalsQueue(updatedQueue);
    setSelectedItem((prev) => prev ? { ...prev, status, reviewerComment: itemComment } : null);
    setComment('');

    setLoading(false);

    if (status === 'APPROVED') {
      const raw = selectedItem.payload || selectedItem.rawPayload || selectedItem;
      const data = raw?.data || raw;
      const itemType = (selectedItem.type || data.type || 'SOCIAL').toUpperCase();
      
      let approvedPayload = {
        ...raw,
        ...data,
        id: selectedItem._id || selectedItem.id,
        type: itemType,
        platform: selectedItem.platform || (itemType === 'BLOG' ? 'blog' : itemType === 'EMAIL' ? 'email' : 'instagram'),
        title: data.title || getCleanItemTitle(selectedItem),
        topic: data.topic || getCleanItemTitle(selectedItem),
      };

      if (itemType === 'BLOG') {
        approvedPayload = {
          ...approvedPayload,
          content: data.content || selectedItem.content,
          wordCount: data.wordCount,
          readingTime: data.readingTime || '5 min read',
          keywords: data.keywords || [],
          metaDescription: data.metaDescription || '',
        };
      } else if (itemType === 'EMAIL') {
        approvedPayload = {
          ...approvedPayload,
          subject: data.subject || selectedItem.title,
          preheader: data.preheader || '',
          body: data.body || selectedItem.content,
          cta: data.cta || '',
        };
      } else {
        // SOCIAL / IMAGE Post
        approvedPayload = {
          ...approvedPayload,
          hook: data.hook || getCleanItemTitle(selectedItem),
          headline: data.headline || data.hook || getCleanItemTitle(selectedItem),
          caption: data.caption || data.longCaption || selectedItem.content,
          shortCaption: data.shortCaption || data.short_caption || data.caption,
          longCaption: data.longCaption || data.caption || selectedItem.content,
          cta: data.cta || data.callToAction || 'Click link to learn more!',
          hashtags: Array.isArray(data.hashtags) ? data.hashtags : ['#AIMarketing', '#BrandDNA', '#Growth'],
          creativeVariations: data.creativeVariations || []
        };
      }

      if (setGeneratedContent) setGeneratedContent(approvedPayload);
      if (setStudioTarget) setStudioTarget(approvedPayload);
      if (setActiveModule) setActiveModule('creative');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const mainEl = document.querySelector('main');
      if (mainEl) mainEl.scrollTop = 0;
    }
  };

  if (isCampaignLocked) {
    return (
      <div className="space-y-6 animate-in fade-in w-full max-w-[1600px] mx-auto p-6 h-[80vh] flex flex-col items-center justify-center text-center">
        <Lock className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Approvals Desk is Locked</h2>
        <p className="text-slate-500 max-w-md">Upgrade your plan to unlock the Approvals Desk and team workflow management features.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in w-full max-w-[1600px] mx-auto p-6">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{t('approvalsTitle', 'Approvals Desk')} & Governance Review Queue</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Role-gated multi-tier approval workflow for <strong className="text-slate-900 dark:text-white">{activeWorkspace?.brandName || 'your brand'}</strong>. Current Role: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeRole || 'Admin'}</span>
          </p>
        </div>

        {isClientPortal && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" /> Client Portal Mode
          </div>
        )}
      </div>

      {/* Review Queue & Detail View Stack (Vertical Top & Bottom) */}
      <div className="space-y-6">
        {/* Top: Pending Review Queue Cards Grid */}
        <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Pending Review Queue</h2>
              <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold text-[10px]">
                {approvalsQueue.length} Items
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Click any card below to review and approve details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {approvalsQueue.map((item) => {
              const isSelected = (selectedItem?._id || selectedItem?.id) === (item._id || item.id);
              return (
                <div
                  key={item._id || item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-500/10 dark:bg-brand-500/20 border-brand-500 shadow-md ring-2 ring-brand-500/40'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-brand-500/40 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-500/10">
                      {item.type || 'CONTENT'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                      item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' :
                      item.status === 'RED_FLAG_CITATION_NEEDED' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2">
                    {getCleanItemTitle(item)}
                  </h3>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="truncate max-w-[110px]">{item.author || 'AI Engine'}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                      {item.factCheck?.passed !== false ? '✓ Fact-Checked' : '⚠ Citation'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: Selected Item Detail View & Approval Actions */}
        <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          {selectedItem ? (
            <div className="space-y-6 text-xs animate-in fade-in">
              {/* 1. Content Details Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      selectedItem.type === 'BLOG' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                    }`}>{selectedItem.type}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">&bull;</span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{selectedItem.platform || 'General Platform'}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{getCleanItemTitle(selectedItem)}</h2>
                  <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500 mt-1">
                    <span>Scheduled: <strong className="text-slate-700 dark:text-slate-300">{selectedItem.scheduledDate || 'TBD'}</strong></span>
                    <span>&bull;</span>
                    <span>Author: <strong className="text-slate-700 dark:text-slate-300">{selectedItem.author || 'AISA AI Engine'}</strong></span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold self-start ${
                  selectedItem.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' :
                  selectedItem.status === 'REJECTED' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30' :
                  selectedItem.status === 'RED_FLAG_CITATION_NEEDED' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30' :
                  'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                }`}>
                  {selectedItem.status}
                </span>
              </div>

              {/* 2. Content Preview */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">Content Review & Preview</h3>
                {renderParsedContentPreview(selectedItem)}
              </div>

              {/* 3. Comment & Actions */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">Reviewer Comments & Feedback</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add feedback, revision instructions, or rejection reason..."
                  className="w-full p-3 rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleUpdateStatus('REJECTED', 'Rejected by reviewer.')}
                    disabled={loading}
                    className="w-full btn-secondary text-xs border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 py-2.5"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('RED_FLAG_CITATION_NEEDED', 'Revision requested by reviewer.')}
                    disabled={loading}
                    className="w-full btn-secondary text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 py-2.5"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />} Request Revision
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('APPROVED', 'Approved for publication.')}
                    disabled={loading}
                    className="w-full btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-lg shadow-emerald-500/20 py-2.5"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
              <p className="text-xs font-medium">Select an item from the pending queue above to inspect details and approve.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
