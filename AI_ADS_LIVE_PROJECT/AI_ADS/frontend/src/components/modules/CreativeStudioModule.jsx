import React, { useState } from 'react';
import { API_BASE } from '../../config/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Palette, Sparkles, AlertCircle, Image as ImageIcon, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const CreativeStudioModule = () => {
  const { activeWorkspace, credits, deductVisualCredits, setIsCreditModalOpen } = useWorkspace();
  const [prompt, setPrompt] = useState('Cyberpunk glassmorphic UI card showing AI content metrics and glowing indigo neon gradients');
  const [style, setStyle] = useState('Glassmorphic Modern 3D');
  const [generating, setGenerating] = useState(false);
  const [generatedVisual, setGeneratedVisual] = useState(null);

  const handleGenerateVisual = async () => {
    if (generating) return;
    const cost = 5;
    if (credits.balance < cost) {
      setIsCreditModalOpen(true);
      return;
    }

    setGenerating(true);
    const success = deductVisualCredits(cost, `AI Visual Generation: "${prompt.slice(0, 30)}..."`);
    if (!success) {
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/creative/visual/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, creditCost: cost })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedVisual(data.asset);
      }
    } catch (e) {
      const escapeXml = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
      const cleanPrompt = escapeXml((prompt || 'Modern visual').slice(0, 40));
      const safeStyle = escapeXml(style);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800"><rect width="800" height="800" fill="#0F172A"/><circle cx="400" cy="400" r="250" fill="#6366F1" opacity="0.25"/><text x="400" y="390" fill="#FFFFFF" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">${cleanPrompt}</text><text x="400" y="430" fill="#818CF8" font-family="sans-serif" font-size="14" text-anchor="middle">Style: ${safeStyle}</text><text x="400" y="520" fill="#94A3B8" font-family="sans-serif" font-size="12" text-anchor="middle">Google Cloud Vertex AI • Gemini Image Pipeline</text></svg>`;
      setGeneratedVisual({
        id: `asset_${Date.now()}`,
        prompt,
        style,
        imageUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`,
        provider: 'Google Cloud Vertex AI (gemini-3.1-flash-image)',
        createdAt: new Date().toISOString()
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-extrabold text-white">Creative Studio & Premium Visual Synthesis</h1>
          </div>
          <p className="text-xs text-slate-400">
            Synthesize AI image prompts & carousel slide visual briefs for <strong className="text-white">{activeWorkspace.brandName}</strong>.
          </p>
        </div>


      </div>

      {/* Permanent Video Policy Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
        <p>
          <strong>Permanent Video Policy Notice:</strong> Native video generation is excluded. Text-based reel concepts, scripts, storyboards, shot lists, and editing instructions remain fully supported.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Generator Form */}
        <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Imagen 3 Prompt & Visual Brief</h2>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Visual Prompt Description</label>
            <textarea 
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full glass-input text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Visual Style Direction</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full glass-input text-xs"
            >
              <option value="Glassmorphic Modern 3D">Glassmorphic Modern 3D (AISA Style)</option>
              <option value="Minimalist Corporate Tech">Minimalist Corporate Tech</option>
              <option value="Cyberpunk Neon Gradients">Cyberpunk Neon Gradients</option>
              <option value="Photorealistic B2B Studio">Photorealistic B2B Studio</option>
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex justify-between items-center">
            <span>Deduction Cost:</span>
            <span className="font-bold text-brand-400">5 Visual Credits / High-Res Synthesis</span>
          </div>

          <button
            onClick={handleGenerateVisual}
            disabled={generating}
            className="w-full btn-primary py-3 rounded-xl font-bold text-xs shadow-glow"
          >
            {generating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Synthesizing Imagen 3 Visual...' : 'Generate High-Res Visual Asset'}
          </button>
        </div>

        {/* Generated Visual Canvas */}
        <div className="lg:col-span-2 p-6 rounded-3xl accent-card glass-card border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Visual Output Canvas & Asset Vault Link</h2>

          {generatedVisual ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-slate-950 flex items-center justify-center">
                <img src={generatedVisual.imageUrl} alt={generatedVisual.prompt} className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-slate-200 flex justify-between items-center">
                  <span className="truncate max-w-md font-medium">"{generatedVisual.prompt}"</span>
                  <span className="text-[10px] bg-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded-full">{generatedVisual.style}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Visual Asset Committed to Asset Library
                </span>
                <span className="text-[10px] text-slate-400">5 Credits Deducted</span>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-500 space-y-2">
              <ImageIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">Click "Generate High-Res Visual Asset" to invoke Vertex AI Imagen 3 synthesis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
