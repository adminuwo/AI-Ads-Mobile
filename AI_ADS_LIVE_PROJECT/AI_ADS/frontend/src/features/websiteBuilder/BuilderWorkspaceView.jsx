import React, { useState } from 'react';
import { API_BASE } from '../../config/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Share2,
  Download,
  Rocket,
  MoreVertical,
  FileText,
  CheckCircle2,
  Code2,
  Copy,
  Settings as SettingsIcon,
  Clock,
  Layers,
  Sparkles,
  Eye,
  X,
  Palette,
  Layout,
  Sun,
  Moon,
  ChevronRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

import { WebsitePreviewEngine } from './WebsitePreviewEngine';
import { ConversationalChatDrawer } from './ConversationalChatDrawer';

export const BuilderWorkspaceView = ({
  projectData,
  onBackToProjects,
  onSendChatEdit,
  isUpdatingChat,
  chatMessages = []
}) => {
  const { theme, toggleTheme } = useWorkspace();

  // Mode: 'preview' | 'code'
  const [workspaceMode, setWorkspaceMode] = useState('preview');
  const [filesMap, setFilesMap] = useState({});
  const [selectedFile, setSelectedFile] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);

  // Viewport Switcher: 'desktop' | 'tablet' | 'mobile'
  const [deviceViewport, setDeviceViewport] = useState('desktop');

  // Optional Collapsible Structure / Inspect Panel (Default: CLOSED)
  const [isStructureOpen, setIsStructureOpen] = useState(false);
  const [structureTab, setStructureTab] = useState('pages'); // 'pages' | 'components' | 'theme'

  // Visual Inspect / Select Mode
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);

  // Right Assistant Visibility Toggle
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);

  // More Menu & Toast State
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activePageIndex, setActivePageIndex] = useState(0);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const website = projectData?.website || {};
  const blueprint = projectData?.blueprint || {};
  const requirement = projectData?.requirement || {};

  const projectId = projectData?.projectId || projectData?._id || website?.websiteId;

  const projectTitle =
    projectData?.title ||
    website?.websiteIdentity?.title ||
    blueprint?.websiteIdentity?.title ||
    requirement?.businessType ||
    'AI Generated Web Application';

  // Fetch Project Source Files for In-Browser Code Viewer
  const fetchProjectFiles = async () => {
    if (!projectId) return;
    setLoadingFiles(true);
    try {
      const res = await fetch(`${API_BASE}/website-builder/projects/${projectId}/files`);
      const data = await res.json();
      if (data.success && data.files) {
        setFilesMap(data.files);
        const keys = Object.keys(data.files);
        if (keys.length > 0 && !selectedFile) {
          const defaultKey = keys.find(k => k.includes('App.jsx')) || keys.find(k => k.includes('package.json')) || keys[0];
          setSelectedFile(defaultKey);
        }
      }
    } catch (e) {
      console.error('Failed to load project files', e);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Download ZIP Archive
  const handleDownloadZip = () => {
    if (!projectId) {
      triggerToast('Project ID not found');
      return;
    }
    triggerToast('Packaging project into ZIP file...');
    const downloadUrl = `${API_BASE}/website-builder/projects/${projectId}/export-zip`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-source-code.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => triggerToast('Project source code ZIP downloaded!'), 1200);
  };

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    if (!selectedFile || !filesMap[selectedFile]) return;
    navigator.clipboard.writeText(filesMap[selectedFile]);
    setCopiedFile(true);
    triggerToast(`Copied ${selectedFile} to clipboard!`);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  // Open Live Sandbox in New Tab
  const handleOpenSandbox = async () => {
    let sandboxUrl = projectData?.runtime?.previewUrl
      ? `${API_BASE.replace(/\/api$/, '')}${projectData.runtime.previewUrl}`
      : (projectData?.runtime?.url || website?.runtime?.url);

    triggerToast('Opening live website in new tab...');

    const isProductionHost = typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1';

    if (projectId && (isProductionHost || !sandboxUrl || sandboxUrl.includes('127.0.0.1'))) {
      sandboxUrl = `${API_BASE}/website-builder/projects/${projectId}/preview/index.html`;
    }

    if (sandboxUrl) {
      window.open(sandboxUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`${API_BASE}/website-builder/projects/${projectId}/preview/index.html`, '_blank', 'noopener,noreferrer');
    }
  };

  const pages = blueprint?.pages || [
    { title: 'Home Page', path: '/' },
    { title: 'About Us', path: '/about' },
    { title: 'Services & Products', path: '/services' },
    { title: 'Pricing & Plans', path: '/pricing' },
    { title: 'Contact & Inquiry', path: '/contact' }
  ];

  const componentsList = [
    { name: 'Navbar', type: 'Header Navigation', section: 'Navigation' },
    { name: 'HeroSection', type: 'High-Impact Headline', section: 'Hero' },
    { name: 'FeatureGrid', type: 'Core Value Props', section: 'Features' },
    { name: 'ProductCatalog', type: 'Interactive Showcase', section: 'Catalog' },
    { name: 'Testimonials', type: 'Social Proof', section: 'Reviews' },
    { name: 'CallToAction', type: 'Conversion Banner', section: 'CTA' },
    { name: 'Footer', type: 'Links & Legal', section: 'Footer' }
  ];

  const designTokens = blueprint?.designSpec || {
    primaryColor: '#6366F1',
    fontPairing: 'Plus Jakarta Sans + Outfit',
    themeMode: 'Modern Clean',
    spacing: '16px / 24px',
    borderRadius: '16px'
  };

  const handleSelectElement = (elem) => {
    setSelectedElement(elem);
    triggerToast(`Selected: ${elem.name} for AI editing`);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8F9FD] dark:bg-[#070A11] text-slate-900 dark:text-slate-100 overflow-hidden select-none">
      {/* ── TOP TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. COMPACT TOP PROJECT TOOLBAR ── */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md px-4 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Back to Projects & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToProjects}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all group"
            title="Return to Projects repository"
          >
            <ArrowLeft className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Projects</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2 truncate max-w-xs md:max-w-md">
            <span className="font-black text-sm text-slate-900 dark:text-white truncate">
              {projectTitle}
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Saved
            </span>
          </div>
        </div>

        {/* Center: Workspace Mode Switcher (Preview | Code) & Responsive Devices */}
        <div className="flex items-center gap-3">
          {/* Preview vs Code Toggle (Lovable Style) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setWorkspaceMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                workspaceMode === 'preview'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => {
                setWorkspaceMode('code');
                fetchProjectFiles();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                workspaceMode === 'code'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Code</span>
            </button>
          </div>

          {/* Viewport Switcher (Only in Preview Mode) */}
          {workspaceMode === 'preview' && (
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeviceViewport('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  deviceViewport === 'desktop'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px]">Desktop</span>
              </button>
              <button
                onClick={() => setDeviceViewport('tablet')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  deviceViewport === 'tablet'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="text-[11px]">Tablet</span>
              </button>
              <button
                onClick={() => setDeviceViewport('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  deviceViewport === 'mobile'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Mobile</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Structure, Theme, Download ZIP & Live View Actions */}
        <div className="flex items-center gap-2">
          {/* Open in New Tab Button */}
          <button
            onClick={handleOpenSandbox}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all"
            title="Open Live Sandbox in New Browser Tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Live View</span>
          </button>

          {/* Download ZIP Button */}
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold shadow-md shadow-brand-500/20 transition-all active:scale-95"
            title="Download Complete Source Code as ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP</span>
          </button>

          {/* THEME TOGGLE: ☀ Light | ◐ Dark */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => {
                if (theme === 'dark') toggleTheme();
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                theme !== 'dark'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Light Mode"
            >
              <Sun className="w-3 h-3 text-amber-500" />
            </button>
            <button
              onClick={() => {
                if (theme !== 'dark') toggleTheme();
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3 h-3 text-brand-400" />
            </button>
          </div>

          {/* Toggle Assistant Drawer Button */}
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              isAssistantOpen
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
            }`}
            title={isAssistantOpen ? 'Collapse AI Assistant' : 'Open AI Assistant'}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── 2. MAIN WORKSPACE BODY ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── CENTER PANE: PREVIEW OR CODE VIEWER ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#EEF2F6] dark:bg-[#070A11] relative">
          {workspaceMode === 'preview' ? (
            /* PREVIEW CANVAS */
            <div className="flex-1 overflow-y-auto p-2 md:p-4 flex items-center justify-center">
              <div
                className={`h-full transition-all duration-300 mx-auto flex flex-col justify-center ${
                  deviceViewport === 'mobile'
                    ? 'w-[375px] max-w-full'
                    : deviceViewport === 'tablet'
                    ? 'w-[768px] max-w-full'
                    : 'w-full'
                }`}
              >
                <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
                  <WebsitePreviewEngine
                    website={website}
                    blueprint={blueprint}
                    phaseState="PHASE_4_COMPLETE"
                    progressStep={6}
                    errorMsg=""
                    onReset={onBackToProjects}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* IN-BROWSER CODE VIEWER (LOVABLE STYLE) */
            <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#0B0F19]">
              {/* File Explorer Tree */}
              <div className="w-64 md:w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 bg-slate-50/60 dark:bg-slate-950/40">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>Project Files</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {Object.keys(filesMap).length} files
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {loadingFiles ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-medium">Loading project files...</div>
                  ) : Object.keys(filesMap).length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-medium">No files available</div>
                  ) : (
                    Object.keys(filesMap).map((filePath) => {
                      const isSelected = selectedFile === filePath;
                      return (
                        <button
                          key={filePath}
                          onClick={() => setSelectedFile(filePath)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 truncate ${
                            isSelected
                              ? 'bg-brand-600 text-white font-bold shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          <Code2 className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{filePath}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Code Content & Action Header */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
                {/* Code Header Bar */}
                <div className="h-11 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/90 flex-shrink-0">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-brand-400" />
                    <span>{selectedFile || 'Select a file'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                      title="Copy file contents"
                    >
                      {copiedFile ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                      <span>{copiedFile ? 'Copied' : 'Copy Code'}</span>
                    </button>
                    <button
                      onClick={handleDownloadZip}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm"
                      title="Download full project ZIP"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download ZIP</span>
                    </button>
                  </div>
                </div>

                {/* Code Editor Body with Line Numbers */}
                <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed select-text bg-[#090D16]">
                  {selectedFile && filesMap[selectedFile] ? (
                    <pre className="text-slate-200">
                      <code>{filesMap[selectedFile]}</code>
                    </pre>
                  ) : (
                    <div className="text-slate-500 text-center py-20">Select a file from the explorer to view code.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT PANE: AI ADS™ ASSISTANT (PRIMARY EDITING INTERFACE) ── */}
        {isAssistantOpen && (
          <aside className="w-80 lg:w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] flex flex-col flex-shrink-0 z-20 animate-in slide-in-from-right duration-200">
            <ConversationalChatDrawer
              onSendChatEdit={onSendChatEdit}
              isUpdating={isUpdatingChat}
              messages={chatMessages}
              selectedElement={selectedElement}
              onClearSelectedElement={() => setSelectedElement(null)}
              projectData={projectData}
            />
          </aside>
        )}
      </div>
    </div>
  );
};
