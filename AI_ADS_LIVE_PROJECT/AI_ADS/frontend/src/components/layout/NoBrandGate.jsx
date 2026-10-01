import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Globe, Link2, FileText, Zap, ArrowRight, Dna } from 'lucide-react';

/**
 * NoBrandGate
 * Wraps any brand-dependent module. If no real brand/workspace is loaded
 * (activeWorkspace falls back to the dummy "ws_empty"), it shows a premium
 * onboarding prompt instead of the module's content.
 */
export const NoBrandGate = ({ children, moduleName = 'this feature' }) => {
  const { activeWorkspace, workspaces, openScraperModal, setActiveModule, t } = useWorkspace();

  const noBrand =
    !activeWorkspace ||
    activeWorkspace.id === 'ws_empty' ||
    workspaces.length === 0;

  if (!noBrand) return children;

  const goToBrands = () => {
    setActiveModule('brands');
    setTimeout(() => openScraperModal('NEW_BRAND'), 180);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Glowing Icon */}
      <div className="relative mb-8">
        <div
          style={{ background: 'radial-gradient(circle, var(--brand-glow, rgba(99,102,241,0.35)) 0%, transparent 70%)' }}
          className="absolute inset-0 scale-150 rounded-full animate-pulse"
        />
        <div
          className="relative flex items-center justify-center w-24 h-24 rounded-3xl shadow-xl"
          style={{ background: 'linear-gradient(135deg, var(--brand-from, #6B5AED), var(--brand-to, #7B61FF))' }}
        >
          <Dna className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 text-center">
        {t('noBrandLoaded', 'No Brand Loaded')}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-10 text-base leading-relaxed">
        {t('toAccess', 'To access')}{' '}
        <span className="text-brand-600 dark:text-brand-400 font-semibold">{moduleName}</span>,{' '}
        {t('pleaseLoadOrCreateBrandFirst', 'please load or create a brand first. Choose an option below to get started.')}
      </p>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
        {/* Enter URL */}
        <button
          onClick={goToBrands}
          className="group flex flex-col gap-3 p-6 rounded-2xl border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800/60 hover:border-brand-500/50 dark:hover:border-brand-500/50
                     hover:bg-brand-500/5 dark:hover:bg-brand-500/10 transition-all duration-200 text-left cursor-pointer shadow-sm hover:shadow-lg"
        >
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500/10
                           text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
            <Globe className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{t('enterBrandUrl', 'Enter Brand URL')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {t('aiScrapesWebsite', 'AI scrapes your website and builds Brand DNA automatically.')}
            </p>
          </div>
        </button>

        {/* Activate Brand */}
        <button
          onClick={() => setActiveModule('brands')}
          className="group flex flex-col gap-3 p-6 rounded-2xl border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800/60 hover:border-brand-500/50 dark:hover:border-brand-500/50
                     hover:bg-brand-500/5 dark:hover:bg-brand-500/10 transition-all duration-200 text-left cursor-pointer shadow-sm hover:shadow-lg"
        >
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500/10
                           text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
            <Link2 className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{t('activateYourBrand', 'Activate Your Brand')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {t('selectAndActivateExistingBrand', 'Select and activate an existing brand from your workspace list.')}
            </p>
          </div>
        </button>

        {/* Upload PDF */}
        <button
          onClick={goToBrands}
          className="group flex flex-col gap-3 p-6 rounded-2xl border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800/60 hover:border-brand-500/50 dark:hover:border-brand-500/50
                     hover:bg-brand-500/5 dark:hover:bg-brand-500/10 transition-all duration-200 text-left cursor-pointer shadow-sm hover:shadow-lg"
        >
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500/10
                           text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{t('uploadBrandPdf', 'Upload Brand PDF')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {t('uploadBrandGuideOrDeck', 'Upload a brand guide or deck — AI extracts your identity.')}
            </p>
          </div>
        </button>
      </div>

      {/* Primary CTA */}
      <button
        onClick={goToBrands}
        className="btn-primary flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
      >
        <Zap className="w-4 h-4" />
        {t('createYourBrandDnaNow', 'Create Your Brand DNA Now')}
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="mt-5 text-xs text-slate-400 dark:text-slate-600">
        {t('takesLessThan60Seconds', 'Takes less than 60 seconds · Powered by AI ADS™ Intelligence Engine')}
      </p>
    </div>
  );
};
