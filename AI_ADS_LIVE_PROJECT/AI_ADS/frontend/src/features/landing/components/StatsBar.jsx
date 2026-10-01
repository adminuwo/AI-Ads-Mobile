import React from 'react';
import { Calendar, Image as ImageIcon, Users, Layers } from 'lucide-react';

export const StatsBar = () => {
  const stats = [
    {
      fact: '30 Days',
      label: 'of strategy in one click',
      icon: Calendar,
      color: 'text-indigo-400'
    },
    {
      fact: '8K',
      label: 'ad visual rendering',
      icon: ImageIcon,
      color: 'text-purple-400'
    },
    {
      fact: '4 Roles',
      label: 'granular team RBAC permissions',
      icon: Users,
      color: 'text-cyan-400'
    },
    {
      fact: '12 Modules',
      label: 'integrated in one governed platform',
      icon: Layers,
      color: 'text-emerald-400'
    }
  ];

  return (
    <section className="py-16 bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 text-center space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-md"
              >
                <IconComp className={`w-6 h-6 mx-auto ${stat.color}`} />
                <p className="text-3xl sm:text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white">
                  {stat.fact}
                </p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
