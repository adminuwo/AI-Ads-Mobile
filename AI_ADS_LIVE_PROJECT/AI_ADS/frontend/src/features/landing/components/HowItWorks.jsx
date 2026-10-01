import React from 'react';
import { Globe, Layers, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const HowItWorks = () => {
  const { setActiveModule } = useWorkspace();

  const steps = [
    {
      num: '01',
      title: 'Paste your website URL',
      desc: 'Brand DNA captures your logo, colors, positioning and verified claims.',
      detail: 'Locks guidelines into immutable single-source AI memory.',
      icon: Globe,
      color: 'from-indigo-500 to-violet-600'
    },
    {
      num: '02',
      title: 'Get your 30-day strategy',
      desc: '30 non-repeating daily post directives.',
      detail: 'Tailored specifically across Instagram, LinkedIn, X, and Facebook.',
      icon: Layers,
      color: 'from-purple-500 to-pink-600'
    },
    {
      num: '03',
      title: 'Generate creatives and content',
      desc: '8K visuals, carousels, threads and ad copy.',
      detail: 'Powered by 2-Agent Vision AI and automated logo watermarking.',
      icon: Sparkles,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      num: '04',
      title: 'Approve, schedule and publish',
      desc: 'across every channel from one calendar.',
      detail: 'Human-in-the-loop review desk and smart peak-hour publisher.',
      icon: Calendar,
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/60 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 text-xs font-extrabold text-indigo-800 dark:text-indigo-300 shadow-sm">
            <span>AUTOMATED CONTENT WORKFLOW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white leading-tight">
            From Website URL to Omnichannel Campaign in 4 Simple Steps
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            An end-to-end governed pipeline that turns brand identity into high-performing social campaigns.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div 
                key={idx}
                className="relative rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-6 flex flex-col justify-between space-y-6 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all duration-300 group shadow-md"
              >
                <div className="space-y-4">
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {step.num}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${step.color} p-0.5 shadow-md`}>
                      <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                        <IconComp className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Step Text */}
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed pt-1">
                    {step.detail}
                  </p>
                </div>

                {/* Connecting Arrow for Desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-700">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="text-center pt-4">
          <button
            onClick={() => setActiveModule('login')}
            className="inline-flex items-center gap-2 text-sm font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <span>See how Brand DNA scraping works in action</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
