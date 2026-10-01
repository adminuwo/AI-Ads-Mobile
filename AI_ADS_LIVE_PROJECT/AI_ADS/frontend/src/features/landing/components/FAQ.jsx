import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const FAQ = () => {
  const { setActiveModule } = useWorkspace();
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: 'How do credits work?',
      a: 'Credits are consumed when running AI operations like photorealistic 8K ad visual generation and strategy synthesis. Unused credits roll over automatically to your next billing cycle.'
      // TODO: confirm exact credit deduction rate per sub-module engine in backend config
    },
    {
      q: 'What is Brand DNA and how is it captured?',
      a: 'Brand DNA is single-source AI memory. Simply paste your website URL; our automated scraper ingests logos, primary/secondary hex color palettes, positioning statements, and verified claims.'
    },
    {
      q: 'Can clients approve content before it is published?',
      a: 'Yes. The built-in Approvals Desk governance queue lets agencies invite clients (using the Client Viewer role) to review, comment on, and approve posts before publishing.'
    },
    {
      q: 'Which social platforms are supported?',
      a: 'AI ADS™ supports post generation, carousels, slide decks, and scheduling across Instagram, LinkedIn, X (Twitter), Facebook, and long-form blog articles.'
      // TODO: confirm direct OAuth auto-publishing API endpoints for Facebook vs LinkedIn
    },
    {
      q: 'Is my data isolated between clients?',
      a: 'Yes. AI ADS™ utilizes multi-tenant workspace architecture with cryptographically isolated brand memories, asset buckets, and RBAC permissions to guarantee zero cross-client data leak.'
    },
    {
      q: 'Can I upgrade, downgrade or cancel anytime?',
      a: 'Absolutely. You can manage your subscription, switch billing cycles (monthly vs. yearly), upgrade plans, or cancel anytime directly from your Settings & Billing panel.'
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIdx(openIdx === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/60 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-cyan-600 dark:text-cyan-400 shadow-sm">
            <HelpCircle className="w-4 h-4" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white leading-tight">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Clear, honest answers about our platform, credit models, data governance, and pricing.
          </p>
        </div>

        {/* Keyboard-Friendly Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const contentId = `faq-content-${idx}`;
            const headerId = `faq-header-${idx}`;

            return (
              <div 
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
              >
                <button
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`} />
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="px-5 pb-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800/60 pt-4 animate-in fade-in duration-200"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Contact CTA */}
        <div className="text-center pt-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Have a question not answered here?{' '}
            <button
              onClick={() => setActiveModule('login')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
            >
              Contact our platform support
            </button>
          </p>
        </div>

      </div>
    </section>
  );
};
