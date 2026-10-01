import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Check, ShieldCheck, UserPlus, LogIn, Zap, X, Scale, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UWOLoginModal } from './UWOLoginModal';
import { API_BASE } from '../../config/api';
import { useWorkspace } from '../../context/WorkspaceContext';

export const Login = ({ onLoginSuccess }) => {
  const { setIsSettingsModalOpen, setActiveSettingsTab } = useWorkspace();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showUwoModal, setShowUwoModal] = useState(false);
  const [uwoRegisterMode, setUwoRegisterMode] = useState(false);

  // Terms & Privacy Policy First-Time Acceptance State
  const [acceptedTerms, setAcceptedTerms] = useState(() => {
    try {
      return localStorage.getItem('aisa_terms_accepted') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState('privacy'); // 'privacy' | 'terms'

  const handleUwoSuccess = (data) => {
    setSuccess(true);
    const uUser = data.user || {};
    const cleanEmail = (uUser.email || email).toLowerCase().trim();
    let userAvatar = uUser.avatar || '';
    if (!userAvatar && cleanEmail) {
      try {
        const savedAvatar = localStorage.getItem(`aisa_user_avatar_${cleanEmail}`);
        if (savedAvatar) userAvatar = savedAvatar;
      } catch (e) { }
    }
    const formattedUser = {
      id: uUser.id || uUser._id || `usr_${Date.now()}`,
      _id: uUser.id || uUser._id || `usr_${Date.now()}`,
      email: cleanEmail,
      name: uUser.name || cleanEmail.split('@')[0],
      role: uUser.role || (cleanEmail === 'admin@aiads.com' ? 'SuperAdmin' : 'AgencyAdmin'),
      avatar: userAvatar,
      accentColor: uUser.accentColor || 'indigo',
      appearance: uUser.appearance || 'light',
      credits: uUser.credits !== undefined ? uUser.credits : 500,
      plan: uUser.plan || 'free',
    };
    localStorage.setItem('aisa_token', data.token || data.access_token);
    localStorage.setItem('token', data.token || data.access_token);
    localStorage.setItem('aisa_user_email', cleanEmail);
    localStorage.setItem('aisa_user', JSON.stringify(formattedUser));

    setTimeout(() => {
      onLoginSuccess(formattedUser);
    }, 600);
  };

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // First-Time Terms & Privacy Policy Acceptance Validation
    if (!acceptedTerms && localStorage.getItem('aisa_terms_accepted') !== 'true') {
      setShowLegalModal(true);
      setError('Please read and accept the Privacy Policy & Terms of Service before proceeding.');
      return;
    }

    // Input Validation
    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (!confirmPassword) {
        setError('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please check and try again.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'register' 
        ? `${API_BASE}/auth/register` 
        : `${API_BASE}/auth/login`;

      const bodyPayload = mode === 'register'
        ? { email, password, confirmPassword }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        const cleanEmail = (data.user?.email || email).toLowerCase().trim();
        localStorage.setItem('aisa_token', data.token);
        localStorage.setItem('aisa_user_email', cleanEmail);
        
        setTimeout(() => {
          onLoginSuccess(data.user || { email: cleanEmail, role: 'AgencyAdmin' });
        }, 800);
      } else {
        setError(data.error || (mode === 'register' ? 'Registration failed.' : 'Login failed.'));
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to backend server. Please verify network connection or server status.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 py-12">

      {/* Soft Ambient Light Glow Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-gradient-to-tr from-brand-500/15 via-indigo-400/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-purple-400/15 via-pink-400/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[25%] right-[15%] w-[35%] h-[35%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />

      {/* Subtle Pattern Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-4">

        {/* Brand Header */}
        <div className="text-center mb-7 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <img 
              src="/logo_icon_only.png?v=10" 
              alt="AI Ads™ Logo" 
              className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 object-contain shrink-0 drop-shadow-xl transition-transform hover:scale-105" 
              onError={(e) => { e.target.onerror = null; e.target.src = '/logo_transparent.png?v=10'; }}
            />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center justify-center">
              <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 bg-clip-text text-transparent leading-none">
                AI Ads
              </span>
              <sup className="text-xs sm:text-sm font-extrabold text-amber-500 ml-1.5 font-sans -mt-3 select-none flex items-center gap-0.5">
                <span className="w-2 h-[1.5px] bg-amber-400/60 rounded-full inline-block"></span>
                TM
                <span className="w-2 h-[1.5px] bg-amber-400/60 rounded-full inline-block"></span>
              </sup>
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-2.5 font-medium">
            {mode === 'login' ? 'Sign in to your workspace' : 'Create your enterprise workspace account'}
          </p>
        </div>

        {/* Premium Light Card */}
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-slate-200/60">

          {/* Mode Segmented Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`relative flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all rounded-xl ${
                mode === 'login' ? 'text-brand-600 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode === 'login' && (
                <motion.div
                  layoutId="activeAuthTabLight"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`relative flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all rounded-xl ${
                mode === 'register' ? 'text-brand-600 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode === 'register' && (
                <motion.div
                  layoutId="activeAuthTabLight"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error Banner */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EMAIL FIELD */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@company.com"
                  className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl py-3.5 pl-10 pr-4 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* PASSWORD / CREATE PASSWORD FIELD */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  {mode === 'register' ? 'Create Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setUwoRegisterMode(false);
                      setShowUwoModal(true);
                    }}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl py-3.5 pl-10 pr-10 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD FIELD (ONLY IN CREATE ACCOUNT MODE) */}
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-1"
              >
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl py-3.5 pl-10 pr-10 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* TERMS & PRIVACY POLICY ACCEPTANCE CHECKBOX */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 my-2 shadow-2xs">
              <input
                type="checkbox"
                id="acceptTermsCheck"
                checked={acceptedTerms}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAcceptedTerms(checked);
                  if (checked) {
                    try { localStorage.setItem('aisa_terms_accepted', 'true'); } catch (err) {}
                    setError('');
                  }
                }}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
              />
              <label htmlFor="acceptTermsCheck" className="text-xs text-slate-700 leading-relaxed select-none">
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveLegalTab('privacy');
                    setShowLegalModal(true);
                  }}
                  className="font-extrabold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                >
                  Privacy Policy
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveLegalTab('terms');
                    setShowLegalModal(true);
                  }}
                  className="font-extrabold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                >
                  Terms of Service
                </button>
                .
              </label>
            </div>

            {/* SUBMIT CTA BUTTON */}
            <button
              type="submit"
              disabled={isLoading || success}
              className={`w-full py-3.5 mt-3 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                success
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'btn-primary shadow-lg shadow-brand-500/25 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{mode === 'register' ? 'Creating Account...' : 'Signing in...'}</span>
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{mode === 'register' ? 'Account Created!' : 'Welcome!'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'register' ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* UWO Single Sign-On Option */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200/80" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-slate-200/80" />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!acceptedTerms && localStorage.getItem('aisa_terms_accepted') !== 'true') {
                setShowLegalModal(true);
                setError('Please read and accept our Privacy Policy & Terms of Service to continue.');
                return;
              }
              setUwoRegisterMode(mode === 'register');
              setShowUwoModal(true);
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 border border-amber-400/50 rounded-2xl text-xs font-black uppercase tracking-wider text-amber-800 transition-all flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] cursor-pointer"
          >
            <div className="w-5 h-5 rounded-lg bg-amber-500 flex items-center justify-center shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            </div>
            <span>Sign In with UWO Platform (SSO)</span>
          </button>

          {/* Bottom Switch Link */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500 font-medium">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

          {/* Security Badge */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-800 font-bold">Enterprise Security Governed</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium flex items-center justify-center gap-2 flex-wrap">
          <span>© 2026 AI Ads™ (AISA)</span>
          <span>·</span>
          <button 
            type="button"
            onClick={() => {
              if (setActiveSettingsTab) setActiveSettingsTab('privacy');
              if (setIsSettingsModalOpen) setIsSettingsModalOpen(true);
            }} 
            className="hover:underline hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>·</span>
          <button 
            type="button"
            onClick={() => {
              if (setActiveSettingsTab) setActiveSettingsTab('terms');
              if (setIsSettingsModalOpen) setIsSettingsModalOpen(true);
            }} 
            className="hover:underline hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            Terms of Service
          </button>
        </p>
      </div>

      {/* Centralized UWO Unified Login Modal */}
      <UWOLoginModal
        isOpen={showUwoModal}
        onClose={() => setShowUwoModal(false)}
        initialRegister={uwoRegisterMode}
        appCode="ai_ads"
        apiKey="key_ai_ads_live_master_2026"
        onSuccess={handleUwoSuccess}
      />

      {/* Interactive First-Time Legal Terms Consent Modal */}
      <AnimatePresence>
        {showLegalModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-full border border-brand-500/20">
                      First-Time User Consent
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
                      AI Ads™ Platform Policies & Agreements
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLegalModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Switcher: Privacy Policy vs Terms of Service */}
              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveLegalTab('privacy')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeLegalTab === 'privacy'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30 font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLegalTab('terms')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeLegalTab === 'terms'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs border border-brand-500/30 font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>Terms of Service</span>
                </button>
              </div>

              {/* Scrollable Content Reader Area */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-[50vh]">
                {activeLegalTab === 'privacy' ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-medium">
                      <p className="font-extrabold text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-1">
                        🔒 Customer Privacy & Data Protection Policy
                      </p>
                      <p className="text-[11.5px]">
                        Your Brand DNA parameters, campaign content, and prompts are strictly protected. We do not sell your workspace data or use your proprietary content to train public AI models.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Summary of Key Privacy Rights:</h4>
                      <ul className="list-disc pl-5 space-y-1.5 text-[11.5px] text-slate-600 dark:text-slate-300">
                        <li><strong>1. Information Collection:</strong> We store account credentials, Brand DNA guidelines, uploaded media, and platform telemetry needed to run your workspace.</li>
                        <li><strong>2. How Data is Used:</strong> Data powers AI ad generation, strategy creation, transactional emails, and system stability.</li>
                        <li><strong>3. 100% Proprietary Ownership:</strong> You retain complete ownership of your uploaded assets and AI-generated campaign outputs.</li>
                        <li><strong>4. Third-Party Infrastructure:</strong> Cloud hosting, payment processing (Razorpay), and AI models process data securely under strict confidentiality.</li>
                        <li><strong>5. Data Security:</strong> Protected using standard industry encryption during network transit and database storage.</li>
                        <li><strong>6. Permanent Account Deletion:</strong> You can purge your account and workspace data permanently at any time via 6-digit email OTP verification.</li>
                      </ul>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                        Privacy Contact: <a href="mailto:admin@uwo24.com" className="text-brand-600 underline font-bold">admin@uwo24.com</a> · Phone: <a href="tel:+918358990909" className="text-brand-600 underline font-bold">+91 83589 90909</a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-900 dark:text-brand-200 font-medium">
                      <p className="font-extrabold text-xs uppercase tracking-wide text-brand-700 dark:text-brand-400 mb-1">
                        ⚖️ Commercial Ownership & Usage Terms
                      </p>
                      <p className="text-[11.5px]">
                        AI Ads™ provides an enterprise marketing generation platform. All website code, ad graphics, and copy synthesized in your workspace belong exclusively to your organization.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Summary of Key Terms:</h4>
                      <ul className="list-disc pl-5 space-y-1.5 text-[11.5px] text-slate-600 dark:text-slate-300">
                        <li><strong>1. License Agreement:</strong> Platform access is licensed according to your selected plan (Starter, Pro, Agency, Enterprise).</li>
                        <li><strong>2. Account Security:</strong> You are responsible for maintaining secure password credentials for your workspace.</li>
                        <li><strong>3. Commercial IP Ownership:</strong> AI Ads™ makes zero claim of ownership over your Brand DNA inputs or generated campaign outputs.</li>
                        <li><strong>4. Acceptable Use:</strong> Users agree not to synthesize illegal, fraudulent, harmful, or deceptive content.</li>
                        <li><strong>5. Subscriptions & Credits:</strong> AI generation consumes visual credits based on your active subscription balance.</li>
                        <li><strong>6. Self-Service Deletion:</strong> You can cancel subscriptions or initiate permanent account deletion at any time.</li>
                      </ul>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                        Legal Support: <a href="mailto:admin@uwo24.com" className="text-brand-600 underline font-bold">admin@uwo24.com</a> · Phone: <a href="tel:+918358990909" className="text-brand-600 underline font-bold">+91 83589 90909</a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  By clicking accept below, you confirm that you have read and agree to both policies.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAcceptedTerms(true);
                    try { localStorage.setItem('aisa_terms_accepted', 'true'); } catch (e) {}
                    setShowLegalModal(false);
                    setError('');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>I Have Read & Accept Policies</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
