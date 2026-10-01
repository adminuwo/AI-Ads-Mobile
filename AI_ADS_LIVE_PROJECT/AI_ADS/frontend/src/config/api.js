/**
 * Global API Base Configuration
 * In local development, Vite dev server proxies '/api' to backend (e.g., http://127.0.0.1:5000).
 * In production on GCP Cloud Run, the unified Express server serves frontend at '/' and API at '/api'.
 * Can be explicitly overridden with VITE_API_URL if needed.
 */

export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

/**
 * Returns full URL for a given API endpoint path.
 * @param {string} endpoint - e.g. '/chat' or 'chat'
 * @returns {string} - e.g. '/api/chat'
 */
export const getApiUrl = (endpoint = '') => {
  if (!endpoint) return API_BASE;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};

export default API_BASE;
