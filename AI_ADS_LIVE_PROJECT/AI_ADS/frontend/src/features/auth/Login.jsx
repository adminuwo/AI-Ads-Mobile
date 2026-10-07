import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Check, ShieldCheck, UserPlus, LogIn, Zap, X, Scale, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLoginSafeButton } from './GoogleLoginSafeButton';
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
  
  // Forgot Password State
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // 2FA OTP State
  const [loginOtpMode, setLoginOtpMode] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [registerOtpMode, setRegisterOtpMode] = useState(false);
  const [registerOtp, setRegisterOtp] = useState('');

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
    try {
      localStorage.setItem('aisa_token', data.token || data.access_token);
      localStorage.setItem('token', data.token || data.access_token);
      localStorage.setItem('aisa_user_email', cleanEmail);
      const userToStore = { ...formattedUser };
      delete userToStore.avatar;
      localStorage.setItem('aisa_user', JSON.stringify(userToStore));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
        localStorage.clear();
        localStorage.setItem('aisa_token', data.token || data.access_token);
        localStorage.setItem('token', data.token || data.access_token);
        localStorage.setItem('aisa_user_email', cleanEmail);
        const userToStore = { ...formattedUser };
        delete userToStore.avatar;
        localStorage.setItem('aisa_user', JSON.stringify(userToStore));
      } else {
        throw e;
      }
    }

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
    setForgotOtpSent(false);
    setResetOtp('');
    setNewPassword('');
    setLoginOtpMode(false);
    setLoginOtp('');
    setRegisterOtpMode(false);
    setRegisterOtp('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // First-Time Terms & Privacy Policy Acceptance Validation
    if (mode !== 'forgot' && !acceptedTerms && localStorage.getItem('aisa_terms_accepted') !== 'true') {
      setShowLegalModal(true);
      setError('Please read and accept the Privacy Policy & Terms of Service before proceeding.');
      return;
    }

    // Input Validation
    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (mode !== 'forgot' && !password) {
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

    if (mode === 'forgot') {
      if (!forgotOtpSent) {
        setIsLoading(true);
        try {
          const res = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (data.success) {
            setForgotOtpSent(true);
            setError('');
          } else {
            setError(data.error || 'Failed to send OTP.');
          }
        } catch (err) {
          setError('Network error. Please try again.');
        } finally {
          setIsLoading(false);
        }
        return;
      } else {
        if (!resetOtp || !newPassword) {
          setError('Please enter the OTP and a new password.');
          return;
        }
        setIsLoading(true);
        try {
          const res = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: resetOtp, newPassword })
          });
          const data = await res.json();
          if (data.success) {
            setSuccess(true);
            setError('');
            // Switch back to login after 2 seconds
            setTimeout(() => {
              handleTabChange('login');
              setPassword(newPassword);
            }, 2000);
          } else {
            setError(data.error || 'Failed to reset password.');
          }
        } catch (err) {
          setError('Network error. Please try again.');
        } finally {
          setIsLoading(false);
        }
        return;
      }
    }

    // --- LOGIN VERIFICATION OTP SUBMISSION ---
    if (mode === 'login' && loginOtpMode) {
      if (!loginOtp) {
        setError('Please enter the verification code.');
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/login-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: loginOtp })
        });
        const data = await res.json();
        if (data.success) {
          setSuccess(true);
          const cleanEmail = (data.user?.email || email).toLowerCase().trim();
          try {
            localStorage.setItem('aisa_token', data.token);
            localStorage.setItem('aisa_user_email', cleanEmail);
          } catch (e) {
            localStorage.clear();
            localStorage.setItem('aisa_token', data.token);
            localStorage.setItem('aisa_user_email', cleanEmail);
          }
          setTimeout(() => onLoginSuccess(data.user || { email: cleanEmail, role: 'AgencyAdmin' }), 800);
        } else {
          setError(data.error || 'Login verification failed.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // --- REGISTER VERIFICATION OTP SUBMISSION ---
    if (mode === 'register' && registerOtpMode) {
      if (!registerOtp) {
        setError('Please enter the verification code.');
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/register-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: registerOtp })
        });
        const data = await res.json();
        if (data.success) {
          setSuccess(true);
          const cleanEmail = (data.user?.email || email).toLowerCase().trim();
          try {
            localStorage.setItem('aisa_token', data.token);
            localStorage.setItem('aisa_user_email', cleanEmail);
          } catch (e) {
            localStorage.clear();
            localStorage.setItem('aisa_token', data.token);
            localStorage.setItem('aisa_user_email', cleanEmail);
          }
          setTimeout(() => onLoginSuccess(data.user || { email: cleanEmail, role: 'AgencyAdmin' }), 800);
        } else {
          setError(data.error || 'Registration verification failed.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
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
        if (data.requiresOtp) {
          if (mode === 'register') {
            setRegisterOtpMode(true);
          } else {
            setLoginOtpMode(true);
          }
          setSuccess(true);
          setError('');
          setTimeout(() => setSuccess(false), 2000);
        } else {
          // Fallback if no OTP required
          setSuccess(true);
          const cleanEmail = (data.user?.email || email).toLowerCase().trim();
          try {
            localStorage.setItem('aisa_token', data.token);
            localStorage.setItem('aisa_user_email', cleanEmail);
          } catch (e) {
            localStorage.clear();
            localStorage.setItem('aisa_token', data.token);
            localStorage.setItem('aisa_user_email', cleanEmail);
          }
          setTimeout(() => onLoginSuccess(data.user || { email: cleanEmail, role: 'AgencyAdmin' }), 800);
        }
      } else {
        setError(data.error || (mode === 'register' ? 'Registration failed.' : 'Login failed.'));
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to backend server. Please verify network connection or server status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: tokenResponse.access_token || tokenResponse.id_token }),
      });
      const data = await res.json();
      if (data.success) {
        handleUwoSuccess(data); // Reuse the same success logic as UWO
      } else {
        setError(data.error || 'Google Login failed.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Google Login Error:', err);
      setError(`Error connecting to backend for Google Login: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleGoogleError = (errorResponse) => {
    setError('Google Login was unsuccessful.');
    console.error(errorResponse);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      {/* Left Half - Branding / Illustration (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white via-[#f0f4ff] to-[#fff0f5]">
        {/* Soft Ambient Light Glow Mesh */}
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-gradient-to-tr from-brand-500/15 via-indigo-400/15 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-purple-400/15 via-pink-400/15 to-transparent blur-[140px] pointer-events-none" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-72 h-72 flex items-center justify-center mb-6">
            {/* We use some concentric circles as decoration */}
            <div className="absolute inset-0 rounded-full border-[3px] border-amber-400/30 border-r-transparent animate-[spin_8s_linear_infinite]"></div>
            <div className="absolute inset-4 rounded-full border-[3px] border-blue-500/30 border-t-transparent animate-[spin_6s_linear_infinite_reverse]"></div>
            <img 
              src="/logo_icon_only.png?v=10" 
              alt="AI Ads™ Logo" 
              className="w-56 h-56 object-contain drop-shadow-2xl relative z-10" 
              onError={(e) => { e.target.onerror = null; e.target.src = '/logo_transparent.png?v=10'; }}
            />
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight flex items-center justify-center mt-2">
            <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 bg-clip-text text-transparent">
              AI Ads
            </span>
            <sup className="text-base font-extrabold text-amber-500 ml-1 mt-1 font-sans flex items-center gap-0.5">
              <span className="w-2.5 h-[2px] bg-amber-400/60 rounded-full inline-block"></span>
              TM
            </sup>
          </h1>
          
          <p className="mt-4 text-xs font-black tracking-[0.25em] text-slate-700 uppercase">
            Create &middot; Plan &middot; Publish &middot; Grow
          </p>
          
          <p className="text-slate-500 text-[15px] font-medium mt-6 text-center max-w-sm">
            Your complete AI-powered marketing platform for modern brands.
          </p>
        </div>


      </div>

      {/* Right Half - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 relative z-10 bg-gradient-to-br from-rose-50 via-white to-amber-50 overflow-hidden">
        
        {/* Bright vibrant glow orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-rose-400/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-amber-400/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[380px] relative z-10">
          
          <div className="bg-white rounded-[1.5rem] p-5 sm:p-6 shadow-[0_12px_40px_rgb(0,0,0,0.04)] border border-slate-100">
            {/* Form Title */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-extrabold text-slate-800">
                {mode === 'forgot' ? 'Reset Password' : mode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {mode === 'forgot' ? 'Enter your email to receive a reset code.' : mode === 'login' ? 'Sign in to continue to your workspace.' : 'Enter your details to get started.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[11px] font-semibold flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-800 uppercase tracking-widest block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    readOnly={loginOtpMode || registerOtpMode}
                    placeholder="you@company.com"
                    className={`w-full bg-white border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-3 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all shadow-sm ${loginOtpMode || registerOtpMode ? 'opacity-70 bg-slate-50' : ''}`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== 'forgot' && !loginOtpMode && !registerOtpMode && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-extrabold text-slate-800 uppercase tracking-widest block">
                      {mode === 'register' ? 'Create Password' : 'Password'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => handleTabChange('forgot')}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-9 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                  </button>
                </div>
              </div>
              )}

              {/* OTP (For Forgot flow) */}
              {mode === 'forgot' && forgotOtpSent && (
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-800 uppercase tracking-widest block">6-Digit OTP</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={resetOtp}
                      onChange={(e) => { setResetOtp(e.target.value); setError(''); }}
                      placeholder="Enter verification code"
                      className="w-full bg-white border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-3 text-slate-800 text-xs font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all shadow-sm"
                      required={mode === 'forgot' && forgotOtpSent}
                    />
                  </div>
                </div>
              )}

              {/* New Password (For Forgot flow) */}
              {mode === 'forgot' && forgotOtpSent && (
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-800 uppercase tracking-widest block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                      placeholder="Enter new password"
                      className="w-full bg-white border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-10 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all shadow-sm"
                      required={mode === 'forgot' && forgotOtpSent}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* 2FA / Login OTP */}
              {mode === 'login' && loginOtpMode && (
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-800 uppercase tracking-widest block">Login Verification Code</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={loginOtp}
                      onChange={(e) => { setLoginOtp(e.target.value); setError(''); }}
                      placeholder="Enter verification code"
                      className="w-full bg-white border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-3 text-slate-800 text-xs font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Register Verification OTP */}
              {mode === 'register' && registerOtpMode && (
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-800 uppercase tracking-widest block">Email Verification Code</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={registerOtp}
                      onChange={(e) => { setRegisterOtp(e.target.value); setError(''); }}
                      placeholder="Enter verification code"
                      className="w-full bg-white border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-3 text-slate-800 text-xs font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              {mode === 'register' && !registerOtpMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[9px] font-extrabold text-slate-800 uppercase tracking-widest block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-9 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Resend OTP Button */}
              {(loginOtpMode || registerOtpMode) && (
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setLoginOtpMode(false);
                      setRegisterOtpMode(false);
                      setLoginOtp('');
                      setRegisterOtp('');
                      // The user can now click Submit again to resend.
                    }}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
                  >
                    Didn't receive code? Try again
                  </button>
                </div>
              )}

              {/* Terms Checkbox */}
              {mode !== 'forgot' && (
                <div className="flex items-start gap-2 p-1 mt-1">
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
                    className="mt-0.5 w-3 h-3 rounded border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="acceptTermsCheck" className="text-[10px] text-slate-600 leading-tight">
                    I agree to the{' '}
                    <button type="button" onClick={() => { setActiveLegalTab('privacy'); setShowLegalModal(true); }} className="font-bold text-rose-600 hover:underline">
                      Privacy Policy
                    </button>
                    {' '}&{' '}
                    <button type="button" onClick={() => { setActiveLegalTab('terms'); setShowLegalModal(true); }} className="font-bold text-rose-600 hover:underline">
                      Terms
                    </button>.
                  </label>
                </div>
              )}

              {/* Submit Button */}
              {mode === 'forgot' ? (
                <>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2.5 mt-1 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-500/20 active:scale-[0.98]`}
                  >
                    {isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><span>{forgotOtpSent ? 'Reset Password' : 'Send Reset Code'}</span> <ArrowRight className="w-3 h-3" /></>
                    )}
                  </button>
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleTabChange('login')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className={`w-full py-2.5 mt-1 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 text-white ${
                    success
                      ? 'bg-emerald-500 shadow-sm'
                      : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-500/20 active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : success ? (
                    <><Check className="w-3.5 h-3.5" /> <span>{mode === 'register' ? 'Account Created!' : 'Welcome!'}</span></>
                  ) : (
                    <><span>{
                      mode === 'register' ? (registerOtpMode ? 'Verify Account' : 'Create Account') : (loginOtpMode ? 'Verify Login' : 'Sign In')
                    }</span> <ArrowRight className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </form>

            {mode !== 'forgot' && (
              <>
                {/* UWO SSO Divider */}
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">or continue with</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

            <div className="grid grid-cols-2 gap-2">
              <GoogleLoginSafeButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                acceptedTerms={acceptedTerms}
                setShowLegalModal={setShowLegalModal}
                setError={setError}
              />

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
                className="w-full py-2 px-2 bg-amber-50/70 hover:bg-amber-100/50 border border-amber-200/50 rounded-xl text-[10px] font-black uppercase tracking-wider text-amber-900 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                  <Zap className="w-2 h-2 fill-black text-black" />
                </div>
                <span>UWO</span>
              </button>
            </div>

            {/* Bottom Switch Link */}
            <div className="mt-4 text-center">
              {mode === 'login' ? (
                <p className="text-[10px] text-slate-500 font-medium">
                  Don't have an account?{' '}
                  <button onClick={() => handleTabChange('register')} className="font-bold text-rose-600 hover:underline">
                    Create Account
                  </button>
                </p>
              ) : (
                <p className="text-[10px] text-slate-500 font-medium">
                  Already have an account?{' '}
                  <button onClick={() => handleTabChange('login')} className="font-bold text-rose-600 hover:underline">
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </>
        )}
        
        {/* Enterprise Security Badge */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-[8px] font-bold text-emerald-800 uppercase tracking-wider">Enterprise Security Governed</span>
              </div>
            </div>

          </div>
        </div>
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
              className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      First-Time User Consent
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight mt-0.5">
                      AI Ads™ Platform Policies & Agreements
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLegalModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Switcher: Privacy Policy vs Terms of Service */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveLegalTab('privacy')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeLegalTab === 'privacy'
                      ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100 font-extrabold'
                      : 'text-slate-500 hover:bg-white hover:text-slate-700'
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
                      ? 'bg-white text-rose-600 shadow-sm border border-rose-100 font-extrabold'
                      : 'text-slate-500 hover:bg-white hover:text-slate-700'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>Terms of Service</span>
                </button>
              </div>

              {/* Scrollable Content Reader Area */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed max-h-[50vh]">
                {activeLegalTab === 'privacy' ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 font-medium">
                      <p className="font-extrabold text-xs uppercase tracking-wide text-emerald-700 mb-1">
                        🔒 Customer Privacy & Data Protection Policy
                      </p>
                      <p className="text-[11.5px]">
                        Your Brand DNA parameters, campaign content, and prompts are strictly protected. We do not sell your workspace data or use your proprietary content to train public AI models.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="font-extrabold text-slate-900 text-xs">Summary of Key Privacy Rights:</h4>
                      <ul className="list-disc pl-5 space-y-1.5 text-[11.5px] text-slate-600">
                        <li><strong>1. Information Collection:</strong> We store account credentials, Brand DNA guidelines, uploaded media, and platform telemetry needed to run your workspace.</li>
                        <li><strong>2. How Data is Used:</strong> Data powers AI ad generation, strategy creation, transactional emails, and system stability.</li>
                        <li><strong>3. 100% Proprietary Ownership:</strong> You retain complete ownership of your uploaded assets and AI-generated campaign outputs.</li>
                        <li><strong>4. Third-Party Infrastructure:</strong> Cloud hosting, payment processing (Razorpay), and AI models process data securely under strict confidentiality.</li>
                        <li><strong>5. Data Security:</strong> Protected using standard industry encryption during network transit and database storage.</li>
                        <li><strong>6. Permanent Account Deletion:</strong> You can purge your account and workspace data permanently at any time via 6-digit email OTP verification.</li>
                      </ul>

                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                        Privacy Contact: <a href="mailto:admin@uwo24.com" className="text-rose-600 underline font-bold">admin@uwo24.com</a> · Phone: <a href="tel:+918358990909" className="text-rose-600 underline font-bold">+91 83589 90909</a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900 font-medium">
                      <p className="font-extrabold text-xs uppercase tracking-wide text-rose-700 mb-1">
                        ⚖️ Commercial Ownership & Usage Terms
                      </p>
                      <p className="text-[11.5px]">
                        AI Ads™ provides an enterprise marketing generation platform. All website code, ad graphics, and copy synthesized in your workspace belong exclusively to your organization.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="font-extrabold text-slate-900 text-xs">Summary of Key Terms:</h4>
                      <ul className="list-disc pl-5 space-y-1.5 text-[11.5px] text-slate-600">
                        <li><strong>1. License Agreement:</strong> Platform access is licensed according to your selected plan (Starter, Pro, Agency, Enterprise).</li>
                        <li><strong>2. Account Security:</strong> You are responsible for maintaining secure password credentials for your workspace.</li>
                        <li><strong>3. Commercial IP Ownership:</strong> AI Ads™ makes zero claim of ownership over your Brand DNA inputs or generated campaign outputs.</li>
                        <li><strong>4. Acceptable Use:</strong> Users agree not to synthesize illegal, fraudulent, harmful, or deceptive content.</li>
                        <li><strong>5. Subscriptions & Credits:</strong> AI generation consumes visual credits based on your active subscription balance.</li>
                        <li><strong>6. Self-Service Deletion:</strong> You can cancel subscriptions or initiate permanent account deletion at any time.</li>
                      </ul>

                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                        Legal Support: <a href="mailto:admin@uwo24.com" className="text-rose-600 underline font-bold">admin@uwo24.com</a> · Phone: <a href="tel:+918358990909" className="text-rose-600 underline font-bold">+91 83589 90909</a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <p className="text-xs text-slate-500 font-medium">
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
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>I Accept</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
