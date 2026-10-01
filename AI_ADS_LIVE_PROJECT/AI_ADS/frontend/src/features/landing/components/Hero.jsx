import React, { useState } from 'react';
import { Sparkles, ArrowRight, Play, CheckCircle2, ShieldCheck, Calendar, Layers, Image as ImageIcon, Sparkle, Bot } from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const Hero = () => {
  const { setActiveModule } = useWorkspace();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleStartTrial = () => {
    setActiveModule('login');
  };

  return (
    <section className="relative overflow-hidden bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-20 right-1/4 w-[450px] h-[450px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[350px] h-[350px] bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-300 text-xs font-extrabold shadow-md dark:shadow-indigo-500/10">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span>v3.5.0 ENTERPRISE · AUTONOMOUS BRAND DNA & 8K STUDIO</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] font-['Outfit'] text-slate-900 dark:text-white">
              Create On-Brand Ads & Content Faster —{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Without Losing Your Brand Voice
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              AI ADS™ learns your Brand DNA, plans your 30-day strategy, renders photorealistic 8K ad creatives, and publishes across every channel — with human approval built in.
            </p>

            {/* CTA Buttons & Micro-copy */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={handleStartTrial}
                  className="w-full sm:w-auto btn-primary px-8 py-4 rounded-xl text-base font-extrabold flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-indigo-600 dark:text-cyan-400 fill-indigo-600 dark:fill-cyan-400" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Micro-copy line under CTAs */}
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center lg:justify-start gap-2 pt-1">
                <span>Plans from ₹799/mo</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span>Credits roll over</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span>No brand drift</span>
              </p>
            </div>
          </div>

          {/* Right Hero Column: CSS-Built Dashboard Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-purple-500/20 to-cyan-500/30 shadow-2xl shadow-indigo-500/10">
              <div className="rounded-[22px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 space-y-4 text-slate-900 dark:text-white">
                
                {/* Mockup Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-mono text-slate-500 dark:text-slate-400">app.aiads.com/studio</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                    AI Memory Locked
                  </span>
                </div>

                {/* Content Calendar Grid Mockup */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <Calendar className="w-4 h-4" />
                      <span>30-Day Campaign Strategy</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Day 14 of 30</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase">INSTAGRAM</span>
                      <p className="text-[10px] font-bold text-slate-800 dark:text-white line-clamp-1">Product Showcase</p>
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[90%]" />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 uppercase">LINKEDIN</span>
                      <p className="text-[10px] font-bold text-slate-800 dark:text-white line-clamp-1">Strategy Deck</p>
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[100%]" />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[9px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase">X / TWITTER</span>
                      <p className="text-[10px] font-bold text-slate-800 dark:text-white line-clamp-1">Feature Thread</p>
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 w-[75%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ad Preview Card Mockup */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-100 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">8K Photorealistic Ad Render</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[9px] font-mono border border-indigo-200 dark:border-indigo-500/30">
                      2-Agent Vision
                    </span>
                  </div>

                  {/* Simulated Ad Render Graphic */}
                  <div className="h-32 rounded-xl bg-gradient-to-tr from-indigo-900/90 via-purple-900/80 to-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25)_0%,transparent_70%)]" />
                    <div className="relative text-center space-y-1 p-3">
                      <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg">
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                          <Bot className="w-5 h-5 text-indigo-300" />
                        </div>
                      </div>
                      <p className="text-[11px] font-black text-white tracking-wide">Brand DNA Verified Ad Visual</p>
                      <span className="text-[9px] font-mono text-cyan-300">Logo Watermark Auto-Applied</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Status: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Ready for Approval</strong></span>
                    <button 
                      onClick={handleStartTrial}
                      className="btn-primary px-3 py-1 rounded-lg font-bold text-[10px] cursor-pointer"
                    >
                      Approve & Schedule →
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Optional Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">AI ADS™ Overview Demo</h3>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center border border-slate-800 text-center p-6 space-y-3">
              <Play className="w-12 h-12 text-indigo-400 fill-indigo-400 animate-bounce" />
              <p className="text-sm font-bold text-white">AI ADS™ Platform Interactive Walkthrough</p>
              <p className="text-xs text-slate-400 max-w-md">Learn how Brand DNA memory, 30-day strategy roadmaps, and 8K visual ad renders automate content production.</p>
              <button
                onClick={() => { setIsVideoModalOpen(false); handleStartTrial(); }}
                className="mt-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Start Free Trial Now
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
