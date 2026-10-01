/**
 * Centralized API Service Layer
 * All frontend API calls go through this module.
 * Base URL auto-detects development vs production.
 */
import { API_BASE } from '../config/api';

export { API_BASE };
const BASE_URL = API_BASE;
const apiFetch = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  const token = localStorage.getItem('aisa_token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server returned status ${res.status}: ${text.slice(0, 80)}...`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `API Error: ${res.status}`);
  }
  return data;
};

// ─── Workspace API ─────────────────────────────────────────────────────────────
export const workspaceAPI = {
  list: () => apiFetch('/workspace/list'),
  create: (body) => apiFetch('/workspace/create', { method: 'POST', body }),
  uploadDoc: (formData) => fetch(`${BASE_URL}/workspace/upload-doc`, { method: 'POST', body: formData }).then((r) => r.json()),
  update: (id, body) => apiFetch(`/workspace/${id}`, { method: 'PUT', body }),
  delete: (id) => apiFetch(`/workspace/${id}`, { method: 'DELETE' }),
};

// ─── Brand Intelligence API ────────────────────────────────────────────────────
export const brandAPI = {
  analyze: (body) => apiFetch('/brand/analyze', { method: 'POST', body }),
  getProfile: (workspaceId) => apiFetch(`/brand/${workspaceId}`).catch(() => workspaceAPI.list().then(res => ({ profile: (res.workspaces || []).find(w => w._id === workspaceId || w.id === workspaceId) }))),
  updateProfile: (workspaceId, body) => apiFetch(`/brand/${workspaceId}`, { method: 'PUT', body }).catch(() => workspaceAPI.update(workspaceId, body)),
  regenerateSection: (body) => apiFetch('/brand/regenerate-section', { method: 'POST', body }),
};

// ─── Strategy API ─────────────────────────────────────────────────────────────
export const strategyAPI = {
  generate: (workspaceId, body = {}) => apiFetch(`/workspace/${workspaceId}/generate-strategy`, { method: 'POST', body }),
  generateCustomStrategy: (workspaceId, body = {}) => apiFetch(`/workspace/${workspaceId}/generate-custom-strategy`, { method: 'POST', body }),
  regenerateCard: (workspaceId, body = {}) => apiFetch(`/workspace/${workspaceId}/regenerate-strategy-card`, { method: 'POST', body }),
  save: (workspaceId, body) => apiFetch(`/workspace/${workspaceId}`, { method: 'PUT', body: { currentStrategy: body } }),
};

// ─── Plans & Pricing API ──────────────────────────────────────────────────────
export const plansAPI = {
  getPlans: () => apiFetch('/plans'),
  getTopups: () => Promise.resolve({ success: true, topups: [] }),
  subscribe: (body) => apiFetch('/plans/subscribe', { method: 'POST', body }),
};

// ─── Campaign API ──────────────────────────────────────────────────────────────
export const campaignAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/campaigns${qs ? `?${qs}` : ''}`);
  },
  get: (id) => apiFetch(`/campaigns/${id}`),
  create: (body) => apiFetch('/campaigns', { method: 'POST', body }),
  update: (id, body) => apiFetch(`/campaigns/${id}`, { method: 'PUT', body }),
  delete: (id) => apiFetch(`/campaigns/${id}`, { method: 'DELETE' }),
  getPosts: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/campaigns/${id}/posts${qs ? `?${qs}` : ''}`);
  },
  generatePlan: (id, body = {}) => apiFetch(`/campaigns/${id}/generate-plan`, { method: 'POST', body }),
  generateStrategy: (id, body = {}) => apiFetch(`/campaigns/${id}/generate-strategy`, { method: 'POST', body }),
  generatePostContent: (postId, body = {}) => apiFetch(`/campaigns/posts/${postId}/generate-content`, { method: 'POST', body }),
  updatePost: (postId, body) => apiFetch(`/campaigns/posts/${postId}`, { method: 'PUT', body }),
  updatePostStatus: (postId, body) => apiFetch(`/campaigns/posts/${postId}/status`, { method: 'PATCH', body }),
  calculateDates: (body) => apiFetch('/campaigns/dates/calculate', { method: 'POST', body }),
};

// ─── Content Generation API ────────────────────────────────────────────────────
export const contentAPI = {
  generateSocialPost: (body) => apiFetch('/content/social/generate', { method: 'POST', body }),
  generateBlogDraft: (body) => apiFetch('/content/blog/draft', { method: 'POST', body }),
  generateEmailCopy: (body) => apiFetch('/content/email/generate', { method: 'POST', body }),
  generateAdCopy: (body) => apiFetch('/content/ad-copy/generate', { method: 'POST', body }),
  factCheck: (body) => apiFetch('/content/fact-check', { method: 'POST', body }),
};

