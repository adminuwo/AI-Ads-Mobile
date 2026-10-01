import React, { useState } from 'react';
import {
  HelpCircle,
  ArrowRight,
  SkipForward,
  Check,
  Palette,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus
} from 'lucide-react';

export const ClarificationCard = ({ questions = [], onComplete, onSkip }) => {
  const [answers, setAnswers] = useState({});
  const [customColor, setCustomColor] = useState('#6366F1');
  const [colorTextInput, setColorTextInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const handleSelectOption = (qKey, option) => {
    setAnswers((prev) => ({ ...prev, [qKey]: option }));
  };

  const handleColorSelect = (colorHex) => {
    setCustomColor(colorHex);
    setColorTextInput(colorHex);
    setAnswers((prev) => ({
      ...prev,
      customBrandColor: colorHex
    }));
  };

  const handleColorTextChange = (text) => {
    setColorTextInput(text);
    if (text.startsWith('#') && (text.length === 4 || text.length === 7)) {
      setCustomColor(text);
    }
    setAnswers((prev) => ({
      ...prev,
      customBrandColor: text
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const base64Url = uploadEvt.target.result;
        const newImg = { id: `img_${Date.now()}_${Math.random()}`, name: file.name, url: base64Url };
        setUploadedImages((prev) => {
          const updated = [...prev, newImg];
          setAnswers((aPrev) => ({ ...aPrev, uploadedImages: updated }));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const newImg = { id: `img_${Date.now()}`, name: 'External Image URL', url: imageUrlInput.trim() };
    const updated = [...uploadedImages, newImg];
    setUploadedImages(updated);
    setAnswers((prev) => ({ ...prev, uploadedImages: updated }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (imgId) => {
    const updated = uploadedImages.filter((img) => img.id !== imgId);
    setUploadedImages(updated);
    setAnswers((prev) => ({ ...prev, uploadedImages: updated }));
  };

  const handleFinish = () => {
    onComplete(answers);
  };

  const answeredCount = Object.keys(answers).filter((k) => Boolean(answers[k])).length;

  const colorSwatches = [
    '#6366F1', '#EC4899', '#10B981', '#F59E0B',
    '#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4',
    '#111827', '#F97316'
  ];

  return (
    <div className="max-w-2xl w-full mx-auto max-h-[88vh] my-auto flex flex-col rounded-3xl bg-slate-900/95 dark:bg-slate-950/95 border border-slate-800 shadow-2xl text-white animate-in fade-in zoom-in-95 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-6 flex-shrink-0 bg-slate-900 dark:bg-slate-950 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-inner">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">Got it. Before I start building...</h3>
            <p className="text-xs text-slate-400 font-medium">AI Ads™ has a few quick questions to personalize your design.</p>
          </div>
        </div>
        <button
          onClick={onSkip}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 border border-slate-700"
        >
          <SkipForward className="w-3.5 h-3.5" /> Skip Questions
        </button>
      </div>

      {/* Questions Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {questions.map((q, idx) => {
          const qKey = q.id || q.question || `q_${idx}`;
          const currentAnswer = answers[qKey];
          const isColorQuestion = (q.question || '').toLowerCase().includes('color') || qKey.toLowerCase().includes('color');
          const isImageQuestion = (q.question || '').toLowerCase().includes('logo') || (q.question || '').toLowerCase().includes('imager') || (q.question || '').toLowerCase().includes('image');

          const showColorInput = isColorQuestion && currentAnswer && currentAnswer.toLowerCase().includes('i have brand colors');
          const showImageInput = isImageQuestion && currentAnswer && currentAnswer.toLowerCase().includes('upload');

          return (
            <div key={qKey} className="space-y-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 transition-all">
              <label className="text-xs font-extrabold text-slate-200 block">
                {idx + 1}. {q.question}
              </label>

              {/* Options */}
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = currentAnswer === opt;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(qKey, opt)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-2 active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 border-brand-400 text-white shadow-lg shadow-brand-500/30 scale-[1.02]'
                          : 'bg-slate-800/90 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* DYNAMIC SUB-INPUT 1: BRAND COLOR INPUT BOX */}
              {showColorInput && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-950/80 border border-brand-500/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-brand-400">
                    <Palette className="w-4 h-4 text-brand-400" />
                    <span>Specify Your Brand Colors</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => handleColorSelect(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        title="Pick Color"
                      />
                      <span className="text-xs font-mono font-extrabold text-slate-200">{customColor.toUpperCase()}</span>
                    </div>

                    <input
                      type="text"
                      value={colorTextInput}
                      onChange={(e) => handleColorTextChange(e.target.value)}
                      placeholder="e.g. #FF5733, Emerald Green & Gold"
                      className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 mr-1">Quick Swatches:</span>
                    {colorSwatches.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => handleColorSelect(hex)}
                        className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* DYNAMIC SUB-INPUT 2: IMAGE UPLOAD BOX */}
              {showImageInput && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-950/80 border border-brand-500/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-brand-400">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-brand-400" />
                      <span>Upload Logos or Brand Imagery</span>
                    </div>
                    {uploadedImages.length > 0 && (
                      <span className="text-[10px] text-slate-400">{uploadedImages.length} file(s) attached</span>
                    )}
                  </div>

                  {/* Drag-and-drop File Upload Zone */}
                  <div className="relative border-2 border-dashed border-slate-800 hover:border-brand-500/50 rounded-2xl p-4 text-center bg-slate-900/60 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-200">
                        Click to browse or drag &amp; drop images
                      </p>
                      <p className="text-[10px] text-slate-500">PNG, JPG, SVG, WebP supported</p>
                    </div>
                  </div>

                  {/* External URL alternative */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                      placeholder="Or paste image URL (e.g. https://mybrand.com/logo.png)..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!imageUrlInput.trim()}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-200 flex items-center gap-1 border border-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  {/* Thumbnail Previews */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {uploadedImages.map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden group">
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            className="absolute top-1 right-1 p-1 rounded-lg bg-black/70 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-800 flex-shrink-0 bg-slate-900 dark:bg-slate-950 z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[11px] text-slate-400 font-medium">You can skip at any time and let AI choose defaults.</span>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Skip &amp; Build
          </button>
          <button
            onClick={handleFinish}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition-all"
          >
            <span>Start Building {answeredCount > 0 ? `(${answeredCount}/${questions.length})` : ''}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
