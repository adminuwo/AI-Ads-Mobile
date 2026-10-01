import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2, Sparkles, X, ArrowRight } from 'lucide-react';

export const CustomPopupModal = ({ alertState, onClose }) => {
  if (!alertState || !alertState.isOpen) return null;

  const {
    title = 'Notice',
    message = '',
    type = 'warning', // 'warning' | 'error' | 'success' | 'info'
    confirmText = 'OK',
    cancelText = null,
    onConfirm = null,
    onCancel = null
  } = alertState;

  const handleConfirm = () => {
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel && typeof onCancel === 'function') {
      onCancel();
    }
    onClose();
  };

  const configMap = {
    warning: {
      icon: <ShieldAlert className="w-8 h-8 text-amber-400" />,
      iconBg: 'bg-amber-500/10 border-amber-500/30',
      border: 'border-amber-500/40',
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      btn: 'from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/25',
      defaultTitle: 'Workspace Limit Reached'
    },
    error: {
      icon: <AlertCircle className="w-8 h-8 text-rose-400" />,
      iconBg: 'bg-rose-500/10 border-rose-500/30',
      border: 'border-rose-500/40',
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      btn: 'from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-500/25',
      defaultTitle: 'Action Required'
    },
    success: {
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" />,
      iconBg: 'bg-emerald-500/10 border-emerald-500/30',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      btn: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25',
      defaultTitle: 'Success'
    },
    info: {
      icon: <Sparkles className="w-8 h-8 text-brand-400" />,
      iconBg: 'bg-brand-500/10 border-brand-500/30',
      border: 'border-brand-500/40',
      badge: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
      btn: 'from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-brand-500/25',
      defaultTitle: 'AISA™ Intelligence'
    }
  };

  const styleConfig = configMap[type] || configMap.warning;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-md p-6 rounded-3xl bg-slate-900 border ${styleConfig.border} shadow-2xl shadow-black/80 space-y-5 text-center overflow-hidden animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="pt-2 flex flex-col items-center space-y-3">
          <div className={`w-16 h-16 rounded-2xl ${styleConfig.iconBg} border flex items-center justify-center shadow-inner`}>
            {styleConfig.icon}
          </div>
          <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styleConfig.badge}`}>
            {type.toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
            {title || styleConfig.defaultTitle}
          </h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          {cancelText && (
            <button
              onClick={handleCancel}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer border border-slate-700"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r ${styleConfig.btn} text-white font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer`}
          >
            {confirmText}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