// ─── SEO API ──────────────────────────────────────────────────────────────────
export const seoAPI = {
  generateBrief: (body) => apiFetch('/seo/brief/generate', { method: 'POST', body }),
  clusterKeywords: (body) => apiFetch('/seo/keywords/cluster', { method: 'POST', body }),
  regenerateKeyword: (body) => apiFetch('/seo/keywords/regenerate', { method: 'POST', body }),
  generateArticle: (body) => apiFetch('/seo/article/generate', { method: 'POST', body }),
  repurposeContent: (body) => apiFetch('/seo/repurpose', { method: 'POST', body }),
};

// ─── Creative Studio API ──────────────────────────────────────────────────────
export const creativeAPI = {
  getCredits: () => apiFetch('/creative/credits'),
  generateVisual: (body) => apiFetch('/creative/visual/generate', { method: 'POST', body }),
  craftAndGenerateVisual: (body) => apiFetch('/creative/craft-and-generate-visual', { method: 'POST', body }),
  setTier: (body) => apiFetch('/creative/credits/tier', { method: 'POST', body }),
};

// ─── AISA Chat API ────────────────────────────────────────────────────────────
export const chatAPI = {
  listSessions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/chat/sessions${qs ? `?${qs}` : ''}`);
  },
  getSession: (sessionId) => apiFetch(`/chat/sessions/${sessionId}`),
  sendMessage: (body, options = {}) => apiFetch('/chat', { method: 'POST', body, ...options }),
  deleteSession: (sessionId) => apiFetch(`/chat/sessions/${sessionId}`, { method: 'DELETE' }),
  renameSession: (sessionId, title) => apiFetch(`/chat/sessions/${sessionId}/title`, { method: 'PATCH', body: { title } }),
};

// ─── Calendar API ─────────────────────────────────────────────────────────────
export const calendarAPI = {
  list: () => apiFetch('/calendar/entries'),
  create: (body) => apiFetch('/calendar/entries', { method: 'POST', body }),
};

// ─── Approvals API ────────────────────────────────────────────────────────────
export const approvalsAPI = {
  getQueue: () => apiFetch('/approvals/queue'),
  updateStatus: (body) => apiFetch('/approvals/status', { method: 'PATCH', body }),
};

// ─── Analytics API ────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getSummary: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/analytics/summary${qs ? `?${qs}` : ''}`);
  },
};

// ─── Notifications API ────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/notifications${qs ? `?${qs}` : ''}`);
  },
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
};

// ─── Reminders API ────────────────────────────────────────────────────────────
export const remindersAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/reminders${qs ? `?${qs}` : ''}`);
  },
  create: (body) => apiFetch('/reminders', { method: 'POST', body }),
  update: (id, body) => apiFetch(`/reminders/${id}`, { method: 'PATCH', body }),
  delete: (id) => apiFetch(`/reminders/${id}`, { method: 'DELETE' }),
};

// ─── AI Website Builder API ───────────────────────────────────────────────────
export const websiteBuilderAPI = {
  analyzeRequirement: (body) => {
    const reqId = body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
    console.log(`[WB:${reqId}] POST /api/website-builder/analyze sending request...`);
    return apiFetch('/website-builder/analyze', {
      method: 'POST',
      headers: { 'x-correlation-id': reqId },
      body: { ...body, reqId }
    });
  },
  generateBlueprint: (body) => {
    const reqId = body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
    console.log(`[WB:${reqId}] POST /api/website-builder/blueprint sending request...`);
    return apiFetch('/website-builder/blueprint', {
      method: 'POST',
      headers: { 'x-correlation-id': reqId },
      body: { ...body, reqId }
    });
  },
  generateWebsite: (body) => {
    const reqId = body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
    console.log(`[WB:${reqId}] POST /api/website-builder/generate sending request...`);
    return apiFetch('/website-builder/generate', {
      method: 'POST',
      headers: { 'x-correlation-id': reqId },
      body: { ...body, reqId }
    });
  },
  buildWebsite: (body) => {
    const reqId = body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
    console.log(`[WB:${reqId}] POST /api/website-builder/build sending request...`);
    return apiFetch('/website-builder/build', {
      method: 'POST',
      headers: { 'x-correlation-id': reqId },
      body: { ...body, reqId }
    });
  },
  clarifyRequirement: (body) => {
    const reqId = body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
    return apiFetch('/website-builder/clarify', {
      method: 'POST',
      headers: { 'x-correlation-id': reqId },
      body: { ...body, reqId }
    });
  },
  chatEditProject: (body) => {
    const reqId = body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
    return apiFetch('/website-builder/chat-edit', {
      method: 'POST',
      headers: { 'x-correlation-id': reqId },
      body: { ...body, reqId }
    });
  },
  getRuntimeStatus: (projectId) => apiFetch(`/website-builder/projects/${projectId}/runtime`),
  stopRuntime: (projectId) => apiFetch(`/website-builder/projects/${projectId}/runtime/stop`, { method: 'POST' }),
  listProjects: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/website-builder/projects${qs ? `?${qs}` : ''}`);
  },
  createProject: (body) => apiFetch('/website-builder/projects', { method: 'POST', body }),
  getProject: (id) => apiFetch(`/website-builder/projects/${id}`),
  deleteProject: (id) => apiFetch(`/website-builder/projects/${id}`, { method: 'DELETE' }),
};

