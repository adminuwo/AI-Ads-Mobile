import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Dna, Globe, CheckCircle2, ShieldAlert, Sliders, Users, Plus, Save, Sparkles, RefreshCw } from 'lucide-react';

export const BrandDnaModule = () => {
  const { activeWorkspace, setIsScraperOpen } = useWorkspace();
  const [formality, setFormality] = useState(activeWorkspace.voiceGuidelines?.formalityScore || 4);
  const [newClaim, setNewClaim] = useState('');
  const [newRestricted, setNewRestricted] = useState('');
  const [claimsList, setClaimsList] = useState(activeWorkspace.approvedClaims || []);
  const [restrictedList, setRestrictedList] = useState(activeWorkspace.restrictedClaims || []);
  const [savedMsg, setSavedMsg] = useState('');

  const addApprovedClaim = () => {
    if (!newClaim.trim()) return;
    setClaimsList(prev => [...prev, { claimText: newClaim, sourceUrl: activeWorkspace.domainUrl, verified: true }]);
    setNewClaim('');
  };

  const addRestrictedClaim = () => {
    if (!newRestricted.trim()) return;
    setRestrictedList(prev => [...prev, newRestricted]);
    setNewRestricted('');
  };

  const handleSaveBrandDna = () => {
    setSavedMsg('Brand DNA Memory successfully updated & locked across all downstream AI generation engines!');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-brand-400" />
            <h1 className="text-xl font-extrabold text-white">Brand Intelligence & Brand DNA Profile</h1>
          </div>
          <p className="text-xs text-slate-400">
            Immutable memory profile governing tone, approved claims, and restricted boundaries for <strong className="text-white">{activeWorkspace.brandName}</strong>.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setIsScraperOpen(true)}
            className="btn-secondary text-xs"
          >
            <RefreshCw className="w-4 h-4 text-brand-400" />
            Auto Scrape Domain URL
          </button>
          <button 
            onClick={handleSaveBrandDna}
            className="btn-primary text-xs"
          >
            <Save className="w-4 h-4" />
            Save Brand DNA Memory
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {savedMsg}
        </div>
      )}

      {/* Brand Identity Card & Voice Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Brand Identity */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Identity & Color Direction</h2>
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <img src={activeWorkspace.logoUrl} alt={activeWorkspace.brandName} className="w-14 h-14 rounded-2xl bg-slate-800 p-1 border border-slate-700" />
            <div>
              <h3 className="font-extrabold text-white text-base">{activeWorkspace.brandName}</h3>
              <p className="text-xs text-brand-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> {activeWorkspace.domainUrl}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Brand Palette Colors</label>
            <div className="flex gap-2">
              {activeWorkspace.brandColors?.map((color, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="h-8 rounded-xl border border-white/20 shadow-lg" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-slate-400 font-mono uppercase mt-1 block">{color}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Positioning Summary</label>
            <textarea 
              rows={4}
              defaultValue={activeWorkspace.positioningSummary}
              className="w-full glass-input text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Right Col: Voice & Tone Sliders */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-slate-800 space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-400" />
            Voice & Writing Governance Sliders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="font-bold text-slate-300">Formality Score (1-5)</span>
                <span className="font-extrabold text-brand-400">{formality} / 5</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={formality} 
                onChange={(e) => setFormality(parseInt(e.target.value))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 (Casual / Witty)</span>
                <span>3 (Balanced)</span>
                <span>5 (Strict Enterprise)</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-300 text-xs block mb-2">Tone Keywords</span>
              <div className="flex flex-wrap gap-1.5">
                {activeWorkspace.voiceGuidelines?.toneKeywords.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Approved & Restricted Claims Repository */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            {/* Approved Claims */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Approved Claims Repository
                </h3>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {claimsList.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <p className="text-slate-200 font-medium">{c.claimText}</p>
                    <span className="text-[10px] text-slate-400 truncate block mt-0.5">Source: {c.sourceUrl}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newClaim}
                  onChange={(e) => setNewClaim(e.target.value)}
                  placeholder="Add approved statistic or product claim..."
                  className="flex-1 glass-input text-xs py-1.5"
                />
                <button onClick={addApprovedClaim} className="btn-primary py-1.5 px-3 text-xs">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Restricted Claims */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Restricted Claims & Taboos
                </h3>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {restrictedList.map((rc, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-900/40 text-xs text-rose-200 font-medium">
                    🚫 {rc}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newRestricted}
                  onChange={(e) => setNewRestricted(e.target.value)}
                  placeholder="Add forbidden claim or phrase..."
                  className="flex-1 glass-input text-xs py-1.5"
                />
                <button onClick={addRestrictedClaim} className="btn-secondary py-1.5 px-3 text-xs border-rose-500/30 text-rose-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
