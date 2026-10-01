import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BarChart3, TrendingUp, Sparkles, RefreshCw, Eye, MousePointer, Award } from 'lucide-react';

export const AnalyticsModule = () => {
  const { activeWorkspace } = useWorkspace();

  const metrics = [
    { title: 'Organic Search Impressions', value: '142,800', change: '+34.2%', icon: Eye, color: 'text-brand-400' },
    { title: 'Social Engagement Rate', value: '4.85%', change: '+1.2%', icon: MousePointer, color: 'text-cyan-400' },
    { title: 'Content Production Velocity', value: '14.2m', change: '-65% SLA time', icon: TrendingUp, color: 'text-emerald-400' },
    { title: 'Attributable Pipeline Leads', value: '284 Leads', change: '+48%', icon: Award, color: 'text-purple-400' }
  ];

  const recommendations = [
    { type: 'Title Optimization', text: `Refresh headline for "${activeWorkspace.brandName} SEO Strategy" to boost CTR by an estimated 18%.` },
    { type: 'Best Posting Time', text: 'Schedule LinkedIn Carousels on Tuesdays at 09:30 AM EST for peak B2B engagement.' },
    { type: 'Content Decay Alert', text: 'Pillar article "Enterprise AI Operations" is experiencing slight decay. Recommended refresh cycle.' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            <h1 className="text-xl font-extrabold text-white">Analytics, Performance & AI Learning Loop</h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time performance tracking and closed-loop recommendations for <strong className="text-white">{activeWorkspace.brandName}</strong>.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-4 rounded-2xl accent-card glass-card border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                <span>{m.title}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className="text-2xl font-extrabold text-white">{m.value}</div>
              <span className="text-[10px] font-bold text-emerald-400">{m.change} vs prev month</span>
            </div>
          );
        })}
      </div>

      {/* AI Recommendation Engine Card */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 space-y-4">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Closed-Loop AI Recommendation Engine
        </h2>

        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-cyan-400">{rec.type}</span>
                <p className="text-slate-200 font-medium">{rec.text}</p>
              </div>
              <button className="btn-secondary py-1 px-3 text-[11px]">Apply Recommendation</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
