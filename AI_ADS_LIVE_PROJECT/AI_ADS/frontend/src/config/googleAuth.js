// Centralized Google OAuth Client ID Configuration & Fallback Guard

export const DEFAULT_GOOGLE_CLIENT_ID = '743928421487-jdji1kn6u5gpklrgiv52956cftcojlj3.apps.googleusercontent.com';

export const getValidGoogleClientId = () => {
  try {
    const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (envId && typeof envId === 'string') {
      const clean = envId.trim();
      if (clean && clean !== 'undefined' && clean !== 'null' && clean.length > 10) {
        return clean;
      }
    }
  } catch (e) {}
  return DEFAULT_GOOGLE_CLIENT_ID;
};

export const GOOGLE_CLIENT_ID = getValidGoogleClientId();
