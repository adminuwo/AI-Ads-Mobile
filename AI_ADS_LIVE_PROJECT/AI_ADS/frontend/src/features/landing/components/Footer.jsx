import React from 'react';
import { Sparkles, ShieldCheck, FileText } from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const Footer = () => {
  const { setActiveModule, setIsSettingsModalOpen, setActiveSettingsTab } = useWorkspace();

  const handleNavClick = (targetId) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-16 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo_icon_only.png?v=10" 
                alt="AI ADS™ Logo" 
                className="w-8 h-8 object-contain drop-shadow-sm" 
              />
              <span className="font-['Outfit'] font-black text-xl text-slate-900 dark:text-white tracking-tight">
                AI ADS<sup className="text-[10px] text-amber-500 dark:text-amber-400 font-bold ml-0.5">TM</sup>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Autonomous Content Intelligence & 8K Creative Studio (v3.5.0 Enterprise). Governed AI content creation and multi-channel publishing.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNavClick('features')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('how-it-works')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  How it Works
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('pricing')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  Pricing
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('faq')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Documentation & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a 
                  href="/AI_ADS_Platform_Documentation.pdf" 
                  download="AI_ADS_Platform_Documentation.pdf"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Documentation (PDF)</span>
                </a>
              </li>
              <li>
                <a 
                  href="/AI_ADS_Platform_Documentation.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Platform Docs (HTML)
                </a>
              </li>
              <li>
                <button onClick={() => setActiveModule('login')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  Dashboard Login
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => {
                    if (setActiveSettingsTab) setActiveSettingsTab('privacy');
                    if (setIsSettingsModalOpen) setIsSettingsModalOpen(true);
                  }}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (setActiveSettingsTab) setActiveSettingsTab('terms');
                    if (setIsSettingsModalOpen) setIsSettingsModalOpen(true);
                  }}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (setActiveSettingsTab) setActiveSettingsTab('help');
                    if (setIsSettingsModalOpen) setIsSettingsModalOpen(true);
                  }}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500">
            © 2026 AI ADS™ Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
            <span>All Systems Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
