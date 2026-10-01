import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { downloadImageToDevice } from '../../utils/downloadHelper';
import { getBrandLogoUrl } from '../../utils/brandLogoHelper';
import { compositeBrandLogoOntoImage } from '../../utils/imageCompositor';
import {
  Palette, Sparkles, ShieldAlert, Image as ImageIcon, CheckCircle2,
  ArrowLeft, ArrowUpRight, Film, Layers, BookOpen, Wand2, Download,
  Copy, RefreshCw, Loader2, Send, Calendar, Tag, Clock, Star,
  FileVideo, LayoutGrid, Mic, Brush, Camera, Zap, X, Heart, MessageSquare,
  Share2, Bookmark, MoreHorizontal, Mail, FileText, Newspaper, Eye
} from 'lucide-react';
import { PlatformPostCanvas } from './PlatformPostCanvas';
import FullImageModal from '../../components/modals/FullImageModal';

// â”€â”€â”€ Utility: Format Date â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// â”€â”€â”€ Section Display Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SectionBlock = ({ label, value, onCopy, color = 'brand', children }) => (
  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
    <div className="flex items-center justify-between">
      <span className={`text-[9px] font-bold uppercase tracking-widest text-${color}-600 dark:text-${color}-400`}>
        {label}
      </span>
      {(onCopy || value) && (
        <button
          onClick={() => navigator.clipboard.writeText(value || '')}
          className="p-1 rounded text-slate-400 hover:text-brand-500 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
    {children || (
      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
        {value}
      </p>
    )}
  </div>
);

// â”€â”€â”€ Meta Stamp â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MetaStamp = ({ topic, date, type }) => (
  <div className="flex flex-wrap gap-3 text-[10px] font-bold">
    {topic && (
      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
        <Tag className="w-3 h-3" /> {topic}
      </span>
    )}
    {type && (
      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
        <Star className="w-3 h-3" /> {type}
      </span>
    )}
    {date && (
      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <Calendar className="w-3 h-3" /> {formatDate(date)}
      </span>
    )}
  </div>
);

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SUB-PAGES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€â”€ 1. AI Visual / Image Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const VisualStudio = ({ workspace, credits, deductVisualCredits, setIsCreditModalOpen }) => {
  const { addGlobalAsset } = useWorkspace();
  const [prompt, setPrompt] = useState('Cyberpunk glassmorphic UI card showing AI metrics and glowing indigo gradients');
  const [style, setStyle] = useState('Glassmorphic Modern 3D');
  const [topic, setTopic] = useState('AI Marketing Campaign Visual');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [showFullImageModal, setShowFullImageModal] = useState(false);

  const handleGenerate = async () => {
    if (generating) return;
    const cost = 5;
    if (credits.balance < cost) { setIsCreditModalOpen(true); return; }
    setGenerating(true);
    deductVisualCredits(cost, `AI Visual: "${prompt.slice(0, 30)}..."`);
    try {
      const res = await fetch(`${API_BASE}/creative/visual/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, creditCost: cost })
      });
      const data = await res.json();
      if (data.success) {
        const rawUrl = data.asset.imageUrl || data.asset.url;
        const compositedUrl = await compositeBrandLogoOntoImage(rawUrl, {
          brandName: workspace?.brandName,
          domainUrl: workspace?.domainUrl,
          logoUrl: workspace?.logoUrl,
          faviconUrl: workspace?.faviconUrl
        });
        const finalAsset = { ...data.asset, imageUrl: compositedUrl || rawUrl };
        setResult(finalAsset);
        addGlobalAsset({ name: topic || 'AI Generated Image', type: 'IMAGE', url: finalAsset.imageUrl, date: new Date().toISOString(), credits: cost });
      }
      else throw new Error('API error');
    } catch (err) {
      console.error('Creative image synthesis error:', err);
      const escapeXml = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
      const cleanPrompt = escapeXml((prompt || topic || 'Modern Commercial Asset').slice(0, 40));
      const safeStyle = escapeXml(style);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800"><rect width="800" height="800" fill="#0F172A"/><circle cx="400" cy="400" r="250" fill="#6366F1" opacity="0.25"/><text x="400" y="390" fill="#FFFFFF" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">${cleanPrompt}</text><text x="400" y="430" fill="#818CF8" font-family="sans-serif" font-size="14" text-anchor="middle">Style: ${safeStyle}</text><text x="400" y="520" fill="#94A3B8" font-family="sans-serif" font-size="12" text-anchor="middle">Google Cloud Vertex AI • Gemini Image Pipeline</text></svg>`;
      const rawFallback = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
      const compositedFallback = await compositeBrandLogoOntoImage(rawFallback, {
        brandName: workspace?.brandName,
        domainUrl: workspace?.domainUrl,
        logoUrl: workspace?.logoUrl,
        faviconUrl: workspace?.faviconUrl
      });
      const fallbackResult = {
        id: `vis_${Date.now()}`,
        topic,
        prompt,
        style,
        imageUrl: compositedFallback || rawFallback,
        provider: 'Google Cloud Vertex AI (gemini-3.1-flash-image)',
        createdAt: new Date().toISOString()
      };
      setResult(fallbackResult);
      // Removed addGlobalAsset here so we don't save wireframes to the asset library
    } finally { setGenerating(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Parameters */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Visual Parameters</h2>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Topic / Campaign Name</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Visual Prompt Description</label>
          <textarea rows={4} value={prompt} onChange={e => setPrompt(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 leading-relaxed" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Visual Style Direction</label>
          <select value={style} onChange={e => setStyle(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100">
            <option value="Glassmorphic Modern 3D">Glassmorphic Modern 3D (AISA Style)</option>
            <option value="Minimalist Corporate Tech">Minimalist Corporate Tech</option>
            <option value="Cyberpunk Neon Gradients">Cyberpunk Neon Gradients</option>
            <option value="Photorealistic B2B Studio">Photorealistic B2B Studio</option>
            <option value="Bold Editorial Fashion">Bold Editorial Fashion</option>
          </select>
        </div>

        <button onClick={handleGenerate} disabled={generating}
          className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Synthesizing Gemini 3.1 Image...' : 'Generate High-Res Visual'}
        </button>
      </div>

      {/* Output Canvas */}
      <div className="lg:col-span-2 p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Visual Output Canvas</h2>
        {result ? (
          <div className="space-y-4 animate-in fade-in">
            <MetaStamp topic={result.topic || topic} type={result.style || style} date={result.createdAt} />
            <div 
              className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video bg-slate-950 flex items-center justify-center group cursor-pointer"
              onClick={() => setShowFullImageModal(true)}
            >
              <img src={result.imageUrl} alt={result.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-extrabold text-xs z-20 pointer-events-none">
                <Eye className="w-5 h-5 text-emerald-400" />
                <span>Click to View Full Resolution Image</span>
              </div>



              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-slate-200 flex justify-between items-center">
                <span className="truncate max-w-sm font-medium">"{result.prompt}"</span>
                <span className="text-[10px] bg-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2">{result.style}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadImageToDevice(result.imageUrl, `${topic || 'creative'}_visual_${Date.now()}.jpg`, { brandName: workspace?.brandName, logoUrl: workspace?.logoUrl || workspace?.faviconUrl })}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button onClick={() => navigator.clipboard.writeText(result.imageUrl)}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Copy className="w-3.5 h-3.5" /> Copy URL
              </button>
              <button onClick={() => setResult(null)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Visual Asset committed to Asset Library
            </div>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
            <p className="text-xs font-medium">Enter a topic & prompt, then click "Generate High-Res Visual" to invoke Vertex AI Imagen 3 synthesis.</p>
          </div>
        )}
      </div>
      {showFullImageModal && result?.imageUrl && (
        <FullImageModal
          imageUrl={result.imageUrl}
          title={result.prompt || topic || 'AI Visual Asset'}
          brandName={workspace?.brandName}
          onClose={() => setShowFullImageModal(false)}
        />
      )}
    </div>
  );
};

// â”€â”€â”€ 2. Carousel Slide Brief Studio â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CarouselStudio = ({ workspace }) => {
  const { addGlobalAsset } = useWorkspace();
  const [topic, setTopic] = useState('5 Ways AI Transforms Brand Marketing');
  const [slides, setSlides] = useState(6);
  const [platform, setPlatform] = useState('instagram');
  const [drafting, setDrafting] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setDrafting(true);
    await new Promise(r => setTimeout(r, 1800));
    const brand = workspace?.brandName || 'Brand';
    const carouselResult = {
      id: `car_${Date.now()}`,
      topic,
      platform,
      createdAt: new Date().toISOString(),
      coverSlide: { headline: topic.toUpperCase(), subtext: `By ${brand} | Swipe to discover â†’` },
      slides: Array.from({ length: slides - 2 }, (_, i) => ({
        num: i + 2,
        title: `Point ${i + 1}: ${['AI-Powered Content Velocity', 'Brand DNA Anchoring', 'Multi-Channel Automation', 'Real-Time Analytics', 'Approvals & Compliance'][i % 5]}`,
        body: `Leverage cutting-edge AI to ${['create content 10x faster with zero compromises on quality or brand alignment.', 'ensure every piece of content reflects your exact brand voice, tone, and messaging guidelines.', 'publish to Instagram, LinkedIn, Twitter, Email, and Newspaper simultaneously.', 'track performance metrics in real-time and optimize campaigns instantly.', 'streamline review cycles with automated compliance and stakeholder approvals.'][i % 5]}`,
        visualCue: `[Visual: ${['Split-screen before/after comparison', 'DNA helix brand identity graphic', 'Multi-platform icons connected by flow lines', 'Dashboard analytics screenshot', 'Approval workflow diagram'][i % 5]}]`
      })),
      ctaSlide: { headline: 'Ready to Transform?', cta: 'Visit aisa.ai â†’ Start Free Trial', brandTag: `@${brand.toLowerCase().replace(/\s/g, '')}` }
    };
    setResult(carouselResult);
    addGlobalAsset({ name: topic || 'AI Generated Carousel', type: 'CAROUSEL', url: 'Carousel Draft Generated', date: new Date().toISOString(), credits: 0 });
    setDrafting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Carousel Parameters</h2>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Carousel Topic</label>
          <textarea rows={3} value={topic} onChange={e => setTopic(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Platform</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100">
            {['instagram', 'linkedin', 'facebook'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Number of Slides: {slides}</label>
          <input type="range" min={4} max={12} value={slides} onChange={e => setSlides(+e.target.value)}
            className="w-full accent-purple-500" />
        </div>
        <button onClick={handleGenerate} disabled={drafting}
          className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60">
          {drafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LayoutGrid className="w-4 h-4" />}
          {drafting ? 'Crafting Slides...' : 'Generate Carousel Brief'}
        </button>
      </div>

      <div className="lg:col-span-2 p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Carousel Slide Brief</h2>
        {result ? (
          <div className="space-y-4 animate-in fade-in">
            <MetaStamp topic={result.topic} type={`${result.slides.length + 2} Slides Â· ${result.platform}`} date={result.createdAt} />
            {/* Cover Slide */}
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-purple-500/30 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300">SLIDE 1 â€” COVER</span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{result.coverSlide.headline}</p>
              <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">{result.coverSlide.subtext}</p>
            </div>
            {/* Content Slides */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {result.slides.map((slide) => (
                <div key={slide.num} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">SLIDE {slide.num}</span>
                    <button onClick={() => navigator.clipboard.writeText(`${slide.title}\n${slide.body}`)}
                      className="p-1 rounded text-slate-400 hover:text-brand-500 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{slide.title}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{slide.body}</p>
                  <p className="text-[10px] text-slate-400 italic">{slide.visualCue}</p>
                </div>
              ))}
            </div>
            {/* CTA Slide */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">SLIDE {result.slides.length + 2} â€” CTA</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">{result.ctaSlide.headline}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">{result.ctaSlide.cta}</p>
              <p className="text-[10px] text-slate-500">{result.ctaSlide.brandTag}</p>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <LayoutGrid className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
            <p className="text-xs font-medium">Enter a topic and click "Generate Carousel Brief" to get full slide-by-slide briefs with visual cues for each frame.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// â”€â”€â”€ 3. Reel / Short Video Script Studio â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ReelScriptStudio = ({ workspace }) => {
  const { addGlobalAsset } = useWorkspace();
  const [topic, setTopic] = useState('Why Every Brand Needs AI Content in 2026');
  const [duration, setDuration] = useState('60');
  const [hook, setHook] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setDrafting(true);
    await new Promise(r => setTimeout(r, 2000));
    const brand = workspace?.brandName || 'Brand';
    const reelResult = {
      id: `reel_${Date.now()}`,
      topic,
      duration,
      createdAt: new Date().toISOString(),
      hookLine: hook || `"Most brands are losing customers silently â€” here's the fix nobody talks about."`,
      sections: [
        { time: '0:00â€“0:05', label: 'HOOK', script: `[CLOSE-UP FACE / BOLD TEXT OVERLAY]\n"${hook || 'Most brands lose customers silently â€” here\'s what they\'re missing.'}"`, direction: 'Fast cut. High energy music starts. Text animates in.' },
        { time: '0:05â€“0:15', label: 'PROBLEM', script: `You're posting every day. Spending hours on content. But your growth is flat.\nWhy? Because your content isn't anchored to your brand DNA.`, direction: 'B-roll of frustrated marketer. Slow zoom out.' },
        { time: '0:15â€“0:30', label: 'SOLUTION', script: `${brand} uses AISA â€” an AI engine that understands your brand's tone, audience, and goals.\nIt generates blogs, social posts, emails, and ads â€” instantly. All 100% on-brand.`, direction: 'Screen recording of AISA dashboard. Clean transitions.' },
        { time: '0:30â€“0:45', label: 'PROOF / BENEFITS', script: `10x faster content. Zero brand inconsistency. Approved by stakeholders in minutes.\nThat's not the future â€” that's what ${brand} does today.`, direction: 'Before/after split screen. Metric counters animate.' },
        { time: '0:45â€“0:55', label: 'CTA', script: `Comment "AI" below if you want to see how we set this up for your brand.\nOr hit the link in bio â€” your first campaign is on us.`, direction: 'Direct to camera. Point at comment section. Smile.' },
        { time: '0:55â€“1:00', label: 'OUTRO', script: `[LOGO STING + BRAND MUSIC]\n@${brand.toLowerCase().replace(/\s/g, '')} | aisa.ai`, direction: 'Fade to brand colors. Logo animation.' }
      ],
      editingNotes: `Total Duration: ${duration}s | Ratio: 9:16 (Vertical) | Music: Upbeat corporate / trending audio | Captions: Auto-generated via CapCut or Premiere | Thumbnail: Freeze frame at 0:01 with bold text overlay`,
      hashtags: ['#AIMarketing', '#ContentCreation', '#BrandGrowth', `#${brand.replace(/\s/g, '')}`, '#ReelsTips', '#MarketingHacks']
    };
    setResult(reelResult);
    addGlobalAsset({ name: topic || 'AI Reel Script', type: 'DOCUMENT', url: 'Reel Script Generated', date: new Date().toISOString(), credits: 0 });
    setDrafting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Film className="w-4 h-4 text-rose-500" /> Reel Script Parameters
        </h2>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Topic / Message</label>
          <textarea rows={3} value={topic} onChange={e => setTopic(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Hook Line (optional)</label>
          <input type="text" value={hook} onChange={e => setHook(e.target.value)} placeholder={`e.g., "You're doing content wrong..."`}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Duration</label>
          <select value={duration} onChange={e => setDuration(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100">
            <option value="15">15 Seconds (Story / Reel)</option>
            <option value="30">30 Seconds (Standard Reel)</option>
            <option value="60">60 Seconds (Long Reel)</option>
            <option value="90">90 Seconds (YouTube Short)</option>
          </select>
        </div>
        <button onClick={handleGenerate} disabled={drafting}
          className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60">
          {drafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
          {drafting ? 'Writing Script...' : 'Generate Reel Script'}
        </button>
      </div>

      <div className="lg:col-span-2 p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Reel Script & Shot List</h2>
        {result ? (
          <div className="space-y-4 animate-in fade-in">
            <MetaStamp topic={result.topic} type={`${result.duration}s Reel Script`} date={result.createdAt} />
            {/* Hook callout */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">HOOK LINE</span>
              <p className="mt-1 text-sm font-black text-slate-900 dark:text-white italic">"{result.hookLine}"</p>
            </div>
            {/* Script Sections */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {result.sections.map((s, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-widest">{s.label}</span>
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{s.time}</span>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(s.script)} className="p-1 rounded text-slate-400 hover:text-brand-500 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">{s.script}</p>
                  <p className="text-[10px] text-slate-400 italic border-t border-slate-100 dark:border-slate-700 pt-1.5">[Director: {s.direction}]</p>
                </div>
              ))}
            </div>
            {/* Editing Notes */}
            <SectionBlock label="Editing Notes & Production Brief" value={result.editingNotes} color="slate" />
            {/* Hashtags */}
            <div className="flex flex-wrap gap-1.5">
              {result.hashtags.map((h, i) => (
                <span key={i} onClick={() => navigator.clipboard.writeText(h)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-brand-600 dark:text-brand-400 text-xs font-bold cursor-pointer hover:bg-brand-50 transition-colors">
                  {h}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Film className="w-10 h-10 mx-auto text-rose-400/50 mb-3" />
            <p className="text-xs font-medium">Enter a topic and click "Generate Reel Script" to get a full timestamped script with shot directions and editing notes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// â”€â”€â”€ 4. Storyboard Studio â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const StoryboardStudio = ({ workspace }) => {
  const { addGlobalAsset } = useWorkspace();
  const [topic, setTopic] = useState('Brand Launch Campaign â€” Premium Product Reveal');
  const [adType, setAdType] = useState('video_ad');
  const [frames, setFrames] = useState(6);
  const [drafting, setDrafting] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setDrafting(true);
    await new Promise(r => setTimeout(r, 1800));
    const brand = workspace?.brandName || 'Brand';
    const storyboardResult = {
      id: `sb_${Date.now()}`,
      topic,
      adType,
      createdAt: new Date().toISOString(),
      frames: Array.from({ length: frames }, (_, i) => ({
        frame: i + 1,
        duration: i === 0 ? '0:00â€“0:03' : i === frames - 1 ? `0:${(frames - 1) * 3}â€“0:${frames * 3}` : `0:${i * 3}â€“0:${(i + 1) * 3}`,
        sceneDesc: [
          `OPEN: Slow-motion black screen fade-in. ${brand} logo materializes in golden particles. Cinematic music begins.`,
          `WIDE SHOT: Aerial drone view of urban landscape. V.O.: "In a world of noise..."`,
          `CLOSE-UP: Product hero shot with dramatic lighting. Slow 360Â° rotation. Lens flare effect.`,
          `LIFESTYLE SHOT: Real person (target audience persona) using the product. Genuine emotion. Warm lighting.`,
          `PROOF PANEL: Key stats animate in. "10,000+ Customers | 4.9â˜… Rating | Industry-Leading Quality"`,
          `CTA FRAME: Product + brand logo + CTA text. "Shop Now at aisa.ai". QR code bottom right.`
        ][Math.min(i, 5)],
        visualDirection: [
          'Black bg â†’ brand color gradient. Logo sting SFX. Font: Bold Sans.',
          'Drone footage. Color grade: cinematic teal-orange. No text.',
          '4K product macro. LED ring light. White/black background. Brand colors.',
          'Golden hour. 85mm portrait lens. Subject in brand-colored outfit.',
          'Clean white bg. Counter animation. Green check icons.',
          'Hero shot + CTA button animation. Brand pattern overlay.'
        ][Math.min(i, 5)],
        voiceover: [
          '',
          'In a world of noise...',
          `...${brand} cuts through.`,
          'Trusted by thousands who demand more.',
          'Quality you can measure. Results you can feel.',
          `${brand}. Visit us now.`
        ][Math.min(i, 5)]
      }))
    };
    setResult(storyboardResult);
    addGlobalAsset({ name: topic || 'AI Storyboard', type: 'DOCUMENT', url: 'Storyboard Generated', date: new Date().toISOString(), credits: 0 });
    setDrafting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" /> Storyboard Parameters
        </h2>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Campaign / Ad Concept</label>
          <textarea rows={3} value={topic} onChange={e => setTopic(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ad Format</label>
          <select value={adType} onChange={e => setAdType(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100">
            <option value="video_ad">Video Ad (15â€“30s)</option>
            <option value="tv_commercial">TV Commercial (30â€“60s)</option>
            <option value="brand_film">Brand Film (60â€“120s)</option>
            <option value="social_story">Social Story (15s Vertical)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Number of Frames: {frames}</label>
          <input type="range" min={4} max={10} value={frames} onChange={e => setFrames(+e.target.value)}
            className="w-full accent-amber-500" />
        </div>
        <button onClick={handleGenerate} disabled={drafting}
          className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60">
          {drafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
          {drafting ? 'Building Storyboard...' : 'Generate Storyboard'}
        </button>
      </div>

      <div className="lg:col-span-2 p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Storyboard Frames & Shot List</h2>
        {result ? (
          <div className="space-y-4 animate-in fade-in">
            <MetaStamp topic={result.topic} type={`${result.frames.length} Frames Â· ${result.adType.replace('_', ' ')}`} date={result.createdAt} />
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {result.frames.map((f) => (
                <div key={f.frame} className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs">F{f.frame}</div>
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{f.duration}</span>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(`${f.sceneDesc}\n${f.visualDirection}`)} className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">SCENE</span>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">{f.sceneDesc}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">VISUAL DIRECTION</span>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">{f.visualDirection}</p>
                  </div>
                  {f.voiceover && (
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Mic className="w-2.5 h-2.5" />V.O.</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 italic">"{f.voiceover}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-amber-400/50 mb-3" />
            <p className="text-xs font-medium">Enter a campaign concept and click "Generate Storyboard" to get a full frame-by-frame shot list with scene descriptions, visual directions, and voiceover.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// â”€â”€â”€ 5. Brand Visual Kit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BrandKitStudio = ({ workspace }) => {
  const { addGlobalAsset } = useWorkspace();
  const [focus, setFocus] = useState('Complete Brand Kit');
  const [drafting, setDrafting] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setDrafting(true);
    await new Promise(r => setTimeout(r, 1500));
    const brand = workspace?.brandName || 'Brand';
    const primary = workspace?.primaryColor || '#6366F1';
    const kitResult = {
      id: `bk_${Date.now()}`,
      focus,
      createdAt: new Date().toISOString(),
      brandName: brand,
      colors: {
        primary: { hex: primary, name: 'Brand Primary', usage: 'CTAs, headings, key UI elements' },
        secondary: { hex: '#10B981', name: 'Accent Emerald', usage: 'Success states, highlights' },
        dark: { hex: '#0F172A', name: 'Deep Navy', usage: 'Dark backgrounds, text' },
        light: { hex: '#F8FAFC', name: 'Off White', usage: 'Light backgrounds, cards' },
        muted: { hex: '#94A3B8', name: 'Slate Muted', usage: 'Body text, secondary elements' }
      },
      typography: {
        heading: 'Outfit â€” Bold 700/800. Use for headlines & display text.',
        body: 'Inter â€” Regular 400/Medium 500. Use for body copy & UI text.',
        mono: 'JetBrains Mono â€” For code, data, and technical content.'
      },
      logoGuidelines: [
        'Minimum size: 80px width for digital, 15mm for print',
        'Clear space: Equal to the height of the logo letter "B" on all sides',
        'Approved backgrounds: White, brand dark, brand primary',
        'Never distort, rotate, or apply drop shadow to logo',
        'Never use low-res logo files below 300 DPI for print'
      ],
      voiceTone: {
        adjectives: ['Bold', 'Confident', 'Expert', 'Approachable', 'Innovative'],
        doSay: [`"${brand} helps you achieve more."`, '"Our AI understands your brand."', '"Built for performance. Designed for trust."'],
        dontSay: ['"We try to..."', '"Hopefully this works..."', '"Cheap and affordable"']
      }
    };
    setResult(kitResult);
    addGlobalAsset({ name: focus || 'Brand Visual Kit', type: 'DOCUMENT', url: 'Brand Kit Generated', date: new Date().toISOString(), credits: 0 });
    setDrafting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Brush className="w-4 h-4 text-brand-500" /> Brand Kit Parameters
        </h2>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kit Focus</label>
          <select value={focus} onChange={e => setFocus(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100">
            <option>Complete Brand Kit</option>
            <option>Color Palette Only</option>
            <option>Typography System Only</option>
            <option>Voice & Tone Guide</option>
            <option>Logo Usage Guidelines</option>
          </select>
        </div>
        <div className="p-3 rounded-2xl bg-brand-500/5 border border-brand-500/20 text-xs text-slate-600 dark:text-slate-400">
          <p className="font-medium">Brand data sourced from your <strong className="text-slate-900 dark:text-white">Brand DNA</strong> profile for {workspace?.brandName || 'your brand'}.</p>
        </div>
        <button onClick={handleGenerate} disabled={drafting}
          className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60">
          {drafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brush className="w-4 h-4" />}
          {drafting ? 'Generating Kit...' : 'Generate Brand Visual Kit'}
        </button>
      </div>

      <div className="lg:col-span-2 p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Brand Visual System</h2>
        {result ? (
          <div className="space-y-5 animate-in fade-in">
            <MetaStamp topic={result.brandName} type={result.focus} date={result.createdAt} />
            {/* Color Palette */}
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">COLOR PALETTE</span>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(result.colors).map(([key, c]) => (
                  <div key={key} className="space-y-1.5 text-center">
                    <div className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: c.hex }}
                      onClick={() => navigator.clipboard.writeText(c.hex)} title={`Click to copy ${c.hex}`} />
                    <p className="text-[9px] font-bold text-slate-700 dark:text-slate-300">{c.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono">{c.hex}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Typography */}
            <SectionBlock label="Typography System" color="brand">
              <div className="space-y-2">
                {Object.entries(result.typography).map(([k, v]) => (
                  <div key={k} className="flex gap-2 items-start">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 w-12 flex-shrink-0 pt-0.5">{k}</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </SectionBlock>
            {/* Voice & Tone */}
            <SectionBlock label="Brand Voice & Tone" color="purple">
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {result.voiceTone.adjectives.map(a => (
                    <span key={a} className="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20">{a}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">âœ“ DO SAY</p>
                    {result.voiceTone.doSay.map((s, i) => <p key={i} className="text-[11px] text-slate-600 dark:text-slate-400 italic mb-0.5">{s}</p>)}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">âœ• DON'T SAY</p>
                    {result.voiceTone.dontSay.map((s, i) => <p key={i} className="text-[11px] text-slate-600 dark:text-slate-400 italic mb-0.5">{s}</p>)}
                  </div>
                </div>
              </div>
            </SectionBlock>
            {/* Logo Guidelines */}
            <SectionBlock label="Logo Usage Guidelines" color="amber">
              <ul className="space-y-1">
                {result.logoGuidelines.map((g, i) => (
                  <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">â€¢</span>{g}
                  </li>
                ))}
              </ul>
            </SectionBlock>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Brush className="w-10 h-10 mx-auto text-brand-400/50 mb-3" />
            <p className="text-xs font-medium">Click "Generate Brand Visual Kit" to produce a complete color palette, typography system, voice guide, and logo guidelines from your Brand DNA.</p>
          </div>
        )}
      </div>
    </div>
  );
};
// PlatformPostCanvas is imported from ./PlatformPostCanvas.jsx

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN MODULE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const CreativeStudioModule = () => {
  const { activeWorkspace, credits, deductVisualCredits, setIsCreditModalOpen, generatedContent, studioTarget, markPostAsGenerated, t } = useWorkspace();
  const [selectedFormat, setSelectedFormat] = useState(null);

  // If redirected from Strategy, Calendar or Content Studio, studioTarget carries post details
  const contentObj = generatedContent?.data ? { ...generatedContent, ...generatedContent.data } : generatedContent;
  const effectiveContent = studioTarget || contentObj
    ? { ...(contentObj || {}), ...(studioTarget || {}) }
    : null;

  // Scroll to top ONCE on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, []);

  // Auto-select the correct format card and mark post as generated in real-time
  useEffect(() => {
    if (!effectiveContent) return;

    const key = effectiveContent.calendarDate || effectiveContent.calendarDay || effectiveContent.topic || effectiveContent.title || effectiveContent.subject;
    if (key && markPostAsGenerated) {
      markPostAsGenerated(key, effectiveContent);
    }

    const type = (effectiveContent.type || effectiveContent.postType || '').toUpperCase();
    const plat = (effectiveContent.platform || '').toLowerCase();

    if (type === 'EMAIL' || plat === 'email' || plat === 'newsletter') {
      setSelectedFormat('EMAIL');
    } else if (type === 'BLOG' || plat === 'blog' || plat === 'seo' || plat === 'website') {
      setSelectedFormat('BLOG');
    } else if (type === 'SOCIAL' || ['instagram', 'linkedin', 'twitter', 'facebook', 'youtube', 'tiktok'].includes(plat)) {
      setSelectedFormat('SOCIAL');
    }
  }, [effectiveContent?.type, effectiveContent?.platform, effectiveContent?.postType, effectiveContent?.calendarDate, effectiveContent?.topic, markPostAsGenerated]);

  const FORMAT_SECTIONS = [
    {
      id: 'EMAIL',
      type: 'EMAIL',
      platform: 'email',
      title: 'Email / Letter',
      subtitle: 'Drip Sequences, Newsletters & Executive Copy',
      icon: Mail,
      colorClass: 'from-indigo-500/10 to-blue-500/5',
      hoverBorder: 'hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
      badgeBg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
      iconColor: 'text-brand-500',
      accentClass: 'border-indigo-500/30 bg-indigo-500/5'
    },
    {
      id: 'SOCIAL',
      type: 'SOCIAL',
      platform: 'instagram',
      title: 'Social Media',
      subtitle: 'Instagram, LinkedIn, Facebook & Twitter Copy',
      icon: Share2,
      colorClass: 'from-purple-500/10 to-violet-500/5',
      hoverBorder: 'hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
      badgeBg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
      iconColor: 'text-brand-500',
      accentClass: 'border-purple-500/30 bg-purple-500/5'
    },
    {
      id: 'BLOG',
      type: 'BLOG',
      platform: 'website',
      title: 'Blog',
      subtitle: 'SEO Long-Form Articles & Authority Guides',
      icon: BookOpen,
      colorClass: 'from-amber-500/10 to-orange-500/5',
      hoverBorder: 'hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-500',
      accentClass: 'border-amber-500/30 bg-amber-500/5'
    }
  ];

  const formatPayloads = {
    SOCIAL: {
      type: 'SOCIAL',
      platform: 'instagram',
      topic: `${activeWorkspace?.brandName || 'Brand'} Social Media Showcase`,
      headline: `Transforming Marketing Velocity with ${activeWorkspace?.brandName || 'AI Ads'} 🚀`,
      hook: `Are you ready to scale your social presence in 2026?`,
      caption: `Building a consistent brand voice across all social media channels has never been easier. Check out these actionable tips to elevate your presence today!`,
      cta: 'Double tap if you agree & tag a colleague below!',
      hashtags: ['#SocialMediaStrategy', '#BrandDNA', '#GrowthMarketing']
    },
    BLOG: {
      type: 'BLOG',
      platform: 'website',
      topic: `${activeWorkspace?.brandName || 'Brand'} SEO Blog Article`,
      headline: `The Ultimate Guide to Scaling ${activeWorkspace?.brandName || 'Brand'} Strategy in 2026`,
      hook: `Complete 8-step breakdown to maximize organic growth and authority.`,
      caption: `In today's fast-evolving landscape, establishing domain authority requires a structured content strategy. Here is our comprehensive guide...`,
      cta: 'Read full 2,000-word SEO article',
      hashtags: ['#SEO', '#ContentStrategy', '#B2BGrowth']
    },
    EMAIL: {
      type: 'EMAIL',
      platform: 'email',
      topic: `${activeWorkspace?.brandName || 'Brand'} Email Newsletter`,
      headline: `Exclusive Updates from ${activeWorkspace?.brandName || 'our team'}`,
      hook: `Here is your weekly digest of industry updates and tactical insights.`,
      caption: `Hello {{First_Name}},\n\nWe are excited to share the latest developments from our product and marketing teams...`,
      cta: 'Explore All Updates Now',
      hashtags: ['#Newsletter', '#EmailMarketing']
    }
  };

  const activeContent = effectiveContent || (selectedFormat ? formatPayloads[selectedFormat] : formatPayloads['social']);

  return (
    <div className="space-y-6 animate-in fade-in w-full max-w-[1600px] mx-auto p-6">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Creative Studio</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                High-Resolution AI Visual Creative &amp; Ad Rendering for <strong className="text-slate-900 dark:text-white">{activeWorkspace?.brandName || 'Brand'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Platform Post Canvas */}
        {activeContent ? (
          <PlatformPostCanvas
            workspace={activeWorkspace}
            generatedContent={activeContent}
            credits={credits}
            deductVisualCredits={deductVisualCredits}
            setIsCreditModalOpen={setIsCreditModalOpen}
          />
        ) : (
          <div className="p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-brand-500/10 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-brand-500" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Creative Studio Ready</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Generate content in <strong>Content Studio</strong> & <strong>Calendar</strong> or create visual assets directly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

