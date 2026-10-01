import React, { useState } from 'react';
import { API_BASE } from '../../config/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getBrandLogoUrl } from '../../utils/brandLogoHelper';
import { X, Zap, Sparkles, Copy, Check, Send, Eye } from 'lucide-react';
import FullImageModal from './FullImageModal';

export const QuickPostModal = () => {
  const { isQuickPostOpen, setIsQuickPostOpen, activeWorkspace, setActiveModule, setStudioTarget } = useWorkspace();
  const [platform, setPlatform] = useState('LinkedIn');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Authoritative & Professional');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  if (!isQuickPostOpen) return null;

  const handleOpenInStudio = () => {
    const platformLower = (platform || 'LinkedIn').toLowerCase();
    const socialMap = {
      'x/twitter': 'twitter',
      twitter: 'twitter',
      linkedin: 'linkedin',
      instagram: 'instagram',
      facebook: 'facebook'
    };
    const matchedPlatform = socialMap[platformLower] || platformLower;

    if (setStudioTarget) {
      setStudioTarget({
        platform: matchedPlatform,
        topic: topic || 'Quick Social Post',
        tone: tone,
        postType: 'educational',
        output: output,
        imageUrl: output?.imageUrl,
        imagePrompt: output?.imagePrompt,
        autoGenerate: !output,
        hook: output?.hook,
        caption: output?.caption,
        hashtags: output?.hashtags,
        cta: output?.cta,
      });
    }

    setIsQuickPostOpen(false);
    if (setActiveModule) {
      setActiveModule('studio');
    }
  };

  const handleGenerate = async () => {
    if (loading || !topic.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/content/social/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, tone, brandName: activeWorkspace.brandName })
      });
      const data = await res.json();
      if (data.success) {
        setOutput(data.data);
      }
    } catch (e) {
      // Fallback preview output
      setOutput({
        platform,
        hook: `🚀 How ${activeWorkspace.brandName} scaled content operations without losing brand voice.`,
        caption: `Managing multi-channel marketing required 10 separate tools—until now.\n\nUnified Brand DNA + instant repurposing solves production bottlenecks.`,
        hashtags: [`#${activeWorkspace.brandName.replace(/\s+/g, '')}`, '#ContentStrategy', '#MarketingOps'],
        cta: 'Book your strategy demo at link in bio!'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    const text = `${output.hook}\n\n${output.caption}\n\n${output.hashtags.join(' ')}\n\n${output.cta}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-700 flex items-center justify-center p-1 shadow-md shrink-0 overflow-hidden">
              <img 
                src={getBrandLogoUrl({ brandName: activeWorkspace?.brandName, domainUrl: activeWorkspace?.domainUrl, logoUrl: activeWorkspace?.logoUrl, faviconUrl: activeWorkspace?.faviconUrl })} 
                alt={activeWorkspace?.brandName} 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = `https://www.google.com/s2/favicons?domain=${(activeWorkspace?.brandName || 'google').toLowerCase().replace(/[^a-z0-9]/g, '')}.com&sz=256`; }}
              />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Quick Social Post Generator</h2>
              <p className="text-xs text-slate-400">Anchored to {activeWorkspace.brandName} Brand DNA</p>
            </div>
          </div>
          <button 
            onClick={() => setIsQuickPostOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Platform</label>
            <div className="grid grid-cols-4 gap-2">
              {['LinkedIn', 'X/Twitter', 'Instagram', 'Facebook'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    platform === p 
                      ? 'bg-brand-500/20 text-brand-300 border-brand-500 shadow-glow font-bold' 
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Post Topic / Focus</label>
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 5 Reasons to Automate SEO Topic Clustering in 2026"
              className="w-full glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Voice Tone</label>
            <select 
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
              className="w-full glass-input text-xs"
            >
              <option value="Authoritative & Professional">Authoritative & Professional</option>
              <option value="Conversational & Friendly">Conversational & Friendly</option>
              <option value="Thought Leadership">Thought Leadership / Founder Voice</option>
              <option value="Educational & Direct">Educational & Direct</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl font-bold text-xs"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Synthesizing Social Post...' : 'Generate Quick Post'}
          </button>
        </div>

        {/* Output Preview */}
        {output && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>{output.platform} Draft Preview</span>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-brand-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Post'}
              </button>
            </div>
            
            <div className="space-y-2 text-xs text-slate-200">
              {output.imageUrl && (
                <div 
                  className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-sm max-h-72 my-2 bg-slate-950 group cursor-pointer"
                  onClick={() => setShowFullImage(true)}
                >
                  <img 
                    src={output.imageUrl} 
                    alt={output.imagePrompt || output.topic || 'Generated visual'} 
                    className="w-full h-full object-cover max-h-72 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-extrabold text-xs">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>View Full Image</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-[10px] text-white font-semibold flex items-center justify-between shadow-lg">
                    <span className="truncate">🎨 AI Generated Visual (Gemini 3.1 Flash Image)</span>
                    <span className="font-bold text-emerald-400 shrink-0">Click to Expand</span>
                  </div>
                </div>
              )}
              <p className="font-bold text-brand-300">{output.hook}</p>
              <p className="whitespace-pre-wrap">{output.caption}</p>
              <p className="text-cyan-400">{output.hashtags?.join(' ')}</p>
              <p className="font-semibold text-slate-400">{output.cta}</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                onClick={handleOpenInStudio}
                className="w-full btn-secondary text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Open in Full Content Studio
              </button>
            </div>
          </div>
        )}
      </div>

      {showFullImage && output?.imageUrl && (
        <FullImageModal
          imageUrl={output.imageUrl}
          title={output.topic || output.hook || 'AI Generated Visual'}
          brandName={activeWorkspace?.brandName}
          onClose={() => setShowFullImage(false)}
        />
      )}
    </div>
  );
};
