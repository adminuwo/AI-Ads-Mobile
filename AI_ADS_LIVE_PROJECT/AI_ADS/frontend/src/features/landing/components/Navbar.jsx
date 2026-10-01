import React, { useState } from 'react';
import { Sparkles, Menu, X, ArrowRight, Shield, Sun, Moon } from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const Navbar = () => {
  const { setActiveModule, user, theme, toggleTheme } = useWorkspace();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (targetId) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthClick = (targetModule = 'login') => {
    setIsMobileMenuOpen(false);
    if (user && targetModule === 'login') {
      setActiveModule('dashboard');
    } else {
      setActiveModule(targetModule);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img 
            src="/logo_icon_only.png?v=10" 
            alt="AI ADS™ Logo" 
            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform drop-shadow-sm" 
          />
          <div className="flex items-center font-black text-2xl tracking-tight leading-none text-slate-900 dark:text-white">
            <span className="font-['Outfit'] bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-600 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent">
              AI ADS
            </span>
            <sup className="text-xs font-bold text-amber-500 dark:text-amber-400 ml-1 select-none">TM</sup>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <button 
            onClick={() => handleNavClick('features')} 
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <button 
            onClick={() => handleNavClick('how-it-works')} 
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            How it Works
          </button>
          <button 
            onClick={() => handleNavClick('pricing')} 
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button 
            onClick={() => handleNavClick('faq')} 
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark / Light Mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleAuthClick('login')}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
          >
            Log in
          </button>
          <button
            onClick={() => handleAuthClick('login')}
            className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => handleNavClick('features')}
            className="block w-full text-left py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="block w-full text-left py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white"
          >
            How it Works
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className="block w-full text-left py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white"
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="block w-full text-left py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white"
          >
            FAQ
          </button>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <button
              onClick={toggleTheme}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center gap-2 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleAuthClick('login')}
              className="w-full py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-center cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={() => handleAuthClick('login')}
              className="w-full py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
