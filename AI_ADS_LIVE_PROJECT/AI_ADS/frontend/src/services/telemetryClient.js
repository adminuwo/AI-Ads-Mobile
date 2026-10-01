/**
 * Centralized Frontend Telemetry Client v1.0
 *
 * Provides structured, non-blocking event tracking for user interactions,
 * UI navigation, search inputs, modal triggers, and application pipeline state changes.
 */
import { API_BASE } from '../config/api';

const BASE_URL = API_BASE;

// Persistent Session ID for the active browser session
function getSessionId() {
  try {
    let sid = sessionStorage.getItem('ai_ads_telemetry_session_id');
    if (!sid) {
      sid = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      sessionStorage.setItem('ai_ads_telemetry_session_id', sid);
    }
    return sid;
  } catch {
    return `sess_temp_${Date.now()}`;
  }
}

// Redact sensitive values from metadata
function sanitizeValue(value) {
  if (!value) return value;
  if (typeof value === 'string') {
    if (value.length > 500) return value.slice(0, 500) + '...[TRUNCATED]';
    return value;
  }
  if (typeof value === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(value)) {
      const kl = k.toLowerCase();
      if (kl.includes('password') || kl.includes('token') || kl.includes('secret') || kl.includes('auth')) {
        clean[k] = '[REDACTED]';
      } else {
        clean[k] = sanitizeValue(v);
      }
    }
    return clean;
  }
  return value;
}

// In-memory queue for non-blocking telemetry batch dispatching
let eventQueue = [];
let dispatchTimer = null;

function flushQueue() {
  if (eventQueue.length === 0) return;
  const batch = [...eventQueue];
  eventQueue = [];

  fetch(`${BASE_URL}/telemetry/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batch),
    keepalive: true
  }).catch((err) => {
    console.warn('[TelemetryClient] Dispatch failed:', err.message);
  });
}

function queueEvent(eventData) {
  const event = {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    projectId: eventData.projectId || null,
    buildId: eventData.buildId || null,
    requestId: eventData.requestId || null,
    source: 'FRONTEND',
    eventType: eventData.eventType || 'USER_ACTION',
    page: eventData.page || window.location.pathname,
    component: eventData.component || 'UIComponent',
    action: eventData.action || 'INTERACTION',
    status: eventData.status || 'SUCCESS',
    metadata: sanitizeValue(eventData.metadata || {})
  };

  eventQueue.push(event);

  if (!dispatchTimer) {
    dispatchTimer = setTimeout(() => {
      dispatchTimer = null;
      flushQueue();
    }, 150); // Quick 150ms debounce batching
  }

  return event;
}

export const telemetry = {
  getSessionId,

  trackEvent: (opts = {}) => {
    return queueEvent(opts);
  },

  trackClick: (component, action, metadata = {}) => {
    return queueEvent({
      component,
      action: `CLICK_${action.toUpperCase().replace(/\s+/g, '_')}`,
      eventType: 'USER_ACTION',
      metadata
    });
  },

  trackNavigation: (fromTab, toTab, metadata = {}) => {
    return queueEvent({
      component: 'Navigation',
      action: `NAVIGATE_${toTab.toUpperCase()}`,
      eventType: 'USER_ACTION',
      metadata: { fromTab, toTab, ...metadata }
    });
  },

  trackModal: (modalName, action, metadata = {}) => {
    return queueEvent({
      component: modalName,
      action: `MODAL_${action.toUpperCase()}`,
      eventType: 'USER_ACTION',
      metadata
    });
  },

  trackBuildStart: (prompt, metadata = {}) => {
    return queueEvent({
      component: 'AIWebsiteBuilder',
      action: 'INITIATE_BUILD',
      eventType: 'USER_ACTION',
      metadata: { promptLength: prompt?.length || 0, promptSnippet: prompt?.slice(0, 100), ...metadata }
    });
  },

  trackSearch: (component, query, metadata = {}) => {
    return queueEvent({
      component,
      action: 'SEARCH_QUERY',
      eventType: 'USER_ACTION',
      metadata: { queryLength: query?.length || 0, ...metadata }
    });
  }
};

// Global click event listener for declarative data-telemetry attributes
export function initGlobalTelemetryListeners() {
  if (typeof window === 'undefined') return;

  window.addEventListener('click', (e) => {
    const el = e.target.closest('[data-telemetry-action]');
    if (el) {
      const action = el.getAttribute('data-telemetry-action');
      const component = el.getAttribute('data-telemetry-component') || 'UIElement';
      telemetry.trackClick(component, action, {
        tagName: el.tagName,
        textSnippet: (el.textContent || '').trim().slice(0, 40)
      });
    }
  }, { capture: true, passive: true });
}

// Connects to SSE telemetry stream for real-time account event dispatches
export function subscribeToAccountEvents(onEvent) {
  if (typeof window === 'undefined') return () => {};

  let eventSource = null;
  try {
    eventSource = new EventSource(`${BASE_URL}/telemetry/stream`);
    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (onEvent) onEvent(payload);
      } catch (err) {}
    };
  } catch (err) {
    console.warn('[TelemetryClient] SSE connection error:', err.message);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}
