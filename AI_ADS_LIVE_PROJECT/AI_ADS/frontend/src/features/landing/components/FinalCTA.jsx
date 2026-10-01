import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const FinalCTA = () => {
  const { setActiveModule } = useWorkspace();

  const handleStartTrial = () => {
    setActiveModule('login');
  };

  return (
    <section className="py-20 bg-gradient-to-b from-indigo-50/80 via-slate-50 to-indigo-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/60 relative overflow-hidden transition-colors duration-300">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/90 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-xs font-extrabold text-indigo-800 dark:text-indigo-300 shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>READY TO SCALE CONTENT VELOCITY?</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white leading-tight">
          Stop juggling tools. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Start shipping on-brand content.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Join forward-thinking marketing teams and growth agencies using AI ADS™ to eliminate brand voice drift and scale campaign velocity.
        </p>

        <div className="pt-2">
          <button
            onClick={handleStartTrial}
            className="btn-primary px-9 py-4 rounded-xl text-base font-extrabold inline-flex items-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
