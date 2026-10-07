import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../../config/googleAuth.js';

class GoogleButtonErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.warn('Google OAuth safe boundary caught error:', err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <button
          type="button"
          onClick={() => this.props.onFallbackClick && this.props.onFallbackClick()}
          className="w-full py-2 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Google</span>
        </button>
      );
    }
    return this.props.children;
  }
}

const InternalGoogleLoginButton = ({ onSuccess, onError, acceptedTerms, setShowLegalModal, setError }) => {
  let loginWithGoogle = null;
  try {
    loginWithGoogle = useGoogleLogin({
      clientId: GOOGLE_CLIENT_ID,
      onSuccess,
      onError
    });
  } catch (err) {
    console.warn('Failed to initialize useGoogleLogin hook:', err);
  }

  const handleClick = () => {
    if (!acceptedTerms && localStorage.getItem('aisa_terms_accepted') !== 'true') {
      setShowLegalModal(true);
      setError('Please read and accept our Privacy Policy & Terms of Service to continue.');
      return;
    }
    try {
      if (typeof loginWithGoogle === 'function') {
        loginWithGoogle();
      } else {
        setError('Google Login is currently unavailable. Please sign in with Email/Password or UWO SSO.');
      }
    } catch (gErr) {
      console.error('Google OAuth Trigger Error:', gErr);
      setError('Google Login is currently unavailable. Please sign in with Email/Password or UWO SSO.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full py-2 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span>Google</span>
    </button>
  );
};

export const GoogleLoginSafeButton = (props) => {
  const handleFallbackClick = () => {
    if (!props.acceptedTerms && localStorage.getItem('aisa_terms_accepted') !== 'true') {
      props.setShowLegalModal(true);
      props.setError('Please read and accept our Privacy Policy & Terms of Service to continue.');
      return;
    }
    props.setError('Google Login is currently unavailable. Please sign in with Email/Password or UWO SSO.');
  };

  return (
    <GoogleButtonErrorBoundary onFallbackClick={handleFallbackClick}>
      <InternalGoogleLoginButton {...props} />
    </GoogleButtonErrorBoundary>
  );
};
