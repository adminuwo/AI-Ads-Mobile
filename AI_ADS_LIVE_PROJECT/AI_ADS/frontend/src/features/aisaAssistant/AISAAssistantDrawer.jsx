import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { X, Send, Dna, PenTool, CheckCircle2, Sparkles, Square, RotateCcw } from 'lucide-react';
import { chatAPI } from '../../services/api';


const QUICK_ACTION_CHIPS = [
  { id: 'dna', prompt: 'Summarize Brand DNA and voice guidelines', label: 'Brand DNA Summary', Icon: Dna, bgClass: 'from-rose-50 to-pink-50 dark:bg-slate-800/80 hover:from-rose-100 hover:to-pink-100 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/40', iconColor: 'text-rose-500' },
  { id: 'linkedin', prompt: 'Generate 3 LinkedIn Post Hooks', label: 'LinkedIn Hooks', Icon: PenTool, bgClass: 'from-indigo-50 to-blue-50 dark:bg-slate-800/80 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-900/40', iconColor: 'text-indigo-500' },
  { id: 'claims', prompt: 'Audit content against restricted claims', label: 'Claims Audit', Icon: CheckCircle2, bgClass: 'from-emerald-50 to-teal-50 dark:bg-slate-800/80 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-900/40', iconColor: 'text-emerald-500' },
  { id: 'adcopy', prompt: 'Generate 3 high-converting Ad Copy variations', label: 'Ad Copy Ideas', Icon: Sparkles, bgClass: 'from-amber-50 to-orange-50 dark:bg-slate-800/80 hover:from-amber-100 hover:to-orange-100 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/40', iconColor: 'text-amber-500' },
];

