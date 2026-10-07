import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { campaignAPI } from '../../services/api';
import {
  Calendar as CalendarIcon, Plus, Settings, BarChart3, ChevronUp, ChevronDown,
  Sparkles, CheckCircle2, Clock, Layers, FileText, Trash2, X, Loader2,
  Linkedin, Instagram, Mail, Globe, Youtube, Twitter, Edit2, Save, ArrowRight
} from 'lucide-react';

export const CalendarModule = () => {
  const { user, activeWorkspace, setActiveModule, calendarEvents, setStudioTarget, setGeneratedContent, generatedStrategy, generatedPostsTracker, setSelectedAssetContext, showCustomAlert, showToast, t } = useWorkspace();
  const workspaceId = activeWorkspace?._id || activeWorkspace?.id || 'ws_001';
  const userPlanNorm = (activeWorkspace?.user?.plan || user?.plan || 'starter').toLowerCase();
  const isCampaignLocked = userPlanNorm === 'starter' || userPlanNorm === 'base' || userPlanNorm === 'free';

  // Read 30-day strategy plan from workspace or context
  const strategyPlan = activeWorkspace?.currentStrategy?.thirtyDayPlan || generatedStrategy?.thirtyDayPlan || [];
  const hasStrategyPlan = strategyPlan.length > 0;

  // Derive unique platforms from strategy plan (for pre-filling)
  const strategyPlatforms = hasStrategyPlan
    ? [...new Set(strategyPlan.map(d => {
        const p = (d.platform || '').toLowerCase();
        if (p.includes('linkedin')) return 'LinkedIn';
        if (p.includes('instagram') || p.includes('reels')) return 'Instagram';
        if (p.includes('email') || p.includes('newsletter')) return 'Email';
        if (p.includes('youtube') || p.includes('video')) return 'YouTube';
        if (p.includes('blog') || p.includes('seo')) return 'Blog';
        if (p.includes('twitter') || p.includes('x.com')) return 'Twitter';
        return 'Instagram';
      }))]
    : ['Instagram', 'LinkedIn', 'YouTube'];

  // Campaigns & History
  const [campaigns, setCampaigns] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [campaignPosts, setCampaignPosts] = useState([]);
  const [isCampaignLoading, setIsCampaignLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [campaignConfig, setCampaignConfig] = useState({
    campaignName: '',
    postingFrequency: 'Daily',
    startDate: '',
    endDate: '',
  });

  // Auto-fill dates and name synced with user-selected schedule days count
  useEffect(() => {
    const savedDays = localStorage.getItem('aisa_selected_schedule_days');
    const days = savedDays ? Math.min(30, Math.max(1, parseInt(savedDays, 10))) : (strategyPlan.length || 30);

    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + (days - 1));

    const brandName = activeWorkspace?.brandName || 'Brand';
    setCampaignConfig({
      campaignName: `${brandName} ${days}-Day Campaign`,
      postingFrequency: 'Daily',
      startDate: today.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  }, [activeWorkspace, strategyPlan.length]);

  // Derived active days count from date span
  const activeDaysCount = (() => {
    const startStr = campaignConfig.startDate || currentCampaign?.startDate;
    const endStr = campaignConfig.endDate || currentCampaign?.endDate;
    if (!startStr || !endStr) return 30;
    const sParts = startStr.split('T')[0].split('-').map(Number);
    const eParts = endStr.split('T')[0].split('-').map(Number);
    if (sParts.length !== 3 || eParts.length !== 3) return 30;
    const startUtc = Date.UTC(sParts[0], sParts[1] - 1, sParts[2]);
    const endUtc = Date.UTC(eParts[0], eParts[1] - 1, eParts[2]);
    if (isNaN(startUtc) || isNaN(endUtc) || startUtc > endUtc) return 30;
    const diffDays = Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  })();

  // Calendar UI states
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const detailCardRef = useRef(null);

  const handleDateSelect = (cellDate) => {
    setSelectedDate(cellDate);
    setTimeout(() => {
      if (detailCardRef.current) {
        detailCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  // Post Editing State
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSavingPost, setIsSavingPost] = useState(false);

  // Load Campaign list (History)
  const loadCampaignHistory = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await campaignAPI.list({ workspaceId });
      if (res.success && res.campaigns) {
        setCampaigns(res.campaigns);
        
        const savedCampaignId = localStorage.getItem('aisa_selected_campaign_id');
        let target = null;
        if (savedCampaignId) {
          target = res.campaigns.find(c => c._id === savedCampaignId);
          localStorage.removeItem('aisa_selected_campaign_id');
        }
        
        if (!target && res.campaigns.length > 0) {
          target = res.campaigns[0];
        }

        if (target) {
          handleSelectCampaign(target);
        }
      }
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadCampaignHistory();
  }, [loadCampaignHistory]);

  // Load specific campaign details
  const handleSelectCampaign = async (campaign) => {
    setIsCampaignLoading(true);
    try {
      setCurrentCampaign(campaign);
      setCampaignConfig({
        campaignName: campaign.campaignName || '',
        postingFrequency: campaign.postingFrequency || 'Daily',
        startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
        endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      });

      // Get posts
      const res = await campaignAPI.getPosts(campaign._id);
      if (res.success && res.posts) {
        setCampaignPosts(res.posts);
        if (res.posts.length > 0) {
          // Set calendar month/year view to first post's date
          const firstDate = new Date(res.posts[0].date);
          setCalendarMonth(firstDate.getMonth());
          setCalendarYear(firstDate.getFullYear());
          setSelectedDate(firstDate);
        }
      }
      setIsEditingPost(false);
    } catch (err) {
      console.error("Failed to load campaign details:", err);
    } finally {
      setIsCampaignLoading(false);
    }
  };
  
  const handleGeneratePost = async (postId) => {
    setActionLoading(true);
    try {
      const res = await campaignAPI.generatePostContent(postId);
      if (res.success && res.post) {
        setCampaignPosts(prev => prev.map(p => p._id === res.post._id ? res.post : p));
      }
    } catch (err) {
      console.error("Failed to generate post:", err);
      showCustomAlert({ title: 'Post Generation Failed', message: err.message || 'Failed to generate post copy', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePostStatus = async (postId, status, approvalStatus) => {
    setActionLoading(true);
    try {
      const payload = { status };
      if (approvalStatus) payload.approvalStatus = approvalStatus;
      const res = await campaignAPI.updatePostStatus(postId, payload);
      if (res.success && res.post) {
        setCampaignPosts(prev => prev.map(p => p._id === res.post._id ? res.post : p));
      }
    } catch (err) {
      console.error("Failed to update post status:", err);
      showCustomAlert({ title: 'Update Failed', message: err.message || 'Failed to update status', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit Post Toggle
  const toggleEditPost = (post) => {
    if (isCampaignLocked) {
      showCustomAlert({ title: 'Feature Locked', message: 'Manual editing of calendar events is locked on the Starter Plan. Upgrade to Pro.', type: 'warning' });
      return;
    }
    if (isEditingPost) {
      setIsEditingPost(false);
      setEditFormData({});
    } else {
      setIsEditingPost(true);
      setEditFormData({ ...post });
    }
  };

  // Handle Save Edited Post
  const handleSavePost = async () => {
    if (!editFormData._id) return;
    setIsSavingPost(true);
    try {
      const res = await campaignAPI.updatePost(editFormData._id, editFormData);
      if (res.success && res.post) {
        // Update local state
        setCampaignPosts(prev => prev.map(p => p._id === res.post._id ? res.post : p));
        setIsEditingPost(false);
      }
    } catch (err) {
      console.error("Failed to save post:", err);
      showCustomAlert({ title: 'Save Failed', message: err.message || 'Failed to save post', type: 'error' });
    } finally {
      setIsSavingPost(false);
    }
  };

  // Generate / Create Calendar Campaign
  const handleCreateCampaign = async () => {
    if (!hasStrategyPlan) {
      showCustomAlert({ title: 'Strategy Required', message: 'Please generate a Campaign Strategy first before generating the calendar.', type: 'warning' });
      return;
    }
    if (!campaignConfig.startDate || !campaignConfig.endDate) {
      showCustomAlert({ title: 'Campaign Setup Required', message: 'Please select Campaign Start and End dates.', type: 'warning' });
      return;
    }
    if (new Date(campaignConfig.startDate) > new Date(campaignConfig.endDate)) {
      showCustomAlert({ title: 'Invalid Date Range', message: 'Start Date cannot be greater than End Date.', type: 'warning' });
      return;
    }
    if (!campaignConfig.campaignName) {
      showCustomAlert({ title: 'Campaign Name Required', message: 'Please enter a Campaign Name.', type: 'warning' });
      return;
    }

    setIsCampaignLoading(true);
    try {
      // 1. Create campaign — use strategy platforms if available
      const platformsToUse = hasStrategyPlan && strategyPlatforms.length > 0
        ? strategyPlatforms
        : ['Instagram', 'LinkedIn', 'YouTube'];

      const campaignGoal = activeWorkspace?.currentStrategy?.businessGoal
        || 'Automated AI content planning';

      const payload = {
        workspaceId,
        campaignName: campaignConfig.campaignName,
        campaignGoal,
        startDate: campaignConfig.startDate,
        endDate: campaignConfig.endDate,
        postingFrequency: campaignConfig.postingFrequency,
        platforms: platformsToUse,
      };

      const res = await campaignAPI.create(payload);
      if (res.success && res.campaign) {
        // 2. Generate plan — pass strategy plan filtered by active days count
        const planToUse = hasStrategyPlan ? strategyPlan.filter(item => (item.day || 1) <= activeDaysCount) : [];
        const genBody = planToUse.length > 0 ? { strategyPlan: planToUse } : {};
        const genRes = await campaignAPI.generatePlan(res.campaign._id, genBody);
        if (genRes.success) {
          setCurrentCampaign(res.campaign);
          setCampaignPosts(genRes.posts || []);
          await loadCampaignHistory();
          
          if (genRes.posts && genRes.posts.length > 0) {
            const firstDate = new Date(genRes.posts[0].date);
            setCalendarMonth(firstDate.getMonth());
            setCalendarYear(firstDate.getFullYear());
            setSelectedDate(firstDate);
          }
        }
      }
    } catch (err) {
      console.error("Failed to generate campaign calendar:", err);
      showCustomAlert({ title: 'Campaign Generation Failed', message: err.message || 'Failed to generate campaign', type: 'error' });
    } finally {
      setIsCampaignLoading(false);
    }
  };

  // Derived counts for Stats
  const startStr = campaignConfig.startDate || currentCampaign?.startDate;
  const endStr = campaignConfig.endDate || currentCampaign?.endDate;
  const cleanStart = startStr ? startStr.split('T')[0] : '';
  const cleanEnd = endStr ? endStr.split('T')[0] : '';

  const hasGeneratedCampaign = campaignPosts && campaignPosts.length > 0;

  const activePosts = hasGeneratedCampaign
    ? campaignPosts.filter((p, idx) => {
        if (!cleanStart || !cleanEnd) return idx < activeDaysCount;
        if (!p.date) return idx < activeDaysCount;
        const pDateStr = p.date.split('T')[0];
        return pDateStr >= cleanStart && pDateStr <= cleanEnd;
      })
    : [];

  const totalCount = hasGeneratedCampaign && activePosts.length > 0 ? activePosts.length : activeDaysCount;
  const generatedCount = hasGeneratedCampaign
    ? activePosts.filter(p => ['Generated', 'Approved', 'Scheduled', 'Published'].includes(p.status)).length
    : 0;
  const scheduledCount = hasGeneratedCampaign
    ? activePosts.filter(p => p.status === 'Scheduled').length
    : 0;
  const remainingCount = Math.max(0, totalCount - generatedCount);
  const progressPercent = hasGeneratedCampaign && totalCount > 0 ? Math.min(100, Math.round((generatedCount / totalCount) * 100)) : 0;

  // Date helper
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar cells generation
  const getCalendarCells = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }

    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }

    return cells;
  };

  const calendarCells = getCalendarCells(calendarYear, calendarMonth);

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  const activePost = campaignPosts.find(p => isSameDay(p.date, selectedDate));

  // Render Campaign Info Card Component
  const campaignInfoCard = (
    <div className="bg-white dark:bg-[#0d131f] p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-500 shadow-md flex flex-col justify-between min-h-[380px]">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">Campaign Info</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {campaigns.length > 0 && (
              <select
                value={currentCampaign?._id || ''}
                onChange={(e) => {
                  const selected = campaigns.find(c => c._id === e.target.value);
                  if (selected) handleSelectCampaign(selected);
                }}
                className="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 outline-none max-w-[120px] truncate"
              >
                <option value="" disabled>Campaign History</option>
                {campaigns.map(c => (
                  <option key={c._id} value={c._id}>{c.campaignName || 'Unnamed'}</option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => {
                setCurrentCampaign(null);
                setCampaignPosts([]);
                setCampaignConfig({
                  campaignName: '',
                  postingFrequency: 'Daily',
                  startDate: '',
                  endDate: '',
                });
              }}
              className="p-1 text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-all flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 cursor-pointer"
              title="Create New Campaign"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-wider">Duration:</span>
          {[7, 14, 30].map(days => {
            const isSelected = activeDaysCount === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => {
                  const today = new Date();
                  const end = new Date(today);
                  end.setDate(today.getDate() + (days - 1));
                  const brandName = activeWorkspace?.brandName || 'Brand';
                  setCampaignConfig(prev => ({
                    ...prev,
                    campaignName: `${brandName} ${days}-Day Campaign`,
                    startDate: today.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                  }));
                }}
                className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm shadow-green-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {days} Days
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Campaign Name</label>
            <input
              type="text"
              value={campaignConfig.campaignName}
              onChange={e => setCampaignConfig(prev => ({ ...prev, campaignName: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Q1 Product Launch"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Posting Frequency</label>
            <select
              value={campaignConfig.postingFrequency}
              onChange={e => setCampaignConfig(prev => ({ ...prev, postingFrequency: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              {['Daily', '2x per week', '3x per week', '4x per week', '5x per week', 'Weekly', 'Bi Weekly', 'Monthly'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Start Date</label>
            <input
              type="date"
              value={campaignConfig.startDate}
              onChange={e => {
                const newStartDate = e.target.value;
                let newEndDate = campaignConfig.endDate;
                
                if (newStartDate && calendarEvents && calendarEvents.length > 0) {
                  const start = new Date(newStartDate);
                  const end = new Date(start.getTime() + (calendarEvents.length - 1) * 86400000);
                  newEndDate = end.toISOString().split('T')[0];
                }
                
                setCampaignConfig(prev => ({ ...prev, startDate: newStartDate, endDate: newEndDate }));
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">End Date</label>
            <input
              type="date"
              value={campaignConfig.endDate}
              onChange={e => setCampaignConfig(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-3">
        {/* Strategy Plan Indicator */}
        {hasStrategyPlan ? (
          <div className="flex items-center justify-between p-2 bg-emerald-500/8 rounded-lg border border-emerald-500/20">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">Strategy Linked</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-600/80 dark:text-emerald-400/80">
              {activeDaysCount}-Day Plan · {strategyPlatforms.length} Platforms
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 bg-amber-500/8 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest">No Strategy Plan</span>
            </div>
            <button
              onClick={() => setActiveModule('strategy')}
              className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 hover:underline tracking-widest"
            >
              Generate →
            </button>
          </div>
        )}

        {campaignConfig.startDate && campaignConfig.endDate && (
          <div className="flex items-center justify-between p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
            <span className="text-[9px] font-black uppercase text-emerald-600/70 dark:text-emerald-400/70 tracking-widest">Active Schedule Span</span>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              {campaignConfig.startDate} → {campaignConfig.endDate}
            </span>
          </div>
        )}

        <button
          onClick={handleCreateCampaign}
          disabled={isCampaignLoading}
          className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-green-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isCampaignLoading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Plan...</>
          ) : hasStrategyPlan ? (
            <><Sparkles className="w-3.5 h-3.5" /> Generate from Strategy Plan</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" /> Generate Calendar</>
          )}
        </button>
      </div>
    </div>
  );

  // Render Campaign Progress Card Component
  const campaignProgressCard = (
    <div className="bg-white dark:bg-[#0d131f] p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-500 shadow-md flex flex-col justify-between space-y-4">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div>
            <h3 className="text-[10px] font-black text-slate-850 dark:text-white uppercase tracking-widest">
              Campaign Progress: {currentCampaign?.campaignName || 'NEW LAUNCH'}
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{totalCount} Scheduled Publication Days</p>
          </div>
          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            {progressPercent}% Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* 4 Stat Cards in 4 Separate Small Centered Rows (Positioned Downward) */}
        <div className="flex flex-col gap-2.5 items-center mt-7 mb-3">
          {[
            { label: "Total Posts", val: totalCount, icon: <FileText className="w-3.5 h-3.5 text-emerald-600" />, bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" },
            { label: "Generated", val: generatedCount, icon: <Sparkles className="w-3.5 h-3.5 text-emerald-500" />, bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" },
            { label: "Scheduled", val: scheduledCount, icon: <Clock className="w-3.5 h-3.5 text-emerald-600" />, bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" },
            { label: "Remaining", val: remainingCount, icon: <Layers className="w-3.5 h-3.5 text-emerald-500" />, bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" }
          ].map((c, idx) => (
            <div key={idx} className={`py-1.5 px-3 rounded-xl border ${c.bg} flex flex-col items-center justify-center text-center gap-0.5 max-w-[200px] w-full transition-all hover:scale-[1.01]`}>
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-md bg-white dark:bg-slate-800 shadow-sm shrink-0">
                  {c.icon}
                </div>
                <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">{c.label}</span>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{c.val}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      {/* ─── Campaign Info & Progress Cards ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {campaignInfoCard}
        {campaignProgressCard}
      </div>

      {/* ─── Calendar view panel ─── */}
      {isCampaignLoading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-[#0d131f] rounded-[28px] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] animate-pulse">Orchestrating Campaign Calendar & Posts...</p>
        </div>
      ) : currentCampaign ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Calendar monthly cells widget */}
          <div className="bg-white dark:bg-[#0d131f] p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between min-h-[380px] space-y-1.5">
            
            {/* Header / Month selectors */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {monthNames[calendarMonth]}, {calendarYear}
              </h3>
              <div className="flex gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(dayName => (
                <div key={dayName} className="py-0.5">{dayName}</div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-bold">
              {calendarCells.map((cell, cellIdx) => {
                if (!cell.isCurrentMonth) {
                  return <div key={cellIdx} className="h-8" />;
                }

                const cellDate = new Date(cell.year, cell.month, cell.day);
                const postOnDay = campaignPosts.find(p => isSameDay(p.date, cellDate));
                const hasPost = !!postOnDay;
                const isSelected = isSameDay(cellDate, selectedDate);

                // Check if this date has been generated/downloaded via generatedPostsTracker
                const wsTrackerMapCell = (generatedPostsTracker && generatedPostsTracker[workspaceId]) || {};
                const isDownloaded = postOnDay && (
                  ['Generated', 'Approved', 'Scheduled', 'Published'].includes(postOnDay.status) ||
                  Object.keys(wsTrackerMapCell).some(key => {
                    const entry = wsTrackerMapCell[key];
                    return (
                      (entry?.calendarDate && isSameDay(entry.calendarDate, cellDate)) ||
                      (entry?.calendarDay && postOnDay?.day && String(entry.calendarDay) === String(postOnDay.day)) ||
                      (entry?.topic && postOnDay?.postObjective && entry.topic === postOnDay.postObjective)
                    );
                  })
                );

                // Platform-based icon for the indicator
                const PlatformIcon = (() => {
                  if (!postOnDay) return null;
                  const p = (postOnDay.platform || '').toLowerCase();
                  if (p === 'linkedin')  return <Linkedin className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />;
                  if (p === 'instagram') return <Instagram className="w-2.5 h-2.5 text-pink-600 dark:text-pink-400" />;
                  if (p === 'email')     return <Mail className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />;
                  if (p === 'blog')      return <Globe className="w-2.5 h-2.5 text-violet-600 dark:text-violet-400" />;
                  if (p === 'youtube')   return <Youtube className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />;
                  if (p === 'twitter')   return <Twitter className="w-2.5 h-2.5 text-sky-500" />;
                  return <Sparkles className="w-2.5 h-2.5 text-brand-500" />;
                })();

                // Platform-based cell bg when selected
                const platformBg = (() => {
                  if (!postOnDay) return 'bg-brand-600';
                  const p = (postOnDay.platform || '').toLowerCase();
                  if (p === 'linkedin')  return 'bg-blue-600';
                  if (p === 'instagram') return 'bg-pink-600';
                  if (p === 'email')     return 'bg-amber-600';
                  if (p === 'blog')      return 'bg-violet-600';
                  if (p === 'youtube')   return 'bg-red-600';
                  if (p === 'twitter')   return 'bg-sky-600';
                  return 'bg-brand-600';
                })();

                return (
                  <div key={cellIdx} className="flex justify-center items-center relative h-8">
                    <div className="relative">
                      <button
                        onClick={() => handleDateSelect(cellDate)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all text-[11px] font-black ${
                          hasPost
                            ? `${platformBg} text-white shadow-sm`
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105'
                        } ${
                          isSelected
                            ? 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-[#0d131f] scale-105'
                            : ''
                        } ${
                          isDownloaded ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-[#0d131f]' : ''
                        }`}
                      >
                        {cell.day}
                      </button>

                      {/* Downloaded checkmark badge — replaces platform icon when generated */}
                      {isDownloaded ? (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-md z-10" title="Content downloaded">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </span>
                      ) : hasPost && PlatformIcon ? (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md z-10">
                          {PlatformIcon}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
                })}
            </div>

            {/* Platform colour legend */}
            {campaignPosts.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-x-3 gap-y-1.5">
                {[
                  { platform: 'linkedin',  label: 'LinkedIn',  icon: <Linkedin className="w-2.5 h-2.5 text-blue-500" /> },
                  { platform: 'instagram', label: 'Instagram', icon: <Instagram className="w-2.5 h-2.5 text-pink-500" /> },
                  { platform: 'email',     label: 'Email',     icon: <Mail className="w-2.5 h-2.5 text-amber-500" /> },
                  { platform: 'blog',      label: 'Blog/SEO',  icon: <Globe className="w-2.5 h-2.5 text-violet-500" /> },
                  { platform: 'youtube',   label: 'YouTube',   icon: <Youtube className="w-2.5 h-2.5 text-red-500" /> },
                  { platform: 'twitter',   label: 'Twitter',   icon: <Twitter className="w-2.5 h-2.5 text-sky-500" /> },
                ].filter(l => campaignPosts.some(p => (p.platform || '').toLowerCase() === l.platform)).map(l => (
                  <div key={l.platform} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                    {l.icon}
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{l.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active selected day details card */}
          <div ref={detailCardRef} className="min-h-[380px] flex flex-col scroll-mt-6">
            {activePost ? (
              <div className="bg-white dark:bg-[#0d131f] border border-slate-200 dark:border-slate-800 rounded-[24px] p-5 hover:shadow-lg transition-all flex flex-col justify-between min-h-[380px] h-full flex-1">
                <div className="space-y-3">
                  <div className="flex justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        {new Date(activePost.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </h4>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{activePost.platform} · {activePost.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleEditPost(activePost)}
                        className="p-1 text-slate-400 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 dark:bg-slate-900 dark:hover:bg-brand-900/20 rounded-lg transition-all"
                        title={isEditingPost ? "Cancel Edit" : "Edit Post Details"}
                      >
                        {isEditingPost ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isEditingPost ? (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Platform</label>
                          <select
                            value={editFormData.platform || ''}
                            onChange={(e) => {
                              const newPlatform = e.target.value;
                              const platformPostTypes = {
                                instagram: ['Single Image', 'Carousel', 'Story', 'Caption'],
                                linkedin: ['Article', 'Carousel', 'Text Post', 'Poll', 'Event', 'Newsletter'],
                                twitter: ['Tweet', 'Thread', 'Carousel', 'Poll', 'Quote Tweet'],
                                facebook: ['Single Image', 'Carousel', 'Story', 'Ad', 'Event'],
                                email: ['Newsletter', 'Promotional', 'Announcement', 'Drip', 'Transactional'],
                                blog: ['Long-form Article', 'Listicle', 'How-to Guide', 'Case Study', 'Press Release'],
                              };
                              const firstPostType = (platformPostTypes[newPlatform] || ['Single Image'])[0];
                              setEditFormData({ ...editFormData, platform: newPlatform, postType: firstPostType });
                            }}
                            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-brand-500"
                          >
                            <option value="instagram">Instagram</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="twitter">Twitter / X</option>
                            <option value="facebook">Facebook</option>
                            <option value="email">Email</option>
                            <option value="blog">Blog / SEO</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Post Type</label>
                          <select
                            value={editFormData.postType || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, postType: e.target.value })}
                            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-brand-500"
                          >
                            {((() => {
                              const platformPostTypes = {
                                instagram: ['Single Image', 'Carousel', 'Story', 'Caption'],
                                linkedin: ['Article', 'Carousel', 'Text Post', 'Poll', 'Event', 'Newsletter'],
                                twitter: ['Tweet', 'Thread', 'Carousel', 'Poll', 'Quote Tweet'],
                                facebook: ['Single Image', 'Carousel', 'Story', 'Ad', 'Event'],
                                email: ['Newsletter', 'Promotional', 'Announcement', 'Drip', 'Transactional'],
                                blog: ['Long-form Article', 'Listicle', 'How-to Guide', 'Case Study', 'Press Release'],
                              };
                              const currentPlatform = (editFormData.platform || 'instagram').toLowerCase();
                              return platformPostTypes[currentPlatform] || ['Single Image', 'Carousel'];
                            })()).map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Content Type</label>
                          <input
                            type="text"
                            value={editFormData.contentType || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, contentType: e.target.value })}
                            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-brand-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Campaign Stage</label>
                          <input
                            type="text"
                            value={editFormData.campaignStage || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, campaignStage: e.target.value })}
                            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>

                      {/* Carousel Image Count — only shown when Post Type is Carousel */}
                      {editFormData.postType === 'Carousel' && (
                        <div
                          className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-brand-400/40 bg-brand-500/5"
                          style={{ animation: 'fadeIn 0.2s ease' }}
                        >
                          <span className="text-[9px] font-black uppercase text-brand-500 tracking-widest whitespace-nowrap">🖼️ No. of Carousel</span>
                          <div className="flex gap-1.5 ml-auto">
                            {[2, 3, 4].map(num => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setEditFormData({ ...editFormData, carouselImageCount: num })}
                                className={`w-8 h-8 rounded-lg text-xs font-black transition-all border ${
                                  (editFormData.carouselImageCount || 2) === num
                                    ? 'bg-brand-600 text-white border-brand-600 shadow scale-105'
                                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Strategy Pillar</label>
                        <input
                          type="text"
                          value={editFormData.postFor || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, postFor: e.target.value })}
                          className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-brand-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Topic / Objective</label>
                        <textarea
                          value={editFormData.postObjective || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, postObjective: e.target.value })}
                          className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-brand-500 min-h-[60px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Best Time</label>
                        <input
                          type="text"
                          value={editFormData.bestPostingTime || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, bestPostingTime: e.target.value })}
                          className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-brand-500"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleSavePost}
                          disabled={isSavingPost}
                          className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-1.5 transition-all"
                        >
                          {isSavingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {isSavingPost ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Strategy-driven metadata grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Platform</span>
                          <p className="font-black text-slate-700 dark:text-slate-200 capitalize">{activePost.platform}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Post Type</span>
                          <p className="font-black text-slate-700 dark:text-slate-200 capitalize">{activePost.postType || 'Image'}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Content Type</span>
                          <p className="font-black text-slate-700 dark:text-slate-200 capitalize">{activePost.contentType || '—'}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Campaign Stage</span>
                          <p className="font-black text-slate-700 dark:text-slate-200 capitalize">{activePost.campaignStage || '—'}</p>
                        </div>
                      </div>

                      {/* Visual Asset Preview */}
                      {activePost.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-[220px] flex items-center justify-center relative group shadow-sm">
                          <img
                            src={activePost.imageUrl}
                            alt={activePost.title || 'Post Visual'}
                            className="w-full h-full max-h-[200px] object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-wider">
                            AI Visual
                          </div>
                        </div>
                      )}

                      {/* Topic / objective */}
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Topic / Objective</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                          {activePost.postObjective || activePost.title}
                        </p>
                      </div>

                      {/* Best posting time */}
                      {activePost.bestPostingTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Best time: {activePost.bestPostingTime}
                          </span>
                        </div>
                      )}

                      {activePost.caption && (
                        <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">AI Generated Copy</span>
                          <p className="text-xs text-slate-650 dark:text-slate-300 italic">"{activePost.caption}"</p>
                        </div>
                      )}

                      {activePost.hashtags && activePost.hashtags.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Hashtags</span>
                          <p className="text-xs text-brand-600 dark:text-brand-400 font-bold">{activePost.hashtags.join(' ')}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                


                {/* Downloaded Asset banner — shown only when date is already generated */}
                {(() => {
                  const wsMap = (generatedPostsTracker && generatedPostsTracker[workspaceId]) || {};
                  const isDateDownloaded = activePost && (
                    ['Generated', 'Approved', 'Scheduled', 'Published'].includes(activePost.status) ||
                    Object.keys(wsMap).some(key => {
                      const entry = wsMap[key];
                      return (
                        (entry?.calendarDate && isSameDay(entry.calendarDate, activePost.date)) ||
                        (entry?.calendarDay && activePost?.day && String(entry.calendarDay) === String(activePost.day)) ||
                        (entry?.topic && activePost?.postObjective && entry.topic === activePost.postObjective)
                      );
                    })
                  );

                  if (isDateDownloaded) {
                    return (
                      <>
                        {/* Downloaded status banner */}
                        <div className="mx-0 mt-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div>
                            <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Content Downloaded</p>
                            <p className="text-[9px] text-emerald-600/70 dark:text-emerald-500/70">This date's asset is saved in your Asset Library</p>
                          </div>
                        </div>

                        {/* View in Asset Library CTA */}
                        <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3">
                          <button
                            onClick={() => {
                              // Deep-link: pass selected date/topic context so Asset Library auto-opens matching asset
                              setSelectedAssetContext({
                                calendarDate: activePost.date,
                                calendarDay: activePost.day,
                                topic: activePost.postObjective || activePost.title || activePost.postFor,
                                platform: activePost.platform,
                                dateLabel: new Date(activePost.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
                              });
                              setActiveModule('assets');
                            }}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                            VIEW IN ASSET LIBRARY
                          </button>
                        </div>
                      </>
                    );
                  }

                  return (
                    <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3">
                      <button
                        onClick={() => {
                          const platform = (activePost.platform || 'instagram').toLowerCase();
                          const topic = activePost.postObjective || activePost.title || activePost.postFor || 'Campaign Update';
                          const postType = (activePost.postType || activePost.contentType || 'social').toLowerCase();

                          const isEmail    = platform === 'email' || postType.includes('email') || postType.includes('newsletter');
                          const isBlog     = platform === 'blog'  || platform === 'seo' || postType.includes('blog') || postType.includes('article');
                          const isNewspaper= platform === 'newspaper' || postType.includes('press') || postType.includes('newspaper');
                          const type       = isEmail ? 'EMAIL' : isBlog ? 'BLOG' : isNewspaper ? 'NEWSPAPER' : 'SOCIAL';

                          const isReelsOrStory = platform.includes('reel') || platform.includes('tiktok') || platform.includes('story');
                          const aspect = isReelsOrStory ? '9:16' : platform === 'instagram' ? '1:1' : '16:9';

                          setGeneratedContent({
                            platform,
                            type,
                            postType: activePost.postType || postType,
                            topic,
                            hook: activePost.caption ? (activePost.caption.slice(0, 90)) : topic,
                            caption: activePost.caption || '',
                            shortCaption: activePost.shortCaption || '',
                            cta: activePost.cta || '',
                            hashtags: activePost.hashtags || [],
                            subject: isEmail ? topic : undefined,
                            title: isBlog || isNewspaper ? topic : undefined,
                            headline: isNewspaper ? topic : undefined,
                            workspaceId: activeWorkspace?._id || activeWorkspace?.id,
                            brandName: activeWorkspace?.brandName,
                            brandColors: activeWorkspace?.brandColors,
                            industry: activeWorkspace?.industryCategory || activeWorkspace?.niche,
                            companyDescription: activeWorkspace?.companyDescription || activeWorkspace?.metaDescription,
                            tagline: activeWorkspace?.tagline,
                            imageAspect: isEmail ? null : aspect,
                            imageStyle: isEmail ? null : 'Photorealistic Commercial',
                            imageUrl: isEmail ? null : (activePost.generatedImage || activePost.imageUrl),
                            strategyPillar: activePost.postFor || activePost.strategyPillar || activePost.pillar || 'Brand Awareness',
                            strategyDescription: activePost.postObjective || activePost.title || '',
                            calendarDate: activePost.date,
                            calendarDay: activePost.day,
                            campaignStage: activePost.campaignStage || 'Awareness',
                          });

                          setStudioTarget({
                            workspaceId: activeWorkspace?._id || activeWorkspace?.id,
                            brandName: activeWorkspace?.brandName,
                            brandColors: activeWorkspace?.brandColors,
                            industry: activeWorkspace?.industryCategory || activeWorkspace?.niche,
                            companyDescription: activeWorkspace?.companyDescription || activeWorkspace?.metaDescription,
                            tagline: activeWorkspace?.tagline,
                            platform,
                            topic,
                            postType: isEmail ? 'email' : postType,
                            type,
                            autoGenerate: true,
                            generateVisual: !isEmail,
                            imageUrl: isEmail ? null : (activePost.generatedImage || activePost.imageUrl),
                            imageAspect: isEmail ? null : aspect,
                            strategyPillar: activePost.postFor || activePost.strategyPillar || 'Brand Awareness',
                            campaignStage: activePost.campaignStage || 'Awareness'
                          });
                          setActiveModule('studio');
                        }}
                        className="w-full py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4 text-white" />
                        CONTINUE TO CONTENT STUDIO
                      </button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0d131f] border border-dashed border-slate-200 dark:border-slate-800 rounded-[24px] p-8 text-center flex flex-col items-center justify-center min-h-[380px] h-full flex-1">
                <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No Post Scheduled</h5>
                <p className="text-[9px] text-slate-400 font-medium mt-1 leading-normal max-w-xs">
                  There is no post generated for {selectedDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-16 bg-white dark:bg-[#0d131f] rounded-[28px] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-350 mb-4">
            <Layers className="w-6 h-6 opacity-30" />
          </div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[4px]">No Campaigns Active</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Configure campaign name, posting frequency, and click Generate Calendar above.</p>
        </div>
      )}
    </div>
  );
};
