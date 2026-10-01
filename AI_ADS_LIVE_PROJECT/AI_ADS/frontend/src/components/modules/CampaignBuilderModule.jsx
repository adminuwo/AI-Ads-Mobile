import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Layers, Sparkles, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export const CampaignBuilderModule = () => {
  const { activeWorkspace, setActiveModule, addCalendarEvent } = useWorkspace();
  const [campaignName, setCampaignName] = useState('Q3 AI Content Velocity Campaign');
  const [duration, setDuration] = useState('30 Days');
  const [generated, setGenerated] = useState(false);

  const handleBuildCampaign = () => {
    setGenerated(true);
    addCalendarEvent({ title: `${campaignName}: Launch Article`, date: '2026-08-01', platform: 'Blog', pillar: 'Campaign Ops', status: 'SCHEDULED', owner: 'Campaign Manager' });
    addCalendarEvent({ title: `${campaignName}: LinkedIn Carousel`, date: '2026-08-03', platform: 'LinkedIn', pillar: 'Campaign Ops', status: 'SCHEDULED', owner: 'Senior Copywriter' });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-400" />
            <h1 className="text-xl font-extrabold text-white">Multi-Channel Campaign Builder</h1>
          </div>
          <p className="text-xs text-slate-400">
            Orchestrate multi-asset campaigns across blogs, social posts, emails, and visual briefs for <strong className="text-white">{activeWorkspace.brandName}</strong>.
          </p>
        </div>

        <button onClick={handleBuildCampaign} className="btn-primary text-xs">
          <Sparkles className="w-4 h-4" />
          Synthesize Campaign Architecture
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Campaign Parameters</h2>
          
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Name</label>
            <input 
              type="text" 
              value={campaignName} 
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full glass-input text-xs" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Duration & Schedule Window</label>
            <input 
              type="text" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className="w-full glass-input text-xs" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Target Channels</label>
            <div className="flex flex-wrap gap-1.5">
              {['Blog', 'LinkedIn', 'Instagram', 'Email', 'Landing Page'].map(c => (
                <span key={c} className="px-2.5 py-1 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold">
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Output Campaign Plan */}
        <div className="lg:col-span-2 p-6 rounded-3xl accent-card glass-card border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Campaign Theme & Asset Hierarchy</h2>

          {generated ? (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-brand-500/30 space-y-1">
                <span className="font-bold text-brand-400 block text-sm">Master Theme: "Stop Content Fragmentation"</span>
                <p className="text-slate-300">Unified campaign positioning highlighting how Brand DNA and structured SEO briefs eliminate 5-day approval bottlenecks.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Auto-Generated Campaign Assets & Calendar Links:</span>
                <div className="space-y-1 text-slate-300">
                  <p>• <strong>Pillar SEO Article:</strong> "The 2026 Enterprise Guide to Governed Content Operations"</p>
                  <p>• <strong>LinkedIn Carousel Copy:</strong> 4-slide breakdown of Brand DNA memory setup</p>
                  <p>• <strong>Reel Script:</strong> 30s video script focusing on tab chaos vs unified workspace</p>
                  <p>• <strong>Email Nurture Sequence:</strong> 3-part automated email stream for lead captures</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Content Calendar Auto-Populated with 4 Campaign Entries
                </span>
                <button onClick={() => setActiveModule('calendar')} className="btn-primary text-xs py-1.5 px-3">
                  View Content Calendar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">Click "Synthesize Campaign Architecture" to build theme hierarchy and auto-populate content calendar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
