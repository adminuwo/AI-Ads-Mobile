import React from 'react';
import { ShieldCheck, Cpu, Image as ImageIcon, Stamp, CheckCircle2, Share2, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const PipelineSpotlight = () => {
  const { setActiveModule } = useWorkspace();

  const flowNodes = [
    { name: 'Brand DNA', desc: 'Locked Memory', icon: ShieldCheck, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' },
    { name: 'Prompt Crafting Agent', desc: 'Agent 1 (Vision AI)', icon: Cpu, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
    { name: 'Image Generation Agent', desc: 'Agent 2 (8K Render)', icon: ImageIcon, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
    { name: 'Auto Logo Watermark', desc: 'Brand Overlay', icon: Stamp, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
    { name: 'Approval', desc: 'Human Gate', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
    { name: 'Publish', desc: 'Omnichannel', icon: Share2, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' }
  ];

  return (
    <section className="py-20 bg-slate-100/60 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100/80 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/30 text-xs font-extrabold text-cyan-800 dark:text-cyan-300 shadow-sm">
            <span>SPOTLIGHT: 2-AGENT VISION ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white leading-tight">
            Two AI agents. One on-brand creative.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Our 2-Agent Vision Architecture pairs product reference photos with autonomous prompt synthesis and 8K commercial rendering.
          </p>
        </div>

        {/* Visual Flow Diagram */}
        <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Pipeline Flow Diagram</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
              100% Governed Execution
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
            {flowNodes.map((node, idx) => {
              const IconComp = node.icon;
              return (
                <React.Fragment key={idx}>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-center flex flex-col items-center justify-center hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${node.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">{node.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{node.desc}</p>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Detailed Agent Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-purple-400 uppercase">Agent 1: Prompt Crafting Agent</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Analyzes reference product photo form factors, lighting, positioning, and campaign goals to synthesize advertising photography prompts.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-cyan-400 uppercase">Agent 2: Image Generation Agent</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Executes photorealistic 8K rendering with automatic brand logo overlays and secure GCS signed-URL asset exports.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
