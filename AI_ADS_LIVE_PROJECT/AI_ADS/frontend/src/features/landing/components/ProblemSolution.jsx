import React from 'react';
import { XCircle, CheckCircle2, ShieldCheck, Zap, Layers } from 'lucide-react';

export const ProblemSolution = () => {
  const painSolutionPairs = [
    {
      num: '01',
      painTitle: 'Inconsistent brand voice',
      painDesc: 'Freelancers, copywriters, and standard generative AI tools lose brand context, creating off-brand visuals and tone drift.',
      solutionTitle: 'Brand DNA Memory keeps every post on-brand',
      solutionDesc: 'Auto-scrapes website URLs to ingest brand logos, hex color palettes, positioning, and verified claims into immutable AI memory.',
      icon: ShieldCheck,
      color: 'indigo'
    },
    {
      num: '02',
      painTitle: 'Slow content production',
      painDesc: 'Planning 30 days of posts across multiple social channels takes weeks of manual brief creation and designer wait times.',
      solutionTitle: '30-day strategy, 8K visuals and multi-format content from one workspace',
      solutionDesc: 'Generates non-repeating daily directives, photorealistic 8K ad visuals, carousels, threads, and landing pages in minutes.',
      icon: Zap,
      color: 'purple'
    },
    {
      num: '03',
      painTitle: 'Scattered tools and messy approvals',
      painDesc: 'Managing content across split spreadsheets, cloud folders, chat apps, and client email chains causes missed deadlines and publishing errors.',
      solutionTitle: 'One platform with a built-in approvals desk and team roles',
      solutionDesc: 'Human-in-the-loop review queue for agencies and clients with brand claim verification checks and 4 RBAC role permissions.',
      icon: Layers,
      color: 'cyan'
    }
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 shadow-sm">
            <span>THE CONTENT SCALING DILEMMA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white leading-tight">
            Stop Compromising Between Content Volume and Brand Quality
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Scaling social media output shouldn't mean diluting your brand identity or drowning in fragmented tools.
          </p>
        </div>

        {/* 3 Pain vs Fix Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {painSolutionPairs.map((pair, idx) => {
            const IconComp = pair.icon;
            return (
              <div 
                key={idx}
                className="rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-300 shadow-xl"
              >
                <div className="space-y-6">
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black font-mono text-slate-300 dark:text-slate-600">
                      {pair.num}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <IconComp className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Pain Block */}
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-xs">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>THE OLD WAY</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {pair.painTitle}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pair.painDesc}
                    </p>
                  </div>

                  {/* Solution Block */}
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>WITH AI ADS™</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {pair.solutionTitle}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {pair.solutionDesc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
