import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  X,
  Play,
  Pause,
  Trash2,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { API_BASE } from '../../config/api';

const BASE_URL = API_BASE;

export const LiveTelemetryPanel = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const logsEndRef = useRef(null);

  // Connect to SSE Stream
  useEffect(() => {
    let eventSource = null;

    try {
      eventSource = new EventSource(`${BASE_URL}/telemetry/stream`);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (e) => {
        if (isPausedRef.current) return;

        try {
          const data = JSON.parse(e.data);
          if (data.type === 'CONNECTED') {
            setIsConnected(true);
            return;
          }

          setEvents((prev) => {
            const exists = prev.some((item) => item.eventId === data.eventId);
            if (exists) return prev;
            return [data, ...prev].slice(0, 300); // Keep last 300 events
          });
        } catch (err) {
          console.warn('Error parsing SSE event:', err.message);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.warn('EventSource initialization error:', err.message);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleCopy = (eventId, content) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedId(eventId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    if (selectedFilter !== 'ALL') {
      if (selectedFilter === 'USER_ACTION' && ev.eventType !== 'USER_ACTION') return false;
      if (selectedFilter === 'AI_PIPELINE' && !['AI_PIPELINE', 'BLUEPRINT', 'CODE_GENERATION'].includes(ev.eventType)) return false;
      if (selectedFilter === 'ASSETS' && !['ASSET_PLAN', 'ASSET_GENERATION', 'ASSET_VALIDATION', 'ASSET_RETRY'].includes(ev.eventType)) return false;
      if (selectedFilter === 'BUILD' && !['BUILD', 'QA'].includes(ev.eventType)) return false;
      if (selectedFilter === 'ERROR' && ev.eventType !== 'ERROR' && ev.status !== 'ERROR') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = (ev.action || '').toLowerCase().includes(q);
      const matchComp = (ev.component || '').toLowerCase().includes(q);
      const matchSrc = (ev.source || '').toLowerCase().includes(q);
      const matchBuild = (ev.buildId || '').toLowerCase().includes(q);
      const matchReq = (ev.requestId || '').toLowerCase().includes(q);
      const matchMeta = JSON.stringify(ev.metadata || {}).toLowerCase().includes(q);

      return matchAction || matchComp || matchSrc || matchBuild || matchReq || matchMeta;
    }

    return true;
  });

  const getBadgeStyle = (eventType, status) => {
    if (status === 'ERROR' || eventType === 'ERROR') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    switch (eventType) {
      case 'USER_ACTION':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'AI_PIPELINE':
      case 'BLUEPRINT':
      case 'CODE_GENERATION':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'ASSET_PLAN':
      case 'ASSET_GENERATION':
      case 'ASSET_VALIDATION':
      case 'ASSET_RETRY':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'BUILD':
      case 'QA':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 top-20 w-[480px] max-w-[calc(100vw-2rem)] bg-slate-950/95 border border-slate-800 rounded-3xl shadow-2xl z-50 flex flex-col backdrop-blur-xl text-white animate-in slide-in-from-right-8 duration-200">
      {/* ── HEADER ── */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-inner">
            <Activity className="w-5 h-5 animate-pulse text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white">Live App Telemetry</h3>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                {isConnected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Real-time user actions, AI pipeline, asset validation & build events.</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── CONTROLS BAR ── */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/50 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
              isPaused
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Clear Logs */}
          <button
            onClick={() => setEvents([])}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear ({events.length})</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['ALL', 'USER_ACTION', 'AI_PIPELINE', 'ASSETS', 'BUILD', 'ERROR'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all shrink-0 border ${
                selectedFilter === type
                  ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, components, actions, or metadata..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
          />
        </div>
      </div>

      {/* ── EVENTS LIST STREAM ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs no-scrollbar">
        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Terminal className="w-8 h-8 mx-auto stroke-[1.5] text-slate-600" />
            <p className="text-xs font-bold text-slate-400">No events captured yet</p>
            <p className="text-[11px] max-w-xs mx-auto text-slate-500 font-medium">
              Interact with the Website Builder UI or click "Build Application" to see live telemetry stream.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isExpanded = expandedEventId === ev.eventId;
            const badgeClass = getBadgeStyle(ev.eventType, ev.status);

            return (
              <div
                key={ev.eventId}
                className="rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all overflow-hidden"
              >
                {/* Event Summary Bar */}
                <div
                  onClick={() => setExpandedEventId(isExpanded ? null : ev.eventId)}
                  className="p-2.5 cursor-pointer flex items-center justify-between gap-2 hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border shrink-0 ${badgeClass}`}>
                      {ev.eventType}
                    </span>

                    <span className="text-slate-300 font-bold truncate text-[11px]">
                      {ev.component} <span className="text-slate-500">→</span> {ev.action}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2 text-[11px]">
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div><span className="text-slate-500">Source:</span> {ev.source}</div>
                      <div><span className="text-slate-500">Status:</span> {ev.status}</div>
                      {ev.buildId && <div><span className="text-slate-500">Build ID:</span> {ev.buildId}</div>}
                      {ev.requestId && <div><span className="text-slate-500">Request ID:</span> {ev.requestId}</div>}
                      {ev.sessionId && <div className="col-span-2 truncate"><span className="text-slate-500">Session:</span> {ev.sessionId}</div>}
                    </div>

                    {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-slate-500 font-bold">Metadata:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(ev.eventId, ev.metadata);
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-[10px]"
                          >
                            {copiedId === ev.eventId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === ev.eventId ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="bg-slate-900 p-2 rounded-xl text-[10px] text-emerald-300 font-mono overflow-x-auto border border-slate-800/80">
                          {JSON.stringify(ev.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
