import React, { useState, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { websiteBuilderAPI } from '../../services/api';
import {
  Bot, Sparkles, Send, Loader2, CheckCircle2, ArrowRight, Layers,
  Layout, HelpCircle, Palette, FileText, CheckSquare, Sparkle, RefreshCw, Eye, AlertTriangle,
  UserCheck, Cpu, CreditCard, ShoppingCart, Lock, PlusCircle, Check,
  Edit2, Trash2, RotateCcw, ArrowUp, ArrowDown, Plus, X, Save, Edit3, Sliders, Settings
} from 'lucide-react';

import { WebsitePreviewEngine } from './WebsitePreviewEngine';
import { ConversationalBuilder } from './ConversationalBuilder';

const COMPONENT_LIBRARY = [
  { type: 'HeroSplit', label: 'Hero Split Banner', desc: 'Split hero section with headline, subheadline, and image' },
  { type: 'HeroBanner', label: 'Hero Full Banner', desc: 'Full width hero banner with background image & CTA' },
  { type: 'HeroMinimal', label: 'Hero Minimal', desc: 'Clean, typography-focused hero section' },
  { type: 'ItemCatalogGrid', label: 'Product / Item Catalog Grid', desc: 'Grid of products or catalog items with cards & pricing' },
  { type: 'RestaurantMenuCard', label: 'Restaurant Menu Highlights', desc: 'Menu categories, dish descriptions & prices' },
  { type: 'PortfolioGallery', label: 'Portfolio Gallery Grid', desc: 'Image gallery grid for creative works & projects' },
  { type: 'ServicesGrid', label: 'Services Grid', desc: 'Service offerings grid with icons & descriptions' },
  { type: 'PricingPlansGrid', label: 'Pricing Tiers Grid', desc: 'Tiered pricing plans & feature checklists' },
  { type: 'FeatureGrid', label: 'Feature Highlights Grid', desc: 'Key product or business feature cards' },
  { type: 'ProcessSteps', label: 'Step-by-Step Process Grid', desc: 'Numbered process steps or how it works' },
  { type: 'TestimonialsCarousel', label: 'Testimonials Carousel', desc: 'Customer reviews and social proof testimonials' },
  { type: 'BookingForm', label: 'Reservation & Booking Form', desc: 'Interactive booking and schedule inquiry form' },
  { type: 'ComparisonTable', label: 'Feature Comparison Table', desc: 'Detailed feature comparison rows & plans' },
  { type: 'GuideAccordion', label: 'FAQ Accordion Guide', desc: 'Collapsible frequently asked questions' },
  { type: 'ContactInquiryForm', label: 'Contact Inquiry Form', desc: 'Contact form with input fields' },
  { type: 'LocationHoursCard', label: 'Location & Operating Hours', desc: 'Physical address, map, and business hours' },
  { type: 'StatsCounter', label: 'Statistics Counter Grid', desc: 'Metrics, numbers, and impact statistics' },
  { type: 'AmenitiesGrid', label: 'Amenities & Property Highlights', desc: 'Resort or property features grid' },
  { type: 'TeamGrid', label: 'Team Members Showcase', desc: 'Team member photos, titles & bios' }
];

export const NewWebsiteView = () => {
  const { activeWorkspace } = useWorkspace();
  const [developerMode, setDeveloperMode] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  
  // Phase 2 Strategy & Overrides State
  const [initialAiRequirement, setInitialAiRequirement] = useState(null); // Pure snapshot of original AI output
  const [requirement, setRequirement] = useState(null); // Active working copy of strategy
  const [approvedFeatures, setApprovedFeatures] = useState([]);
  const [rejectedFeatures, setRejectedFeatures] = useState([]);
  const [editedRecommendations, setEditedRecommendations] = useState({}); // { [origName]: { customName, description, intent } }

  const [errorMsg, setErrorMsg] = useState('');
  const [inputValidationError, setInputValidationError] = useState('');
  const [answers, setAnswers] = useState({});

  const [blueprint, setBlueprint] = useState(null);
  const [generatingBlueprint, setGeneratingBlueprint] = useState(false);

  // Phase 4 Autonomous Website Generator States
  const [website, setWebsite] = useState(null);
  const [phaseState, setPhaseState] = useState('PHASE_3_BLUEPRINT_READY');
  const [progressStep, setProgressStep] = useState(1);

  // Phase Navigation State (1: Requirements, 2: Approval, 3: Blueprint, 4: Website Generation)
  const [activePhase, setActivePhase] = useState(1);
  const topContainerRef = useRef(null);

  // Modals & Editing Section Toggle States
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingDesign, setEditingDesign] = useState(false);
  const [newUserReqInput, setNewUserReqInput] = useState('');

  // Page Editing Modal State
  const [editingPageModal, setEditingPageModal] = useState(null); // null or { index, page }
  const [addingPageModal, setAddingPageModal] = useState(false);
  const [editingRecModal, setEditingRecModal] = useState(null); // null or { origName, customName, description, intent }

  if (!developerMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-slate-900/60 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" /> AI ADS™ Builder Mode Active
          </span>
          <button
            onClick={() => setDeveloperMode(true)}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] flex items-center gap-1 transition-all"
          >
            <Settings className="w-3 h-3 text-slate-400" /> Developer Mode
          </button>
        </div>
        <ConversationalBuilder developerMode={false} />
      </div>
    );
  }

  const scrollToTop = () => {
    if (topContainerRef.current) {
      topContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const switchPhase = (targetPhase) => {
    setActivePhase(targetPhase);
    setTimeout(scrollToTop, 50);
  };

  const handleAnalyze = async (customPrompt = null) => {
    const inputPrompt = customPrompt !== null ? customPrompt : prompt;
    const reqId = `wb_${Math.random().toString(36).substring(2, 8)}`;
    
    if (!inputPrompt || !inputPrompt.trim()) {
      setInputValidationError('Please enter your website requirement or pick a preset starter.');
      return;
    }

    console.log(`[WB:${reqId}] Analyze clicked. Prompt: "${inputPrompt.slice(0, 50)}..."`);

    // Wipe previous analysis state
    setInputValidationError('');
    setErrorMsg('');
    setRequirement(null);
    setInitialAiRequirement(null);
    setApprovedFeatures([]);
    setRejectedFeatures([]);
    setEditedRecommendations({});
    setBlueprint(null);
    setWebsite(null);
    setPhaseState('PHASE_3_BLUEPRINT_READY');
    setAnswers({});
    setAnalyzing(true);
    setEditingProfile(false);
    setEditingDesign(false);

    try {
      const res = await websiteBuilderAPI.analyzeRequirement({
        reqId,
        prompt: inputPrompt.trim(),
        brandContext: {
          brandName: activeWorkspace?.brandName || '',
          industryCategory: activeWorkspace?.industryCategory || '',
          targetAudience: activeWorkspace?.targetAudience || []
        }
      });

      if (res && res.success && res.requirement) {
        const source = res.requirement.analysisMetadata?.analysisSource || 'unknown';
        console.log(`[WB:${reqId}] Requirement analysis complete. Source: ${source}`);
        
        const reqSnapshot = JSON.parse(JSON.stringify(res.requirement));
        setInitialAiRequirement(reqSnapshot);
        setRequirement(res.requirement);
        setApprovedFeatures([]);
        switchPhase(2);
      } else {
        throw new Error(res?.error || 'Server did not return a valid requirement schema.');
      }
    } catch (err) {
      console.error(`[WB:${reqId}] Requirement analysis error:`, err.message);
      setErrorMsg(err.message || "Robert couldn't analyze your requirement. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // ----------------------------------------------------
  // BUSINESS PROFILE EDITING HANDLERS
  // ----------------------------------------------------
  const handleUpdateProfileField = (field, val) => {
    setRequirement(prev => ({ ...prev, [field]: val }));
  };

  const handleResetProfileField = (field) => {
    if (initialAiRequirement && initialAiRequirement[field] !== undefined) {
      setRequirement(prev => ({ ...prev, [field]: initialAiRequirement[field] }));
    }
  };

  // ----------------------------------------------------
  // DESIGN SYSTEM EDITING HANDLERS
  // ----------------------------------------------------
  const handleUpdateDesignField = (field, val) => {
    setRequirement(prev => ({
      ...prev,
      designPreferences: {
        ...(prev.designPreferences || {}),
        [field]: val
      }
    }));
  };

  const handleResetDesignField = (field) => {
    if (initialAiRequirement?.designPreferences?.[field] !== undefined) {
      setRequirement(prev => ({
        ...prev,
        designPreferences: {
          ...(prev.designPreferences || {}),
          [field]: initialAiRequirement.designPreferences[field]
        }
      }));
    }
  };

  // ----------------------------------------------------
  // USER REQUESTED SPECIFICATIONS HANDLERS
  // ----------------------------------------------------
  const handleAddUserRequirement = () => {
    if (!newUserReqInput || !newUserReqInput.trim()) return;
    const text = newUserReqInput.trim();
    setRequirement(prev => ({
      ...prev,
      userRequestedFeatures: [...(prev.userRequestedFeatures || []), text]
    }));
    setNewUserReqInput('');
  };

  const handleRemoveUserRequirement = (index) => {
    setRequirement(prev => ({
      ...prev,
      userRequestedFeatures: (prev.userRequestedFeatures || []).filter((_, i) => i !== index)
    }));
  };

  const handleEditUserRequirement = (index, newText) => {
    if (!newText || !newText.trim()) return;
    setRequirement(prev => {
      const copy = [...(prev.userRequestedFeatures || [])];
      copy[index] = newText.trim();
      return { ...prev, userRequestedFeatures: copy };
    });
  };

  // ----------------------------------------------------
  // AI RECOMMENDATIONS HANDLERS ([Accept], [Edit], [Reject])
  // ----------------------------------------------------
  const handleAcceptRecommendation = (recName) => {
    setRejectedFeatures(prev => prev.filter(r => r.toLowerCase() !== recName.toLowerCase()));
    if (!approvedFeatures.some(f => f.toLowerCase() === recName.toLowerCase())) {
      setApprovedFeatures(prev => [...prev, recName]);
    }
  };

  const handleRejectRecommendation = (recName) => {
    setApprovedFeatures(prev => prev.filter(f => f.toLowerCase() !== recName.toLowerCase()));
    if (!rejectedFeatures.some(r => r.toLowerCase() === recName.toLowerCase())) {
      setRejectedFeatures(prev => [...prev, recName]);
    }
  };

  const handleSaveEditedRecommendation = (origName, customName, description, intent) => {
    setEditedRecommendations(prev => ({
      ...prev,
      [origName]: { customName, description, intent }
    }));
    // Auto-accept the edited recommendation
    handleAcceptRecommendation(customName || origName);
    setEditingRecModal(null);
  };

  const handleResetRecommendation = (recName) => {
    setApprovedFeatures(prev => prev.filter(f => f.toLowerCase() !== recName.toLowerCase()));
    setRejectedFeatures(prev => prev.filter(r => r.toLowerCase() !== recName.toLowerCase()));
    setEditedRecommendations(prev => {
      const copy = { ...prev };
      delete copy[recName];
      return copy;
    });
  };

  // ----------------------------------------------------
  // PROPOSED PAGES & PAGE COMPONENTS REORDERING / EDITING
  // ----------------------------------------------------
  const handleMovePage = (index, direction) => {
    const pages = [...(requirement.proposedPages || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const temp = pages[index];
    pages[index] = pages[targetIdx];
    pages[targetIdx] = temp;
    setRequirement(prev => ({ ...prev, proposedPages: pages }));
  };

  const handleRemovePage = (index) => {
    const pages = (requirement.proposedPages || []).filter((_, i) => i !== index);
    setRequirement(prev => ({ ...prev, proposedPages: pages }));
  };

  const handleSavePageEdit = (index, updatedPage) => {
    const pages = [...(requirement.proposedPages || [])];
    pages[index] = updatedPage;
    setRequirement(prev => ({ ...prev, proposedPages: pages }));
    setEditingPageModal(null);
  };

  const handleCreateNewPage = (newPage) => {
    const pages = [...(requirement.proposedPages || []), newPage];
    setRequirement(prev => ({ ...prev, proposedPages: pages }));
    setAddingPageModal(false);
  };

  const handleResetPagesToAi = () => {
    if (initialAiRequirement?.proposedPages) {
      setRequirement(prev => ({
        ...prev,
        proposedPages: JSON.parse(JSON.stringify(initialAiRequirement.proposedPages))
      }));
    }
  };

  // ----------------------------------------------------
  // VALIDATION & PHASE 3 BLUEPRINT GENERATION
  // ----------------------------------------------------
  const validateFinalStrategy = () => {
    if (!requirement.proposedPages || requirement.proposedPages.length === 0) {
      return 'At least one page must exist in the strategy before generating a blueprint.';
    }
    const pageNames = requirement.proposedPages.map(p => (p.name || '').trim().toLowerCase());
    const uniqueNames = new Set(pageNames);
    if (uniqueNames.size !== pageNames.length) {
      return 'All page names must be unique.';
    }
    for (const page of requirement.proposedPages) {
      if (!page.name || !page.name.trim()) {
        return 'Every page must have a valid non-empty name.';
      }
      if (!page.purpose || !page.purpose.trim()) {
        return `Page "${page.name}" must have a valid purpose specified.`;
      }
    }
    if (!requirement.designPreferences?.theme || !requirement.designPreferences?.primaryColor) {
      return 'Design specification must contain a valid theme and primary color.';
    }
    return null;
  };

  const handleGenerateBlueprint = async () => {
    const valErr = validateFinalStrategy();
    if (valErr) {
      setErrorMsg(valErr);
      return;
    }

    setGeneratingBlueprint(true);
    setErrorMsg('');
    const reqId = `bp_${Math.random().toString(36).substring(2, 8)}`;

    // Calculate user overrides stats for final strategy contract
    const isProfileModified =
      requirement.industry !== initialAiRequirement?.industry ||
      requirement.businessType !== initialAiRequirement?.businessType ||
      requirement.websiteType !== initialAiRequirement?.websiteType ||
      requirement.uniqueValueProposition !== initialAiRequirement?.uniqueValueProposition ||
      requirement.primaryGoal !== initialAiRequirement?.primaryGoal;

    const isDesignModified =
      requirement.designPreferences?.theme !== initialAiRequirement?.designPreferences?.theme ||
      requirement.designPreferences?.primaryColor !== initialAiRequirement?.designPreferences?.primaryColor ||
      requirement.designPreferences?.secondaryColor !== initialAiRequirement?.designPreferences?.secondaryColor ||
      requirement.designPreferences?.typography !== initialAiRequirement?.designPreferences?.typography ||
      requirement.designPreferences?.visualTone !== initialAiRequirement?.designPreferences?.visualTone;

    const isPagesModified =
      JSON.stringify(requirement.proposedPages) !== JSON.stringify(initialAiRequirement?.proposedPages);

    const userOverridesCount =
      (isProfileModified ? 1 : 0) +
      (isDesignModified ? 1 : 0) +
      (isPagesModified ? 1 : 0) +
      rejectedFeatures.length +
      Object.keys(editedRecommendations).length;

    // Build normalized finalStrategy object
    const finalStrategy = {
      ...requirement,
      approvedRecommendations: approvedFeatures,
      rejectedRecommendations: rejectedFeatures,
      editedRecommendations,
      userOverrides: {
        editedBusinessProfile: isProfileModified,
        editedDesignPreferences: isDesignModified,
        editedPages: isPagesModified,
        userOverridesCount
      }
    };

    try {
      console.log(`[WB:${reqId}] Generating Phase 3 Blueprint with finalStrategy...`);
      const res = await websiteBuilderAPI.generateBlueprint({
        reqId,
        requirement: finalStrategy,
        approvedRecommendations: approvedFeatures
      });

      if (res && res.success && res.blueprint) {
        console.log(`[WB:${reqId}] Blueprint received. Blueprint ID: ${res.blueprint.blueprintId}`);
        setBlueprint(res.blueprint);
        switchPhase(3);
      } else {
        throw new Error(res?.error || 'Server failed to generate Website Blueprint.');
      }
    } catch (err) {
      console.error(`[WB:${reqId}] Blueprint generation error:`, err.message);
      setErrorMsg(err.message || 'Blueprint generation failed. Please try again.');
    } finally {
      setGeneratingBlueprint(false);
    }
  };

  const handleGenerateWebsite = async () => {
    if (!blueprint) return;
    setPhaseState('PHASE_4_GENERATING');
    setProgressStep(1);
    const reqId = `site_${Math.random().toString(36).substring(2, 8)}`;

    try {
      console.log(`[WB:${reqId}] Phase 4 Website Generation initiated...`);
      for (let s = 1; s <= 5; s++) {
        setProgressStep(s);
        await new Promise((r) => setTimeout(r, 400));
      }

      setPhaseState('PHASE_4_VALIDATING');
      setProgressStep(6);
      await new Promise((r) => setTimeout(r, 500));

      const res = await websiteBuilderAPI.generateWebsite({
        reqId,
        blueprint
      });

      if (res && res.success && res.website) {
        console.log(`[WB:${reqId}] Phase 4 Website generated. Status: ${res.website.validationResult?.status}`);
        setWebsite(res.website);
        setPhaseState('PHASE_4_COMPLETE');
      } else {
        throw new Error(res?.error || 'Server failed to generate website.');
      }
    } catch (err) {
      console.error(`[WB:${reqId}] Website Generation Error:`, err.message);
      setErrorMsg(err.message || 'Website generation failed. Please try again.');
      setPhaseState('PHASE_4_VALIDATION_FAILED');
    }
  };

  // Helper check if a section has user overrides
  const isProfileOverridden =
    initialAiRequirement && (
      requirement?.industry !== initialAiRequirement.industry ||
      requirement?.businessType !== initialAiRequirement.businessType ||
      requirement?.websiteType !== initialAiRequirement.websiteType ||
      requirement?.uniqueValueProposition !== initialAiRequirement.uniqueValueProposition ||
      requirement?.primaryGoal !== initialAiRequirement.primaryGoal
    );

  const isDesignOverridden =
    initialAiRequirement?.designPreferences && (
      requirement?.designPreferences?.theme !== initialAiRequirement.designPreferences.theme ||
      requirement?.designPreferences?.primaryColor !== initialAiRequirement.designPreferences.primaryColor ||
      requirement?.designPreferences?.secondaryColor !== initialAiRequirement.designPreferences.secondaryColor ||
      requirement?.designPreferences?.typography !== initialAiRequirement.designPreferences.typography ||
      requirement?.designPreferences?.visualTone !== initialAiRequirement.designPreferences.visualTone
    );

  const isPagesOverridden =
    initialAiRequirement?.proposedPages &&
    JSON.stringify(requirement?.proposedPages) !== JSON.stringify(initialAiRequirement.proposedPages);

  return (
    <div ref={topContainerRef} className="space-y-4">
      {/* ── STICKY PHASE NAVIGATION BAR (DEVELOPER MODE ACTIVE) ────────────────── */}
      <div className="sticky top-0 z-30 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeveloperMode(false)}
            className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all"
          >
            &larr; Conversational Mode
          </button>
          <button
            onClick={() => switchPhase(activePhase - 1)}
            disabled={activePhase <= 1}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all"
          >
            &larr; Previous
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => switchPhase(1)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all ${
              activePhase === 1
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {requirement ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-brand-400" />}
            Phase 1: Requirements
          </button>

          <button
            onClick={() => requirement && switchPhase(2)}
            disabled={!requirement}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all ${
              !requirement
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 text-slate-400'
                : activePhase === 2
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {blueprint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-yellow-400" />}
            Phase 2: Approval & Overrides
          </button>

          <button
            onClick={() => requirement && switchPhase(3)}
            disabled={!requirement}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all ${
              !requirement
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 text-slate-400'
                : activePhase === 3
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {website ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-indigo-400" />}
            Phase 3: Blueprint
          </button>

          <button
            onClick={() => blueprint && switchPhase(4)}
            disabled={!blueprint}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all ${
              !blueprint
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 text-slate-400'
                : activePhase === 4
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {website ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
            Phase 4: Website Generation
          </button>
        </div>

        <button
          onClick={() => {
            if (activePhase === 1 && requirement) switchPhase(2);
            else if (activePhase === 2 && requirement) switchPhase(3);
            else if (activePhase === 3 && blueprint) switchPhase(4);
          }}
          disabled={
            (activePhase === 1 && !requirement) ||
            (activePhase === 2 && !requirement) ||
            (activePhase === 3 && !blueprint) ||
            activePhase === 4
          }
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all"
        >
          Next &rarr;
        </button>
      </div>

      {/* ── PHASE 1: REQUIREMENTS INPUT ─────────────────────────────────────── */}
      {activePhase === 1 && (
        <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Phase 1 — Robert 👋 • Requirement Engine</h3>
              <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Generative AI Architecture Active
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium space-y-2">
            <p className="font-bold text-slate-900 dark:text-white">Describe your website vision...</p>
            <p>Enter any natural-language requirement. AI will perform semantic analysis and extract structured specifications.</p>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Popular Industry Presets:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { label: '💅 Press-On Nail Store', text: 'Create an e-commerce website for a press-on nail fashion store called VelvetClaws.' },
                { label: '🍕 Italian Restaurant', text: 'Create a website for an Italian restaurant called Bella Roma.' },
                { label: '📸 Wedding Photographer', text: 'Create a website for a wedding photographer called Alex Weddings.' },
                { label: '📊 AI Accounting SaaS', text: 'Create a website for an AI accounting SaaS called LedgerAI.' },
                { label: '🌿 Luxury Resort', text: 'Create a website for a luxury resort called Casa Verde.' },
                { label: '📐 Modern Architecture', text: 'Create a website for a modern architecture studio called Vanguard Architects.' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(chip.text);
                    handleAnalyze(chip.text);
                  }}
                  className="p-3 accent-card rounded-2xl bg-white dark:bg-slate-900 hover:border-brand-500 text-left transition-all text-xs space-y-0.5 shadow-xs"
                >
                  <span className="block font-extrabold">{chip.label}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-2">{chip.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Custom Requirement Prompt:</label>
            <textarea
              rows="4"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (inputValidationError) setInputValidationError('');
              }}
              placeholder="e.g., 'Create a website for a premium car dealership with test drive booking...'..."
              className={`w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 ${
                inputValidationError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              } focus:border-brand-500 text-xs text-slate-900 dark:text-white font-medium focus:outline-none placeholder:text-slate-400 leading-relaxed`}
            />
            {inputValidationError && (
              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {inputValidationError}
              </p>
            )}
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={analyzing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300 text-white font-extrabold text-xs shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
            {analyzing ? 'Analyzing via LLM Reasoning...' : 'Analyze Requirement Specification &rarr;'}
          </button>

          {requirement && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Requirement Analysis Ready ({requirement.businessType})
              </div>
              <button
                onClick={() => switchPhase(2)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow"
              >
                Proceed to Phase 2 Approval &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── PHASE 2: REQUIREMENT SPECIFICATION APPROVAL & USER OVERRIDES ─────── */}
      {activePhase === 2 && (
        <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-6 bg-slate-950/95 text-slate-100 animate-fadeIn">
          {analyzing ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-400 mx-auto" />
              <h4 className="text-sm font-extrabold text-white">Robert LLM is analyzing requirements...</h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                Executing semantic domain reasoning & extracting structured specifications.
              </p>
            </div>
          ) : errorMsg ? (
            <div className="py-12 text-center space-y-4 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
              <h4 className="text-sm font-extrabold text-white">Analysis or Validation Error</h4>
              <p className="text-xs text-rose-300 max-w-md mx-auto font-medium">{errorMsg}</p>
              <button
                onClick={() => handleAnalyze()}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retry Analysis
              </button>
            </div>
          ) : !requirement ? (
            <div className="py-24 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-extrabold text-white">No Requirement Analyzed Yet</h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                Please enter a website description in Phase 1 first.
              </p>
              <button
                onClick={() => switchPhase(1)}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Go to Phase 1 Requirements &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <div>
                    <span className="text-sm font-extrabold text-white block">Phase 2 — Strategy Approval & User Control</span>
                    <span className="text-[10px] text-slate-400 font-medium">Review AI Strategy • Make targeted edits • User decisions take priority</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isProfileOverridden || isDesignOverridden || isPagesOverridden || rejectedFeatures.length > 0 || Object.keys(editedRecommendations).length > 0 ? (
                    <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/40 flex items-center gap-1">
                      ✏️ User Overrides Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/40 flex items-center gap-1">
                      🤖 Original AI Strategy
                    </span>
                  )}
                </div>
              </div>

              {/* USER INTENT UNDERSTANDING CARD */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 border border-brand-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-extrabold text-white">AI Prompt Intent Analysis & Decision Attribution</span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    requirement.userIntent?.specificityLevel === 'HIGH'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : requirement.userIntent?.specificityLevel === 'LOW'
                      ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    {requirement.userIntent?.specificityLevel === 'HIGH' ? '🎯 High Specificity Prompt' : requirement.userIntent?.specificityLevel === 'LOW' ? '🎨 Creative Discovery (Low Specificity)' : '🔍 Medium Specificity Topic'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Identified Domain</span>
                    <p className="font-extrabold text-indigo-300">{requirement.userIntent?.domain || requirement.industry}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Type: {requirement.businessType}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Explicit User Requirements</span>
                    {requirement.userIntent?.explicitRequirements && requirement.userIntent.explicitRequirements.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {requirement.userIntent.explicitRequirements.map((req, idx) => (
                          <span key={idx} className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            ✓ {req}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">None explicitly given (AI creative reasoning active)</p>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Decision Origin Attribution</span>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Primary Color Origin:</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                          requirement.designPreferences?.sources?.primaryColor === 'user_explicit'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {requirement.designPreferences?.sources?.primaryColor === 'user_explicit' ? 'User Explicit' : 'Semantic Inference'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Theme Style Origin:</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                          requirement.designPreferences?.sources?.theme === 'user_explicit'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {requirement.designPreferences?.sources?.theme === 'user_explicit' ? 'User Explicit' : 'Semantic Inference'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. BUSINESS PROFILE EDITING */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">1. Business Profile & Website Strategy</span>
                    {isProfileOverridden && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">User Override</span>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Edit2 className="w-3 h-3" /> {editingProfile ? 'Close Editor' : 'Edit Profile'}
                  </button>
                </div>

                {editingProfile ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-slate-400 font-bold">Industry</label>
                          <button
                            onClick={() => handleResetProfileField('industry')}
                            className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                            title="Reset to AI"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                        <input
                          type="text"
                          value={requirement.industry || ''}
                          onChange={(e) => handleUpdateProfileField('industry', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-slate-400 font-bold">Business Type</label>
                          <button
                            onClick={() => handleResetProfileField('businessType')}
                            className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                            title="Reset to AI"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                        <input
                          type="text"
                          value={requirement.businessType || ''}
                          onChange={(e) => handleUpdateProfileField('businessType', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-slate-400 font-bold">Website Type</label>
                          <button
                            onClick={() => handleResetProfileField('websiteType')}
                            className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                            title="Reset to AI"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                        <input
                          type="text"
                          value={requirement.websiteType || ''}
                          onChange={(e) => handleUpdateProfileField('websiteType', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-400 font-bold">Unique Value Proposition</label>
                        <button
                          onClick={() => handleResetProfileField('uniqueValueProposition')}
                          className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> Reset
                        </button>
                      </div>
                      <input
                        type="text"
                        value={requirement.uniqueValueProposition || ''}
                        onChange={(e) => handleUpdateProfileField('uniqueValueProposition', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-400 font-bold">Primary Conversion Goal</label>
                        <button
                          onClick={() => handleResetProfileField('primaryGoal')}
                          className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> Reset
                        </button>
                      </div>
                      <input
                        type="text"
                        value={requirement.primaryGoal || ''}
                        onChange={(e) => handleUpdateProfileField('primaryGoal', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Industry</span>
                        <p className="font-bold text-white text-xs mt-0.5">{requirement.industry}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Business Type</span>
                        <p className="font-bold text-emerald-400 text-xs mt-0.5">{requirement.businessType}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Website Type</span>
                        <p className="font-bold text-indigo-300 text-xs mt-0.5">{requirement.websiteType}</p>
                      </div>
                    </div>
                    {requirement.uniqueValueProposition && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-medium block">Unique Value Proposition</span>
                        <p className="text-xs text-slate-200 mt-0.5 italic">"{requirement.uniqueValueProposition}"</p>
                      </div>
                    )}
                    {requirement.primaryGoal && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-medium block">Primary Conversion Goal</span>
                        <p className="text-xs text-amber-300 font-bold mt-0.5">🎯 {requirement.primaryGoal}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. DESIGN SYSTEM & VISUAL IDENTITY EDITING */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">2. Design System & Visual Identity</span>
                    {isDesignOverridden && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">User Override</span>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingDesign(!editingDesign)}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Palette className="w-3 h-3" /> {editingDesign ? 'Close Editor' : 'Edit Design System'}
                  </button>
                </div>

                {editingDesign ? (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-slate-400 font-bold">Design Theme</label>
                          <button
                            onClick={() => handleResetDesignField('theme')}
                            className="text-[9px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                        <input
                          type="text"
                          value={requirement.designPreferences?.theme || ''}
                          onChange={(e) => handleUpdateDesignField('theme', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-slate-400 font-bold">Primary Color</label>
                          <button
                            onClick={() => handleResetDesignField('primaryColor')}
                            className="text-[9px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={requirement.designPreferences?.primaryColor || '#6366F1'}
                            onChange={(e) => handleUpdateDesignField('primaryColor', e.target.value)}
                            className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                          />
                          <input
                            type="text"
                            value={requirement.designPreferences?.primaryColor || ''}
                            onChange={(e) => handleUpdateDesignField('primaryColor', e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-slate-400 font-bold">Secondary Color</label>
                          <button
                            onClick={() => handleResetDesignField('secondaryColor')}
                            className="text-[9px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={requirement.designPreferences?.secondaryColor || '#4F46E5'}
                            onChange={(e) => handleUpdateDesignField('secondaryColor', e.target.value)}
                            className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                          />
                          <input
                            type="text"
                            value={requirement.designPreferences?.secondaryColor || ''}
                            onChange={(e) => handleUpdateDesignField('secondaryColor', e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-slate-400 font-bold">Typography Pair</label>
                          <button
                            onClick={() => handleResetDesignField('typography')}
                            className="text-[9px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                        <input
                          type="text"
                          value={requirement.designPreferences?.typography || ''}
                          onChange={(e) => handleUpdateDesignField('typography', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-slate-400 font-bold">Visual Tone / Style</label>
                          <button
                            onClick={() => handleResetDesignField('visualTone')}
                            className="text-[9px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                        <input
                          type="text"
                          value={requirement.designPreferences?.visualTone || ''}
                          onChange={(e) => handleUpdateDesignField('visualTone', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[9px] text-slate-400 font-medium block">Design Theme</span>
                      <span className="font-bold text-white text-xs block">{requirement.designPreferences?.theme}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[9px] text-slate-400 font-medium block">Color Palette</span>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="w-4 h-4 rounded-full border border-white/20 shadow-xs inline-block" style={{ backgroundColor: requirement.designPreferences?.primaryColor }} title="Primary" />
                        <span className="w-4 h-4 rounded-full border border-white/20 shadow-xs inline-block" style={{ backgroundColor: requirement.designPreferences?.secondaryColor }} title="Secondary" />
                        <span className="text-[10px] text-slate-300 font-mono ml-1">{requirement.designPreferences?.primaryColor}</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[9px] text-slate-400 font-medium block">Typography Pair</span>
                      <span className="font-bold text-white text-xs block">{requirement.designPreferences?.typography}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[9px] text-slate-400 font-medium block">Visual Tone & Style</span>
                      <span className="font-bold text-indigo-300 text-xs block capitalize">{requirement.designPreferences?.visualTone || 'professional'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. USER REQUESTED SPECIFICATIONS (Add / Edit / Remove) */}
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 space-y-3 text-xs shadow-inner">
                <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-emerald-400" /> USER REQUESTED SPECIFICATIONS ({requirement.userRequestedFeatures?.length || 0})</span>
                  <span className="text-[10px] text-emerald-300/80 font-medium">Add, Edit or Remove Requirements</span>
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUserReqInput}
                    onChange={(e) => setNewUserReqInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUserRequirement()}
                    placeholder="e.g., 'Add online booking system' or 'WhatsApp Chat'..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddUserRequirement}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-brand-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Requirement
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(requirement.userRequestedFeatures || []).map((feat, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-900/90 text-emerald-100 border border-emerald-500/60 text-[11px] font-extrabold shadow-sm flex items-center gap-2">
                      <span>★ {feat}</span>
                      <button
                        onClick={() => handleRemoveUserRequirement(idx)}
                        className="text-emerald-300/60 hover:text-rose-300 transition-colors"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. AI RECOMMENDATIONS ([Accept], [Edit], [Reject]) */}
              {requirement.aiRecommendedFeatures && requirement.aiRecommendedFeatures.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-brand-500/50 space-y-3 text-xs shadow-inner">
                  <span className="text-[11px] font-black text-brand-300 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-brand-400" /> AI RECOMMENDATIONS & FEATURE CONTROLS</span>
                    <span className="text-[10px] text-brand-200/90 font-extrabold">Accept • Edit • Reject</span>
                  </span>

                  <div className="space-y-2">
                    {requirement.aiRecommendedFeatures.map((feat, idx) => {
                      const isApproved = approvedFeatures.some(f => f.toLowerCase() === feat.toLowerCase());
                      const isRejected = rejectedFeatures.some(r => r.toLowerCase() === feat.toLowerCase());
                      const editedInfo = editedRecommendations[feat];

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                            isRejected
                              ? 'bg-rose-950/40 border-rose-500/40 opacity-70'
                              : isApproved
                              ? 'bg-emerald-950/50 border-emerald-500/50'
                              : 'bg-slate-900 border-brand-500/40'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-xs ${isRejected ? 'line-through text-rose-300' : isApproved ? 'text-emerald-300' : 'text-brand-100'}`}>
                                🤖 {editedInfo?.customName || feat}
                              </span>
                              {editedInfo && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-extrabold">User Edited</span>
                              )}
                              {isApproved && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-extrabold">Approved ✓</span>
                              )}
                              {isRejected && (
                                <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-extrabold">Rejected ❌</span>
                              )}
                            </div>
                            {editedInfo?.description && (
                              <p className="text-[10px] text-slate-400 italic">"{editedInfo.description}"</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleAcceptRecommendation(editedInfo?.customName || feat)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                isApproved
                                  ? 'bg-emerald-600 text-white shadow'
                                  : 'bg-slate-800 hover:bg-emerald-600/80 text-emerald-300 hover:text-white'
                              }`}
                            >
                              <Check className="w-3 h-3" /> Accept
                            </button>

                            <button
                              onClick={() =>
                                setEditingRecModal({
                                  origName: feat,
                                  customName: editedInfo?.customName || feat,
                                  description: editedInfo?.description || '',
                                  intent: editedInfo?.intent || ''
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-brand-600 text-brand-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>

                            <button
                              onClick={() => handleRejectRecommendation(editedInfo?.customName || feat)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                isRejected
                                  ? 'bg-rose-600 text-white shadow'
                                  : 'bg-slate-800 hover:bg-rose-600/80 text-rose-300 hover:text-white'
                              }`}
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>

                            {(isApproved || isRejected || editedInfo) && (
                              <button
                                onClick={() => handleResetRecommendation(feat)}
                                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                                title="Reset to original AI recommendation"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. PROPOSED PAGES & PAGE ARCHITECTURE MANAGER */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-brand-400" />
                    <span className="text-[10px] font-extrabold text-brand-400 uppercase tracking-wider">
                      5. Proposed Pages & Architecture ({requirement.proposedPages?.length || 0})
                    </span>
                    {isPagesOverridden && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">User Override</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isPagesOverridden && (
                      <button
                        onClick={handleResetPagesToAi}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset Pages
                      </button>
                    )}
                    <button
                      onClick={() => setAddingPageModal(true)}
                      className="px-3 py-1 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Page
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(requirement.proposedPages || []).map((page, idx) => {
                    const sections = page.recommendedSections || page.components || [];
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-xs">{page.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              page.source === 'user_created'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : page.source === 'user_requested'
                                ? 'bg-brand-500/20 text-brand-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {page.source === 'user_created' ? 'User Added' : page.source === 'user_requested' ? 'User Requested' : 'AI Recommended'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{page.purpose}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {sections.map((sec, sIdx) => (
                              <span key={sIdx} className="text-[9px] bg-slate-900 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded">
                                {sec.type || sec.name || 'Component'}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleMovePage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300"
                            title="Move Page Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMovePage(idx, 'down')}
                            disabled={idx === (requirement.proposedPages || []).length - 1}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEditingPageModal({ index: idx, page: JSON.parse(JSON.stringify(page)) })}
                            className="px-2.5 py-1 rounded-lg bg-brand-600/80 hover:bg-brand-500 text-white text-[10px] font-extrabold flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit Page
                          </button>

                          <button
                            onClick={() => handleRemovePage(idx)}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all"
                            title="Remove Page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7. FINAL APPROVED STRATEGY SUMMARY CARD */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-brand-500/50 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-brand-500/30 pb-2">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI GENERATED + USER MODIFICATIONS = FINAL APPROVED STRATEGY
                  </span>
                  <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    Ready for Phase 3 Blueprint
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Business Identity</span>
                    <p className="font-extrabold text-white">{requirement.businessType} • {requirement.industry}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Design System Theme</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: requirement.designPreferences?.primaryColor }} />
                      <p className="font-extrabold text-white">{requirement.designPreferences?.theme}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Final Site Structure</span>
                    <p className="font-extrabold text-brand-300">{requirement.proposedPages?.length || 0} Pages Configured</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGenerateBlueprint}
                    disabled={generatingBlueprint}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300 text-white font-extrabold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generatingBlueprint ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Phase 3 Website Blueprint...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300" /> Generate Phase 3 Website Blueprint &rarr;
                      </>
                    )}
                  </button>
                  {blueprint && (
                    <button
                      onClick={() => switchPhase(3)}
                      className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-2"
                    >
                      View Phase 3 Blueprint &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EDIT PAGE & COMPONENT STACK MODAL ────────────────────────────── */}
      {editingPageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-brand-400" />
                <h3 className="text-sm font-extrabold text-white">Edit Page & Component Stack</h3>
              </div>
              <button
                onClick={() => setEditingPageModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Page Name</label>
                <input
                  type="text"
                  value={editingPageModal.page.name || ''}
                  onChange={(e) =>
                    setEditingPageModal(prev => ({
                      ...prev,
                      page: { ...prev.page, name: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Page Purpose & Overview</label>
                <textarea
                  rows="2"
                  value={editingPageModal.page.purpose || ''}
                  onChange={(e) =>
                    setEditingPageModal(prev => ({
                      ...prev,
                      page: { ...prev.page, purpose: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* COMPONENT STACK EDITOR */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-brand-400 uppercase">
                    Page Component Stack ({(editingPageModal.page.recommendedSections || editingPageModal.page.components || []).length})
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(editingPageModal.page.recommendedSections || editingPageModal.page.components || []).map((comp, cIdx) => (
                    <div key={cIdx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold text-amber-300">
                          #{cIdx + 1} {comp.type || 'ContentSectionCard'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const stack = [...(editingPageModal.page.recommendedSections || editingPageModal.page.components || [])];
                              if (cIdx > 0) {
                                const temp = stack[cIdx];
                                stack[cIdx] = stack[cIdx - 1];
                                stack[cIdx - 1] = temp;
                                setEditingPageModal(prev => ({
                                  ...prev,
                                  page: { ...prev.page, recommendedSections: stack, components: stack }
                                }));
                              }
                            }}
                            disabled={cIdx === 0}
                            className="p-1 rounded bg-slate-900 disabled:opacity-30 text-slate-300"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              const stack = [...(editingPageModal.page.recommendedSections || editingPageModal.page.components || [])];
                              if (cIdx < stack.length - 1) {
                                const temp = stack[cIdx];
                                stack[cIdx] = stack[cIdx + 1];
                                stack[cIdx + 1] = temp;
                                setEditingPageModal(prev => ({
                                  ...prev,
                                  page: { ...prev.page, recommendedSections: stack, components: stack }
                                }));
                              }
                            }}
                            disabled={cIdx === (editingPageModal.page.recommendedSections || editingPageModal.page.components || []).length - 1}
                            className="p-1 rounded bg-slate-900 disabled:opacity-30 text-slate-300"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              const stack = (editingPageModal.page.recommendedSections || editingPageModal.page.components || []).filter((_, i) => i !== cIdx);
                              setEditingPageModal(prev => ({
                                ...prev,
                                page: { ...prev.page, recommendedSections: stack, components: stack }
                              }));
                            }}
                            className="p-1 rounded bg-rose-500/20 text-rose-300 hover:text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Component Title"
                          value={comp.title || ''}
                          onChange={(e) => {
                            const stack = [...(editingPageModal.page.recommendedSections || editingPageModal.page.components || [])];
                            stack[cIdx] = { ...stack[cIdx], title: e.target.value };
                            setEditingPageModal(prev => ({
                              ...prev,
                              page: { ...prev.page, recommendedSections: stack, components: stack }
                            }));
                          }}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-white"
                        />
                        <input
                          type="text"
                          placeholder="Component Purpose"
                          value={comp.purpose || ''}
                          onChange={(e) => {
                            const stack = [...(editingPageModal.page.recommendedSections || editingPageModal.page.components || [])];
                            stack[cIdx] = { ...stack[cIdx], purpose: e.target.value };
                            setEditingPageModal(prev => ({
                              ...prev,
                              page: { ...prev.page, recommendedSections: stack, components: stack }
                            }));
                          }}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ADD COMPONENT SELECTOR */}
                <div className="pt-2">
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">+ Add Component to Page</label>
                  <select
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const compType = e.target.value;
                      const libraryItem = COMPONENT_LIBRARY.find(c => c.type === compType);
                      const stack = [...(editingPageModal.page.recommendedSections || editingPageModal.page.components || [])];
                      stack.push({
                        type: compType,
                        title: libraryItem ? libraryItem.label : `${compType} Section`,
                        purpose: libraryItem ? libraryItem.desc : 'Custom section',
                        source: 'user_created'
                      });
                      setEditingPageModal(prev => ({
                        ...prev,
                        page: { ...prev.page, recommendedSections: stack, components: stack }
                      }));
                      e.target.value = '';
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">Select a component from library...</option>
                    {COMPONENT_LIBRARY.map((item, i) => (
                      <option key={i} value={item.type}>
                        {item.label} — {item.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingPageModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSavePageEdit(editingPageModal.index, editingPageModal.page)}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1 shadow"
              >
                <Save className="w-3.5 h-3.5" /> Save Page Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW PAGE MODAL ──────────────────────────────────────────────── */}
      {addingPageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Create New Custom Page
              </h3>
              <button onClick={() => setAddingPageModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const name = formData.get('name');
                const purpose = formData.get('purpose');
                if (!name || !purpose) return;

                handleCreateNewPage({
                  name: name.trim(),
                  purpose: purpose.trim(),
                  source: 'user_created',
                  recommendedSections: [
                    { type: 'HeroBanner', title: `${name.trim()} Hero`, purpose: purpose.trim(), source: 'user_created' },
                    { type: 'ContentSectionCard', title: `${name.trim()} Content`, purpose: purpose.trim(), source: 'user_created' }
                  ]
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Page Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g., Portfolio Page or Custom Order"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Page Purpose & Content Intent</label>
                <textarea
                  name="purpose"
                  rows="3"
                  required
                  placeholder="e.g., Showcase gallery of past client work and project stories."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddingPageModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all cursor-pointer"
                >
                  Create Page &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT RECOMMENDATION MODAL ─────────────────────────────────────── */}
      {editingRecModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-400" /> Edit Recommendation
              </h3>
              <button onClick={() => setEditingRecModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Feature Name</label>
                <input
                  type="text"
                  value={editingRecModal.customName}
                  onChange={(e) => setEditingRecModal(prev => ({ ...prev, customName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Description & Intent</label>
                <textarea
                  rows="3"
                  value={editingRecModal.description}
                  onChange={(e) => setEditingRecModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Specify custom details or implementation instructions..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setEditingRecModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleSaveEditedRecommendation(
                      editingRecModal.origName,
                      editingRecModal.customName,
                      editingRecModal.description,
                      editingRecModal.intent
                    )
                  }
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow"
                >
                  Save & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PHASE 3: WEBSITE BLUEPRINT SPECIFICATION ─────────────────────── */}
      {activePhase === 3 && (
        <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-6 bg-slate-950/95 text-slate-100 animate-fadeIn">
          {!blueprint ? (
            <div className="py-20 text-center space-y-4">
              <Layers className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-extrabold text-white">Phase 3 Blueprint Not Synthesized Yet</h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                Synthesize the website blueprint from your Phase 2 requirements and user edits.
              </p>
              <button
                onClick={handleGenerateBlueprint}
                disabled={generatingBlueprint || !requirement}
                className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg inline-flex items-center gap-2 disabled:opacity-50"
              >
                {generatingBlueprint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Phase 3 Blueprint Now &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-400" />
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Phase 3 — Website Blueprint Specification</h4>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {blueprint.blueprintId}</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-brand-500/20 text-brand-300 px-2.5 py-1 rounded-full border border-brand-500/40 flex items-center gap-1">
                  ⚡ Generative Blueprint Engine
                </span>
              </div>

              {/* Identity & Structure */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block uppercase">Website Title</span>
                  <p className="font-extrabold text-white">{blueprint.websiteIdentity?.title}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block uppercase">Website Type</span>
                  <p className="font-extrabold text-brand-300">{blueprint.websiteType}</p>
                </div>
              </div>

              {/* Feature Ownership Matrix */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Feature Ownership Matrix
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1">
                    <span className="text-[9px] font-extrabold text-emerald-400 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> User Requested ({blueprint.featureMatrix?.userRequestedFeatures?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(blueprint.featureMatrix?.userRequestedFeatures || []).map((f, idx) => (
                        <span key={idx} className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-brand-500/30 space-y-1">
                    <span className="text-[9px] font-extrabold text-brand-400 uppercase flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Approved Recs ({blueprint.featureMatrix?.approvedRecommendations?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(blueprint.featureMatrix?.approvedRecommendations || []).length > 0 ? (
                        (blueprint.featureMatrix?.approvedRecommendations || []).map((f, idx) => (
                          <span key={idx} className="text-[9px] bg-brand-500/10 text-brand-300 border border-brand-500/20 px-1.5 py-0.5 rounded">
                            {f}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-500 italic">None accepted</span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                      <Bot className="w-3 h-3" /> AI Unapproved ({blueprint.featureMatrix?.aiRecommendedFeatures?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(blueprint.featureMatrix?.aiRecommendedFeatures || []).map((f, idx) => (
                        <span key={idx} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Component Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Site Map & Page Component Specifications
                </span>
                <div className="space-y-3">
                  {(blueprint.pages || []).map((page, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-xs flex items-center gap-2">
                          <Layout className="w-3.5 h-3.5 text-brand-400" /> {page.name}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                          page.source === 'user_created' || page.source === 'user_requested'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {page.source === 'user_created' ? 'User Created' : page.source === 'user_requested' ? 'User Requested' : 'AI Recommended'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{page.purpose}</p>

                      <div className="pt-1 border-t border-slate-800/80 space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Page Components ({page.components?.length || 0})</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {(page.components || []).map((c, cIdx) => (
                            <div key={cIdx} className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[10px]">
                              <span className="font-bold text-slate-200 block">{c.title}</span>
                              <span className="text-slate-500 font-mono text-[9px]">{c.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs & Navigation Spec */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block uppercase">Primary Action CTA</span>
                  <p className="font-extrabold text-emerald-400">{blueprint.ctaRequirements?.primaryCTA}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block uppercase">Secondary Action CTA</span>
                  <p className="font-extrabold text-indigo-300">{blueprint.ctaRequirements?.secondaryCTA}</p>
                </div>
              </div>

              {/* Proceed to Phase 4 Action CTA */}
              <div className="pt-2">
                <button
                  onClick={() => switchPhase(4)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" /> Proceed to Phase 4 Website Generation &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PHASE 4: AUTONOMOUS WEBSITE GENERATION & LIVE PREVIEW ────────────── */}
      {activePhase === 4 && (
        <div className="animate-fadeIn">
          {!blueprint ? (
            <div className="p-8 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 text-center space-y-3 bg-slate-950 text-white">
              <Lock className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-sm font-extrabold">Phase 4 Locked</h4>
              <p className="text-xs text-slate-400">Generate a Phase 3 Blueprint first to access website generation.</p>
              <button onClick={() => switchPhase(1)} className="px-4 py-2 rounded-xl bg-brand-600 text-xs font-bold">
                Start Phase 1 Requirements &rarr;
              </button>
            </div>
          ) : (
            <WebsitePreviewEngine
              website={website}
              blueprint={blueprint}
              phaseState={phaseState}
              progressStep={progressStep}
              errorMsg={errorMsg}
              onGenerateWebsite={handleGenerateWebsite}
              onReset={() => {
                setWebsite(null);
                setPhaseState('PHASE_3_BLUEPRINT_READY');
                switchPhase(3);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
