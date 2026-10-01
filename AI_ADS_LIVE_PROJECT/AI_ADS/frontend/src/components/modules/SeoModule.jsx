import React, { useState } from 'react';
import { API_BASE } from '../../config/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Search, Layers, FileText, Code2, Sparkles, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const SeoModule = () => {
  const { activeWorkspace, setActiveModule } = useWorkspace();
  const [seedKeyword, setSeedKeyword] = useState('AI Content Marketing Strategy');
  const [intent, setIntent] = useState('Commercial');
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState(null);

  const keywordsList = [
    { term: 'AI Content Marketing Strategy', intent: 'Commercial', volume: '14,200/mo', difficulty: 'Medium (42)', cluster: 'Content Ops' },
    { term: 'Brand DNA Memory Architecture', intent: 'Informational', volume: '8,900/mo', difficulty: 'Low (28)', cluster: 'Governance' },
    { term: 'Enterprise SEO Brief Generator', intent: 'Transactional', volume: '5,400/mo', difficulty: 'High (68)', cluster: 'SEO Tools' },
    { term: 'Content Repurposing Automation', intent: 'Informational', volume: '12,100/mo', difficulty: 'Medium (38)', cluster: 'Workflow' }
  ];

  const handleGenerateBrief = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/seo/brief/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: seedKeyword, intent, targetAudience: 'Enterprise Leaders' })
      });
      const data = await res.json();
      if (data.success) {
        setBrief(data.brief);
      }
    } catch (e) {
      // Fallback mock brief
      setBrief({
        primaryKeyword: seedKeyword,
        searchIntent: intent,
        suggestedTitles: [
          `The Ultimate Guide to ${seedKeyword} in 2026: Strategy & Governance`,
          `How Enterprise Teams Master ${seedKeyword}: Actionable Playbook`
        ],
        metaTitle: `${seedKeyword} Playbook: 2026 Enterprise Guide`,
        metaDescription: `Master ${seedKeyword} with our comprehensive guide. Discover topic cluster mapping, JSON-LD schema, and brand governance frameworks.`,
        urlSlug: seedKeyword.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        targetWordCount: 2400,
        headingOutline: [
          { h2: `Introduction to ${seedKeyword}`, h3s: ["Market Shifts & Trends", "Why Brand DNA Memory Matters"] },
          { h2: `Core Architecture & Operations`, h3s: ["Briefing & Cluster Setup", "Quality Gates & Fact Checks"] }
        ],
        entityKeywords: [seedKeyword, "Brand DNA", "Content Velocity", "SEO Clusters", "Schema Markup"],
        jsonLdSchema: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": `The Ultimate Guide to ${seedKeyword} in 2026`,
          "keywords": [seedKeyword, "AI Content Ops"]
        }, null, 2)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-brand-400" />
            <h1 className="text-xl font-extrabold text-white">SEO Intelligence & Brief Builder Workspace</h1>
          </div>
          <p className="text-xs text-slate-400">
            Keyword intent classification, topic clustering, and structured 8-step SEO brief generation for <strong className="text-white">{activeWorkspace.brandName}</strong>.
          </p>
        </div>
      </div>

      {/* Mandatory Disclaimer Alert */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
        <p>
          <strong>Mandatory Product Disclaimer:</strong> AI Ads™ strictly refrains from guaranteeing search engine rankings, indexing speed, organic traffic volumes, or backlinks. Controls focus on factual accuracy and structured schema readiness.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Keyword Workspace */}
        <div className="p-6 rounded-3xl accent-card glass-card border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            Keyword & Intent Workspace
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Seed Keyword</label>
            <input
              type="text"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              className="w-full glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Search Intent</label>
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="w-full glass-input text-xs"
            >
              <option value="Informational">Informational (Know)</option>
              <option value="Commercial">Commercial (Investigate)</option>
              <option value="Transactional">Transactional (Buy / Convert)</option>
              <option value="Navigational">Navigational (Find)</option>
              <option value="Local">Local Intent</option>
            </select>
          </div>

          <button
            onClick={handleGenerateBrief}
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl font-bold text-xs"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Synthesizing Brief & Outline...' : 'Generate Structured SEO Brief'}
          </button>

          {/* Clustered Keywords List */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-400 block mb-2">Clustered Target Keywords:</span>
            <div className="space-y-2">
              {keywordsList.map((kw, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{kw.term}</span>
                    <span className="text-[10px] text-slate-400">{kw.cluster} • Vol: {kw.volume}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    {kw.intent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2 & 3: Generated Structured Brief */}
        <div className="lg:col-span-2 p-6 rounded-3xl accent-card glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Structured 8-Step SEO Brief Output
            </h2>
            {brief && (
              <button
                onClick={() => setActiveModule('studio')}
                className="btn-primary text-xs py-1.5 px-3"
              >
                <Send className="w-3.5 h-3.5" />
                Send Brief to Editorial Studio
              </button>
            )}
          </div>

          {brief ? (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Keyword</span>
                  <span className="font-extrabold text-brand-300 text-sm">{brief.primaryKeyword}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Word Count</span>
                  <span className="font-extrabold text-cyan-300 text-sm">{brief.targetWordCount} Words</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">Proposed Title Tag:</span>
                <p className="text-white font-semibold text-xs">{brief.suggestedTitles[0]}</p>
                <span className="text-slate-400 font-bold block pt-1">Meta Description & Slug:</span>
                <p className="text-slate-300">{brief.metaDescription}</p>
                <code className="text-brand-400 text-[11px] block">Slug: /{brief.urlSlug}</code>
              </div>

              {/* H2/H3 Outline Tree */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-slate-300 font-bold block">H2/H3 Editorial Outline Tree:</span>
                {brief.headingOutline.map((section, i) => (
                  <div key={i} className="pl-2 border-l-2 border-brand-500/50 space-y-1">
                    <span className="font-bold text-white text-xs">H2: {section.h2}</span>
                    <ul className="pl-4 text-[11px] text-slate-400 list-disc">
                      {section.h3s.map((h3, j) => <li key={j}>H3: {h3}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              {/* JSON-LD Schema */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-brand-400" /> JSON-LD Schema Markup Ready
                </span>
                <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto p-2 bg-slate-900/60 rounded-xl">
                  {brief.jsonLdSchema}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-600 animate-bounce" />
              <p className="text-xs">Click "Generate Structured SEO Brief" to synthesize search intent, titles, H2/H3 outline tree, and JSON-LD schema.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
