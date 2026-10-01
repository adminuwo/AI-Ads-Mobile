import React from 'react';
import { CheckCircle2, Sparkles, AlertCircle, X } from 'lucide-react';

export const CustomToastContainer = ({ toastState, onClose }) => {
  if (!toastState || !toastState.isVisible) return null;

  const { text = '', type = 'success' } = toastState;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-brand-500/40 text-white shadow-2xl backdrop-blur-lg animate-in slide-in-from-bottom-5 duration-200">
      {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
      {type === 'info' && <Sparkles className="w-5 h-5 text-brand-400 flex-shrink-0" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
      <span className="text-xs font-bold text-slate-100">{text}</span>
      <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors ml-2 cursor-pointer">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
