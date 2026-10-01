import React from 'react';
import { ShieldCheck, Layers, Cpu, Globe, Zap } from 'lucide-react';

export const TrustStrip = () => {
  const brandPlaceholders = [
    { name: 'Apex Media', icon: Layers },
    { name: 'Velocity Digital', icon: Zap },
    { name: 'Nexus Brands', icon: Globe },
    { name: 'Aura Marketing', icon: Cpu },
    { name: 'Lumina Agency', icon: ShieldCheck }
  ];

  return (
    <section className="py-12 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-extrabold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-8">
          Built for marketing teams & agencies
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-center">
          {brandPlaceholders.map((brand, idx) => {
            const IconComp = brand.icon;
            return (
              <div 
                key={idx}
                className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-default group shadow-sm"
              >
                <IconComp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors" />
                <span className="text-sm font-extrabold font-['Outfit'] tracking-wide">
                  {brand.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
