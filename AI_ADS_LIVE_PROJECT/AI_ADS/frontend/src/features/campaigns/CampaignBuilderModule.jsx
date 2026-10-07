import React, { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { campaignAPI } from '../../services/api';
import {
  Layers, Sparkles, Calendar, CheckCircle2, ArrowRight, Plus, Trash2,
  ChevronDown, ChevronUp, Loader2, AlertCircle, RefreshCw, Target,
  Clock, Users, BarChart3, Eye, ThumbsUp, Edit3, X, ExternalLink
} from 'lucide-react';

const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'X/Twitter', 'YouTube', 'Threads'];
const FREQUENCIES = ['Daily', '2x per week', '3x per week', '4x per week', '5x per week', 'Weekly', 'Bi Weekly', 'Monthly'];
const STATUS_COLORS = {
  Draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  Active: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  Paused: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  Completed: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  Archived: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
};
const POST_STATUS_COLORS = {
  Draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Generated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Published: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

// ─── Create Campaign Modal ─────────────────────────────────────────────────────
const CreateCampaignModal = ({ workspaceId, onClose, onCreated }) => {
  const { user, t } = useWorkspace();
  const userPlanNorm = (user?.plan || 'starter').toLowerCase();
  const isCampaignLocked = false;
  const [form, setForm] = useState({
    campaignName: '',
    campaignGoal: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    postingFrequency: 'Daily',
    platforms: ['Instagram'],
    budget: '',
    targetAudience: '',
  });
  const [autoGenerateStrategy, setAutoGenerateStrategy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePlatform = (p) => {
    setForm((prev) => {
      if (prev.platforms.includes(p)) {
        return { ...prev, platforms: prev.platforms.filter((x) => x !== p) };
      } else {
        if (userPlanNorm === 'starter' || userPlanNorm === 'free') {
          if (prev.platforms.length >= 2) {
            alert('Starter Plan is limited to 2 target platforms. Upgrade to unlock more.');
            return prev;
          }
        } else if (userPlanNorm === 'base') {
          if (prev.platforms.length >= 3) {
            alert('Base Plan is limited to 3 target platforms. Upgrade to Pro/Growth to unlock more.');
            return prev;
          }
        } else if (userPlanNorm === 'pro' || userPlanNorm === 'growth') {
          if (prev.platforms.length >= 5) {
            alert('Pro/Growth Plan is limited to 5 target platforms.');
            return prev;
          }
        }
        return { ...prev, platforms: [...prev.platforms, p] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.campaignName.trim() || !form.campaignGoal.trim()) {
      setError(t('nameAndGoalRequired', 'Campaign name and goal are required'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await campaignAPI.create({ ...form, workspaceId });
      let finalCampaign = result.campaign;
      if (autoGenerateStrategy && finalCampaign?._id) {
        try {
          const stratRes = await campaignAPI.generateStrategy(finalCampaign._id);
          if (stratRes.campaign) finalCampaign = stratRes.campaign;
        } catch (stratErr) {
          console.log('Auto strategy note:', stratErr.message);
        }
      }
      onCreated(finalCampaign);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('createCampaign', 'Create Campaign')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('createCampaignSubtitle', 'AI will generate a complete posting plan')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('campaignNameLabel', 'Campaign Name *')}</label>
              <input
                type="text"
                value={form.campaignName}
                onChange={(e) => setForm((p) => ({ ...p, campaignName: e.target.value }))}
                placeholder={t('campaignNamePlaceholder', 'e.g. Q3 Brand Awareness Drive')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('campaignGoalLabel', 'Campaign Goal *')}</label>
              <input
                type="text"
                value={form.campaignGoal}
                onChange={(e) => setForm((p) => ({ ...p, campaignGoal: e.target.value }))}
                placeholder={t('campaignGoalPlaceholder', 'e.g. Increase brand awareness and drive 20% more website traffic')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('startDateLabel', 'Start Date')}</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('endDateLabel', 'End Date')}</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('postingFrequencyLabel', 'Posting Frequency')}</label>
              <select
                value={form.postingFrequency}
                onChange={(e) => setForm((p) => ({ ...p, postingFrequency: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                {FREQUENCIES.map((f) => (<option key={f} value={f}>{t(f.toLowerCase(), f)}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('budgetLabel', 'Budget (optional)')}</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                placeholder="₹50,000"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{t('targetPlatformsLabel', 'Target Platforms')}</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    form.platforms.includes(p)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('targetAudienceLabel', 'Target Audience (optional)')}</label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
              placeholder="e.g. Marketing managers at B2B SaaS companies"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer">
            <input
              type="checkbox"
              checked={autoGenerateStrategy}
              onChange={(e) => setAutoGenerateStrategy(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t('autoGenerateStrategyLabel', 'Generate AI Strategy Roadmap immediately')}
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                {t('autoGenerateStrategyDesc', "Builds a 30-day strategy plan tailored specifically to this campaign's target goal.")}
              </p>
            </div>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? t('creating', 'Creating...') : t('createCampaign', 'Create Campaign')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Campaign Card ─────────────────────────────────────────────────────────────
const CampaignCard = ({ campaign, onSelect, onDelete }) => {
  const { t } = useWorkspace();
  return (
    <div
      onClick={() => onSelect(campaign)}
      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 hover:border-blue-500/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/10 flex flex-col justify-between gap-4 shadow-sm"
    >
      <div className="space-y-3">
        {/* Header: Title, Goal, Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{campaign.campaignName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{campaign.campaignGoal}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${STATUS_COLORS[campaign.status] || STATUS_COLORS.Draft}`}>
            {t((campaign.status || 'Draft').toLowerCase(), campaign.status)}
          </span>
        </div>

        {/* Metadata: Date & Frequency */}
        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" />{new Date(campaign.startDate).toLocaleDateString()}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />{t((campaign.postingFrequency || '').toLowerCase(), campaign.postingFrequency)}</span>
          {campaign.totalPosts > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400"><BarChart3 className="w-3.5 h-3.5" />{campaign.totalPosts} {t('posts', 'posts')}</span>
            </>
          )}
        </div>

        {/* Platforms Badges Row */}
        <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
          {(campaign.platforms || []).slice(0, 4).map((p) => (
            <span key={p} className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold whitespace-nowrap">
              {p}
            </span>
          ))}
          {campaign.platforms?.length > 4 && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold whitespace-nowrap">
              +{campaign.platforms.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
          {campaign.totalPosts > 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{campaign.totalPosts} {t('postsReady', 'posts scheduled')}</span>
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{t('readyToPlan', 'Ready to plan')}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(campaign);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
          >
            {campaign.totalPosts > 0 ? (
              <>
                <Target className="w-3.5 h-3.5" />
                <span>{campaign.aiGeneratedStrategy ? t('viewStrategy', 'View Strategy') : t('generateStrategy', 'Generate Strategy')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('generatePlan', 'Generate Plan')}</span>
              </>
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(campaign._id); }}
            className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            title={t('deleteCampaign', 'Delete Campaign')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Campaign Detail View ──────────────────────────────────────────────────────
const CampaignDetail = ({ campaign, onBack }) => {
  const { user, setActiveModule, updateWorkspace, activeWorkspace, setGeneratedStrategy, t } = useWorkspace();
  const userPlanNorm = (user?.plan || 'starter').toLowerCase();
  const isCampaignLocked = false;
  const workspaceId = activeWorkspace?._id || activeWorkspace?.id || campaign.workspaceId;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [campaignStrategy, setCampaignStrategy] = useState(
    campaign.aiGeneratedStrategy ||
    (activeWorkspace?.currentStrategy?.campaignId === campaign._id ? activeWorkspace.currentStrategy : null)
  );
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [isStrategyExpanded, setIsStrategyExpanded] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [generatingPost, setGeneratingPost] = useState(null);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await campaignAPI.getPosts(campaign._id);
      setPosts(result.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [campaign._id]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleGenerateStrategyAndGoToPlan = async (force = false) => {
    sessionStorage.setItem('strategyActiveTab', 'overview');
    if (campaignStrategy && !force && campaignStrategy.gtmStrategy) {
      setActiveModule('strategy');
      return;
    }
    setGeneratingStrategy(true);
    setError('');
    try {
      const result = await campaignAPI.generateStrategy(campaign._id);
      if (result.strategy) {
        setCampaignStrategy(result.strategy);
        if (setGeneratedStrategy) setGeneratedStrategy(result.strategy);
        if (workspaceId && updateWorkspace) {
          await updateWorkspace(workspaceId, { currentStrategy: result.strategy });
        }
      }
      sessionStorage.setItem('strategyActiveTab', 'overview');
      setActiveModule('strategy');
    } catch (err) {
      setError(err.message || 'Failed to generate campaign strategy');
      setGeneratingStrategy(false);
    }
  };

  const handleGeneratePlan = async (customPlan) => {
    setGeneratingPlan(true);
    setError('');
    try {
      const planToUse = customPlan || campaignStrategy?.thirtyDayPlan;
      const result = await campaignAPI.generatePlan(
        campaign._id,
        planToUse && planToUse.length > 0 ? { strategyPlan: planToUse } : {}
      );
      setPosts(result.posts || []);
      setCampaignStrategy(null);
      setSuccessToast(`Plan ready: ${result.posts?.length || 0} scheduled posts created!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to generate campaign plan');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleGeneratePostContent = async (postId) => {
    setGeneratingPost(postId);
    try {
      const result = await campaignAPI.generatePostContent(postId);
      setPosts((prev) => prev.map((p) => p._id === postId ? result.post : p));
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingPost(null);
    }
  };

  const handleUpdateStatus = async (postId, status) => {
    try {
      const result = await campaignAPI.updatePostStatus(postId, { status, approvalStatus: status === 'Approved' ? 'Approved' : undefined });
      setPosts((prev) => prev.map((p) => p._id === postId ? result.post : p));
    } catch (err) {
      setError(err.message);
    }
  };

  const groupedPosts = posts.reduce((acc, post) => {
    const dateKey = new Date(post.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(post);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{campaign.campaignName}</h2>
              {campaignStrategy && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Target className="w-3 h-3" /> {t('strategyActive', 'Strategy Active')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{campaign.campaignGoal}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {posts.length > 0 && (
            <>
              <button
                onClick={() => handleGenerateStrategyAndGoToPlan(false)}
                disabled={generatingStrategy}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {generatingStrategy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
                {generatingStrategy ? t('generatingStrategy', 'Generating Strategy...') : campaignStrategy?.gtmStrategy ? t('viewStrategy', 'View Strategy') : t('generateStrategy', 'Generate Strategy')}
              </button>

              {!isCampaignLocked && campaignStrategy?.gtmStrategy && (
                <button
                  onClick={() => handleGenerateStrategyAndGoToPlan(true)}
                  disabled={generatingStrategy}
                  className="px-3 py-2 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
                  title={t('regenerateStrategyTooltip', 'Regenerate Strategy with GEO, SEO & GTM from Plan Topics')}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{t('regenerateStrategy', 'Regenerate Strategy')}</span>
                </button>
              )}

              {!isCampaignLocked && (
              <button
                onClick={() => handleGeneratePlan()}
                disabled={generatingPlan}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {generatingPlan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {generatingPlan ? t('generatingPlan', 'Generating Plan...') : t('regeneratePlan', 'Regenerate Plan')}
              </button>
              )}
            </>
          )}
        </div>
      </div>

      {successToast && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          {successToast}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* ─── Strategy Completion Modal ─── */}
      {showStrategyModal && campaignStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t('campaignStrategyReady', 'Campaign Strategy Ready!')}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('synthesizedFor', 'Synthesized specifically for')} "{campaign.campaignName}"</p>
                </div>
              </div>
              <button onClick={() => setShowStrategyModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('targetGoal', 'Target Goal')}</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{campaignStrategy.businessGoal || campaign.campaignGoal}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">🎁 {t('leadMagnet', 'Lead Magnet')}</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{campaignStrategy.leadMagnet}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">📢 {t('primaryCta', 'Primary CTA')}</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{campaignStrategy.primaryCta}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">⚡ {t('thirtyDayTacticalPlan', '30-Day Tactical Plan')}</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  30 structured daily action items across {(campaignStrategy.bestPlatforms || campaign.platforms || []).join(', ')} are linked to this campaign.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  setShowStrategyModal(false);
                  setActiveModule('strategy');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Target className="w-3.5 h-3.5" /> {t('openStrategyModule', 'Open Strategy Module')} <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    setShowStrategyModal(false);
                    handleGeneratePlan(campaignStrategy.thirtyDayPlan);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> {t('generatePostsNow', 'Generate Posts Now')}
                </button>
                <button
                  onClick={() => setShowStrategyModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  {t('close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('totalPosts', 'Total Posts'), value: posts.length, icon: BarChart3, color: 'text-blue-500' },
          { label: t('generated', 'Generated'), value: posts.filter((p) => p.status === 'Generated' || p.status === 'Approved').length, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: t('platforms', 'Platforms'), value: campaign.platforms?.length || 0, icon: Layers, color: 'text-blue-500' },
          { label: t('pending', 'Pending'), value: posts.filter((p) => p.status === 'Draft').length, icon: Clock, color: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Posts grouped by date */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('noPlanGeneratedYet', 'No plan generated yet')}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('noPlanGeneratedDesc', 'Click "Generate Plan" to create a complete content calendar with AI-crafted posts for each day and platform.')}</p>
          </div>
          <button
            onClick={() => handleGeneratePlan()}
            disabled={generatingPlan}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 cursor-pointer"
          >
            {generatingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generatingPlan ? t('generatingPlan', 'Generating Plan...') : t('generatePlan', 'Generate Plan')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedPosts).map(([date, datePosts]) => (
            <div key={date}>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{date}</h3>
              <div className="space-y-2">
                {datePosts.map((post) => (
                  <div key={post._id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold capitalize">{post.platform}</span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">{post.contentType}</span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium">{post.campaignStage}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1.5">{post.postObjective}</p>
                        {post.caption && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic">"{post.caption}"</p>
                        )}
                        {post.hashtags?.length > 0 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{post.hashtags.slice(0, 4).join(' ')}</p>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${POST_STATUS_COLORS[post.status] || POST_STATUS_COLORS.Draft}`}>
                        {t((post.status || 'Draft').toLowerCase(), post.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 pt-0.5">
                      <span className="font-medium">
                        {(post.platform || '').toLowerCase().includes('email') ? 'Email Copy' : (post.postType || 'Image')}
                      </span>
                      {post.bestPostingTime && <span>· {post.bestPostingTime}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

// ─── Main {t('campaignsTitle', 'Campaign Builder')} Module ──────────────────────────────────────────────
export const CampaignBuilderModule = () => {
  const {activeWorkspace, user, t, showCustomAlert, setIsSettingsModalOpen, setActiveSettingsTab } = useWorkspace();
  const userPlanNorm = (user?.plan || 'starter').toLowerCase();
  const isCampaignLocked = false;
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [error, setError] = useState('');

  const workspaceId = activeWorkspace?._id || activeWorkspace?.id;

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await campaignAPI.list(workspaceId ? { workspaceId } : {});
      setCampaigns(result.campaigns || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign and all its posts?')) return;
    try {
      await campaignAPI.delete(id);
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
      if (selectedCampaign?._id === id) setSelectedCampaign(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (selectedCampaign) {
    return (
      <div className="space-y-5 animate-in fade-in">
        <CampaignDetail
          campaign={selectedCampaign}
          onBack={() => setSelectedCampaign(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {showCreate && (
        <CreateCampaignModal
          workspaceId={workspaceId}
          onClose={() => setShowCreate(false)}
          onCreated={(c) => { setCampaigns((prev) => [c, ...prev]); setSelectedCampaign(c); }}
        />
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{t('campaignBuilderTitle', 'Campaign Builder')}</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {t('campaignBuilderSubtitle', 'AI-powered campaign planning with auto-generated post schedules for')}{' '}
            <strong className="text-slate-900 dark:text-white">{activeWorkspace?.brandName || 'your brand'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadCampaigns} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              const getCampaignLimit = (plan) => {
                const p = (plan || 'starter').toLowerCase();
                if (p === 'starter' || p === 'base' || p === 'free') return 3;
                if (p === 'pro' || p === 'growth' || p === 'professional') return 10;
                return 9999;
              };
              const campaignLimit = getCampaignLimit(userPlanNorm);

              if (campaigns.length >= campaignLimit) {
                if (showCustomAlert) {
                  showCustomAlert({
                    title: 'Upgrade Plan for More Campaigns',
                    message: `Your current plan is limited to ${campaignLimit} campaigns. Upgrade your plan to unlock more AI campaigns and scale your marketing.`,
                    type: 'warning',
                    confirmText: 'Upgrade Plan',
                    cancelText: 'Cancel',
                    onConfirm: () => {
                      if (setActiveSettingsTab) setActiveSettingsTab('billing');
                      if (setIsSettingsModalOpen) setIsSettingsModalOpen(true);
                    }
                  });
                } else {
                  alert(`Your plan is limited to ${campaignLimit} campaigns. Upgrade to unlock more.`);
                }
                return;
              }
              setShowCreate(true);
            }} 
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> {t('newCampaign', 'New Campaign')}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* Campaign Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mx-auto text-blue-500">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{t('noCampaignsYet', 'No Campaigns Yet')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {t('noCampaignsDesc', 'Create your first campaign and let AI generate a complete posting schedule with captions, hashtags, and visual prompts.')}
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs mx-auto flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 transition-all">
            <Sparkles className="w-4 h-4" /> {t('createFirstCampaign', 'Create First Campaign')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign._id}
              campaign={campaign}
              onSelect={setSelectedCampaign}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
