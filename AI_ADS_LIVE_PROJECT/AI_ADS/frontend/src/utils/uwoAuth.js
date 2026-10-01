/**
 * Unified Web Options (UWO) Central Auth Configuration
 * Enables seamless Single Sign-On (SSO) between AI Ads and the Unified Platform.
 */
import { API_BASE } from '../config/api';

export const getUnifiedApiBaseUrl = () => {
  const envUrl = (typeof window !== 'undefined' && window._env_?.VITE_UNIFIED_BACKEND_API) ||
    import.meta.env?.VITE_UNIFIED_BACKEND_API;

  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.hostname;
    // When running in production/staging (not localhost), use cloud run service if not set
    if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.trim().replace(/\/+$/, '');
      }
      return 'https://unified-dashboard-977864306871.asia-south1.run.app/api';
    }
  }

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return 'https://unified-dashboard-977864306871.asia-south1.run.app/api';
};

export const getBackendApiUrl = () => {
  const envUrl = (typeof window !== 'undefined' && window._env_?.VITE_API_URL) ||
    import.meta.env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return API_BASE;
};

export const getApis = () => {
  const unifiedBase = getUnifiedApiBaseUrl();
  const apiBase = getBackendApiUrl();

  return {
    unifiedAuth: {
      register: `${unifiedBase}/auth/register`,
      login: `${unifiedBase}/auth/login`,
      forgotPassword: `${unifiedBase}/auth/forgot-password`,
      resetPassword: `${unifiedBase}/auth/reset-password`,
      me: `${unifiedBase}/auth/me`,
    },
    uwoLogin: `${apiBase}/auth/uwo-login`,
    baseUrl: apiBase,
  };
};

export const apis = getApis();
export default apis;