export const AISAAssistantDrawer = () => {
  const { isAISAAssistantOpen, setIsAISAAssistantOpen, activeWorkspace } = useWorkspace();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello! I am AI Ads™ Assistant, your strategic advertising and content intelligence assistant. I am connected to ${activeWorkspace?.brandName || 'your brand'} brand memory.\n\nAsk me to generate high-converting ad copy, social posts, strategic briefs, or analyze your marketing campaigns.`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
        text: `Hello! I am AI Ads™ Assistant, your strategic advertising and content intelligence assistant. Chat reset and re-connected to ${activeWorkspace?.brandName || 'your brand'} brand memory.\n\nAsk me to generate high-converting ad copy, social posts, strategic briefs, or analyze your marketing campaigns.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSessionId(null);
  };

  const formatLinks = (contentStr) => {
    if (typeof contentStr !== 'string') return contentStr;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = contentStr.split(urlRegex);
    if (parts.length === 1) return contentStr;
    return parts.map((part, i) => {
      if (/^https?:\/\//.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 dark:text-purple-400 font-bold underline underline-offset-2 hover:text-pink-600 transition-colors break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const renderFormattedText = (text) => {
    if (!text) return null;

    // Completely strip out all asterisks and angular symbols
    const cleanedText = text
      .replace(/\*/g, '')
      .replace(/<|>/g, '')
      .replace(/AISA\\u2122/g, 'AI Ads™')
      .replace(/\\u2122/g, '™')
      .replace(/\\u26a0\\ufe0f/g, '⚠️');

    const lines = cleanedText.split('\n');
    const elements = [];
    let listItems = [];

    const flushList = (keyPrefix) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`${keyPrefix}-ul`} className="my-2 space-y-1.5 pl-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-1.5 shrink-0" />
                <div>{formatLinks(item)}</div>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList(index);
        return;
      }

      if (trimmed === '---') {
        flushList(index);
        elements.push(
          <hr key={index} className="my-3 border-purple-100 dark:border-slate-800" />
        );
        return;
      }

      if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
        flushList(index);
        const title = trimmed.replace(/^#+\s*/, '');
        elements.push(
          <h3 key={index} className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 mt-3 mb-1.5 tracking-tight">
            {title}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
        flushList(index);
        const title = trimmed.replace(/^#+\s*/, '');
        elements.push(
          <h4 key={index} className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-2.5 mb-1 tracking-wide uppercase">
            {title}
          </h4>
        );
        return;
      }

      if (/^[\-\•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        const itemContent = trimmed.replace(/^([\-\•]|\d+\.)\s+/, '');
        listItems.push(itemContent);
        return;
      }

      flushList(index);
      elements.push(
        <p key={index} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
          {formatLinks(trimmed)}
        </p>
      );
    });

    flushList('final');

    return <div className="space-y-1">{elements}</div>;
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (customPrompt) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() || loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg = { id: Date.now(), sender: 'user', text: promptText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    const history = messages.slice(-10).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      content: m.text,
    }));
    history.push({ role: 'user', content: promptText });

    try {
      let currentUserEmail = activeWorkspace?.userEmail || null;
      let currentUserName = null;
      try {
        const savedUserStr = localStorage.getItem('aisa_user');
        if (savedUserStr) {
          const u = JSON.parse(savedUserStr);
          if (u.email) currentUserEmail = u.email;
          if (u.name) currentUserName = u.name;
        }
      } catch (e) { }

      const result = await chatAPI.sendMessage({
        message: promptText,
        sessionId,
        model: 'gemini-3.5-flash',
        history,
        workspaceId: activeWorkspace?._id || activeWorkspace?.id,
        userEmail: currentUserEmail,
        userName: currentUserName,
        brandContext: typeof activeWorkspace?.brandVoiceTone === 'string'
          ? activeWorkspace.brandVoiceTone
          : (typeof activeWorkspace?.positioningSummary === 'string' ? activeWorkspace.positioningSummary : (activeWorkspace?.brandName || '')),
        systemInstruction: `You are AI Ads™ Assistant, the official AI copilot embedded inside the AI Ads™ Platform for ${activeWorkspace?.brandName || 'the brand'}.

MANDATORY OUT-OF-SCOPE RULE:
If the user talks about or asks questions about anything else EXCEPT AI Ads, SEO, marketing strategy, social media, branding, advertising, or marketing growth (for example: general chitchat, coding, math, recipes/food, personal advice, trivia, movies, weather, general topics):
You MUST politely inform them that you are specialized strictly in AI Ads, SEO, Marketing Strategy, and Social Media Growth, and provide them with this link for further talk: https://aisa24.com/dashboard/chat/new

MANDATORY PLATFORM DIRECTIVE:
Whenever users ask how to generate content, create Instagram/social posts, build websites, create ads, or run marketing tasks, ALWAYS direct them to the corresponding built-in AI Ads™ platform modules FIRST (e.g. Content Studio for Instagram/social posts, Creative Studio for AI ad images, AI Website Builder for websites, Brand DNA for brand identity, Strategy for campaign playbooks, or click + Quick Post in the top bar). DO NOT recommend third-party external tools like Canva, Midjourney, or CapCut.

MANDATORY CONCISENESS RULE:
Keep your response short, concise, and to the point. DO NOT give long detailed responses unless the user explicitly asks for 'in detail' or 'long form'. Respond in plain text with short headings and concise bullet points. DO NOT use any asterisks (*), hashtags (#), or angular brackets (< >) in your text.`,
      }, { signal: controller.signal });

      if (result.sessionId && !sessionId) setSessionId(result.sessionId);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: result.response || 'I processed your request.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: `⚠️ Could not connect to backend service. Please check that backend server is active.\n\nError: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-full sm:max-w-md h-full bg-slate-50 dark:bg-[#070b19] border-l border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 text-slate-900 dark:text-white">
        {/* Drawer Header */}
        <div className="relative border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl shadow-xs">
          {/* Top Panch Tattva Vibrant Accent Ribbon */}
          <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full" />
          
          <div className="p-3.5 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 drop-shadow-md flex items-center justify-center">
                <img src="/aisa_brain_logo_hd.png?v=3" alt="AI Brain" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                  <span>AI Ads™ Chatbot Assistant</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  Connected to <span className="font-bold text-slate-800 dark:text-slate-100">{activeWorkspace?.brandName || 'Brand'} Memory</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearChat}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-purple-900/50 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 font-bold text-xs transition-all border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="Reset / Clear Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button
                onClick={() => setIsAISAAssistantOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-900/50 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all border border-slate-200/80 dark:border-slate-700 shadow-2xs active:scale-95"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Chips (Non-Stop Infinite Marquee) */}
        <div className="overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-2.5">
          <div className="animate-marquee-infinite flex gap-2">
            {[...QUICK_ACTION_CHIPS, ...QUICK_ACTION_CHIPS, ...QUICK_ACTION_CHIPS, ...QUICK_ACTION_CHIPS].map((chip, idx) => {
              const IconComp = chip.Icon;
              return (
                <button
                  key={`${chip.id}-${idx}`}
                  onClick={() => handleSend(chip.prompt)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r ${chip.bgClass} border shadow-2xs hover:shadow-xs transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 shrink-0`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${chip.iconColor}`} />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-slate-50/70 dark:bg-[#070b19]/90">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 shrink-0 mt-0.5 drop-shadow-sm flex items-center justify-center">
                  <img src="/aisa_brain_logo_hd.png?v=3" alt="AI Brain" className="w-full h-full object-contain" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed font-medium ${m.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-tr-none shadow-md shadow-purple-500/15'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none shadow-sm'
                }`}>
                {m.sender === 'assistant' ? renderFormattedText(m.text) : m.text}
                <div className="text-[9px] opacity-60 text-right mt-1.5">{m.time}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5 items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-bold p-3 bg-white dark:bg-slate-800 rounded-2xl border border-purple-200/80 dark:border-purple-800/50 max-w-[85%] shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-xl border-2 border-purple-500/20 border-t-purple-600 animate-spin" />
                  <img src="/aisa_brain_logo_hd.png?v=3" alt="AI Ads™ Logo" className="w-5 h-5 object-contain" />
                </div>
                <span>AI Ads™ Engine analyzing...</span>
              </div>
              <button
                onClick={handleStop}
                className="text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white px-2 py-0.5 rounded-lg border border-rose-500/20 font-bold transition-all flex items-center gap-1 active:scale-95"
                title="Stop Response Generation"
              >
                <Square className="w-3 h-3 fill-current" />
                Stop
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box (Auto-Expanding Multi-Row Textarea) */}
        <div className="p-3.5 border-t border-purple-100/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Ask AI Ads™ for ${activeWorkspace?.brandName || 'Brand'}...`}
              className="flex-1 bg-purple-50/30 dark:bg-slate-800/80 border border-purple-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20 rounded-xl px-3.5 py-2.5 text-xs resize-none max-h-32 min-h-[40px] leading-relaxed scrollbar-thin font-medium"
            />
            {loading ? (
              <button
                type="button"
                onClick={handleStop}
                className="px-4 py-2.5 h-[40px] rounded-xl flex-shrink-0 flex items-center justify-center gap-1.5 font-extrabold text-xs tracking-wide text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-md shadow-rose-500/25 transition-all active:scale-95 animate-pulse"
                title="Stop Response Generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="btn-primary px-4 py-2.5 h-[40px] rounded-xl flex-shrink-0 flex items-center justify-center gap-1.5 font-extrabold text-xs tracking-wide disabled:opacity-50"
                title="Send Message (Enter)"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enter</span>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

