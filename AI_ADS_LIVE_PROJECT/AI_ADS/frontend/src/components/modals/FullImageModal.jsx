import React, { useEffect } from 'react';
import { X, ArrowLeft, Download, Copy, Check } from 'lucide-react';
import { downloadImageToDevice } from '../../utils/downloadHelper';

export const FullImageModal = ({ imageUrl, title = '', brandName = '', onClose }) => {
  const [downloaded, setDownloaded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  const handleDownload = async () => {
    const cleanName = (title || 'image').replace(/[^a-z0-9_\- ]/gi, '_').slice(0, 60);
    await downloadImageToDevice(imageUrl, `${cleanName}.jpg`, { brandName });
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-200 select-none overflow-hidden"
      onClick={onClose}
    >
      {/* Top Header Controls Bar */}
      <div 
        className="w-full max-w-6xl flex items-center justify-between z-10 pt-2 pb-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-105 active:scale-95 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>

        {title && (
          <div className="hidden sm:flex flex-col items-center text-center px-4">
            <h3 className="text-sm font-extrabold text-white line-clamp-1 max-w-md">{title}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Resolution Preview</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95"
          title="Close Full Preview (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Image Container */}
      <div 
        className="relative flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden my-auto p-2"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title || 'Full Resolution Image'}
          className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 duration-200 cursor-default"
        />
      </div>

      {/* Bottom Actions Bar */}
      <div 
        className="w-full max-w-xl flex items-center justify-center gap-3 z-10 pb-2"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleCopyLink}
          className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Link Copied!' : 'Copy Image Link'}</span>
        </button>

        <button
          onClick={handleDownload}
          className="btn-primary px-6 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          {downloaded ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
          <span>{downloaded ? 'Downloaded to Device!' : 'Download Full Image'}</span>
        </button>
      </div>
    </div>
  );
};

export default FullImageModal;
