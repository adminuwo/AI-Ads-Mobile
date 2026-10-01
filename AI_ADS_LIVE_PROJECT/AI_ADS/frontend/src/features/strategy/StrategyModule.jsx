import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { strategyAPI } from '../../services/api';
import { resolveBrandVisualAsset } from '../../services/brandVisualResolver';
import {
  Target, Layers, Zap, CheckCircle2, ArrowRight, TrendingUp, Users, BarChart3,
  Globe, Mail, Instagram, Linkedin, Loader2, Save, Crosshair, Gift,
  MousePointerClick, Edit3, Sparkles, PieChart, Calendar, DollarSign,
  Megaphone, BookOpen, Clock, ChevronRight, Star, Lightbulb, Rocket,
  Hash, Video, FileText, MessageSquare, Filter, Play, Award, BarChart2,
  ArrowUpRight, Flame, X, RefreshCw, UploadCloud, Image as ImageIcon, Trash2, Plus,
  MapPin, Search, Compass, Bot, Lock, Download
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const deriveGoal = (ws) => {
  const name = ws.brandName || 'Brand';
  const category = ws.industryCategory || '';
  if (category.toLowerCase().includes('fashion') || category.toLowerCase().includes('lifestyle'))
    return `Scale ${name}'s Organic Fashion Traffic by 300% & Drive Seasonal Revenue Growth`;
  if (category.toLowerCase().includes('e-commerce') || category.toLowerCase().includes('retail'))
    return `Grow ${name}'s Organic Buyer Traffic by 250% & Maximize Conversion Rate Across All Categories`;
  if (category.toLowerCase().includes('footwear'))
    return `Drive ${name}'s Brand Awareness in Comfort Footwear Segment & Grow DTC Revenue by 40%`;
  if (category.toLowerCase().includes('ai') || category.toLowerCase().includes('tech'))
    return `Scale ${name}'s Enterprise Pipeline by 250% Through Governed AI Content Operations`;
  return `Scale ${name}'s Organic Lead Pipeline by 200% & Strengthen Market Positioning`;
};

const deriveLeadMagnet = (ws) => {
  const name = ws.brandName || 'Brand';
  const category = ws.industryCategory || '';
  if (category.toLowerCase().includes('fashion'))
    return `${name}'s Ultimate 2026 Style & Trend Forecast Report`;
  if (category.toLowerCase().includes('e-commerce') || category.toLowerCase().includes('retail'))
    return `The ${name} Smart Shopper's Guide: Best Deals & Product Selection Playbook`;
  if (category.toLowerCase().includes('footwear'))
    return `${name} Comfort Footwear Buyer's Guide: Finding Your Perfect Pair`;
  if (category.toLowerCase().includes('ai') || category.toLowerCase().includes('tech'))
    return `The 2026 Enterprise AI Content Operations Playbook (PDF)`;
  return `${name}'s Expert Guide to Maximum Value & Brand Experience`;
};

const deriveCta = (ws) => {
  const category = ws.industryCategory || '';
  if (category.toLowerCase().includes('fashion') || category.toLowerCase().includes('lifestyle'))
    return `Shop the Latest Collection & Get 20% Off Your First Order`;
  if (category.toLowerCase().includes('e-commerce') || category.toLowerCase().includes('retail'))
    return `Explore Best Deals & Shop Now for Unbeatable Prices`;
  if (category.toLowerCase().includes('footwear'))
    return `Find Your Perfect Pair — Free Shipping on Orders Over ₹999`;
  if (category.toLowerCase().includes('ai') || category.toLowerCase().includes('tech'))
    return `Book Your Enterprise Strategy Demo Today`;
  return `Get Started Free — No Credit Card Required`;
};

// Channel icon/color mapping
const channelColors = {
  Globe:     { gradient: 'from-violet-500 to-indigo-600', bg: 'bg-violet-500/10', text: 'text-brand-600 dark:text-violet-400', bar: 'from-violet-500 to-indigo-500', ring: 'ring-violet-500/20' },
  Linkedin:  { gradient: 'from-blue-500 to-cyan-500',     bg: 'bg-blue-500/10',   text: 'text-blue-600 dark:text-blue-400',    bar: 'from-blue-500 to-cyan-500',   ring: 'ring-blue-500/20' },
  Mail:      { gradient: 'from-amber-500 to-orange-500',  bg: 'bg-amber-500/10',  text: 'text-amber-600 dark:text-amber-400',  bar: 'from-amber-500 to-orange-500', ring: 'ring-amber-500/20' },
  Instagram: { gradient: 'from-pink-500 to-rose-500',     bg: 'bg-pink-500/10',   text: 'text-pink-600 dark:text-pink-400',   bar: 'from-pink-500 to-rose-500',    ring: 'ring-pink-500/20' },
};

// Platform icon helper
const getPlatformIcon = (platform = '') => {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return Linkedin;
  if (p.includes('instagram') || p.includes('reels')) return Instagram;
  if (p.includes('email') || p.includes('newsletter')) return Mail;
  if (p.includes('blog') || p.includes('seo') || p.includes('article')) return FileText;
  if (p.includes('twitter') || p.includes('x.com')) return MessageSquare;
  if (p.includes('youtube') || p.includes('video')) return Video;
  return Globe;
};

const getPlatformColor = (platform = '') => {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-blue-500/20';
  if (p.includes('instagram') || p.includes('reels')) return 'bg-pink-500/15 text-pink-600 dark:text-pink-400 ring-pink-500/20';
  if (p.includes('email') || p.includes('newsletter')) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/20';
  if (p.includes('blog') || p.includes('seo')) return 'bg-violet-500/15 text-brand-600 dark:text-violet-400 ring-violet-500/20';
  if (p.includes('twitter') || p.includes('x.com')) return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-sky-500/20';
  if (p.includes('youtube') || p.includes('video')) return 'bg-red-500/15 text-red-600 dark:text-red-400 ring-red-500/20';
  return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 ring-slate-500/20';
};

// Week label helper
const getWeekLabel = (day) => {
  if (day <= 7)  return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
};

// Helper to sanitize & format post titles cleanly without trailing '...' or redundant prefixes
const formatPostTitle = (title, directive) => {
  if (!title) return '';
  let text = title;
  text = text.replace(/^Day\s+\d+\s*\([^)]+\):\s*/i, '');

  if (directive && directive.trim()) {
    const cleanDir = directive.trim();
    const escapedDir = cleanDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`[:\\s—-]+${escapedDir}.*`, 'i'), '');
  }

  text = text.replace(/:\s*i\s+am\s+launching.*/i, '');
  text = text.replace(/:\s*launch\s+\d+.*strategy.*/i, '');
  text = text.replace(/:\s*30\s*days\s*marketing.*/i, '');
  text = text.replace(/\.\.\.$/, '');

  return text.trim();
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const StrategyModule = () => {
  const {
    user,
    activeWorkspace,
    setActiveModule,
    updateWorkspace,
    bulkAddCalendarEvents,
    calendarEvents,
    setGeneratedStrategy,
    setStudioTarget,
    showCustomAlert,
    language,
    setIsSettingsModalOpen,
    setActiveSettingsTab,
    t
  } = useWorkspace();

  const userPlanNorm = (user?.plan || 'starter').toLowerCase();
  const isCampaignLocked = false;
  const isHighestPlan = userPlanNorm === 'enterprise' || userPlanNorm === 'unlimited';

  const [selectedStrategyType, setSelectedStrategyType] = useState(() => {
    const strat = activeWorkspace?.currentStrategy;
    if (strat?.activeStrategyType && strat.activeStrategyType !== 'aiBrand') return strat.activeStrategyType;
    if (strat?.customStrategy) return 'custom';
    return 'campaign';
  });


  // Core strategy fields
  const [businessGoal,      setBusinessGoal]      = useState('');
  const [leadMagnet,        setLeadMagnet]         = useState('');
  const [primaryCta,        setPrimaryCta]         = useState('');
  const [channelMix,        setChannelMix]         = useState([]);
  const [postingFrequency,  setPostingFrequency]   = useState('Daily');
  const [budgetSuggestions, setBudgetSuggestions]  = useState('');
  const [bestPlatforms,     setBestPlatforms]      = useState([]);
  const [contentPillars,    setContentPillars]     = useState([]);
  const [campaignIdeas,     setCampaignIdeas]      = useState([]);
  const [thirtyDayPlan,     setThirtyDayPlan]      = useState([]);
  const [funnel,            setFunnel]             = useState({ awareness: '', nurturing: '', conversion: '' });
  const [audience,          setAudience]           = useState([]);
  const [gtmStrategy,       setGtmStrategy]       = useState(null);
  const [seoStrategy,       setSeoStrategy]       = useState(null);
  const [geoStrategy,       setGeoStrategy]       = useState(null);
  const [geoSeoGtmTab,      setGeoSeoGtmTab]      = useState('seo');

  // UI state
  const [selectedWeek,  setSelectedWeek]  = useState('ALL');
  const [generatedDoc,  setGeneratedDoc]  = useState(false);
  const [isGenerating,  setIsGenerating]  = useState(false);
  const [isSaving,      setIsSaving]      = useState(false);
  const [editingField,  setEditingField]  = useState(null);
  const [activeTab,     setActiveTab]     = useState(() => {
    const saved = sessionStorage.getItem('strategyActiveTab');
    return (saved && saved !== 'campaigns') ? saved : 'overview';
  }); // overview | plan
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showRegenToast, setShowRegenToast] = useState(false);
  const [isSavedState,  setIsSavedState]  = useState(false);

  useEffect(() => {
    const targetTab = sessionStorage.getItem('strategyActiveTab');
    if (targetTab && targetTab !== 'campaigns') {
      setActiveTab(targetTab);
    }
    sessionStorage.removeItem('strategyActiveTab');
  }, []);

  // Build Campaign Modal State
  const [buildCampaignModal, setBuildCampaignModal] = useState(false);
  const [selectedCampaignIdea, setSelectedCampaignIdea] = useState(null);
  const [campaignDuration, setCampaignDuration] = useState('30');

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDays, setScheduleDays] = useState('30');

  // Image Upload Guidance Modal State
  const [showImageBriefModal, setShowImageBriefModal] = useState(false);
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageDirective, setImageDirective] = useState('');
  const [isSubmittingImageBrief, setIsSubmittingImageBrief] = useState(false);
  const [customImageBriefs, setCustomImageBriefs] = useState([]);
  const [customStrategy, setCustomStrategy] = useState(null);
  const [showImageBriefToast, setShowImageBriefToast] = useState(false);
  const [imageBriefToastMsg, setImageBriefToastMsg] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleImageFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showCustomAlert({ title: 'Invalid File Format', message: 'Please select a valid image file (PNG, JPG, WebP, SVG, GIF).', type: 'error' });
        return;
      }
      setUploadedImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDropImage = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        showCustomAlert({ title: 'Invalid File Format', message: 'Please select a valid image file (PNG, JPG, WebP, SVG, GIF).', type: 'error' });
        return;
      }
      setUploadedImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [selectedCustomWeek, setSelectedCustomWeek] = useState('ALL');
  const [selectedCustomPlatform, setSelectedCustomPlatform] = useState('ALL');

  const handleGenerateCustomStrategy = async () => {
    if (!uploadedImageFile && !imagePreviewUrl && !imageDirective.trim()) {
      showCustomAlert({
        title: 'Missing Information',
        message: 'Please upload an image or enter instructions for what AI should do with the image.',
        type: 'warning'
      });
      return;
    }

    const genCountKey = `image_brief_gen_count_${activeWorkspace?.id || 'default'}`;
    const genCount = parseInt(localStorage.getItem(genCountKey) || '0', 10);
    if ((userPlanNorm === 'pro' || userPlanNorm === 'growth') && genCount >= 3) {
      showCustomAlert({
        title: 'Limit Reached',
        message: 'You have reached the maximum limit of 3 Image Brief generations for your plan. Please upgrade to unlock unlimited generation.',
        type: 'warning'
      });
      return;
    }

    setIsSubmittingImageBrief(true);
    try {
      const wsId = activeWorkspace?.id || activeWorkspace?._id || 'default_ws';
      const brandName = activeWorkspace?.brandName || 'Brand';
      const industry = activeWorkspace?.industryCategory || activeWorkspace?.industry || 'Consumer Products';
      const directive = imageDirective.trim() || 'Promote core product features and scale social media engagement with reference image';

      let newCustomStrat = null;
      try {
        const res = await strategyAPI.generateCustomStrategy(wsId, {
          directive,
          referenceImageUrl: imagePreviewUrl || null,
          brandName,
          industry,
          tagline: activeWorkspace?.tagline || '',
          companyDescription: activeWorkspace?.companyDescription || '',
          brandColors: activeWorkspace?.brandColors || []
        });

        if (res && res.customStrategy && Array.isArray(res.customStrategy.posts)) {
          newCustomStrat = res.customStrategy;
        }
      } catch (apiErr) {
        console.warn('[Custom Strategy Frontend] Backend API notice:', apiErr.message);
      }

      if (!newCustomStrat) {
        const platformsList = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter / X', 'YouTube Shorts', 'Pinterest'];
        const generated30DayPosts = Array.from({ length: 30 }, (_, i) => {
          const day = i + 1;
          const weekNum = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : 4;
          const platform = platformsList[i % platformsList.length];
          const weekTag = weekNum === 1 ? 'Week 1: Awareness' : weekNum === 2 ? 'Week 2: Value' : weekNum === 3 ? 'Week 3: Engagement' : 'Week 4: Conversion';
          const weekName = weekNum === 1 ? 'Brand Awareness & Visual Hook (Days 1–7)' : weekNum === 2 ? 'Product Value & Feature Deep Dive (Days 8–14)' : weekNum === 3 ? 'Social Proof & Community Engagement (Days 15–21)' : 'Conversion Sprint & Direct Response CTA (Days 22–30)';

          return {
            day,
            week: weekNum,
            weekTag,
            weekName,
            platform,
            format: platform === 'Instagram' ? 'Carousel Slide / Reel Concept' : platform === 'Facebook' ? 'High-Engagement Ad Graphic' : platform === 'LinkedIn' ? 'Executive Slide Briefing' : '16:9 Viral Thread Graphic',
            title: `Day ${day}: ${brandName} Launch Focus - ${directive.slice(0, 30)}...`,
            visualDirective: `[Day ${day} - ${platform}] Custom product launch graphic highlighting ${directive}.`,
            hook: `✨ Day ${day} Product Launch Spotlight for ${brandName}!`,
            caption: `Day ${day} of our 30-Day custom visual launch roadmap for ${brandName}.`,
            cta: `Explore ${brandName}'s new release today! 👇`,
            hashtags: `#${brandName.replace(/\s+/g,'')} #Day${day} #${industry.replace(/\s+/g,'')}`
          };
        });

        newCustomStrat = {
          id: 'custom_strat_' + Date.now(),
          imagePreviewUrl: imagePreviewUrl || null,
          fileName: uploadedImageFile ? uploadedImageFile.name : 'Reference Image',
          directive,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          posts: generated30DayPosts
        };
      }

      const newBrief = {
        id: 'brief_' + Date.now(),
        imageUrl: imagePreviewUrl || null,
        fileName: uploadedImageFile ? uploadedImageFile.name : 'Reference Image',
        fileSize: uploadedImageFile ? `${(uploadedImageFile.size / 1024).toFixed(1)} KB` : 'N/A',
        directive,
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      const updatedBriefs = [newBrief, ...customImageBriefs];
      setCustomImageBriefs(updatedBriefs);
      setCustomStrategy(newCustomStrat);

      const updatedStrategy = {
        ...(activeWorkspace.currentStrategy || {}),
        customImageBriefs: updatedBriefs,
        customStrategy: newCustomStrat
      };

      if (updateWorkspace && wsId) {
        await updateWorkspace(wsId, { currentStrategy: updatedStrategy });
      }

      setImageBriefToastMsg('Custom Social Media Strategy generated successfully for all platforms!');
      setShowImageBriefToast(true);
      setTimeout(() => setShowImageBriefToast(false), 4500);

      localStorage.setItem(genCountKey, (genCount + 1).toString());

      // Reset modal and switch active tab to 'custom'
      setShowImageBriefModal(false);
      setActiveTab('custom');
    } catch (err) {
      console.error('Failed to generate custom strategy:', err);
      showCustomAlert({ title: 'Error', message: 'Failed to generate custom strategy. Please try again.', type: 'error' });
    } finally {
      setIsSubmittingImageBrief(false);
    }
  };

  const handleDeleteImageBrief = async (briefId) => {
    const updatedBriefs = customImageBriefs.filter(b => b.id !== briefId);
    setCustomImageBriefs(updatedBriefs);
    const updatedStrategy = {
      ...(activeWorkspace.currentStrategy || {}),
      customImageBriefs: updatedBriefs
    };
    if (updateWorkspace && (activeWorkspace.id || activeWorkspace._id)) {
      await updateWorkspace(activeWorkspace.id || activeWorkspace._id, { currentStrategy: updatedStrategy });
    }
  };

  // Card Regeneration State
  const [openRegenDays, setOpenRegenDays] = useState({});
  const [regenInputs, setRegenInputs] = useState({});
  const [loadingRegenDays, setLoadingRegenDays] = useState({});

  const handleRegenerateCardItem = async (item, e) => {
    if (e) e.stopPropagation();
    const day = item.day;
    const userDirective = (regenInputs[day] || '').trim();

    setLoadingRegenDays(prev => ({ ...prev, [day]: true }));

    try {
      const wsId = activeWorkspace.id || activeWorkspace._id || 'default_ws';
      const data = await strategyAPI.regenerateCard(wsId, {
        day: item.day,
        currentTopic: item.topic,
        currentActionItem: item.actionItem,
        platform: item.platform,
        pillar: item.pillar,
        userDirective
      });

      if (data && data.updatedCard) {
        const updated = data.updatedCard;
        setThirtyDayPlan(prevPlan => {
          const newPlan = prevPlan.map(card => {
            if (card.day === item.day) {
              return {
                ...card,
                topic: updated.topic || card.topic,
                actionItem: updated.actionItem || card.actionItem,
                pillar: updated.pillar || card.pillar
              };
            }
            return card;
          });

          const updatedStrategy = {
            ...(activeWorkspace.currentStrategy || {}),
            thirtyDayPlan: newPlan
          };
          updateWorkspace(activeWorkspace.id || activeWorkspace._id, { currentStrategy: updatedStrategy }).catch(() => {});

          return newPlan;
        });
      }
    } catch (err) {
      console.error('Failed to regenerate strategy card:', err);
    } finally {
      setLoadingRegenDays(prev => ({ ...prev, [day]: false }));
      setOpenRegenDays(prev => ({ ...prev, [day]: false }));
    }
  };

  const isLegacyStrategy = (strat) => {
    if (!strat || !strat.thirtyDayPlan || strat.thirtyDayPlan.length < 10) return true;
    if (strat.campaignIdeas && strat.campaignIdeas.some(c => c.title === 'The Authority Series' || c.title === 'DNA Lead Magnet Launch')) return true;
    if (strat.thirtyDayPlan.some(d => d.title && (d.title.includes('Key Insights for') || d.title.includes('Day 1: Pillar')))) return true;
    return false;
  };

  // ─── Init from workspace ─────────────────────────────────────────────────
  useEffect(() => {
    const strat = activeWorkspace.currentStrategy;
    
    if (!strat) {
      if (activeWorkspace.id || activeWorkspace._id) {
        handleGenerate();
      }
      return;
    }

    if (strat.customImageBriefs && Array.isArray(strat.customImageBriefs)) {
      setCustomImageBriefs(strat.customImageBriefs);
    }
    if (strat.customStrategy) {
      setCustomStrategy(strat.customStrategy);
    }

    // Determine target strategy object based on selected Strategy Type
    let target = null;
    if (selectedStrategyType === 'campaign' && !isCampaignLocked) {
      target = strat.campaignStrategy || (strat.campaignName ? strat : null);
    } else if (selectedStrategyType === 'custom') {
      target = strat.customStrategy || null;
    } else if (selectedStrategyType === 'aiBrand') {
      target = strat.aiBrandStrategy || (strat.thirtyDayPlan ? strat : null);
      if (target && target.campaignName) {
        target = { ...target };
        delete target.campaignName;
        delete target.campaignId;
      }
    }

    if (target && ((target.thirtyDayPlan && target.thirtyDayPlan.length > 0) || (target.posts && target.posts.length > 0))) {
      setBusinessGoal(target.businessGoal || deriveGoal(activeWorkspace));
      setLeadMagnet(target.leadMagnet || deriveLeadMagnet(activeWorkspace));
      setPrimaryCta(target.primaryCta || deriveCta(activeWorkspace));
      setPostingFrequency(target.postingFrequency || 'Daily');
      setBudgetSuggestions(target.budgetSuggestions || '60% Organic content marketing & SEO / 40% Paid retargeting.');
      setBestPlatforms(target.bestPlatforms || ['LinkedIn', 'Google SEO Blog', 'Email Newsletter', 'Instagram & Reels']);
      setContentPillars(target.contentPillars || activeWorkspace.contentPillars || []);
      setCampaignIdeas(target.campaignIdeas || []);
      setThirtyDayPlan(target.thirtyDayPlan || target.posts || []);
      setFunnel(target.funnel || { awareness: '', nurturing: '', conversion: '' });
      setAudience(target.audience || (activeWorkspace.targetAudience || []).slice(0, 4));
      if (target.channelMix && target.channelMix.length > 0) setChannelMix(target.channelMix);
      if (target.gtmStrategy) setGtmStrategy(target.gtmStrategy);
      if (target.seoStrategy) setSeoStrategy(target.seoStrategy);
      if (target.geoStrategy) setGeoStrategy(target.geoStrategy);
      setGeneratedDoc(true);
    } else if (selectedStrategyType === 'aiBrand' && !isGenerating) {
      handleGenerate();
    }
  }, [activeWorkspace.id || activeWorkspace._id, selectedStrategyType, activeWorkspace.currentStrategy]);

  // ─── Download Strategy as PDF ─────────────────────────────────────────────
  const handleDownloadPDF = () => {
    const brandName = activeWorkspace?.brandName || 'Brand';
    const cleanBrandFilename = brandName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const pri = iframe.contentWindow;
    pri.document.open();
    pri.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${brandName} — Marketing Strategy & Growth Blueprint</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
            
            @page {
              size: A4;
              margin: 12mm 15mm;
            }

            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              color: #0f172a;
              background: #ffffff;
              line-height: 1.5;
              font-size: 11px;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .header-banner {
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
              color: #ffffff;
              padding: 24px;
              border-radius: 14px;
              margin-bottom: 20px;
            }

            .header-banner h1 {
              font-size: 22px;
              font-weight: 800;
              margin: 0 0 6px 0;
              letter-spacing: -0.5px;
            }

            .header-banner p {
              margin: 0;
              font-size: 12px;
              opacity: 0.95;
              font-weight: 600;
            }

            .meta-bar {
              display: flex;
              justify-content: space-between;
              margin-top: 16px;
              padding-top: 12px;
              border-top: 1px solid rgba(255, 255, 255, 0.25);
              font-size: 11px;
              font-weight: 700;
            }

            .section {
              margin-bottom: 22px;
              page-break-inside: avoid;
            }

            .section-title {
              font-size: 13px;
              font-weight: 800;
              color: #1e1b4b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #6366f1;
              padding-bottom: 6px;
              margin-bottom: 12px;
            }

            .grid-3 {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
            }

            .card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 12px;
            }

            .card-label {
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              color: #64748b;
              margin-bottom: 4px;
              letter-spacing: 0.5px;
            }

            .card-val {
              font-size: 11px;
              font-weight: 700;
              color: #0f172a;
              line-height: 1.4;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10.5px;
              margin-top: 8px;
            }

            th {
              background: #f1f5f9;
              color: #334155;
              font-weight: 800;
              text-align: left;
              padding: 8px 10px;
              border: 1px solid #cbd5e1;
              font-size: 9.5px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            td {
              padding: 8px 10px;
              border: 1px solid #e2e8f0;
              vertical-align: top;
            }

            tr:nth-child(even) {
              background: #f8fafc;
            }

            .badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 6px;
              font-size: 9px;
              font-weight: 800;
              background: #e0e7ff;
              color: #3730a3;
              border: 1px solid #c7d2fe;
            }

            .badge-green {
              background: #dcfce7;
              color: #166534;
              border-color: #bbf7d0;
            }

            .badge-amber {
              background: #fef3c7;
              color: #92400e;
              border-color: #fde68a;
            }

            .footer {
              margin-top: 24px;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <h1>${brandName} — Master Marketing Strategy</h1>
            <p>AI-Generated Autonomous Brand Positioning & 30-Day Execution Blueprint</p>
            <div class="meta-bar">
              <span>Brand: <strong>${brandName}</strong></span>
              <span>Generated: <strong>${new Date().toLocaleDateString()}</strong></span>
              <span>Type: <strong>${selectedStrategyType === 'campaign' ? 'Campaign Strategy' : selectedStrategyType === 'custom' ? 'Image Brief Strategy' : 'Brand Growth Strategy'}</strong></span>
            </div>
          </div>

          <!-- Section 1: Objectives -->
          <div class="section">
            <div class="section-title">1. Core Strategic Objectives</div>
            <div class="grid-3">
              <div class="card">
                <div class="card-label">Primary Business Goal</div>
                <div class="card-val">${businessGoal || deriveGoal(activeWorkspace)}</div>
              </div>
              <div class="card">
                <div class="card-label">Lead Magnet / High-Value Offer</div>
                <div class="card-val">${leadMagnet || deriveLeadMagnet(activeWorkspace)}</div>
              </div>
              <div class="card">
                <div class="card-label">Primary Call-to-Action</div>
                <div class="card-val">${primaryCta || deriveCta(activeWorkspace)}</div>
              </div>
            </div>
          </div>

          <!-- Section 2: Channel Allocation & Budget -->
          <div class="section">
            <div class="section-title">2. Channel Allocation & Budget Strategy</div>
            <div class="grid-3" style="margin-bottom: 10px;">
              <div class="card">
                <div class="card-label">Posting Frequency</div>
                <div class="card-val">${postingFrequency || 'Daily'}</div>
              </div>
              <div class="card" style="grid-column: span 2;">
                <div class="card-label">Budget & Media Model</div>
                <div class="card-val">${budgetSuggestions || '60% Organic content marketing & SEO / 40% Paid retargeting.'}</div>
              </div>
            </div>
            ${bestPlatforms && bestPlatforms.length > 0 ? `
              <div style="margin-top: 8px;">
                <span class="card-label" style="display:inline-block; margin-right:6px;">Target Platforms:</span>
                ${bestPlatforms.map(p => `<span class="badge" style="margin-right: 4px;">${p}</span>`).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Section 3: Funnel Architecture -->
          <div class="section">
            <div class="section-title">3. Content Funnel Architecture</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 25%;">Funnel Stage</th>
                  <th style="width: 15%;">Allocation</th>
                  <th>Objective & Content Focus</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Brand Awareness (TOFU)</strong></td>
                  <td><span class="badge">50%</span></td>
                  <td>${funnel.awareness || `Educational content, viral hooks, and SEO optimization for ${brandName}.`}</td>
                </tr>
                <tr>
                  <td><strong>Lead Nurturing (MOFU)</strong></td>
                  <td><span class="badge badge-amber">30%</span></td>
                  <td>${funnel.nurturing || `How-to guides, lead magnets, and value breakdown posts to build audience trust.`}</td>
                </tr>
                <tr>
                  <td><strong>Conversion (BOFU)</strong></td>
                  <td><span class="badge badge-green">20%</span></td>
                  <td>${funnel.conversion || `Direct sales copy, customer proof, case studies, and primary offer CTAs.`}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 4: Content Pillars & Campaign Ideas -->
          ${(contentPillars && contentPillars.length > 0) || (campaignIdeas && campaignIdeas.length > 0) ? `
          <div class="section">
            <div class="section-title">4. Brand Pillars & High-Impact Campaigns</div>
            ${contentPillars && contentPillars.length > 0 ? `
              <div style="margin-bottom: 12px;">
                <div class="card-label" style="margin-bottom: 6px;">Content Pillars:</div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  ${contentPillars.map(p => `<span class="badge" style="padding: 5px 10px; font-size: 10px;">${p}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${campaignIdeas && campaignIdeas.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th style="width: 30%;">Campaign Title</th>
                    <th>Concept & Strategic Focus</th>
                  </tr>
                </thead>
                <tbody>
                  ${campaignIdeas.map(c => `
                    <tr>
                      <td><strong>${c.title || 'Campaign Concept'}</strong></td>
                      <td>${c.desc || c.description || ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>
          ` : ''}

          <!-- Section 5: 30-Day Execution Calendar -->
          <div class="section">
            <div class="section-title">5. 30-Day Execution Plan</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 7%;">Day</th>
                  <th style="width: 14%;">Platform</th>
                  <th style="width: 20%;">Pillar</th>
                  <th>Topic & Directive</th>
                </tr>
              </thead>
              <tbody>
                ${(thirtyDayPlan && thirtyDayPlan.length > 0 ? thirtyDayPlan : []).map(item => `
                  <tr>
                    <td><strong>Day ${item.day}</strong></td>
                    <td><span class="badge">${item.platform || 'Social'}</span></td>
                    <td>${item.pillar || 'Brand Focus'}</td>
                    <td>
                      <strong>${formatPostTitle(item.title || item.topic, item.action || item.actionItem)}</strong>
                      ${(item.action || item.actionItem) ? `<div style="color:#64748b; font-size:9.5px; margin-top:2px;">${item.action || item.actionItem}</div>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            Generated by AI ADS™ Autonomous Marketing Strategy System • ${new Date().getFullYear()}
          </div>
        </body>
      </html>
    `);
    pri.document.close();

    setTimeout(() => {
      pri.focus();
      pri.print();
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch(e) {}
      }, 1000);
    }, 500);
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const updatedStrategy = {
      ...(activeWorkspace.currentStrategy || {}),
      businessGoal, leadMagnet, primaryCta, channelMix,
      postingFrequency, budgetSuggestions, bestPlatforms,
      contentPillars, campaignIdeas, thirtyDayPlan, funnel, audience,
      customImageBriefs, customStrategy,
      gtmStrategy, seoStrategy, geoStrategy,
    };
    await updateWorkspace(activeWorkspace.id || activeWorkspace._id, { currentStrategy: updatedStrategy });
    setIsSaving(false);
    setEditingField(null);
    setIsSavedState(true);
    setShowSaveToast(true);
    setTimeout(() => {
      setIsSavedState(false);
      setShowSaveToast(false);
    }, 3000);
  }, [activeWorkspace, businessGoal, leadMagnet, primaryCta, channelMix,
      postingFrequency, budgetSuggestions, bestPlatforms, contentPillars,
      campaignIdeas, thirtyDayPlan, funnel, audience, customImageBriefs, customStrategy,
      gtmStrategy, seoStrategy, geoStrategy, updateWorkspace]);

  // ─── Generate AI Strategy ─────────────────────────────────────────────────
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const id = activeWorkspace.id || activeWorkspace._id || 'default_ws';
      let strategy = null;
      try {
        const data = await strategyAPI.generate(id);
        if (data && data.strategy) {
          strategy = data.strategy.data || (typeof data.strategy === 'object' && !data.strategy.data ? data.strategy : null);
        }
      } catch (apiErr) {
        console.log('Strategy API notice:', apiErr.message);
      }

      if (!strategy) {
        const brandName = activeWorkspace.brandName || 'Brand';
        const industry = activeWorkspace.industryCategory || activeWorkspace.industry || 'Consumer Products';
        const topics = (activeWorkspace.contentPillars && activeWorkspace.contentPillars.length > 0)
          ? activeWorkspace.contentPillars
          : [`${brandName} Product Value`, `Industry Trends in ${industry}`, `Customer Proof & Reviews`, `How-to Guides`];
        const platforms = ['SEO Blog', 'LinkedIn', 'Instagram', 'Email Newsletter'];

        const fallbackPlan = Array.from({ length: 30 }, (_, i) => {
          const day = i + 1;
          const pillar = topics[i % topics.length];
          const platform = platforms[i % platforms.length];
          return {
            day,
            title: `Day ${day}: ${pillar} - Key Insights for ${brandName}`,
            topic: `${pillar} Focus: Essential Strategies & Tips`,
            platform,
            pillar,
            status: 'PLANNED',
            action: `Publish ${platform} content highlighting ${brandName}'s core value in ${industry}.`
          };
        });

        strategy = {
          businessGoal: deriveGoal(activeWorkspace),
          leadMagnet: deriveLeadMagnet(activeWorkspace),
          primaryCta: deriveCta(activeWorkspace),
          postingFrequency: 'Daily',
          budgetSuggestions: '60% Organic content marketing & SEO / 40% Paid micro-targeting & retargeting.',
          bestPlatforms: ['LinkedIn', 'Google SEO Blog', 'Email Newsletter', 'Instagram & Reels'],
          contentPillars: topics,
          campaignIdeas: [
            { title: `${brandName} Authority Series`, desc: `Long-form thought leadership posts demonstrating domain mastery.` },
            { title: `Lead Magnet Opt-In Push`, desc: `Direct-response opt-in push using landing page & email funnel.` },
            { title: `Social Proof Sprint`, desc: `Customer testimonials & case-study carousel posts for trust.` }
          ],
          thirtyDayPlan: fallbackPlan,
          funnel: {
            awareness: `Pillar-driven content, SEO optimization, and educational hooks to drive top-of-funnel reach for ${brandName}.`,
            nurturing: `Interactive guides, how-to value-bombs, and lead magnet resources to capture email subscribers.`,
            conversion: `Direct sales copy, verified client testimonials, case studies, and primary product benefit pushes.`
          },
          audience: Array.isArray(activeWorkspace.targetAudience) ? activeWorkspace.targetAudience : [activeWorkspace.targetAudience || `Target consumers in ${industry}`]
        };
      }

      setBusinessGoal(strategy.businessGoal || '');
      setLeadMagnet(strategy.leadMagnet || '');
      setPrimaryCta(strategy.primaryCta || '');
      setPostingFrequency(strategy.postingFrequency || 'Daily');
      setBudgetSuggestions(strategy.budgetSuggestions || '');
      setBestPlatforms(strategy.bestPlatforms || []);
      setContentPillars(strategy.contentPillars || []);
      setCampaignIdeas(strategy.campaignIdeas || []);
      setThirtyDayPlan(strategy.thirtyDayPlan || []);
      setFunnel(strategy.funnel || { awareness: '', nurturing: '', conversion: '' });
      setAudience(strategy.audience || []);
      if (strategy.channelMix) setChannelMix(strategy.channelMix);

      if (updateWorkspace && id) {
        await updateWorkspace(id, { currentStrategy: strategy });
      }
      if (setGeneratedStrategy) setGeneratedStrategy(strategy);
      setGeneratedDoc(true);
      setShowRegenToast(true);
      setTimeout(() => setShowRegenToast(false), 4000);
    } catch (err) {
      console.log('Strategy generation error:', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Generate Strategy for Campaign Duration ─────────────────────────────
  const handleGenerateForCampaign = async (numDays, campaignGoal) => {
    setIsGenerating(true);
    try {
      const days = Number(numDays) || 30;
      const brandName = activeWorkspace.brandName || 'Brand';
      const industry = activeWorkspace.industryCategory || activeWorkspace.industry || 'Consumer Products';
      const topics = (activeWorkspace.contentPillars && activeWorkspace.contentPillars.length > 0)
        ? activeWorkspace.contentPillars
        : [`${brandName} Product Value`, `Industry Trends in ${industry}`, `Customer Proof & Reviews`, `How-to Guides`];
      const platforms = ['SEO Blog', 'LinkedIn', 'Instagram', 'Email Newsletter'];

      const generatedPlan = Array.from({ length: days }, (_, i) => {
        const day = i + 1;
        const pillar = topics[i % topics.length];
        const platform = platforms[i % platforms.length];
        return {
          day,
          title: `Day ${day}: ${pillar} - ${campaignGoal || `Key Insights for ${brandName}`}`,
          topic: `${pillar} Focus: ${campaignGoal || 'Essential Strategies & Tips'}`,
          platform,
          pillar,
          status: 'PLANNED',
          action: `Publish ${platform} content highlighting ${brandName}'s core value in ${industry}.`
        };
      });

      setThirtyDayPlan(generatedPlan);
      setGeneratedDoc(true);
      setActiveTab('plan');
    } catch (err) {
      console.log('Campaign strategy generation error:', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Generate Calendar Events ─────────────────────────────────────────────
  const handleGenerateCalendar = () => {
    if (!thirtyDayPlan || thirtyDayPlan.length === 0) {
      showCustomAlert({ title: 'No Strategy Generated', message: 'Please generate a brand strategy plan first before scheduling calendar entries.', type: 'warning' });
      return;
    }
    setScheduleDays(String(Math.min(30, thirtyDayPlan.length)));
    setShowScheduleModal(true);
  };

  const [isCreatingCalendarCampaign, setIsCreatingCalendarCampaign] = useState(false);

  const confirmGenerateCalendar = async (numDays) => {
    const daysToGen = Math.min(Number(numDays) || 30, Math.max(30, thirtyDayPlan.length || 30));
    localStorage.setItem('aisa_selected_schedule_days', String(daysToGen));
    setIsCreatingCalendarCampaign(true);

    try {
      const today = new Date();
      const end = new Date(today);
      end.setDate(today.getDate() + (daysToGen - 1));

      // Filter plan to only generate up to daysToGen
      const planToUse = (thirtyDayPlan.length >= daysToGen)
        ? thirtyDayPlan.filter(item => item.day <= daysToGen)
        : Array.from({ length: daysToGen }, (_, i) => {
            const day = i + 1;
            const existing = thirtyDayPlan.find(d => d.day === day);
            if (existing) return existing;
            const pillar = contentPillars[i % (contentPillars.length || 1)] || 'Product Value';
            return {
              day,
              platform: bestPlatforms[i % (bestPlatforms.length || 1)] || 'Instagram',
              topic: `Day ${day}: Strategic ${pillar} for ${activeWorkspace?.brandName || 'Brand'}`,
              pillar,
              actionItem: `Publish content showcasing ${pillar} benefits and drive engagement.`
            };
          });

      const brandName = activeWorkspace?.brandName || 'Brand';
      const wsId = activeWorkspace?.id || activeWorkspace?._id || 'ws_001';

      // Extract unique platforms
      const platformsToUse = [...new Set(planToUse.map(d => {
        const raw = (d.platform || '').toLowerCase();
        if (raw.includes('linkedin')) return 'LinkedIn';
        if (raw.includes('instagram') || raw.includes('reels')) return 'Instagram';
        if (raw.includes('email') || raw.includes('newsletter')) return 'Email';
        if (raw.includes('youtube') || raw.includes('video')) return 'YouTube';
        if (raw.includes('blog') || raw.includes('seo')) return 'Blog';
        return 'Instagram';
      }))];

      const payload = {
        workspaceId: wsId,
        campaignName: `${brandName} ${daysToGen}-Day Strategy Campaign`,
        campaignGoal: businessGoal || activeWorkspace?.currentStrategy?.businessGoal || 'Comprehensive Growth Roadmap',
        startDate: today.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        postingFrequency: postingFrequency || 'Daily',
        platforms: platformsToUse.length > 0 ? platformsToUse : ['Instagram', 'LinkedIn', 'YouTube'],
      };

      const res = await campaignAPI.create(payload);
      if (res.success && res.campaign) {
        await campaignAPI.generatePlan(res.campaign._id, { strategyPlan: planToUse });
        localStorage.setItem('aisa_selected_campaign_id', res.campaign._id);
      }

      const eventsToCreate = planToUse.map(item => {
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + (item.day - 1));
        
        return {
          title: item.topic || `Day ${item.day} Content`,
          date: eventDate.toISOString().split('T')[0],
          platform: item.platform || 'Blog',
          pillar: activeWorkspace?.brandName || 'Brand Strategy',
          status: 'SCHEDULED',
          owner: 'Content Strategist'
        };
      });

      bulkAddCalendarEvents(eventsToCreate);
    } catch (e) {
      console.warn('Calendar campaign generation notice:', e.message);
    } finally {
      setIsCreatingCalendarCampaign(false);
      setShowScheduleModal(false);
      setActiveModule('calendar'); // Transition to calendar view
    }
  };

  // ─── Derived data ─────────────────────────────────────────────────────────
  const totalPct = channelMix.reduce((s, c) => s + c.pct, 0);

  const filteredPlan = selectedWeek === 'ALL'
    ? thirtyDayPlan
    : thirtyDayPlan.filter(d => getWeekLabel(d.day) === Number(selectedWeek));

  const objectiveCards = [
    { key: 'businessGoal', label: t('primaryBusinessGoal', 'Primary Business Goal'), sublabel: t('primaryBusinessGoalSub', 'North-star metric for all content strategy'), value: businessGoal, setter: setBusinessGoal, icon: Crosshair, iconBg: 'bg-gradient-to-br from-violet-500 to-indigo-600', tag: 'GOAL', tagColor: 'bg-violet-500/15 text-violet-700 dark:text-violet-300' },
    { key: 'leadMagnet',   label: t('leadMagnetOffer', 'Lead Magnet / Offer'),   sublabel: t('leadMagnetOfferSub', 'High-value asset to capture qualified leads'),  value: leadMagnet,   setter: setLeadMagnet,   icon: Gift,           iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',  tag: 'OFFER', tagColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
    { key: 'primaryCta',   label: t('primaryCtaTitle', 'Primary CTA'),           sublabel: t('primaryCtaSub', 'Main call-to-action across all touchpoints'),    value: primaryCta,   setter: setPrimaryCta,   icon: MousePointerClick, iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500', tag: 'CTA',   tagColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  ];

  const funnelStages = [
    { label: t('brandAwareness', 'Brand Awareness'), mix: '50%', desc: funnel.awareness,  goal: t('organicTrafficReach', 'Organic Traffic & Reach'), border: 'border-brand-500/40',   bg: 'bg-brand-500/5 dark:bg-brand-500/10',   badge: 'bg-brand-500/15 text-brand-700 dark:text-brand-300',   text: 'text-brand-600 dark:text-brand-400',   bar: 'bg-brand-500',   barW: 'w-[50%]' },
    { label: t('leadNurturing', 'Lead Nurturing'),  mix: '30%', desc: funnel.nurturing,  goal: t('leadCaptures', 'Lead Captures'),           border: 'border-purple-500/40',  bg: 'bg-purple-500/5 dark:bg-brand-500/10', badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300', text: 'text-brand-600 dark:text-brand-400', bar: 'bg-purple-500', barW: 'w-[30%]' },
    { label: t('conversion', 'Conversion'),      mix: '20%', desc: funnel.conversion, goal: t('salesRevenue', 'Sales & Revenue'),         border: 'border-emerald-500/40', bg: 'bg-emerald-500/5 dark:bg-emerald-500/10', badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', barW: 'w-[20%]' },
  ];

  const weekStats = [1,2,3,4].map(w => {
    const days = thirtyDayPlan.filter(d => getWeekLabel(d.day) === w);
    const fullTheme = days[0]?.topic || days[0]?.theme || days[0]?.title || `Week ${w} Strategy Focus`;
    return { week: w, count: days.length, theme: fullTheme };
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in relative">

      {/* ── SAVE SUCCESS FLOATING NOTIFICATION ── */}
      {showSaveToast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 text-white p-3.5 px-4 rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3 max-w-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white flex items-center justify-between">
                <span>{t('strategySavedSuccessfully', 'Strategy Saved Successfully')}</span>
                <button
                  onClick={() => setShowSaveToast(false)}
                  className="text-slate-400 hover:text-white transition-colors ml-2 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {t('strategySavedSub', 'Your growth roadmap & campaign settings are updated.')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── REGENERATE SUCCESS FLOATING NOTIFICATION ── */}
      {showRegenToast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-brand-500/40 text-white p-3.5 px-4 rounded-2xl shadow-2xl shadow-brand-500/20 flex items-center gap-3 max-w-sm">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white flex items-center justify-between">
                <span>{t('strategyRegenerated', 'Strategy Regenerated!')}</span>
                <button
                  onClick={() => setShowRegenToast(false)}
                  className="text-slate-400 hover:text-white transition-colors ml-2 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {t('deepBrandDnaComplete', 'Deep Brand DNA analysis complete for')} <strong className="text-brand-300">{activeWorkspace.brandName}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── IMAGE BRIEF SUCCESS FLOATING NOTIFICATION ── */}
      {showImageBriefToast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-purple-500/40 text-white p-3.5 px-4 rounded-2xl shadow-2xl shadow-purple-500/20 flex items-center gap-3 max-w-sm">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <UploadCloud className="w-4.5 h-4.5 text-purple-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white flex items-center justify-between">
                <span>{t('visualGuidanceSaved', 'Visual Guidance Saved')}</span>
                <button
                  onClick={() => setShowImageBriefToast(false)}
                  className="text-slate-400 hover:text-white transition-colors ml-2 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {imageBriefToastMsg}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ HEADER ══════════ */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl accent-card bg-gradient-to-r from-purple-500/8 via-indigo-500/5 to-pink-500/8 dark:from-purple-950/30 dark:to-slate-900/90 border border-purple-200/60 dark:border-purple-800/40 shadow-md backdrop-blur-xl">
        {/* Decorative background orbs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-gradient-to-br from-brand-500/10 to-purple-500/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/8 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          {/* Left: Title block */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 dark:from-brand-300 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent leading-none tracking-tight">
                  {selectedStrategyType === 'campaign' ? t('campaignMarketingStrategy', 'Campaign Marketing Strategy') : selectedStrategyType === 'custom' ? t('imageBriefVisualStrategy', 'Image Brief Visual Strategy') : t('strategyTitle', 'Marketing Strategy & Roadmap')}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold">
                  {selectedStrategyType === 'campaign' ? t('integratedGtmSeoGeoSub', 'Integrated GTM, SEO & GEO roadmap derived from your active campaign.') : selectedStrategyType === 'custom' ? t('custom30DayVisualSub', 'Custom 30-day visual social roadmap generated from reference image brief.') : t('aiGenerated30DayBlueprint', 'AI-generated 30-day growth blueprint for')}{' '}
                  <span className="font-black text-brand-600 dark:text-brand-300 px-1.5 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20">{activeWorkspace.brandName}</span>
                </p>
                {activeWorkspace.currentStrategy?.campaignName && selectedStrategyType === 'campaign' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-black mt-1.5 shadow-sm">
                    <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('campaignFocus', 'Campaign Focus')}: <strong>{activeWorkspace.currentStrategy.campaignName}</strong></span>
                    <button
                      onClick={() => setActiveModule('campaigns')}
                      className="ml-1 text-[11px] underline hover:text-emerald-950 dark:hover:text-emerald-100 font-extrabold"
                    >
                      {t('backToCampaign', 'Back to Campaign →')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            {generatedDoc && (
              <div className="flex items-center gap-1 mt-2 bg-white/60 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-1.5 w-fit flex-wrap border border-purple-200/50 dark:border-purple-800/40 shadow-inner">
                {[
                  { id: 'overview',   label: t('overviewTab', 'Overview'),   icon: BarChart2 },
                  { id: 'plan',       label: t('masterStrategyTab', '30 Day Strategy'), icon: Calendar  },
                  ...(customStrategy ? [{ id: 'custom', label: t('customStrategyTab', 'Custom Strategy'), icon: Sparkles, isCustom: true }] : []),
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-white/50'
                    } ${tab.isCustom ? 'text-purple-700 dark:text-purple-300' : ''}`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.isCustom && (
                      <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[8px] font-black uppercase ml-0.5">AI</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end flex-wrap">
            {generatedDoc && (
              <button
                onClick={handleDownloadPDF}
                className="btn-primary px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                title="Download full 30-day marketing strategy report as PDF to your device"
              >
                <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center shadow-sm text-white">
                  <Download className="w-3.5 h-3.5 text-white" />
                </div>
                <span>{t('downloadStrategyPdf', 'Download Strategy PDF')}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (isCampaignLocked) {
                  showCustomAlert({
                    title: 'Feature Locked',
                    message: 'Image Brief Strategy is a premium feature. Please upgrade your plan to unlock.',
                    type: 'warning',
                    confirmText: 'Upgrade Plan',
                    cancelText: 'Cancel'
                  });
                  return;
                }
                setShowImageBriefModal(true);
              }}
              className="group relative px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-extrabold text-xs tracking-wider border border-slate-200 dark:border-slate-700 hover:border-brand-500/50 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              title="Upload reference image and specify custom visual instructions for AI strategy"
            >
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm text-white">
                <UploadCloud className="w-3.5 h-3.5 text-white" />
              </div>
              <span>{t('uploadImageBrief', 'Upload Image Brief')}</span>
            </button>

            {activeTab !== 'custom' && selectedStrategyType === 'aiBrand' && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="group relative px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                title={`Perform a deep AI Brand DNA re-analysis for ${activeWorkspace.brandName}`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t('reAnalyzingBrandDna', 'Re-Analyzing Brand DNA...')}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-white transition-transform group-hover:rotate-180 duration-500" />
                    <span>{t('regenerateStrategy', 'Regenerate Strategy')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ STRATEGY SELECTOR BAR ══════════ */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md w-full flex-wrap sm:flex-nowrap backdrop-blur-md">
        {/* Strategy 1: Campaign Strategy */}
        <button
          onClick={() => setSelectedStrategyType('campaign')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-200 cursor-pointer ${
            selectedStrategyType === 'campaign'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-300" />
          <span>{t('campaignStrategy', 'Campaign Strategy')}</span>
          {isCampaignLocked ? (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-500 dark:text-amber-300 text-[9px] font-black border border-amber-500/30 flex items-center gap-0.5">
              <Lock className="w-2.5 h-2.5" /> {t('proTag', 'PRO')}
            </span>
          ) : (activeWorkspace.currentStrategy?.campaignStrategy || activeWorkspace.currentStrategy?.campaignName) ? (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[9px] font-extrabold">{t('activeTag', 'Active')}</span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-medium">{t('notCreatedTag', 'Not Created')}</span>
          )}
        </button>

        {/* Strategy 3: Image Brief Strategy */}
        <button
          onClick={() => setSelectedStrategyType('custom')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-200 cursor-pointer ${
            selectedStrategyType === 'custom'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-purple-300" />
          <span>{t('imageBriefStrategy', 'Image Brief Strategy')}</span>
          {customStrategy ? (
            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[9px] font-extrabold">{t('readyTag', 'Ready')}</span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-medium">{t('uploadBriefTag', 'Upload Brief')}</span>
          )}
        </button>
      </div>

      {/* ══════════ CONTEXTUAL EMPTY & LOCKED STATES ══════════ */}
      {selectedStrategyType === 'campaign' && isCampaignLocked && (
        <div className="text-center py-16 p-8 rounded-3xl accent-card glass-card border border-brand-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white mt-6 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-lg">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40">
            {t('proFeatureLocked', 'Pro Feature Locked')}
          </span>
          <h3 className="text-xl font-extrabold text-white mt-3 mb-2">{t('campaignStrategyLockedTitle', 'Campaign Strategy is Locked on Starter Plan')}</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
            {t('campaignStrategyLockedSub', 'Campaign-driven strategy roadmaps require the Pro / Growth subscription plan. Upgrade now to unlock autonomous campaigns and campaign strategies.')}
          </p>
          <button
            onClick={() => setActiveModule('settings')}
            className="btn-primary text-xs flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 hover:scale-105 transition-all cursor-pointer font-extrabold"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t('upgradePlanToUnlock', 'Upgrade Plan to Unlock')}</span>
          </button>
        </div>
      )}

      {selectedStrategyType === 'campaign' && !isCampaignLocked && !activeWorkspace.currentStrategy?.campaignStrategy && !activeWorkspace.currentStrategy?.campaignName && (
        <div className="text-center py-16 p-8 rounded-3xl accent-card glass-card border border-dashed border-slate-300 dark:border-slate-700 mt-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-500 shadow-sm">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">{t('noCampaignStrategyTitle', 'No Campaign Strategy Created Yet')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {t('noCampaignStrategySub', 'Build a campaign in the Campaigns module to automatically generate an integrated 30-day Go-To-Market, SEO, and GEO campaign strategy.')}
          </p>
          <button
            onClick={() => setActiveModule('campaigns')}
            className="btn-primary text-xs flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 hover:scale-105 transition-all cursor-pointer font-extrabold"
          >
            <Target className="w-4 h-4 text-white" />
            <span>{t('proceedToCampaignModule', 'Proceed to Campaign Module →')}</span>
          </button>
        </div>
      )}

      {selectedStrategyType === 'custom' && !customStrategy && (
        <div className="text-center py-16 p-8 rounded-3xl accent-card glass-card border border-dashed border-purple-300 dark:border-purple-800/60 mt-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400 shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">{t('noImageBriefTitle', 'No Image Brief Strategy Generated Yet')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {t('noImageBriefSub', 'Upload a reference product image and enter custom visual instructions to generate an image-guided 30-day social media roadmap.')}
          </p>
          <button
            onClick={() => {
              if (isCampaignLocked) {
                showCustomAlert({
                  title: 'Feature Locked',
                  message: 'Image Brief Strategy is a premium feature. Please upgrade your plan to unlock.',
                  type: 'warning',
                  confirmText: 'Upgrade Plan',
                  cancelText: 'Cancel'
                });
                return;
              }
              setShowImageBriefModal(true);
            }}
            className="btn-primary text-xs flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 hover:scale-105 transition-all cursor-pointer font-extrabold"
          >
            <UploadCloud className="w-4 h-4 text-white" />
            <span>{t('uploadImageBrief', 'Upload Image Brief')}</span>
          </button>
        </div>
      )}

      {/* ══════════ DEFAULT AI BRAND EMPTY STATE (NOT GENERATED) ══════════ */}
      {selectedStrategyType === 'aiBrand' && !generatedDoc && (
        <div className="text-center py-20 rounded-3xl accent-card glass-card border border-dashed border-slate-200 dark:border-slate-700 mt-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500/20 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-brand-500" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">{t('generateYourMasterStrategy', 'Generate Your Master Strategy')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {t('generateMasterStrategySub', 'Click "Generate Master Strategy" to get an AI-powered growth blueprint, channel mix, and 30-day content calendar.')}
          </p>
          <button onClick={handleGenerate} disabled={isGenerating} className="btn-primary text-sm flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl disabled:opacity-50 shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all">
            {isGenerating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('generatingStrategy', 'Generating Strategy...')}</>
              : <><Zap className="w-4 h-4 text-amber-300 fill-amber-300" /> {t('generateMasterStrategyBtn', 'Generate Master Strategy')}</>
            }
          </button>
        </div>
      )}

      {/* ══════════ TAB: OVERVIEW ══════════ */}
      {generatedDoc && activeTab === 'overview' && (
        <div className="space-y-6">

          {/* ROW 1: Objectives + Channel Mix */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left: 3 Objective Cards */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  {t('objectivesPathTitle', 'Objectives & Conversion Path')}
                </h2>
              </div>

              <div className="space-y-3.5">
                {objectiveCards.map(card => {
                  const IconComp  = card.icon;
                  const isEditing = editingField === card.key;
                  const cardGradients = {
                    businessGoal: 'from-violet-500/5 via-indigo-500/3 to-purple-500/5 dark:from-violet-950/30 dark:to-slate-900/90 border-violet-200/60 dark:border-violet-900/40',
                    leadMagnet: 'from-amber-500/5 via-orange-500/3 to-yellow-500/5 dark:from-amber-950/30 dark:to-slate-900/90 border-amber-200/60 dark:border-amber-900/40',
                    primaryCta: 'from-emerald-500/5 via-teal-500/3 to-cyan-500/5 dark:from-emerald-950/30 dark:to-slate-900/90 border-emerald-200/60 dark:border-emerald-900/40',
                  };
                  return (
                    <div key={card.key} className={`group relative p-5 rounded-2xl bg-gradient-to-br ${cardGradients[card.key]} border backdrop-blur-md hover:shadow-md transition-all duration-300 flex gap-4`}>
                      <div className={`shrink-0 w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-sm ring-4 ring-white/40 dark:ring-slate-900/50`}>
                        <IconComp className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-2xs ${card.tagColor}`}>{card.tag}</span>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider">{card.label}</span>
                        </div>
                        {isEditing ? (
                          <input
                            type="text" value={card.value}
                            onChange={e => card.setter(e.target.value)}
                            onBlur={() => { handleSave(); setEditingField(null); }}
                            onKeyDown={e => { if (e.key === 'Enter') { handleSave(); setEditingField(null); }}}
                            autoFocus className="flex-1 glass-input text-xs font-bold py-2.5 w-full bg-white/80 dark:bg-slate-800"
                          />
                        ) : (
                          <div onClick={() => setEditingField(card.key)} className="cursor-pointer flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors -ml-3">
                            <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">{t(card.value)}</p>
                            <Edit3 className="w-4 h-4 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-3 border-l-2 border-slate-300 dark:border-slate-700 font-medium">{card.sublabel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Channel Mix */}
            <div className="lg:col-span-2">
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-blue-500/6 via-cyan-500/4 to-indigo-500/6 dark:from-blue-950/30 dark:to-slate-900/90 border border-blue-200/60 dark:border-blue-900/40 shadow-sm backdrop-blur-md flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                      <PieChart className="w-3.5 h-3.5" />
                    </div>
                    {t('channelMix', 'Channel Mix')}
                  </h2>
                  <span className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-200/50">{totalPct}% {t('totalTag', 'Total')}</span>
                </div>

                {/* Donut */}
                <div className="flex justify-center mb-5">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      {(() => {
                        let offset = 0;
                        const r = 48;
                        const circ = 2 * Math.PI * r;
                        const grads = [['#8B5CF6','#6366F1'],['#3B82F6','#06B6D4'],['#F59E0B','#F97316'],['#EC4899','#F43F5E']];
                        return channelMix.map((ch, i) => {
                          const pct = ch.pct / totalPct;
                          const dash = pct * circ;
                          const gap  = circ - dash;
                          const cur  = offset;
                          offset += pct * circ;
                          const gid = `g${i}`;
                          return (
                            <React.Fragment key={ch.label}>
                              <defs><linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%"   stopColor={grads[i]?.[0] || '#6366F1'} />
                                <stop offset="100%" stopColor={grads[i]?.[1] || '#8B5CF6'} />
                              </linearGradient></defs>
                              <circle cx="60" cy="60" r={r} fill="none" stroke={`url(#${gid})`} strokeWidth="12"
                                strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-cur} strokeLinecap="round"
                                className="transition-all duration-1000 ease-out" />
                            </React.Fragment>
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{channelMix.length}</span>
                      <span className="text-[9px] text-slate-600 dark:text-slate-300 font-black uppercase tracking-wider">{t('channelsLabel', 'Channels')}</span>
                    </div>
                  </div>
                </div>

                {/* Channel list */}
                <div className="flex-1 space-y-3">
                  {channelMix.map(ch => {
                    let Icon = Globe;
                    if (ch.icon === 'Linkedin')  Icon = Linkedin;
                    if (ch.icon === 'Mail')       Icon = Mail;
                    if (ch.icon === 'Instagram')  Icon = Instagram;
                    const colors = channelColors[ch.icon] || channelColors.Globe;
                    return (
                      <div key={ch.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-slate-900/50 border border-blue-400/20 hover:bg-white/60 transition-colors">
                        <div className={`shrink-0 w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center ring-2 ${colors.ring}`}>
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">{t(ch.label)}</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white ml-2">{ch.pct}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200/60 dark:bg-slate-800 overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-1000`} style={{ width: `${ch.pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: AI Suggestions Row — Platforms | Frequency | Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Best Platforms */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/6 via-purple-500/4 to-violet-500/6 dark:from-indigo-950/30 dark:to-slate-900/90 border border-indigo-200/60 dark:border-indigo-900/40 backdrop-blur-md shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t('bestPlatforms', 'Best Platforms')}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {bestPlatforms.map((p, i) => {
                  const PIcon = getPlatformIcon(p);
                  return (
                    <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold ring-1 shadow-2xs ${getPlatformColor(p)}`}>
                      <PIcon className="w-3.5 h-3.5" /> {t(p)}
                    </span>
                  );
                })}
              </div>
              {bestPlatforms.length === 0 && (
                <p className="text-xs text-slate-400 italic">{t('generateStrategyPlatformRec', 'Generate strategy to get AI platform recommendations')}</p>
              )}
            </div>

            {/* Posting Frequency */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/6 via-teal-500/4 to-cyan-500/6 dark:from-emerald-950/30 dark:to-slate-900/90 border border-emerald-200/60 dark:border-emerald-900/40 backdrop-blur-md shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-sm">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t('postingFrequency', 'Posting Frequency')}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-300/40 dark:border-emerald-800/40 flex items-center justify-center shadow-xs">
                  <Flame className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{t(postingFrequency)}</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">{t('aiRecommended', 'AI RECOMMENDED')}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {t('consistentPublishingSub', "Consistent publishing schedule optimized for growth targets.")}
              </p>
            </div>

            {/* Budget */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/6 via-orange-500/4 to-yellow-500/6 dark:from-amber-950/30 dark:to-slate-900/90 border border-amber-200/60 dark:border-amber-900/40 backdrop-blur-md shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t('budgetStrategy', 'Budget Strategy')}</h3>
              </div>
              <div className="space-y-2">
                {budgetSuggestions.split('/').map((part, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${i === 0 ? 'bg-brand-500' : 'bg-amber-500'}`} />
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-snug">{t(part.trim())}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 3: Content Pillars + Target Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Content Pillars */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-500/6 via-pink-500/4 to-purple-500/6 dark:from-rose-950/30 dark:to-slate-900/90 border border-rose-200/60 dark:border-rose-900/40 backdrop-blur-md shadow-sm space-y-4">
              <h2 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-500 dark:text-rose-400" /> {t('contentPillars', 'Content Pillars')}
              </h2>
              <div className="grid grid-cols-1 gap-2.5">
                {contentPillars.map((pillar, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-rose-200/50 dark:border-rose-900/30 text-slate-900 dark:text-white font-bold text-xs shadow-2xs">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">{i + 1}</div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{t(pillar)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/6 via-indigo-500/4 to-pink-500/6 dark:from-purple-950/30 dark:to-slate-900/90 border border-purple-200/60 dark:border-purple-900/40 backdrop-blur-md shadow-sm space-y-4">
              <h2 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500 dark:text-purple-400" /> {t('targetAudience', 'Target Audience')}
              </h2>
              <div className="grid grid-cols-1 gap-2.5">
                {(audience.length > 0 ? audience : (activeWorkspace.targetAudience || []).slice(0, 4)).map((persona, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-purple-200/50 dark:border-purple-900/30 text-slate-900 dark:text-white font-bold text-xs shadow-2xs">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs mt-0.5">{i + 1}</div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-white leading-snug">{t(persona)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 3.5: Custom Visual Directives & Uploaded Images */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/6 via-indigo-500/4 to-cyan-500/6 dark:from-purple-950/30 dark:to-slate-900/90 border border-purple-200/60 dark:border-purple-900/40 backdrop-blur-md shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  {t('customVisualDirectivesAssets', 'Custom Visual Directives & Uploaded Assets')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {t('referenceImagesSub', 'Reference images and specific visual instructions provided for strategy and visual asset creation')}
                </p>
              </div>
              <button
                onClick={() => {
                  if (isCampaignLocked) {
                    showCustomAlert({
                      title: 'Feature Locked',
                      message: 'Image Brief Strategy is a premium feature. Please upgrade your plan to unlock.',
                      type: 'warning',
                      confirmText: 'Upgrade Plan',
                      cancelText: 'Cancel'
                    });
                    return;
                  }
                  setShowImageBriefModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{t('uploadImageBrief', 'Upload Image Brief')}</span>
              </button>
            </div>

            {customImageBriefs && customImageBriefs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {customImageBriefs.map((brief) => (
                  <div key={brief.id} className="group relative p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-purple-200/50 flex items-start gap-4 hover:border-purple-400 transition-all shadow-2xs">
                    {brief.imageUrl ? (
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-purple-200/60 shrink-0 flex items-center justify-center">
                        <img src={brief.imageUrl} alt={brief.fileName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-8 h-8 text-purple-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{brief.fileName}</span>
                        <button
                          onClick={() => handleDeleteImageBrief(brief.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                          title="Delete image brief"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic leading-snug font-medium">
                        "{brief.directive || t('noSpecificInstruction', 'No specific text instruction provided.')}"
                      </p>
                      <span className="inline-block text-[10px] text-purple-600 dark:text-purple-400 font-bold">{brief.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-purple-200 dark:border-purple-800/40 bg-purple-500/5 text-center space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {t('noImageReferenceBriefsUploaded', 'No image reference briefs uploaded yet. Click Upload Image Brief to upload product photos or layout reference images and tell AI how to use them.')}
                </p>
              </div>
            )}
          </div>


          {/* ══════════ ROW: GTM, SEO & GEO STRATEGY INTELLIGENCE ══════════ */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-500/8 via-purple-500/5 to-cyan-500/8 dark:from-slate-900/95 dark:to-slate-900/90 border border-indigo-200/60 dark:border-indigo-900/40 shadow-sm backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('gtmSeoGeoEngineTitle', 'GTM, SEO & GEO Marketing Engine')}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                    {t('planTopicsIntegrated', 'Plan Topics Integrated')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {t('autonomousGtmSub', 'Autonomous Go-To-Market launch phases, organic search keyword clusters, and regional geo-targeting derived directly from your campaign plan.')}
                </p>
              </div>

              {/* Sub-tabs: GTM | SEO | GEO */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-fit self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (!isHighestPlan) {
                      showCustomAlert({
                        title: 'Feature Locked',
                        message: 'GTM Strategy is a premium feature. Please upgrade your plan to unlock.',
                        type: 'warning',
                        confirmText: 'Upgrade Plan',
                        cancelText: 'Cancel'
                      });
                    } else {
                      setGeoSeoGtmTab('gtm');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    geoSeoGtmTab === 'gtm' && !isHighestPlan
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white'
                  }`}
                >
                  {!isHighestPlan ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : <Rocket className="w-3.5 h-3.5" />}
                  <span>{t('gtmTab', 'Go-To-Market (GTM)')}</span>
                  {!isHighestPlan && <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[9px] font-medium flex items-center gap-1">PRO</span>}
                </button>
                <button
                  type="button"
                  onClick={() => setGeoSeoGtmTab('seo')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    geoSeoGtmTab === 'seo'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{t('seoTab', 'SEO Strategy')}</span>
                </button>
                {!(userPlanNorm === 'starter' || userPlanNorm === 'free') && (
                <button
                  type="button"
                  onClick={() => setGeoSeoGtmTab('geo')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    geoSeoGtmTab === 'geo'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t('geoTab', 'GEO Targeting')}</span>
                </button>
                )}
              </div>
            </div>

            {/* TAB CONTENT: GTM */}
            {isHighestPlan && geoSeoGtmTab === 'gtm' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-indigo-200/50 dark:border-indigo-900/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> {t('idealCustomerProfileIcp', 'Ideal Customer Profile (ICP)')}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {gtmStrategy?.targetIcp || (audience[0] ? `Primary: ${audience[0]} seeking immediate solutions for: ${businessGoal}` : 'Decision-makers and high-intent buyers evaluating modern solutions.')}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-purple-200/50 dark:border-purple-900/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> {t('valuePropositionPositioning', 'Value Proposition & Positioning')}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {gtmStrategy?.valuePositioning || `${activeWorkspace.brandName} positions as the definitive accelerator to achieve: ${businessGoal}.`}
                    </p>
                  </div>
                </div>

                {/* 4-Phase Launch Funnel */}
                <div>
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> {t('fourPhaseGtmRollout', '4-Phase GTM Rollout (Aligned with 30-Day Plan Topics)')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(gtmStrategy?.launchPhases || [
                      { phase: 'Phase 1: Market Seeding (Days 1–7)', focus: 'Problem awareness & industry friction points', kpi: 'Reach & impressions' },
                      { phase: 'Phase 2: Value Demonstration (Days 8–14)', focus: 'Feature deep dives & step-by-step solutions', kpi: 'Saves & engagement' },
                      { phase: 'Phase 3: Authority & Trust (Days 15–21)', focus: 'Social proof, case studies & comparisons', kpi: 'Lead captures' },
                      { phase: 'Phase 4: High-Urgency Conversion (Days 22–30)', focus: 'Direct CTAs & closing offers', kpi: 'Goal conversions' }
                    ]).map((lp, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">{t('phaseTag', 'Phase')} {idx + 1}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{t('weekTag', 'Week')} {idx + 1}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{lp.phase || lp.name}</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{lp.focus}</p>
                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          KPI: {lp.kpi}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activation Milestones & Growth Loops */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('gtmActivationMilestones', 'GTM Activation Milestones')}
                    </span>
                    <ul className="space-y-1.5">
                      {(gtmStrategy?.activationMilestones || [
                        'Milestone 1: 10,000+ targeted reach on problem-awareness topics',
                        'Milestone 2: 500+ qualified engagements on solution spotlight posts',
                        'Milestone 3: High conversion velocity on lead magnet and primary CTA'
                      ]).map((m, idx) => (
                        <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> {t('viralGrowthLoop', 'Viral Growth Loop')}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {gtmStrategy?.growthLoops || `Built-in referral incentive & social sharing prompt immediately after user achieves their first milestone with ${activeWorkspace.brandName}.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SEO */}
            {geoSeoGtmTab === 'seo' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Keywords derived from topics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-teal-200/50 dark:border-teal-900/30 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5" /> {t('primaryTargetKeywords', 'Primary Target Keywords (Extracted from Plan)')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(seoStrategy?.primaryKeywords || [
                        `${activeWorkspace.brandName.toLowerCase()} solutions`,
                        `${(businessGoal || '').slice(0, 25).toLowerCase()}`,
                        `best ${activeWorkspace.industryCategory || 'business'} tool`,
                        'how to scale operations'
                      ]).map((kw, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-200 font-bold text-xs border border-teal-500/20">
                          <Hash className="w-3 h-3 text-teal-600" /> {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-cyan-200/50 dark:border-cyan-900/30 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> {t('highIntentLongTailQueries', 'High-Intent Long-Tail Search Queries')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(seoStrategy?.longTailKeywords || [
                        `how to achieve ${businessGoal.slice(0, 30)}`,
                        `best software for ${activeWorkspace.brandName}`,
                        `step by step guide for ${activeWorkspace.industryCategory || 'growth'}`
                      ]).map((query, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-800 dark:text-cyan-200 font-semibold text-xs border border-cyan-500/20">
                          🔍 "{query}"
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Search Intent Mix */}
                <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t('searchIntentMapping', 'Search Intent Mapping')}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(seoStrategy?.searchIntentMix || [
                      { intent: 'Informational', percentage: 45, description: 'Problem-awareness & how-to content mapped to Week 1 & 2' },
                      { intent: 'Commercial Investigation', percentage: 35, description: 'Comparisons, features & use-cases mapped to Week 2 & 3' },
                      { intent: 'Transactional', percentage: 20, description: 'Direct acquisition, demo booking & downloads mapped to Week 4' }
                    ]).map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.intent}</span>
                          <span className="text-xs font-black text-teal-600 dark:text-teal-400">{item.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-teal-500" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* On-Page & Schema */}
                <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> {t('onPageSeoSchemaDirectives', 'On-Page SEO & Schema Directives')}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {seoStrategy?.onPageDirectives || 'Target primary keywords in H1 headers and opening 100 words. Implement Product/Software schema on conversion pages and FAQ schema on educational blogs.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GEO */}
            {geoSeoGtmTab === 'geo' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Priority Hubs */}
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-blue-200/50 dark:border-blue-900/30 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> {t('priorityGeographicMarkets', 'Priority Geographic Markets & Metros')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(geoStrategy?.priorityRegions || [
                      'Tier-1 Metros (Delhi NCR, Mumbai, Bengaluru)',
                      'High-Growth Tech Corridors (Hyderabad, Pune, Chennai)',
                      'Emerging Commercial Hubs (Ahmedabad, Kolkata, Chandigarh)'
                    ]).map((reg, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-800 dark:text-blue-200 font-bold text-xs border border-blue-500/20">
                        <MapPin className="w-3 h-3 text-blue-500" /> {reg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Regional Messaging Hooks */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t('regionalMessagingHooks', 'Regional Messaging Hooks (Localized Angles for Plan Topics)')}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(geoStrategy?.regionalHooks || [
                      { region: 'Tech & Startup Metros (Bengaluru, Hyderabad)', hook: `Rapid digital adoption, automation efficiency, and tech-forward integration with ${activeWorkspace.brandName}.` },
                      { region: 'Commercial Centers (Mumbai, Delhi NCR)', hook: `Enterprise compliance, regulatory peace of mind, and high-stakes ROI.` },
                      { region: 'Tier-2 Fast-Growing Cities', hook: `Modern, cost-effective alternative to legacy tools with instant local support.` }
                    ]).map((rh, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40 space-y-1">
                        <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 block">{rh.region}</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{rh.hook}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Geo Distribution Tactics */}
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> {t('geoDistributionTactics', 'Geo-Distribution & Local Advertising Tactics')}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {geoStrategy?.geoDistributionTactics || 'Deploy geo-fenced social advertising around major business districts. Use regional city references in high-converting ad copy variations.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ROW 4: Funnel Architecture */}
          {isCampaignLocked ? null : (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-500/6 via-purple-500/4 to-emerald-500/6 dark:from-slate-900/90 dark:to-slate-900/90 border border-purple-200/60 dark:border-purple-900/40 shadow-sm backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500 dark:text-purple-400" /> {t('marketingFunnelArchitecture', 'Marketing Funnel Architecture')}
              </h2>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{t('autoMappedFromBrandPillars', "Auto-mapped from brand pillars")}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {funnelStages.map((stage, i) => (
                <div key={stage.label} className={`p-5 rounded-2xl border ${stage.border} ${stage.bg} space-y-3 relative overflow-hidden backdrop-blur-md shadow-2xs`}>
                  <span className="absolute top-3 right-4 text-[40px] font-black leading-none text-purple-900/10 dark:text-white/10 select-none">{i+1}</span>
                  <div className="relative space-y-1.5">
                    <span className={`text-xs font-extrabold ${stage.text} block`}>{stage.label}</span>
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${stage.badge}`}>{stage.mix} {t('contentMix', 'Content Mix')}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed relative">{t(stage.desc)}</p>
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-slate-200/60 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full rounded-full ${stage.bar} ${stage.barW}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{t('goalLabel', 'Goal')}: {t(stage.goal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      )}

      {/* ══════════ TAB: 30-DAY PLAN ══════════ */}
      {generatedDoc && activeTab === 'plan' && (
        <div className="space-y-5">

          {/* Week Summary Cards */}
          {thirtyDayPlan.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {weekStats.map(ws => (
                  <div
                    key={ws.week}
                    onClick={() => setSelectedWeek(selectedWeek === String(ws.week) ? 'ALL' : String(ws.week))}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                      selectedWeek === String(ws.week)
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/20 shadow-xs'
                        : 'border-purple-200/50 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-purple-300 backdrop-blur-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-300">{t('weekLabel', 'Week')} {ws.week}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selectedWeek === String(ws.week) ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300' : 'bg-purple-500/10 text-purple-600 dark:text-purple-300'}`}>{ws.count} {t('daysLabel', 'days')}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">{t(ws.theme)}</p>
                  </div>
                ))}
              </div>

              {/* Filter Bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  {selectedWeek === 'ALL' ? t('thirtyDayMarketingCalendar', '30-Day Marketing Calendar') : `${t('weekLabel', 'Week')} ${selectedWeek} ${t('planLabel', 'Plan')}`}
                  <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2 py-0.5 rounded-full">{filteredPlan.length} {t('daysLabel', 'days')}</span>
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleDownloadPDF}
                    className="px-3 py-1 text-[11px] font-extrabold rounded-lg bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 shadow-sm shadow-brand-500/20 cursor-pointer transition-all"
                    title="Download 30-Day Plan as PDF"
                  >
                    <Download className="w-3 h-3 text-white" />
                    <span>{t('downloadPdfBtn', 'Download PDF')}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    {['ALL','1','2','3','4'].map(w => (
                      <button
                        key={w}
                        onClick={() => setSelectedWeek(w)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all duration-150 ${
                          selectedWeek === w
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                            : 'bg-purple-500/8 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-500/15'
                        }`}
                      >
                        {w === 'ALL' ? t('allLabel', 'All') : `W${w}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 30-Day Plan Grid */}
          {filteredPlan.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPlan.map(item => {
                const PIcon = getPlatformIcon(item.platform);
                const week = getWeekLabel(item.day);
                const weekColors = ['from-violet-500 to-indigo-600','from-blue-500 to-cyan-500','from-emerald-500 to-teal-500','from-amber-500 to-orange-500'];
                return (
                  <div
                    key={item.day}
                    onClick={() => {
                      const platformRaw = (item.platform || 'instagram').toLowerCase();
                      const isEmail = platformRaw.includes('email') || platformRaw.includes('newsletter');
                      const isBlog = platformRaw.includes('blog') || platformRaw.includes('seo') || platformRaw.includes('article');
                      const type = isEmail ? 'EMAIL' : isBlog ? 'BLOG' : 'SOCIAL';
                      const platform = isEmail ? 'email' : isBlog ? 'blog' : platformRaw.includes('linkedin') ? 'linkedin' : platformRaw.includes('twitter') ? 'twitter' : 'instagram';

                      const brandName = activeWorkspace?.brandName || 'Brand';
                      const aspect = platform === 'instagram' ? '1:1' : '16:9';
                      const fullStrategyPrompt = item.actionItem ? `${item.topic}: ${item.actionItem}` : item.topic;
                      const imagePrompt = isEmail ? null : `${fullStrategyPrompt} — ${brandName} commercial marketing campaign photography, professional studio lighting, 8k resolution`;
                      const initialImageUrl = isEmail ? null : resolveBrandVisualAsset({
                        prompt: imagePrompt,
                        brandName: brandName,
                        topic: fullStrategyPrompt,
                        style: 'Photorealistic Commercial',
                        aspect: aspect,
                        variationIndex: item.day || 0
                      });

                      const payload = {
                        platform,
                        type,
                        postType: isEmail ? 'email' : 'image',
                        topic: item.topic,
                        hook: item.topic,
                        caption: item.actionItem || '',
                        customPrompt: item.actionItem || '',
                        strategyPillar: item.topic,
                        strategyDescription: item.actionItem || '',
                        calendarDay: item.day,
                        campaignStage: week === 1 ? 'Awareness' : week === 2 ? 'Consideration' : week === 3 ? 'Engagement' : 'Conversion',
                        imageUrl: isEmail ? null : initialImageUrl,
                        imagePrompt: isEmail ? null : imagePrompt,
                        imageStyle: isEmail ? null : 'Photorealistic Commercial',
                        imageAspect: isEmail ? null : aspect,
                      };

                      if (setGeneratedContent) {
                        setGeneratedContent(payload);
                      }

                      if (setStudioTarget) {
                        setStudioTarget({
                          platform,
                          topic: item.topic,
                          customPrompt: item.actionItem || '',
                          actionItem: item.actionItem || '',
                          postType: isEmail ? 'email' : 'image',
                          type,
                          autoGenerate: true,
                          generateVisual: !isEmail,
                          strategyPillar: item.topic,
                          strategyDescription: item.actionItem || '',
                          imageUrl: isEmail ? null : initialImageUrl,
                          imagePrompt: isEmail ? null : imagePrompt,
                          imageStyle: isEmail ? null : 'Photorealistic Commercial',
                          imageAspect: isEmail ? null : aspect,
                        });
                      }

                      setActiveModule('studio');
                    }}
                    className="group relative p-5 rounded-2xl bg-white/80 dark:bg-slate-900/85 border border-purple-200/60 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all duration-300 space-y-3 cursor-pointer"
                  >
                    {/* Day badge & Action Buttons */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${weekColors[week-1]} flex items-center justify-center shadow-xs text-white text-xs font-extrabold shrink-0`}>
                          {item.day}
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{t('dayLabel', 'Day')} {item.day} · {t('weekLabel', 'Week')} {week}</p>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${getPlatformColor(item.platform)}`}>
                              <PIcon className="w-2.5 h-2.5" />
                              {t(item.platform?.split('/')[0]?.trim() || 'Content')}
                            </span>
                            {item.gtmStage && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                                🚀 {t(item.gtmStage.split(':')[0])}
                              </span>
                            )}
                            {item.geoTarget && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                📍 {t(item.geoTarget.split('(')[0].trim())}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons: Regenerate & Draft Post */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenRegenDays(prev => ({ ...prev, [item.day]: !prev[item.day] }));
                          }}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all flex items-center gap-1 border ${
                            openRegenDays[item.day]
                              ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                              : 'text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border-brand-500/20'
                          }`}
                          title="Regenerate strategy content for this card"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{t('regenerateCardBtn', 'Regenerate')}</span>
                        </button>
                        <span className="text-[9px] font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          {t('draftPostBtn', 'Draft Post')} <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Topic */}
                    <div>
                      {loadingRegenDays[item.day] ? (
                        <div className="flex items-center gap-2 py-1 text-brand-600 dark:text-brand-400">
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          <span className="text-xs font-semibold animate-pulse">{t('regeneratingStrategyContent', 'Regenerating strategy content...')}</span>
                        </div>
                      ) : (
                        <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{t(item.topic)}</p>
                      )}
                    </div>

                    {/* SEO Keyword Tag */}
                    {item.seoKeywords && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-md w-fit border border-teal-500/20">
                        <Search className="w-2.5 h-2.5 text-teal-600" />
                        <span className="truncate">SEO: {t(item.seoKeywords)}</span>
                      </div>
                    )}

                    {/* Action item */}
                    {item.actionItem && !loadingRegenDays[item.day] && (
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/30">
                        <Play className="w-3 h-3 text-brand-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{t(item.actionItem)}</p>
                      </div>
                    )}

                    {/* Inline Regenerate Input Box */}
                    {openRegenDays[item.day] && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 p-3 rounded-2xl bg-white dark:bg-slate-900/95 border border-brand-500/30 shadow-lg space-y-2 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-brand-500" />
                            {t('strategyContentDirectives', 'Strategy Content Directives')}
                          </label>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenRegenDays(prev => ({ ...prev, [item.day]: false }));
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={regenInputs[item.day] || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              setRegenInputs(prev => ({ ...prev, [item.day]: e.target.value }));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleRegenerateCardItem(item, e);
                              }
                            }}
                            placeholder={t('enterStrategyContentInput', 'Enter strategy content input (e.g. Focus on family recipe, vintage photo story)...')}
                            className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                            autoFocus
                          />
                          <button
                            type="button"
                            disabled={loadingRegenDays[item.day]}
                            onClick={(e) => handleRegenerateCardItem(item, e)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1 shrink-0 disabled:opacity-50"
                          >
                            {loadingRegenDays[item.day] ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>{t('generatingBtn', 'Generating...')}</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3 h-3 fill-white" />
                                <span>{t('regenerateBtn', 'Regenerate')}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}


        </div>
      )}



      {/* ══════════ TAB: CUSTOM STRATEGY (30-DAY SOCIAL MEDIA POST GENERATION) ══════════ */}
      {activeTab === 'custom' && customStrategy && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* Top Summary Banner */}
          <div className="p-6 rounded-3xl accent-card glass-card border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-slate-900/10 to-indigo-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                {customStrategy.imagePreviewUrl ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-950 border-2 border-purple-500/40 shadow-xl shrink-0">
                    <img src={customStrategy.imagePreviewUrl} alt="Uploaded Brief" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-10 h-10 text-purple-400" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" /> {t('thirtyDayCustomStrategy', '30-Day Custom Strategy')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                      {t('thirtyPostsGenerated', '30 Posts Generated')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">{customStrategy.timestamp}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {t('thirtyDayCustomSocialRoadmap', '30-Day Custom Social Media Post Roadmap')}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic max-w-xl">
                    {t('directiveLabel', 'Directive')}: "{customStrategy.directive}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                <button
                  onClick={() => {
                    if (customStrategy?.imagePreviewUrl && !imagePreviewUrl) {
                      setImagePreviewUrl(customStrategy.imagePreviewUrl);
                    }
                    if (customStrategy?.directive && !imageDirective) {
                      setImageDirective(customStrategy.directive);
                    }
                    handleGenerateCustomStrategy();
                  }}
                  disabled={isSubmittingImageBrief}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 disabled:opacity-60 disabled:pointer-events-none"
                  title="Regenerate dynamic 30-day post concepts for this custom strategy"
                >
                  {isSubmittingImageBrief ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{t('regeneratingCustomStrategy', 'Regenerating Custom Strategy...')}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 text-white transition-transform hover:rotate-180 duration-500" />
                      <span>{t('regenerateCustomStrategy', 'Regenerate Custom Strategy')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 30-Day Navigation & Filter Controls */}
          <div className="space-y-3 p-4 rounded-2xl accent-card glass-card border border-slate-200 dark:border-slate-800">
            {/* Week Filter Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" /> {t('filterByWeek', 'Filter By Week:')}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'ALL', label: t('all30DaysFilter', 'All 30 Days (30 Posts)') },
                  { id: '1', label: t('week1AwarenessFilter', 'Week 1: Awareness (Days 1–7)') },
                  { id: '2', label: t('week2ValueFilter', 'Week 2: Value (Days 8–14)') },
                  { id: '3', label: t('week3EngagementFilter', 'Week 3: Engagement (Days 15–21)') },
                  { id: '4', label: t('week4ConversionFilter', 'Week 4: Conversion (Days 22–30)') },
                ].map(w => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedCustomWeek(w.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCustomWeek === w.id
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-brand-500" /> {t('platformFilter', 'Platform Filter:')}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['ALL', 'Instagram', 'Facebook', 'LinkedIn', 'Twitter / X', 'YouTube Shorts', 'Pinterest'].map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedCustomPlatform(p)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      selectedCustomPlatform === p
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-600'
                    }`}
                  >
                    {p === 'ALL' ? t('allPlatformsFilter', 'All Platforms') : p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-500" />
                {t('thirtyDayGeneratedPosts', '30-Day Generated Posts')} ({
                  (customStrategy.posts || []).filter(post => {
                    const matchesWeek = selectedCustomWeek === 'ALL' || String(post.week) === selectedCustomWeek;
                    const matchesPlatform = selectedCustomPlatform === 'ALL' || post.platform.toLowerCase().includes(selectedCustomPlatform.toLowerCase());
                    return matchesWeek && matchesPlatform;
                  }).length
                } {t('postsDisplayedTag', 'Posts Displayed')})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('customDailyPostsTailoredSub', 'Custom daily posts tailored to your uploaded reference image and instructions across 30 days')}
              </p>
            </div>
          </div>

          {/* 30 Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
            {(customStrategy.posts || [])
              .filter(post => {
                const matchesWeek = selectedCustomWeek === 'ALL' || String(post.week) === selectedCustomWeek;
                const matchesPlatform = selectedCustomPlatform === 'ALL' || post.platform.toLowerCase().includes(selectedCustomPlatform.toLowerCase());
                return matchesWeek && matchesPlatform;
              })
              .map((post, idx) => {
                const PIcon = getPlatformIcon(post.platform);
                return (
                  <div
                    key={post.day || idx}
                    className="group relative p-3.5 rounded-2xl accent-card glass-card border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 hover:shadow-lg transition-all duration-300 space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {/* Header: Day Badge, Platform & Week Tag */}
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="px-2 py-0.5 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-[10px] shadow-2xs shrink-0">
                            {t('dayLabel', 'Day')} {post.day}
                          </div>
                          <div className={`w-5.5 h-5.5 rounded-md flex items-center justify-center shadow-2xs shrink-0 ${getPlatformColor(post.platform)}`}>
                            <PIcon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[10.5px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{post.platform}</h4>
                            <span className="text-[9px] text-slate-400 font-medium block -mt-0.5">{t(post.format)}</span>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[8.5px] font-extrabold border border-purple-500/20 shrink-0">
                          {t(post.weekTag)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug break-words">
                        {t(formatPostTitle(post.title, customStrategy?.directive))}
                      </h3>

                      {/* Visual Directive Box */}
                      <div className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/50 space-y-1 shadow-2xs">
                        <span className="text-[9.5px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" /> {t('visualGuidanceLabel', 'Visual Guidance:')}
                        </span>
                        <p className="text-[10px] font-semibold text-slate-900 dark:text-slate-100 leading-snug break-words">
                          {t(post.visualDirective)}
                        </p>
                      </div>

                      {/* Hook & Copy */}
                      <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{t('hookLineLabel', 'Hook Line')}</span>
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-snug break-words mt-0.5">{t(post.hook)}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{t('captionCopyLabel', 'Caption Copy')}</span>
                          <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed break-words mt-0.5">
                            {t(post.caption)}
                          </p>
                        </div>
                      </div>

                      {/* CTA & Hashtags */}
                      <div className="space-y-1 text-[9.5px] pt-0.5">
                        <div className="font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 rounded-md text-[9.5px] break-words">
                          {t('ctaLabel', 'CTA')}: {t(post.cta)}
                        </div>
                        <div className="text-purple-700 dark:text-purple-300 font-bold text-[9px] break-words">
                          {t(post.hashtags)}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 mt-1.5">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`Day ${post.day} - ${post.platform}\n\n${post.hook}\n\n${post.caption}\n\n${post.cta}\n${post.hashtags}`);
                          showCustomAlert({ title: 'Copied!', message: `Day ${post.day} (${post.platform}) copy copied.`, type: 'success' });
                        }}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[9.5px] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-2.5 h-2.5" />
                        <span>{t('copyBtn', 'Copy')}</span>
                      </button>

                      <button
                        onClick={() => {
                          const cleanTitle = formatPostTitle(post.title, customStrategy?.directive);
                          const studioPayload = {
                            platform: post.platform,
                            type: 'SOCIAL',
                            postType: 'image',
                            topic: cleanTitle,
                            headline: cleanTitle,
                            hook: post.hook || cleanTitle,
                            caption: post.caption,
                            shortCaption: post.caption,
                            longCaption: post.caption,
                            visualDirective: post.visualDirective,
                            imagePrompt: post.visualDirective,
                            imageUrl: null,
                            referenceImage: customStrategy?.imagePreviewUrl || null,
                            cta: post.cta,
                            hashtags: post.hashtags ? post.hashtags.split(' ') : [],
                            autoGenerate: true,
                            isCustomStrategy: true
                          };
                          if (setStudioTarget) {
                            setStudioTarget(studioPayload);
                          }
                          if (setGeneratedContent) {
                            setGeneratedContent({
                              data: studioPayload,
                              ...studioPayload
                            });
                          }
                          setActiveModule('creativeStudio');
                        }}
                        className="px-2.5 py-0.5 rounded bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-extrabold text-[9.5px] shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{t('createStudioBtn', 'Create Studio →')}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
          </div>

        </div>
      )}

      {/* ══════════ WORKFLOW ACTION BANNER ══════════ */}
        {/* ══════════ SCHEDULE CONTENT CALENDAR MODAL ══════════ */}
      {showScheduleModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto my-auto text-slate-900 dark:text-white">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-500 dark:text-brand-400 shrink-0" />
                <span>{t('scheduleContentCalendarModalTitle', 'Schedule Content Calendar')}</span>
              </h3>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 py-1">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('enterNumberOfDaysSub', 'Enter the number of days you would like to generate and populate in your Content Calendar from your Strategy Hub.')}
              </p>
              
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('howManyDaysToScheduleQuestion', 'How many days to schedule?')}
                </label>

                {/* Input with side suffix badge */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={thirtyDayPlan.length || 30}
                    value={scheduleDays}
                    onChange={(e) => setScheduleDays(e.target.value)}
                    className="flex-1 min-w-0 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-sm sm:text-base focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-sm transition-all"
                    placeholder={t('enterDaysPlaceholder', 'Enter days (e.g. 30)')}
                  />
                  <span className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 font-black text-xs uppercase tracking-wider shrink-0">
                    {t('daysUnit', 'Days')}
                  </span>
                </div>

                {/* Preset Quick Select Pills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('quickSelectLabel', 'Quick Select:')}</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[7, 14, 21, 30].map(d => {
                      const maxPlan = thirtyDayPlan.length || 30;
                      if (d > maxPlan) return null;
                      const isSelected = String(scheduleDays) === String(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setScheduleDays(String(d))}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border text-center ${
                            isSelected
                              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {d} {t('daysUnit', 'Days')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  {t('maximumAvailableDaysSub', 'Maximum available days from your strategy:')} <span className="font-extrabold text-brand-600 dark:text-brand-400">{thirtyDayPlan.length || 30} {t('daysUnit', 'Days')}</span>.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                {t('cancelBtn', 'Cancel')}
              </button>
              <button
                onClick={() => confirmGenerateCalendar(scheduleDays)}
                disabled={isCreatingCalendarCampaign || !scheduleDays || Number(scheduleDays) < 1 || Number(scheduleDays) > (thirtyDayPlan.length || 30)}
                className="w-full sm:w-auto btn-primary text-xs flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed bg-brand-600 hover:bg-brand-500 text-white"
              >
                {isCreatingCalendarCampaign ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t('generatingBtn', 'Generating...')}
                  </>
                ) : (
                  t('generateBtn', 'Generate')
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}



      {/* ══════════ MODAL: UPLOAD IMAGE & CUSTOM DIRECTIVE ══════════ */}
      {showImageBriefModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 via-brand-500 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {t('customImageVisualBriefTitle', 'Custom Image Visual Brief')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('uploadImageAssetSub', 'Upload an image asset & describe how AI should utilize it for')} {activeWorkspace.brandName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImageBriefModal(false);
                  setUploadedImageFile(null);
                  setImagePreviewUrl('');
                  setImageDirective('');
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* 1. Image Upload Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
                    1. {t('uploadReferenceImageStep', 'Upload Reference Image')}
                  </span>
                  {imagePreviewUrl && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {t('imageLoadedTag', 'Image Loaded')}
                    </span>
                  )}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {imagePreviewUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 p-2 flex items-center justify-center max-h-56">
                    <img
                      src={imagePreviewUrl}
                      alt="Uploaded reference"
                      className="max-h-48 rounded-xl object-contain shadow-md"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        {t('changeImageBtn', 'Change Image')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImageFile(null);
                          setImagePreviewUrl('');
                        }}
                        className="p-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white shadow-lg transition-all cursor-pointer"
                        title={t('removeImageTitle', 'Remove image')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleDropImage}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                      isDraggingFile
                        ? 'border-brand-500 bg-brand-500/10 scale-[0.99]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-500/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t('clickToBrowseOrDragDrop', 'Click to browse or drag & drop reference image')}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      {t('supportsFormatSub', 'Supports PNG, JPG, JPEG, WebP, SVG, GIF (Max 10MB)')}
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Custom Guidance / Directive Input Box */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    2. {t('whatShouldAiDoQuestion', 'What should AI do with this image? / Custom Directive')}
                  </span>
                </label>

                <textarea
                  rows={4}
                  value={imageDirective}
                  onChange={(e) => setImageDirective(e.target.value)}
                  placeholder={t('tellUsDirectivePlaceholder', "Tell us what you want us to do with the uploaded image (e.g. 'Use this product photo to design our main campaign poster', 'Extract product style & brand colors for Instagram post visuals', 'Incorporate this product showcase into our 30-day strategy')...")}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all resize-none"
                />

                {/* Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('quickPresetDirectives', 'Quick Preset Directives:')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Use as primary product focus in campaign posts",
                      "Extract brand style & logo for strategy visuals",
                      "Design promotional banner with custom text overlay",
                      "Incorporate product image into 30-day content plan"
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageDirective(prev => prev ? `${prev}\n${preset}` : preset)}
                        className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all text-left cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowImageBriefModal(false);
                  setUploadedImageFile(null);
                  setImagePreviewUrl('');
                  setImageDirective('');
                }}
                className="px-4 py-2.5 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('cancelBtn', 'Cancel')}
              </button>

              <button
                type="button"
                disabled={isSubmittingImageBrief || (!imagePreviewUrl && !imageDirective.trim())}
                onClick={handleGenerateCustomStrategy}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {isSubmittingImageBrief ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t('generatingCustomStrategyBtn', 'Generating Custom Strategy...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>{t('generateStrategyBtn', 'Generate Strategy')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════ STICKY FLOATING GENERATE CALENDAR BUTTON ══════════ */}
      {generatedDoc && activeTab === 'plan' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 shrink-0">
          {calendarEvents && calendarEvents.length > 0 ? (
            <button 
              onClick={() => setActiveModule('calendar')}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-2xl shadow-indigo-600/40 border border-indigo-400/30 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md whitespace-nowrap"
              title="View Calendar Events"
            >
              <Calendar className="w-5 h-5 text-white shrink-0" />
              <span className="tracking-wide">{t('viewCalendarBtn', 'View Calendar')}</span>
            </button>
          ) : (
            <button 
              onClick={handleGenerateCalendar}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-2xl shadow-brand-600/40 border border-brand-400/30 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md whitespace-nowrap"
              title="Generate content calendar events from strategy"
            >
              <Calendar className="w-5 h-5 text-white shrink-0" />
              <span className="tracking-wide">{t('generateCalendarBtn', 'Generate Calendar')}</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
};
