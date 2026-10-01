import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { getApis, getUnifiedApiBaseUrl } from '../../utils/uwoAuth';

export const UWOLoginModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialRegister = false,
  appCode = 'ai_ads',
  apiKey = 'key_ai_ads_live_master_2026',
}) => {
  const [authMode, setAuthMode] = useState(initialRegister ? 'register' : 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync state if initialRegister changes or when modal opens
  useEffect(() => {
    setAuthMode(initialRegister ? 'register' : 'signin');
    setError('');
    setSuccessMsg('');
    setPassword('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  }, [initialRegister, isOpen]);

  if (!isOpen) return null;

  const isRegisterMode = authMode === 'register';

  // Helper for final session provisioning across AI_ADS
  const completeSessionProvisioning = async (loginData, userEmail, userName) => {
    let uwoUser = {
      name: loginData.user?.name || loginData.user?.full_name || userName || userEmail.split('@')[0],
      email: loginData.user?.email || userEmail,
      id: loginData.user?.id || loginData.user?._id,
    };

    // 1. Fetch Central /auth/me for highest-fidelity user details
    try {
      const unifiedApiBase = getUnifiedApiBaseUrl();
      const meRes = await fetch(`${unifiedApiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${loginData.access_token}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        uwoUser = {
          ...meData,
          name: meData.name || meData.full_name || uwoUser.name,
          email: meData.email || uwoUser.email,
          id: meData.id || meData._id || uwoUser.id,
        };
      }
    } catch (meErr) {
      console.warn('Failed to fetch /auth/me from Unified Dashboard:', meErr);
    }

    let finalData = { ...loginData, user: uwoUser };

    // 2. Synchronize Session with AI_ADS Local Backend
    try {
      const apis = getApis();
      const ssoRes = await fetch(apis.uwoLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: uwoUser.email || userEmail,
          name: uwoUser.name || userName || userEmail.split('@')[0],
          uwo_token: loginData.access_token,
          uwo_user_id: uwoUser.id || uwoUser._id,
        }),
      });

      if (ssoRes.ok) {
        const ssoData = await ssoRes.json();
        if (ssoData.success && ssoData.token) {
          finalData = {
            token: ssoData.token,
            access_token: ssoData.token,
            uwo_token: loginData.access_token,
            user: {
              ...ssoData.user,
              name: ssoData.user?.name || uwoUser.name,
              email: ssoData.user?.email || uwoUser.email,
              id: ssoData.user?.id || ssoData.user?._id || uwoUser.id,
            },
          };
        }
      }
    } catch (ssoErr) {
      console.warn('[UWO SSO] AI_ADS Backend session sync fallback:', ssoErr);
    }

    // 3. Persist local storage keys
    const sessionToken = finalData.token || finalData.access_token;
    const cleanEmail = (finalData.user?.email || userEmail).toLowerCase().trim();
    if (sessionToken) {
      localStorage.setItem('aisa_token', sessionToken);
      localStorage.setItem('token', sessionToken);
      localStorage.setItem('aisa_user_email', cleanEmail);
      localStorage.setItem('aisa_user', JSON.stringify(finalData.user));
      localStorage.setItem('uwo_access_token', loginData.access_token);
      localStorage.setItem('uwo_user', JSON.stringify(finalData.user));
      if (finalData.user?.id || finalData.user?._id) {
        localStorage.setItem('userId', finalData.user.id || finalData.user._id);
      }
    }

    if (onSuccess) onSuccess(finalData);
    onClose();
  };

  // 1. Submit Registration or Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const apis = getApis();

    try {
      if (isRegisterMode) {
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const regRes = await fetch(apis.unifiedAuth.register, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Application-Key': apiKey,
            'X-App-Code': appCode,
          },
          body: JSON.stringify({ name: name || email.split('@')[0], email, password }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          let errorText = 'Registration failed';
          if (typeof regData.detail === 'string') {
            errorText = regData.detail;
          } else if (Array.isArray(regData.detail)) {
            errorText = regData.detail.map((d) => d.msg || d.detail || JSON.stringify(d)).join(', ');
          } else if (regData.detail) {
            errorText = typeof regData.detail === 'object' ? JSON.stringify(regData.detail) : String(regData.detail);
          } else if (regData.message) {
            errorText = String(regData.message);
          }

          if (errorText.toLowerCase().includes('already exists')) {
            errorText = 'An account with this email already exists on UWO Platform. Switching to Sign In...';
            setTimeout(() => {
              setAuthMode('signin');
              setError('');
            }, 1800);
          }
          throw new Error(errorText);
        }

        setSuccessMsg('Account created successfully! Signing you in...');
      }

      // Authenticate & Obtain Central UWO Tokens
      const loginRes = await fetch(apis.unifiedAuth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Application-Key': apiKey,
          'X-App-Code': appCode,
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        let loginErr = 'Authentication failed';
        if (typeof loginData.detail === 'string') {
          loginErr = loginData.detail;
        } else if (Array.isArray(loginData.detail)) {
          loginErr = loginData.detail.map((d) => d.msg || d.detail).join(', ');
        } else if (loginData.detail) {
          loginErr = typeof loginData.detail === 'object' ? JSON.stringify(loginData.detail) : String(loginData.detail);
        } else if (loginData.message) {
          loginErr = String(loginData.message);
        }
        throw new Error(loginErr);
      }

      await completeSessionProvisioning(loginData, email, name);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const displayError =
        typeof err === 'string'
          ? err
          : err?.message
          ? typeof err.message === 'string'
            ? err.message
            : JSON.stringify(err.message)
          : 'Authentication error';
      setError(displayError);
    }
  };

  // 2. Request OTP for Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const apis = getApis();
      const endpoint = apis.unifiedAuth.forgotPassword;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Application-Key': apiKey,
          'X-App-Code': appCode,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Failed to send reset code');
      }

      setSuccessMsg(data.message || 'Verification code sent to your email address!');
      setTimeout(() => {
        setAuthMode('reset');
        setError('');
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to process forgot password request');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setError('Please provide the OTP code and your new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const apis = getApis();
      const endpoint = apis.unifiedAuth.resetPassword;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Application-Key': apiKey,
          'X-App-Code': appCode,
        },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Failed to reset password');
      }

      setSuccessMsg('Password reset successfully! Signing in with your new credentials...');

      // Auto login with new credentials
      const loginRes = await fetch(apis.unifiedAuth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Application-Key': apiKey,
          'X-App-Code': appCode,
        },
        body: JSON.stringify({ email, password: newPassword }),
      });

      const loginData = await loginRes.json();
      if (loginRes.ok) {
        await completeSessionProvisioning(loginData, email, name);
      } else {
        setTimeout(() => {
          setAuthMode('signin');
          setPassword('');
          setSuccessMsg('Password reset! Please sign in with your new password.');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.35 }}
        className="relative w-full max-w-md bg-[#0d121f] border border-amber-500/25 rounded-3xl p-7 shadow-2xl shadow-amber-500/10 overflow-hidden text-slate-100"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/15 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-32 bg-blue-500/10 blur-[50px] pointer-events-none" />

        {/* Header with Close and Back Buttons */}
        <div className="flex items-center justify-between relative z-10 mb-5">
          <div className="flex items-center gap-2">
            {(authMode === 'forgot' || authMode === 'reset') && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                  setSuccessMsg('');
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                  Unified Platform SSO
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                  UWO
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {authMode === 'signin' && 'Sign In to AI Ads'}
                {authMode === 'register' && 'Create UWO Account'}
                {authMode === 'forgot' && 'Reset Your Password'}
                {authMode === 'reset' && 'Enter Verification Code'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle / Mode Description */}
        <p className="text-xs text-slate-400 relative z-10 -mt-2 mb-4 leading-relaxed">
          {authMode === 'signin' && 'One single account for AI Ads, AISA, AI-Mall, EFV, and the entire Unified Platform.'}
          {authMode === 'register' && 'Join the Unified Platform ecosystem with cross-application single sign-on.'}
          {authMode === 'forgot' && 'Enter your verified account email to receive a 6-digit one-time password (OTP).'}
          {authMode === 'reset' && 'Enter the 6-digit OTP code sent to your email along with your new password.'}
        </p>

        {/* Feedback Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 mb-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5 relative z-10"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 mb-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 relative z-10"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Switcher (Only in signin / register modes) */}
        {(authMode === 'signin' || authMode === 'register') && (
          <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/10 mb-4 relative z-10">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'signin'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* FLOW 1: Standard Sign In & Register Form */}
        {(authMode === 'signin' || authMode === 'register') && (
          <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
            {isRegisterMode && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{isRegisterMode ? 'Register & Sign In with UWO' : 'Sign In with UWO Platform'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* FLOW 2: Forgot Password Request (Step 1) */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5 relative z-10">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* FLOW 3: Reset Password with OTP (Step 2) */}
        {authMode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 relative z-10">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono font-bold tracking-widest transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reset Password & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Security Badge */}
        <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-center gap-2 text-slate-400 text-xs relative z-10">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="text-[11px]">Protected by Unified Web Options Central Auth Security</span>
        </div>
      </motion.div>
    </div>
  );
};

export default UWOLoginModal;
