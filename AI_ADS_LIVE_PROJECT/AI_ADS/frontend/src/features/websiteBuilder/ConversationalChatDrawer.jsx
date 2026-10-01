import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Globe,
  Mic,
  MicOff
} from 'lucide-react';
import { VisualAssetsPreviewCard } from './VisualAssetsPreviewCard';

export const ConversationalChatDrawer = ({
  onSendChatEdit,
  isUpdating,
  messages = [],
  selectedElement = null,
  onClearSelectedElement,
  projectData = null
}) => {
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { showCustomAlert } = useWorkspace();
  const handleVoiceCommand = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (showCustomAlert) {
        showCustomAlert({ title: 'Voice Input Unsupported', message: 'Voice input is not supported in this browser. Please use Chrome or Edge.', type: 'info' });
      }
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const initialText = chatInput || '';

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentSpeech = '';
        for (let i = 0; i < event.results.length; i++) {
          currentSpeech += event.results[i][0].transcript;
        }
        const cleanSpeech = currentSpeech.trim();
        if (cleanSpeech) {
          setChatInput(initialText ? `${initialText} ${cleanSpeech}` : cleanSpeech);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isUpdating]);

  const website = projectData?.website || {};
  const requirement = projectData?.requirement || {};
  const blueprint = projectData?.blueprint || {};

  const projectTitle =
    projectData?.title ||
    website?.websiteIdentity?.title ||
    blueprint?.websiteIdentity?.title ||
    requirement?.businessType ||
    'Your Web Application';

  const businessType = website?.websiteIdentity?.businessType || requirement?.businessType || 'Custom Application';
  const pagesCount = website?.pages?.length || blueprint?.pages?.length || 1;

  // Extract all generated visual assets
  let visualAssets = Array.isArray(projectData?.visualAssets) ? projectData.visualAssets : [];

  if (visualAssets.length === 0 && website?.pages) {
    const assetMap = new Map();
    website.pages.forEach((p) => {
      (p.sections || []).forEach((s) => {
        if (s.imageUrl && !assetMap.has(s.imageUrl)) {
          assetMap.set(s.imageUrl, {
            imageUrl: s.imageUrl,
            context: `${s.title || s.headline || p.name || 'Hero'} Visual`,
            type: s.type,
            page: p.name,
            prompt: s.headline ? `Commercial photography of ${s.headline}` : `Hero visual for ${projectTitle}`
          });
        }
        if (Array.isArray(s.items)) {
          s.items.forEach((it) => {
            if (it.imageUrl && !assetMap.has(it.imageUrl)) {
              assetMap.set(it.imageUrl, {
                imageUrl: it.imageUrl,
                context: it.name || 'Catalog Product',
                type: 'catalog_item',
                page: p.name,
                prompt: it.description || it.name
              });
            }
          });
        }
      });
    });
    visualAssets = Array.from(assetMap.values());
  }

  const samplePrompts = [
    'Make the hero smaller',
    'Change the CTA to Get Started',
    'Add a pricing section',
    'Change the colors to black and ivory',
    'Add a contact form',
    'Make the navbar sticky',
    'Create a mobile menu'
  ];

  const handleInputChange = (e) => {
    setChatInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!chatInput || !chatInput.trim() || isUpdating) return;
    let finalMsg = chatInput.trim();
    if (selectedElement && selectedElement.name) {
      finalMsg = `[Target Element: ${selectedElement.name} (${selectedElement.type || 'Component'})] ${finalMsg}`;
    }
    setChatInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSendChatEdit(finalMsg);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-slate-800 p-4 shadow-lg text-slate-900 dark:text-white select-none">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">AI Ads™ Assistant</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Natural language live application editing
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* ── MESSAGES SCROLL AREA ── */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs scrollbar-thin">
        {/* LOVABLE-STYLE GENERATED VISUAL ASSETS CARD */}
        {visualAssets.length > 0 && (
          <VisualAssetsPreviewCard
            assets={visualAssets}
            websiteTitle={projectTitle}
            businessType={businessType}
          />
        )}

        {/* Live Website Status Announcement Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Website Generated & Live</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            Your {businessType} website is live at <strong className="text-slate-900 dark:text-white font-black">{projectTitle}</strong> — I built a complete {pagesCount}-page application with prompt-tailored visual assets, verified components, and responsive mobile architecture.
          </p>

          <div className="pt-1 space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {samplePrompts.slice(0, 5).map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => !isUpdating && onSendChatEdit(suggestion)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-600/20 dark:hover:text-brand-300 text-slate-700 dark:text-slate-300 font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Messages */}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl border space-y-1.5 transition-all ${
              m.sender === 'user'
                ? 'bg-brand-500/10 border-brand-500/30 text-slate-900 dark:text-white ml-4'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 mr-4 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                {m.sender === 'user' ? (
                  <User className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                ) : (
                  <Bot className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                )}
                <span>{m.sender === 'user' ? 'You' : 'AI Ads™ AI'}</span>
              </span>
              <span className="font-mono text-[9px]">{m.timestamp || ''}</span>
            </div>
            <p className="text-xs leading-relaxed font-medium">{m.text}</p>
            {m.modifiedFiles && m.modifiedFiles.length > 0 && (
              <div className="pt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span>Updated: {m.modifiedFiles.join(', ')}</span>
              </div>
            )}
          </div>
        ))}

        {isUpdating && (
          <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 animate-pulse">
            <Loader2 className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-spin flex-shrink-0" />
            <span className="text-xs font-bold">Modifying source files & hot-reloading preview...</span>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* ── TARGETED ELEMENT CONTEXT CHIP ── */}
      {selectedElement && (
        <div className="mt-2 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-500/15 border border-brand-200 dark:border-brand-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 text-brand-700 dark:text-brand-300 font-bold truncate">
            <Layers className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              Target: <strong className="font-black">{selectedElement.name}</strong>
            </span>
          </div>
          {onClearSelectedElement && (
            <button
              onClick={onClearSelectedElement}
              className="p-1 rounded hover:bg-brand-200/50 dark:hover:bg-brand-500/30 text-brand-700 dark:text-brand-300"
              title="Clear selected element"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── INPUT FORM (MULTI-LINE AUTO-EXPANDING TEXTAREA) ── */}
      <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-end gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={chatInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedElement
                ? `Edit ${selectedElement.name} (e.g. Make this button green...)`
                : 'Ask AI Ads™ (e.g. Add cart section on top in navbar...)'
            }
            disabled={isUpdating}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium resize-none max-h-36 min-h-[40px] leading-relaxed scrollbar-thin"
          />

          <button
            type="button"
            onClick={handleVoiceCommand}
            className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-all flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-sm shadow-red-500/30'
                : 'text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
            title={isListening ? 'Listening... Click to stop' : 'Voice Command: Speak your edit request'}
          >
            {isListening ? (
              <MicOff className="w-3.5 h-3.5 animate-bounce" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={!chatInput.trim() || isUpdating}
          className="px-4 py-2.5 h-[40px] rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300 disabled:opacity-40 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-500/20 active:scale-95 flex-shrink-0"
          title="Send edit request (Enter)"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
