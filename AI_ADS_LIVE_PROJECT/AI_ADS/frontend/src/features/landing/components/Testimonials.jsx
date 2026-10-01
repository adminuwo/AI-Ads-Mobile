import React from 'react';
import { MessageSquareQuote, ShieldAlert } from 'lucide-react';

export const Testimonials = () => {
  const placeholders = [
    { id: 1, role: 'Digital Marketing Agency Lead' },
    { id: 2, role: 'E-commerce Growth Manager' },
    { id: 3, role: 'Brand Identity Director' }
  ];

  return (
    <section className="py-20 bg-slate-100/60 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-600 dark:text-slate-400 shadow-sm">
            <MessageSquareQuote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>CUSTOMER FEEDBACK PLACEHOLDERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white leading-tight">
            Early Agency Feedback
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Real customer feedback slots reserved for onboarding enterprise case studies.
          </p>
        </div>

        {/* 3 Explicitly Labeled Placeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {placeholders.map((card) => (
            <div 
              key={card.id}
              className="rounded-3xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-6 space-y-4 shadow-md relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30">
                    Placeholder Slot #{card.id}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                    {card.role}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-300">
                    [ Replace with a real testimonial ]
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    "This section is reserved for verified client reviews. AI ADS™ avoids fake names, invented customer counts, or artificial awards."
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 font-mono text-center">
                Verified Customer Feedback Placeholder
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
