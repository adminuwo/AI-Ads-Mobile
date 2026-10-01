import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Image as ImageIcon,
  Sparkles,
  Eye,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Layers,
  Wand2
} from 'lucide-react';

export const VisualAssetsPreviewCard = ({
  assets = [],
  websiteTitle = 'Your Website',
  businessType = 'Custom Application'
}) => {
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  React.useEffect(() => {
    if (showDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDetailsModal]);

  if (!Array.isArray(assets) || assets.length === 0) {
    return null;
  }

  const previewLimit = 5;
  const visibleAssets = assets.slice(0, previewLimit);
  const remainingCount = Math.max(0, assets.length - previewLimit);

  const activeModalAsset = selectedAssetIndex !== null ? assets[selectedAssetIndex] : (assets[0] || null);

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedAssetIndex((prev) => (prev > 0 ? prev - 1 : assets.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedAssetIndex((prev) => (prev < assets.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      {/* ── LOVABLE-GRADE VISUAL ASSETS CARD ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md p-3.5 space-y-3 transition-all hover:shadow-lg relative overflow-hidden">
        {/* Panch Tattva Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] panch-tattva-ribbon" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                  Generated Visual Assets
                </h4>
                <div className="flex items-center gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {assets.length} studio-grade prompt assets created
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetailsModal(true)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Bookmark / View Specs"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* 2x3 Image Grid */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          {visibleAssets.map((asset, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedAssetIndex(idx);
                setShowDetailsModal(true);
              }}
              className="group relative aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer border border-slate-200/60 dark:border-slate-800 hover:border-brand-500 transition-all"
            >
              <img
                src={asset.imageUrl}
                alt={asset.context || `Asset ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <span className="text-[9px] font-bold text-white truncate">
                  {asset.type || 'Asset'}
                </span>
              </div>
            </div>
          ))}

          {/* +N More Tile */}
          {remainingCount > 0 && (
            <div
              onClick={() => {
                setSelectedAssetIndex(previewLimit);
                setShowDetailsModal(true);
              }}
              className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-750 transition-all"
            >
              <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                +{remainingCount}
              </span>
              <span className="text-[9px] font-bold text-slate-500">More</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              setSelectedAssetIndex(0);
              setShowDetailsModal(true);
            }}
            className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all text-center"
          >
            Details
          </button>
          <div className="flex-1 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-extrabold text-center border border-brand-500/20 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span>Previewing</span>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX / DETAILS MODAL (MOUNTED TO BODY VIA PORTAL) ── */}
      {showDetailsModal && activeModalAsset && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in"
          onClick={() => setShowDetailsModal(false)}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] my-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0 animate-in zoom-in-95 duration-200 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {activeModalAsset.context || 'Visual Asset Specification'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Asset {(selectedAssetIndex ?? 0) + 1} of {assets.length} • {activeModalAsset.type || 'Showcase'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content - ONLY THIS SCROLLS ON MOUSE WHEEL */}
            <div
              className="flex-1 overflow-y-auto scrollbar-thin"
              onWheel={(e) => e.stopPropagation()}
            >
              {/* Main Visual Image with Navigation Arrows */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
                <img
                  src={activeModalAsset.imageUrl}
                  alt={activeModalAsset.context}
                  className="w-full h-full object-cover"
                />

                {/* Prev / Next Controls */}
                {assets.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Bottom tag */}
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-bold backdrop-blur-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Validated & Approved</span>
                </div>
              </div>

              {/* Spec Details */}
              <div className="p-6 space-y-4 text-xs">
                {/* Generation Prompt */}
                {activeModalAsset.prompt && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Photographic Generation Prompt
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-mono text-[11px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                      "{activeModalAsset.prompt}"
                    </p>
                  </div>
                )}

                {/* Negative Elements / Must Not Appear */}
                {Array.isArray(activeModalAsset.mustNotAppear) && activeModalAsset.mustNotAppear.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400">
                      Forbidden Subjects (Must Not Appear)
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {activeModalAsset.mustNotAppear.map((neg, nIdx) => (
                        <span
                          key={nIdx}
                          className="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20"
                        >
                          ✕ {neg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Page & Location */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Target Page</span>
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {activeModalAsset.page || 'Home'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Resolution Mode</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Dynamic Semantic Synthesis</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal Actions */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
              <a
                href={activeModalAsset.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>Open high-res original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-black transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