// ─── Account & Identity Verification API ─────────────────────────────────────
export const accountAPI = {
  sendDeleteOTP: (body) => apiFetch('/account/send-delete-otp', { method: 'POST', body }),
  verifyDeleteOTP: (body) => apiFetch('/account/verify-delete-otp', { method: 'POST', body }),
  deleteAccount: (body) => apiFetch('/account/delete', { method: 'POST', body }),
  sendFeedback: (body) => apiFetch('/feedback', { method: 'POST', body }),
};

// ─── Auth & User Profile API ─────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: credentials }),
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: data }),
  uwoLogin: (data) => apiFetch('/auth/uwo-login', { method: 'POST', body: data }),
  updateProfile: (data) => apiFetch('/auth/profile', { method: 'PUT', body: data }),
};

// ─── Auto-Pilot API (SSE Stream) ──────────────────────────────────────────────
export const autopilotAPI = {
  generate: (body, onMessage, onError, onComplete) => {
    const controller = new AbortController();
    fetch(`${BASE_URL}/autopilot/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    }).then(async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) { onComplete?.(); break; }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));
              onMessage?.(payload);
              if (payload.status === 'complete') onComplete?.(payload);
            } catch {}
          }
        }
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') onError?.(err);
    });
    return controller;
  },
};

// ─── Admin Dashboard API ──────────────────────────────────────────────────────
const adminApiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('aisa_token');
  return apiFetch(path, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

export const adminAPI = {
  getDashboardSummary: () => adminApiFetch('/admin/dashboard-summary'),
  getAllUserStats: () => adminApiFetch('/admin/users-stats'),
  getUserDetail: (userId) => adminApiFetch(`/admin/user/${userId}`),
  updateUserQuota: (userId, data) => adminApiFetch(`/admin/user/${userId}/quota`, { method: 'PUT', body: data }),
  deleteUser: (userId) => adminApiFetch(`/admin/user/${userId}`, { method: 'DELETE' }),
  getChatSessions: () => adminApiFetch('/admin/chat-sessions'),
  getLegalPages: () => adminApiFetch('/admin/legal'),
  updateLegalPages: (data) => adminApiFetch('/admin/legal', { method: 'POST', body: data }),
  getToolLimits: () => adminApiFetch('/admin/tool-limits'),
  updateToolLimits: (data) => adminApiFetch('/admin/tool-limits', { method: 'POST', body: data }),
  getHelpDeskTickets: () => adminApiFetch('/admin/help-desk'),
  updateTicketStatus: (ticketId, status) => adminApiFetch(`/admin/help-desk/${ticketId}/status`, { method: 'PATCH', body: { status } }),
};

// ─── Health Check & Testing Diagnostics ────────────────────────────────────────
export const healthAPI = {
  check: () => apiFetch('/health'),
  details: () => apiFetch('/api/health/details'),
  db: () => apiFetch('/api/health/db'),
  ping: (message) => apiFetch(`/api/health/ping${message ? `?message=${encodeURIComponent(message)}` : ''}`),
};

export default {
  auth: authAPI,
  workspace: workspaceAPI,
  brand: brandAPI,
  campaign: campaignAPI,
  content: contentAPI,
  seo: seoAPI,
  creative: creativeAPI,
  chat: chatAPI,
  calendar: calendarAPI,
  approvals: approvalsAPI,
  analytics: analyticsAPI,
  notifications: notificationsAPI,
  reminders: remindersAPI,
  websiteBuilder: websiteBuilderAPI,
  autopilot: autopilotAPI,
  admin: adminAPI,
  health: healthAPI,
};
