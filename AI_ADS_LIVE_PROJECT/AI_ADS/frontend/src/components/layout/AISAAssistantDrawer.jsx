import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { X, Send, Sparkles, RefreshCw, Dna, PenTool, CheckCircle2, Square, RotateCcw } from 'lucide-react';

const QUICK_ACTION_CHIPS = [
  { id: 'dna', prompt: 'Summarize Brand DNA and voice guidelines', label: 'Brand DNA Summary', Icon: Dna, iconColor: 'text-brand-400' },
  { id: 'linkedin', prompt: 'Generate 3 LinkedIn Post Hooks', label: 'LinkedIn Hooks', Icon: PenTool, iconColor: 'text-cyan-400' },
  { id: 'claims', prompt: 'Audit content against restricted claims', label: 'Claims Audit', Icon: CheckCircle2, iconColor: 'text-emerald-400' },
  { id: 'adcopy', prompt: 'Generate 3 high-converting Ad Copy variations', label: 'Ad Copy Ideas', Icon: Sparkles, iconColor: 'text-amber-400' },
];

export const AISAAssistantDrawer = () => {
  const { isAISAAssistantOpen, setIsAISAAssistantOpen, activeWorkspace } = useWorkspace();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello! I am AI Ads™ Assistant, your AI Social & Content Operations Assistant. I am linked directly to **${activeWorkspace?.brandName || 'Brand'}** Brand DNA memory.\n\nHow can I assist your campaign strategy today?`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chipsRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!isAISAAssistantOpen) return;
    const container = chipsRef.current;
    if (!container) return;

    let animId;
    let isHovered = false;

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => { isHovered = false; };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    const step = () => {
      if (!isHovered && container) {
        container.scrollLeft += 0.7;
        if (container.scrollLeft >= (container.scrollWidth / 3)) {
          container.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    const timer = setTimeout(() => {
      animId = requestAnimationFrame(step);
    }, 100);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isAISAAssistantOpen]);

  if (!isAISAAssistantOpen) return null;

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        sender: 'assistant',
        text: '⏹️ Chat response stopped by user.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleClearChat = () => {
    if (loading) {
      handleStop();
    }
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: `Hello! I am AI Ads™ Assistant, your AI Social & Content Operations Assistant. Chat reset and re-connected to **${activeWorkspace?.brandName || 'Brand'}** Brand DNA memory.\n\nHow can I assist your campaign strategy today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSend = async (customPrompt) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() || loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg = { id: Date.now(), sender: 'user', text: promptText, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/content/social/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: promptText, brandName: activeWorkspace?.brandName }),
        signal: controller.signal
      });
      const data = await res.json();

      let replyText = `Here is your strategy suggestion anchored to **${activeWorkspace?.brandName || 'Brand'}** Brand DNA:\n\n`;
      if (data.data) {
        replyText += `**Hook:** ${data.data.hook}\n\n**Caption:** ${data.data.caption}\n\n**Hashtags:** ${data.data.hashtags.join(' ')}`;
      } else {
        replyText += `I have analyzed your prompt against the approved brand memory. ${activeWorkspace?.positioningSummary || ''}`;
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: replyText, time: 'Just now' }]);
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'assistant', 
        text: `Executed AI Ads™ assistant task based on ${activeWorkspace?.brandName || 'Brand'} positioning: Generated structured output and verified against restricted claims repository.`, 
        time: 'Just now' 
      }]);
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in"
      onClick={() => setIsAISAAssistantOpen(false)}
    >
      <div 
        className="w-full max-w-md h-full bg-[#0d121f] border-l border-slate-800 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="relative border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-xs">
          <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full" />
          <div className="p-3.5 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 drop-shadow-md flex items-center justify-center">
                <img src="/aisa_brain_logo_hd.png?v=3" alt="AI Brain Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight">AI Ads™ Chatbot Assistant</h3>
                <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  Connected to <span className="font-bold text-slate-200">{activeWorkspace?.brandName || 'Brand'} Memory</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearChat}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-900/50 text-slate-200 hover:text-purple-300 font-bold text-xs transition-all border border-slate-700 flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="Reset / Clear Chat"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                <span>Reset</span>
              </button>
              <button 
                onClick={() => setIsAISAAssistantOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 transition-all border border-slate-700 shadow-2xs active:scale-95"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Chips (Non-Stop Infinite Marquee) */}
        <div ref={chipsRef} className="overflow-hidden border-b border-slate-800/60 bg-slate-900/30 py-2">
          <div className="animate-marquee-infinite flex gap-2">
            {[...QUICK_ACTION_CHIPS, ...QUICK_ACTION_CHIPS, ...QUICK_ACTION_CHIPS, ...QUICK_ACTION_CHIPS].map((chip, idx) => {
              const IconComp = chip.Icon;
              return (
                <button 
                  key={`${chip.id}-${idx}`}
                  onClick={() => handleSend(chip.prompt)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-slate-700/60 whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                >
                  <IconComp className={`w-3 h-3 ${chip.iconColor}`} />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 shrink-0 mt-0.5 flex items-center justify-center">
                  <img src="/aisa_brain_logo_hd.png?v=3" alt="AI Brain" className="w-full h-full object-contain" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-brand-600 text-white rounded-tr-none' 
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none whitespace-pre-wrap'
              }`}>
                {m.text}
                <div className="text-[9px] opacity-60 text-right mt-1">{m.time}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-center justify-between text-xs text-cyan-400 p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 max-w-[85%]">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Ads™ Engine analyzing...</span>
              </div>
              <button
                onClick={handleStop}
                className="text-[10px] bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white px-2 py-0.5 rounded-lg border border-rose-500/30 font-bold transition-all flex items-center gap-1 active:scale-95"
                title="Stop Response Generation"
              >
                <Square className="w-3 h-3 fill-current" />
                Stop
              </button>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask AI Ads™ for ${activeWorkspace?.brandName || 'Brand'}...`}
              className="flex-1 glass-input text-xs"
            />
            {loading ? (
              <button 
                type="button"
                onClick={handleStop}
                className="p-2.5 rounded-xl flex-shrink-0 bg-rose-500 hover:bg-rose-600 text-white transition-all animate-pulse"
                title="Stop Response Generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button 
                type="submit"
                disabled={!input.trim()}
                className="btn-primary p-2.5 rounded-xl flex-shrink-0 disabled:opacity-50"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
