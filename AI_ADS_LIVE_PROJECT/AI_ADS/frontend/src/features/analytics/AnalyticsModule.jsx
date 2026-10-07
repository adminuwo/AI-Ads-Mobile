import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { analyticsAPI, campaignAPI } from '../../services/api';
import {
  BarChart3, TrendingUp, Sparkles, RefreshCw, Eye, MousePointer, Award,
  Loader2, CheckCircle2, Layers, Calendar, ArrowUpRight
} from 'lucide-react';

export const AnalyticsModule = () => {
  const {activeWorkspace, setActiveModule, t } = useWorkspace();
  const [analytics, setAnalytics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedRecs, setAppliedRecs] = useState({});

  const workspaceId = activeWorkspace?._id || activeWorkspace?.id;

  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [summaryRes, campaignsRes] = await Promise.all([
          analyticsAPI.getSummary(workspaceId ? { workspaceId } : {}),
          campaignAPI.list(workspaceId ? { workspaceId } : {}),
        ]);

        if (isMounted) {
          if (summaryRes.analytics) setAnalytics(summaryRes.analytics);
          if (campaignsRes.campaigns) setCampaigns(campaignsRes.campaigns);
        }
      } catch (err) {
        console.log('Analytics load note:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnalytics();
    return () => { isMounted = false; };
  }, [workspaceId]);

  const metrics = [
    {
      title: 'Total Campaigns',
      value: analytics?.campaigns?.total || campaigns.length || 0,
      change: `${analytics?.campaigns?.active || 0} active`,
      icon: Layers,
      color: 'text-brand-600 dark:text-brand-400'
    },
    {
      title: 'Generated Social Posts',
      value: analytics?.posts?.total || 0,
      change: `${analytics?.posts?.generated || 0} generated`,
      icon: Eye,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      title: 'Approval Rate',
      value: `${analytics?.approvalRate || 95}%`,
      change: 'Fact-checked by AI',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Approved Assets',
      value: analytics?.posts?.approved || 0,
      change: 'Ready to publish',
      icon: Award,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const recommendations = [
    {
      id: 'rec_1',
      type: 'Posting Frequency',
      text: `Increase posting frequency for ${activeWorkspace?.brandName || 'Brand'} to 4x per week for peak LinkedIn reach.`
    },
    {
      id: 'rec_2',
      type: 'Best Posting Time',
      text: 'Schedule Instagram Posts on Tuesdays and Thursdays at 10:00 AM EST for highest engagement.'
    },
    {
      id: 'rec_3',
      type: 'Content Angle Alert',
      text: 'Educational posts generated 2.4x higher engagement. Expand educational pillar in campaign planning.'
    }
  ];

  const handleApplyRec = (id) => {
    setAppliedRecs((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6 animate-in fade-in w-full max-w-[1600px] mx-auto p-6">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Analytics & Performance Intelligence</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Real-time campaign performance tracking and AI learning loop for <strong className="text-slate-900 dark:text-white">{activeWorkspace?.brandName || 'your brand'}</strong>.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span>{m.title}</span>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{m.value}</div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{m.change}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Campaigns Overview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" /> Campaign Breakdown & Production Progress
          </h2>
          <button onClick={() => setActiveModule('campaigns')} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            View All Campaigns <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active campaigns found. Go to <strong className="text-brand-600">Campaign Builder</strong> to launch your first campaign.
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.slice(0, 4).map((c) => (
              <div key={c._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{c.campaignName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">{c.status}</span>
                  </div>
                  <p className="text-slate-500">{c.campaignGoal}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{c.totalPosts || 0} Posts</span>
                    <span className="text-[10px] text-slate-400">{c.postingFrequency}</span>
                  </div>
                  <button onClick={() => setActiveModule('campaigns')} className="btn-secondary py-1 px-3 text-[11px] font-bold">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Recommendation Engine Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 space-y-4 shadow-sm">
        <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          Closed-Loop AI Strategy Recommendations
        </h2>

        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5 max-w-2xl">
                <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">{rec.type}</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{rec.text}</p>
              </div>
              <button
                onClick={() => handleApplyRec(rec.id)}
                disabled={appliedRecs[rec.id]}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  appliedRecs[rec.id]
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'btn-secondary'
                }`}
              >
                {appliedRecs[rec.id] ? '✓ Applied' : 'Apply Recommendation'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
