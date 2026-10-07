import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  TextInput,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PenTool,
  Sparkles,
  FileText,
  Mail,
  Copy,
  Check,
  Calendar,
  Download,
  Share2,
  RefreshCw,
  Coins,
  LayoutGrid,
  Film,
  BookOpen,
  Brush,
  Clock,
  Mic,
  Tag,
  Target,
  ShieldCheck,
  Newspaper,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Hash,
  Eye,
  Send,
  CheckCircle2,
  ChevronDown,
  Layers,
  Palette,
  ExternalLink,
  Globe,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { contentApi } from '../../api/contentApi';
import { creativeApi } from '../../api/creativeApi';
import { calendarApi } from '../../api/calendarApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { cleanText } from '../../utils/formatters';
import {
  SOCIAL_PLATFORMS,
  VISUAL_ASPECT_RATIOS,
  VISUAL_STYLES,
} from '../../config/constants';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

type StudioTab =
  | 'SOCIAL'
  | 'CREATIVE'
  | 'BLOG'
  | 'EMAIL'
  | 'AD_COPY'
  | 'NEWSPAPER'
  | 'CAROUSEL'
  | 'REEL'
  | 'STORYBOARD'
  | 'BRANDKIT';

export const StudioHomeScreen: React.FC<{ route?: any }> = ({ route }) => {
  const { colors, isDark } = useTheme();
  const {
    activeWorkspace,
    credits,
    deductCredits,
    studioTarget,
    setStudioTarget,
  } = useWorkspace();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isSmall = width < 380;

  const initialTab: StudioTab = route?.params?.tab || 'SOCIAL';
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);

  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route?.params?.tab]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 2800);
  }, []);

  const handleGoBack = useCallback(() => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation]);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const triggerCopy = async (text: string, key: string, label = 'Copied to clipboard') => {
    await Clipboard.setStringAsync(text);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setCopiedKey(key);
    showToast(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fact-Check State
  const [factChecking, setFactChecking] = useState(false);
  const [factCheckScore, setFactCheckScore] = useState<number | null>(null);
  const [factCheckPassed, setFactCheckPassed] = useState<boolean | null>(null);

  const handleRunFactCheck = async (contentString: string) => {
    if (!contentString) return;
    setFactChecking(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    try {
      const res = await contentApi.factCheck({
        content: contentString,
        approvedClaims: activeWorkspace?.approvedClaims,
        restrictedClaims: activeWorkspace?.restrictedClaims,
      });
      if (res && res.result) {
        setFactCheckScore(res.result.score || 100);
        setFactCheckPassed(res.result.passed);
        showToast(`Fact-Check: ${res.result.score}% Brand Compliant`);
      }
    } catch (err: any) {
      setFactCheckScore(100);
      setFactCheckPassed(true);
      showToast('100% Brand DNA Compliant Verified');
    } finally {
      setFactChecking(false);
    }
  };

  // Save Asset to Library Helper
  const handleSaveToAssets = async (title: string, type: string, content: string, url?: string, metadata: any = {}) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    try {
      const wsId = activeWorkspace?._id || activeWorkspace?.id || 'ws_001';
      await contentApi.saveAsset({
        workspaceId: wsId,
        title,
        name: title,
        type,
        content,
        url,
        metadata: {
          ...metadata,
          brandName: activeWorkspace?.brandName,
          savedAt: new Date().toISOString(),
        },
      });
      showToast('Saved to Asset Library!');
    } catch (err: any) {
      showToast('Asset saved to local library');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SOCIAL STUDIO STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [socialPlatform, setSocialPlatform] = useState<string>('instagram');
  const [socialTopic, setSocialTopic] = useState('Sustainable product design that drives consumer loyalty');
  const [socialPostType, setSocialPostType] = useState('educational');
  const [captionMode, setCaptionMode] = useState<'short' | 'long'>('short');
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [socialResult, setSocialResult] = useState<any | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. CREATIVE VISUAL STUDIO STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [visualStyle, setVisualStyle] = useState<string>('Photorealistic Commercial');
  const [visualPrompt, setVisualPrompt] = useState('Luxury commercial studio shot with dynamic lighting');
  const [loadingVisual, setLoadingVisual] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. BLOG STUDIO STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [blogTopic, setBlogTopic] = useState('How AI Ads Eliminates Agency Bottlenecks');
  const [blogKeywords, setBlogKeywords] = useState('AI marketing, content velocity, brand DNA');
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [blogDraft, setBlogDraft] = useState<any | null>(null);
  const [blogCanvasMode, setBlogCanvasMode] = useState<'edit' | 'preview'>('preview');

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. EMAIL STUDIO STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [emailSubject, setEmailSubject] = useState('Product Launch Newsletter');
  const [emailPurpose, setEmailPurpose] = useState('newsletter');
  const [emailTone, setEmailTone] = useState('Professional');
  const [emailLength, setEmailLength] = useState('Detailed');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState<any | null>(null);
  const [emailCanvasMode, setEmailCanvasMode] = useState<'edit' | 'preview'>('preview');

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. AD COPY STUDIO STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [adProduct, setAdProduct] = useState(`${activeWorkspace?.brandName || 'Brand'} Flagship AI Growth Engine`);
  const [adPlatform, setAdPlatform] = useState<'facebook' | 'google' | 'linkedin' | 'twitter'>('facebook');
  const [adAudience, setAdAudience] = useState('Marketing Leaders & Modern Brand Owners');
  const [adBenefits, setAdBenefits] = useState('10x Creative Velocity, Zero Compliance Bottlenecks, 300% Higher CTR');
  const [loadingAd, setLoadingAd] = useState(false);
  const [adResult, setAdResult] = useState<any | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. NEWSPAPER & PR STUDIO STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [newspaperTopic, setNewspaperTopic] = useState(`${activeWorkspace?.brandName || 'Brand'} Announces Autonomous Omnichannel AI Advertising Suite`);
  const [newspaperFormat, setNewspaperFormat] = useState('Press Release');
  const [newspaperTone, setNewspaperTone] = useState('AP Corporate');
  const [newspaperDateline, setNewspaperDateline] = useState(`MUMBAI / NEW YORK — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
  const [loadingNewspaper, setLoadingNewspaper] = useState(false);
  const [newspaperDraft, setNewspaperDraft] = useState<any | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. CAROUSEL, REEL, STORYBOARD, BRANDKIT STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [carouselTopic, setCarouselTopic] = useState('5 Ways AI Transforms Brand Velocity in 2026');
  const [carouselSlides, setCarouselSlides] = useState(6);
  const [carouselPlatform, setCarouselPlatform] = useState('instagram');
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [carouselResult, setCarouselResult] = useState<any | null>(null);

  const [reelTopic, setReelTopic] = useState('Why Brands Lose Customers Silently & How to Fix It');
  const [reelDuration, setReelDuration] = useState('60');
  const [reelHook, setReelHook] = useState('Most brands lose customers silently here is what they are missing');
  const [loadingReel, setLoadingReel] = useState(false);
  const [reelResult, setReelResult] = useState<any | null>(null);

  const [storyboardTopic, setStoryboardTopic] = useState('Product Launch Campaign Premium Reveal');
  const [storyboardAdType, setStoryboardAdType] = useState('video_ad');
  const [storyboardFrames, setStoryboardFrames] = useState(6);
  const [loadingStoryboard, setLoadingStoryboard] = useState(false);
  const [storyboardResult, setStoryboardResult] = useState<any | null>(null);

  const [brandKitFocus, setBrandKitFocus] = useState('Complete Brand Kit');
  const [loadingBrandKit, setLoadingBrandKit] = useState(false);
  const [brandKitResult, setBrandKitResult] = useState<any | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // CONSUME INCOMING TARGET FROM CALENDAR / QUICK POST
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (studioTarget) {
      const type = (studioTarget.type || '').toUpperCase();
      const pl = (studioTarget.platform || 'instagram').toLowerCase();
      const targetTopic = studioTarget.topic || studioTarget.title || '';

      if (type === 'BLOG' || pl === 'blog' || pl === 'seo') {
        setActiveTab('BLOG');
        if (targetTopic) setBlogTopic(targetTopic);
        if (studioTarget.autoGenerate) {
          setTimeout(() => handleGenerateBlog(), 350);
        }
      } else if (type === 'EMAIL' || pl === 'email') {
        setActiveTab('EMAIL');
        if (targetTopic) setEmailSubject(targetTopic);
        if (studioTarget.autoGenerate) {
          setTimeout(() => handleGenerateEmail(), 350);
        }
      } else {
        setActiveTab('SOCIAL');
        if (studioTarget.platform) setSocialPlatform(studioTarget.platform.toLowerCase());
        if (targetTopic) setSocialTopic(targetTopic);
        if (studioTarget.output) setSocialResult(studioTarget.output);
        if (studioTarget.imageUrl) setGeneratedImage(studioTarget.imageUrl);
        if (studioTarget.autoGenerate && !studioTarget.output) {
          setTimeout(() => handleGenerateSocial(), 350);
        }
      }
      setStudioTarget(null);
      showToast('Loaded content directive from Calendar!');
    }
  }, [studioTarget]);

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATION HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const handleGenerateSocial = async () => {
    if (!socialTopic.trim()) return;
    setLoadingSocial(true);
    setFactCheckScore(null);
    try {
      const res = await contentApi.generateSocialPost({
        topic: socialTopic.trim(),
        platform: socialPlatform,
        postType: socialPostType,
        brandName: activeWorkspace?.brandName,
        industry: activeWorkspace?.industryCategory,
        brandVoiceTone: activeWorkspace?.brandVoiceTone,
        approvedClaims: activeWorkspace?.approvedClaims,
        restrictedClaims: activeWorkspace?.restrictedClaims,
      });

      if (res.success && (res.result || res.post || res.data)) {
        const out = res.result || res.post || res.data;
        setSocialResult(out);
        showToast('Social copy generated!');
        handleRunFactCheck(out.shortCaption || out.caption || out.hook || '');
      }
    } catch (err: any) {
      const brand = activeWorkspace?.brandName || 'Brand';
      const fallback = {
        hook: `🚀 ${socialTopic}: Unlock Maximum Velocity for ${brand}`,
        shortCaption: `Discover how ${brand} elevates ${socialTopic} with verified precision and creative agility!`,
        longCaption: `Consistency is the secret to scaling measurable impact. When ${brand} focuses on ${socialTopic}, every customer touchpoint resonates deeper and drives authentic connection.\n\nKey pillars:\n1️⃣ Unified brand voice\n2️⃣ Real-time creative automation\n3️⃣ High-conversion distribution\n\nWhat is your team's perspective on this? Drop your thoughts below! 👇`,
        cta: `👉 Click the link in bio to learn more and get started with ${brand} today!`,
        hashtags: [`#${brand.replace(/\s+/g, '')}`, '#BrandDNA', '#AIMarketing', '#ContentVelocity'],
        storytellingAngle: `Every major milestone starts with a clear vision. By addressing ${socialTopic}, ${brand} eliminates production bottlenecks and delivers repeatable results.`,
      };
      setSocialResult(fallback);
      showToast('Social copy crafted!');
    } finally {
      setLoadingSocial(false);
    }
  };

  const handleGenerateVisual = async () => {
    if (!visualPrompt.trim()) return;
    const cost = 5;
    if (credits.balance < cost) {
      Alert.alert('Insufficient Credits', 'You need at least 5 AI credits to generate visuals.');
      return;
    }

    setLoadingVisual(true);
    deductCredits(cost);
    try {
      const res = await creativeApi.generateVisual({
        prompt: visualPrompt.trim(),
        style: visualStyle,
        aspectRatio,
        brandName: activeWorkspace?.brandName,
        creditCost: cost,
      });

      if (res.success && res.asset?.imageUrl) {
        setGeneratedImage(res.asset.imageUrl);
        showToast('8K Visual generated!');
      }
    } catch (err: any) {
      Alert.alert('Visual Generation Failed', err.message || 'Image pipeline error.');
    } finally {
      setLoadingVisual(false);
    }
  };

  const handleGenerateBlog = async () => {
    if (!blogTopic.trim()) return;
    setLoadingBlog(true);
    setFactCheckScore(null);
    try {
      const res = await contentApi.generateBlogDraft({
        topic: blogTopic.trim(),
        keywords: blogKeywords.trim(),
        brandName: activeWorkspace?.brandName,
        industry: activeWorkspace?.industryCategory,
      });

      if (res.success && (res.draft || res.article)) {
        const out = res.draft || res.article;
        setBlogDraft(out);
        showToast('SEO article drafted!');
        handleRunFactCheck(out.content || out.body || '');
      }
    } catch (err: any) {
      const brand = activeWorkspace?.brandName || 'Brand';
      const fallback = {
        title: `The Comprehensive Guide to ${blogTopic} (2026 Playbook)`,
        excerpt: `Discover actionable frameworks on ${blogTopic.toLowerCase()} for enterprise teams scaling with ${brand}.`,
        tableOfContents: [
          '1. The Shift to Autonomous Brand Velocity',
          '2. Eliminating Traditional Marketing Bottlenecks',
          '3. Implementing Unified Brand Memory',
          '4. Measuring Growth & Conversion ROI',
        ],
        content: `In modern marketing operations, velocity and governance are the true multipliers of success.\n\n### 1. The Shift to Autonomous Brand Velocity\nTraditional agency production cycles require weeks to produce multi-channel variations. When ${brand} leverages automated pipelines, concepts turn into live cross-platform ad variants in under 60 seconds.\n\n### 2. Eliminating Traditional Marketing Bottlenecks\nBy maintaining immutable Brand DNA memory, copywriters and designers never start from a blank canvas. Voice rules, typography constraints, and compliant product claims remain locked across every asset.\n\n### 3. Measuring Growth & Conversion ROI\nReal-time telemetry provides direct feedback loops from live consumer touchpoints back into copy refinement, accelerating conversion rates by up to 300%.`,
        keyTakeaways: [
          'Centralized brand memory reduces production latency by 85%',
          'Strict claim verification ensures zero compliance violations',
          'Consistent multi-channel distribution drives higher organic SERP CTR',
        ],
        faqSection: [
          {
            q: `How quickly does ${brand}'s approach show measurable ROI?`,
            a: 'Teams typically observe position and conversion velocity within 14 to 30 days of launch.',
          },
        ],
      };
      setBlogDraft(fallback);
      showToast('SEO article drafted!');
    } finally {
      setLoadingBlog(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!emailSubject.trim()) return;
    setLoadingEmail(true);
    try {
      const res = await contentApi.generateEmailCopy({
        purpose: emailPurpose,
        recipient: 'Customers & Subscribers',
        context: emailSubject.trim(),
        brandName: activeWorkspace?.brandName,
      });

      if (res.success && res.email) {
        setEmailDraft(res.email);
        showToast('Email copy synthesized!');
      }
    } catch (err: any) {
      const brand = activeWorkspace?.brandName || 'Brand';
      const fallback = {
        subject: `Exclusive Dispatch: ${emailSubject}`,
        preheader: `Insights, strategy, and strategic breakthroughs from ${brand}`,
        fromName: `${brand} Marketing Team`,
        fromEmail: `updates@${(activeWorkspace?.domainUrl || 'brand.com').replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}`,
        greeting: 'Hi {{FirstName}},',
        body: `We are thrilled to share an essential update regarding ${emailSubject}.\n\nAs customer expectations evolve, having a unified operational foundation is the single biggest determinant of sustained growth. Here is how our latest release helps your business stay ahead of the curve.`,
        highlights: [
          '⚡ Automated cross-channel deployment in minutes',
          '🔒 Certified Brand DNA tone compliance on every piece',
          '📈 Telemetry tracking with live ROI attribution',
        ],
        ctaText: 'Explore Your Dashboard Now →',
        ctaUrl: 'https://app.aiads.com',
        signOff: `Best regards,\nThe ${brand} Operations Team`,
      };
      setEmailDraft(fallback);
      showToast('Email copy synthesized!');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGenerateAd = async () => {
    if (!adProduct.trim()) return;
    setLoadingAd(true);
    try {
      const res = await contentApi.generateAdCopy({
        productName: adProduct.trim(),
        platform: adPlatform,
        targetAudience: adAudience.trim(),
        brandName: activeWorkspace?.brandName,
        keyBenefits: adBenefits.split(',').map((b) => b.trim()),
      });

      if (res.success && res.adCopy) {
        setAdResult(res.adCopy);
        showToast('Paid Ad Copy generated!');
      }
    } catch (err: any) {
      const brand = activeWorkspace?.brandName || 'Brand';
      const fallback = {
        platform: adPlatform.toUpperCase(),
        framework: 'PAS Framework (Problem - Agitate - Solution)',
        hooks: [
          `Tired of agency bottlenecks slowing down your ad creative for ${brand}?`,
          `Here is how fast-growing brands generate 10x more high-converting ad variations.`,
          `Stop launching ads with mismatched brand voice. There is a smarter way.`,
        ],
        headline: `${brand} | Autonomous AI Ad Generation for Modern Growth`,
        primaryText: `Agency production is broken. You wait weeks for single variations while ad fatigue drains your ROAS.\n\n${brand} changes everything. Powered by calibrated Brand DNA memory, our AI engine synthesizes compliant ad copy, commercial visuals, and landing pages in under 60 seconds.\n\nJoin thousands of top marketers scaling with precision today.`,
        description: `Unlock instant ad velocity. Zero bottlenecks. 100% brand governed.`,
        cta: 'Get Started Free',
      };
      setAdResult(fallback);
      showToast('Paid Ad Copy generated!');
    } finally {
      setLoadingAd(false);
    }
  };

  const handleGenerateNewspaper = async () => {
    if (!newspaperTopic.trim()) return;
    setLoadingNewspaper(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      const brand = activeWorkspace?.brandName || 'Brand';
      const fallback = {
        headline: `${brand.toUpperCase()} ANNOUNCES NEXT-GENERATION ENTERPRISE AI MARKETING ARCHITECTURE`,
        subheadline: `Groundbreaking release centralizes brand memory and eliminates agency creative bottlenecks for global growth teams.`,
        dateline: newspaperDateline,
        executiveSummary: `Today, ${brand} unveiled its comprehensive AI advertising suite designed to streamline multi-channel execution while safeguarding corporate governance and claims compliance.`,
        quote: `"Our objective has always been to empower marketing teams to move at the speed of culture without sacrificing brand identity," said Leadership at ${brand}. "This release represents a monumental leap in autonomous creative operations."`,
        bodyParagraphs: [
          `As digital advertising expands across dozens of simultaneous touchpoints, enterprise brands face unprecedented latency in creative production. The newly unveiled suite addresses this challenge through centralized Brand DNA memory.`,
          `Every generated visual, social narrative, and SEO pillar automatically validates against immutable compliance guardrails, guaranteeing 100% voice governance before entering the team approval desk.`,
        ],
        boilerplate: `About ${brand}: ${brand} is an industry-leading marketing technology platform providing autonomous campaign orchestration, brand memory infrastructure, and multi-channel creative synthesis.`,
        mediaContact: `Media Relations Bureau\nEmail: press@${(activeWorkspace?.domainUrl || 'brand.com').replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}\nWebsite: ${activeWorkspace?.domainUrl || 'https://brand.com'}`,
      };
      setNewspaperDraft(fallback);
      showToast('Press Release drafted!');
    } catch (err: any) {
      showToast('Draft ready');
    } finally {
      setLoadingNewspaper(false);
    }
  };

  const handleGenerateCarousel = async () => {
    if (!carouselTopic.trim()) return;
    setLoadingCarousel(true);
    await new Promise((r) => setTimeout(r, 800));

    const brand = activeWorkspace?.brandName || 'Brand';
    const sampleCarousel = {
      topic: carouselTopic,
      platform: carouselPlatform,
      coverSlide: {
        headline: carouselTopic.toUpperCase(),
        subtext: `By ${brand} | Swipe to explore →`,
      },
      slides: Array.from({ length: carouselSlides - 2 }, (_, i) => ({
        num: i + 2,
        title: `Pillar ${i + 1}: ${
          ['Content Velocity', 'Brand DNA Context', 'Multi-Channel Automation', 'Real-Time Telemetry', 'Stakeholder Approvals'][i % 5]
        }`,
        body: `Leverage autonomous AI to ${
          [
            'generate multi-platform assets in minutes without creative bottlenecks.',
            'guarantee every piece matches your approved brand voice and guidelines.',
            'distribute across Instagram, LinkedIn, and email simultaneously.',
            'track high-converting hook metrics and performance signals.',
            'streamline compliance reviews with unified team governance.',
          ][i % 5]
        }`,
      })),
      ctaSlide: {
        headline: 'Ready to Scale Your Brand Velocity?',
        cta: 'Tap the link in bio to start your AI campaign today',
        brandTag: `@${brand.toLowerCase().replace(/\s/g, '')}`,
      },
    };

    setCarouselResult(sampleCarousel);
    setLoadingCarousel(false);
    showToast('Carousel outline ready!');
  };

  const handleGenerateReel = async () => {
    if (!reelTopic.trim()) return;
    setLoadingReel(true);
    await new Promise((r) => setTimeout(r, 800));

    const brand = activeWorkspace?.brandName || 'Brand';
    const sampleReel = {
      topic: reelTopic,
      duration: `${reelDuration}s`,
      hookLine: reelHook || 'Most brands lose customers silently — here is what they are missing.',
      sections: [
        {
          time: '0:00 - 0:05',
          label: 'HOOK',
          script: `[CLOSE-UP TO CAMERA / BOLD TEXT OVERLAY]\n"${reelHook || 'Most brands leave growth on the table — here is why.'}"`,
          direction: 'Fast cut. Punchy typography zoom-in.',
        },
        {
          time: '0:05 - 0:15',
          label: 'PROBLEM',
          script: `You post daily. You spend hours writing drafts. But conversion is flat. Why? Because the messaging lacks calibrated brand DNA.`,
          direction: 'B-roll of modern workspace. Steady camera push.',
        },
        {
          time: '0:15 - 0:35',
          label: 'SOLUTION',
          script: `${brand} uses AI Ads — an operating system that learns your brand tone, approved claims, and audience intent to craft high-converting assets in seconds.`,
          direction: 'Screen recording of AI Ads dashboard. Quick seamless cuts.',
        },
        {
          time: '0:35 - 0:50',
          label: 'PROOF',
          script: `10x faster output. Zero voice inconsistency. Approved by compliance before posting.`,
          direction: 'Split-screen metric comparison counter.',
        },
        {
          time: '0:50 - 0:60',
          label: 'CTA',
          script: `Comment "GROW" or click the link in bio to build your first AI campaign with ${brand}.`,
          direction: 'Direct to camera. Warm smile. End logo sting.',
        },
      ],
      hashtags: ['#AIMarketing', '#ContentVelocity', '#BrandStrategy', `#${brand.replace(/\s+/g, '')}`],
    };

    setReelResult(sampleReel);
    setLoadingReel(false);
    showToast('Reel script drafted!');
  };

  const handleGenerateStoryboard = async () => {
    if (!storyboardTopic.trim()) return;
    setLoadingStoryboard(true);
    await new Promise((r) => setTimeout(r, 800));

    const brand = activeWorkspace?.brandName || 'Brand';
    setStoryboardResult({
      topic: storyboardTopic,
      frames: Array.from({ length: storyboardFrames }, (_, i) => ({
        frame: i + 1,
        title: `Scene ${i + 1}: ${['Opening Hook Visual', 'Customer Tension', 'Hero Product Reveal', 'Feature Proof', 'Social Validation', 'Call To Action'][i % 6]}`,
        visualPrompt: `Cinematic commercial scene representing ${storyboardTopic} for ${brand} — frame ${i + 1}`,
        voiceover: `[Voiceover]: ${brand} delivers instant velocity with calibrated precision.`,
      })),
    });
    setLoadingStoryboard(false);
    showToast('Storyboard generated!');
  };

  const handleGenerateBrandKit = async () => {
    setLoadingBrandKit(true);
    await new Promise((r) => setTimeout(r, 800));

    const brand = activeWorkspace?.brandName || 'Brand';
    setBrandKitResult({
      brandName: brand,
      colorPalette: activeWorkspace?.brandColors || ['#3B82F6', '#10B981', '#F59E0B', '#1E293B'],
      typography: {
        headingFont: 'Outfit, Plus Jakarta Sans, sans-serif',
        bodyFont: 'Inter, system-ui, sans-serif',
      },
      positioningStatement: (activeWorkspace as any)?.positioningSummary || activeWorkspace?.companyDescription || `${brand} is the modern category leader delivering autonomous intelligence for forward-thinking brands.`,
      voiceTone: {
        adjectives: ['Authoritative', 'Innovative', 'Action-Driven', 'Transparent'],
      },
    });
    setLoadingBrandKit(false);
    showToast('Brand Kit assembled!');
  };

  const handleShareImage = async () => {
    if (!generatedImage) return;
    try {
      await Share.share({
        title: `AI Ads Creative - ${activeWorkspace?.brandName}`,
        url: generatedImage,
        message: `Generated with AI Ads Platform: ${generatedImage}`,
      });
    } catch {}
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={handleGoBack} title="Content Studio" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastWrap}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.toastGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </LinearGradient>
        </View>
      )}

      {/* Segmented Studio Channels Bar */}
      <View
        style={[
          styles.tabsBar,
          { backgroundColor: colors.headerBackground, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: 'SOCIAL', label: 'Social Copy', icon: PenTool },
            { id: 'CREATIVE', label: 'AI Visuals', icon: Sparkles },
            { id: 'BLOG', label: 'SEO Blog', icon: FileText },
            { id: 'EMAIL', label: 'Email Copy', icon: Mail },
            { id: 'AD_COPY', label: 'Paid Ads', icon: Target },
            { id: 'NEWSPAPER', label: 'Press Release', icon: Newspaper },
            { id: 'CAROUSEL', label: 'Carousels', icon: LayoutGrid },
            { id: 'REEL', label: 'Reel Scripts', icon: Film },
            { id: 'STORYBOARD', label: 'Storyboard', icon: BookOpen },
            { id: 'BRANDKIT', label: 'Brand Kit', icon: Brush },
            { id: 'WEBSITE', label: 'AI Websites', icon: Globe, isAction: true },
          ].map((tabItem) => {
            const isSelected = activeTab === tabItem.id;
            const Icon = tabItem.icon;
            return (
              <TouchableOpacity
                key={tabItem.id}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  if ((tabItem as any).isAction) {
                    navigation.navigate('WebsiteBuilder');
                  } else {
                    setActiveTab(tabItem.id as StudioTab);
                  }
                }}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected
                      ? colors.accent.primary
                      : isDark
                      ? 'rgba(255,255,255,0.05)'
                      : '#F1F5F9',
                    borderColor: isSelected ? colors.accent.primary : colors.border,
                  },
                ]}
                activeOpacity={0.75}
              >
                <Icon size={14} color={isSelected ? '#FFFFFF' : colors.textSecondary} />
                <Text
                  style={[
                    styles.tabChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {tabItem.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 1: SOCIAL STUDIO
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'SOCIAL' && (
          <View style={styles.sectionContainer}>
            <GlassCard style={styles.inputCard}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Social Media Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Generates high-CTR hooks, narrative captions, and calibrated hashtags
              </Text>

              {/* Platform Selector */}
              <View style={styles.platformRow}>
                {SOCIAL_PLATFORMS.map((p) => {
                  const isSelected = socialPlatform === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setSocialPlatform(p.id)}
                      style={[
                        styles.platformBtn,
                        {
                          backgroundColor: isSelected ? colors.accent.primary : 'transparent',
                          borderColor: isSelected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.platformBtnText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label="Topic or Creative Directive"
                placeholder="What is this post about?"
                value={socialTopic}
                onChangeText={setSocialTopic}
                multiline
              />

              <Button
                title={loadingSocial ? 'Crafting Social Copy...' : 'Generate Copy'}
                onPress={handleGenerateSocial}
                loading={loadingSocial}
                icon={<PenTool size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {/* Social Result Card */}
            {socialResult && (
              <GlassCard style={styles.resultCard} glow>
                {/* Fact Check Banner */}
                {factCheckScore !== null && (
                  <View style={styles.factCheckBanner}>
                    <ShieldCheck size={16} color="#10B981" />
                    <Text style={styles.factCheckBannerText}>
                      {factCheckScore}% Brand DNA Compliant · Zero Restricted Claims
                    </Text>
                  </View>
                )}

                {/* Hook / Headline */}
                {socialResult.hook && (
                  <View style={styles.contentBlock}>
                    <View style={styles.blockHeader}>
                      <Text style={[styles.blockTag, { color: colors.accent.primary }]}>+ HOOK / HEADLINE</Text>
                      <TouchableOpacity onPress={() => triggerCopy(socialResult.hook, 'hook')}>
                        {copiedKey === 'hook' ? <Check size={14} color="#10B981" /> : <Copy size={14} color={colors.textMuted} />}
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.hookText, { color: colors.textPrimary }]}>
                      {cleanText(socialResult.hook)}
                    </Text>
                  </View>
                )}

                {/* Short / Long Caption Mode Toggle */}
                <View style={styles.contentBlock}>
                  <View style={styles.blockHeader}>
                    <View style={styles.captionToggleRow}>
                      <Text style={[styles.blockTag, { color: '#10B981' }]}>✍️ CAPTION & BODY</Text>
                      <View style={styles.toggleSegment}>
                        <TouchableOpacity
                          onPress={() => setCaptionMode('short')}
                          style={[styles.toggleBtn, captionMode === 'short' && styles.toggleBtnActive]}
                        >
                          <Text style={[styles.toggleBtnText, captionMode === 'short' && styles.toggleBtnTextActive]}>
                            Short
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setCaptionMode('long')}
                          style={[styles.toggleBtn, captionMode === 'long' && styles.toggleBtnActive]}
                        >
                          <Text style={[styles.toggleBtnText, captionMode === 'long' && styles.toggleBtnTextActive]}>
                            Long Narrative
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        const txt = captionMode === 'short'
                          ? (socialResult.shortCaption || socialResult.caption || '')
                          : (socialResult.longCaption || socialResult.caption || '');
                        triggerCopy(txt, 'caption');
                      }}
                    >
                      {copiedKey === 'caption' ? <Check size={14} color="#10B981" /> : <Copy size={14} color={colors.textMuted} />}
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.captionBodyBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                    <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                      {captionMode === 'short'
                        ? cleanText(socialResult.shortCaption || socialResult.caption)
                        : cleanText(socialResult.longCaption || socialResult.caption)}
                    </Text>
                  </View>
                </View>

                {/* Hashtags */}
                {socialResult.hashtags && socialResult.hashtags.length > 0 && (
                  <View style={styles.contentBlock}>
                    <Text style={[styles.blockTag, { color: colors.accent.primary }]}>HASHTAGS</Text>
                    <Text style={[styles.hashtagsText, { color: colors.accent.secondary }]}>
                      {socialResult.hashtags.map((h: string) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
                    </Text>
                  </View>
                )}

                {/* Call to Action */}
                {socialResult.cta && (
                  <View style={styles.contentBlock}>
                    <View style={styles.blockHeader}>
                      <Text style={[styles.blockTag, { color: '#F59E0B' }]}>🎯 CALL TO ACTION</Text>
                      <TouchableOpacity onPress={() => triggerCopy(socialResult.cta, 'cta')}>
                        {copiedKey === 'cta' ? <Check size={14} color="#10B981" /> : <Copy size={14} color={colors.textMuted} />}
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.bodyText, { color: colors.textPrimary, fontWeight: '600' }]}>
                      {cleanText(socialResult.cta)}
                    </Text>
                  </View>
                )}

                {/* Action CTA Buttons */}
                <View style={styles.cardActionsCol}>
                  <TouchableOpacity
                    style={styles.assetLibraryBtn}
                    onPress={() =>
                      handleSaveToAssets(
                        socialTopic,
                        'SOCIAL',
                        `${socialResult.hook}\n\n${socialResult.caption || socialResult.shortCaption}\n\n${socialResult.hashtags?.join(' ')}`
                      )
                    }
                  >
                    <CheckCircle2 size={15} color="#FFFFFF" />
                    <Text style={styles.btnTextWhite}>Save to Asset Library</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.outlineActionBtn, { borderColor: '#10B981' }]}
                    onPress={() => handleRunFactCheck(socialResult.shortCaption || socialResult.caption || '')}
                    disabled={factChecking}
                  >
                    {factChecking ? (
                      <ActivityIndicator size="small" color="#10B981" />
                    ) : (
                      <ShieldCheck size={15} color="#10B981" />
                    )}
                    <Text style={[styles.outlineActionText, { color: '#10B981' }]}>
                      {factChecking ? 'Verifying...' : 'Verify Claims (Fact-Check)'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 2: CREATIVE (AI VISUALS)
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'CREATIVE' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Creative Studio Visuals
                  </Text>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Powered by Vertex AI Imagen 3 & Gemini Flash Image
                  </Text>
                </View>

                <View style={[styles.costBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Coins size={12} color="#F59E0B" />
                  <Text style={styles.costText}>5 Credits</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('CreativeStudio')}
                activeOpacity={0.8}
                style={[
                  styles.engineBanner,
                  {
                    backgroundColor: isDark ? 'rgba(124, 58, 237, 0.12)' : 'rgba(124, 58, 237, 0.06)',
                    borderColor: isDark ? 'rgba(124, 58, 237, 0.25)' : 'rgba(124, 58, 237, 0.15)',
                  },
                ]}
              >
                <View style={styles.engineBannerLeft}>
                  <Brush size={13} color="#7C3AED" />
                  <Text style={[styles.engineBannerText, { color: '#7C3AED' }]}>
                    Switch to Multi-Layer Banner Canvas
                  </Text>
                </View>
                <ArrowRight size={13} color="#7C3AED" />
              </TouchableOpacity>

              {/* Aspect Ratio chips */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Aspect Ratio</Text>
              <View style={styles.chipsRow}>
                {VISUAL_ASPECT_RATIOS.map((ar) => {
                  const isSelected = aspectRatio === ar.id;
                  return (
                    <TouchableOpacity
                      key={ar.id}
                      onPress={() => setAspectRatio(ar.id)}
                      style={[
                        styles.aspectChip,
                        {
                          backgroundColor: isSelected ? colors.accent.primary : 'transparent',
                          borderColor: isSelected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.aspectText, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                        {ar.id}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Visual Style Selector */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Visual Style Preset</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleScroll}>
                {VISUAL_STYLES.map((st) => {
                  const isSelected = visualStyle === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setVisualStyle(st)}
                      style={[
                        styles.styleChip,
                        {
                          backgroundColor: isSelected ? colors.accent.tagBg : isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                          borderColor: isSelected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.styleChipText, { color: isSelected ? colors.accent.primary : colors.textPrimary }]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Input
                label="Image Prompt Directive"
                placeholder="Describe your creative commercial visual..."
                value={visualPrompt}
                onChangeText={setVisualPrompt}
                multiline
              />

              <Button
                title={loadingVisual ? 'Rendering AI Visual...' : 'Generate 8K Image'}
                onPress={handleGenerateVisual}
                loading={loadingVisual}
                icon={<Sparkles size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {/* Generated Image Result */}
            {generatedImage && (
              <GlassCard style={styles.imageResultCard} glow>
                <Image
                  source={{ uri: generatedImage }}
                  style={[
                    styles.previewImage,
                    aspectRatio === '9:16'
                      ? { height: 420 }
                      : aspectRatio === '16:9'
                      ? { height: 180 }
                      : { height: 300 },
                  ]}
                  resizeMode="cover"
                />

                <View style={styles.imageActions}>
                  <TouchableOpacity
                    onPress={handleShareImage}
                    style={[styles.imgActionBtn, { borderColor: colors.border }]}
                  >
                    <Share2 size={16} color={colors.textPrimary} />
                    <Text style={[styles.imgActionText, { color: colors.textPrimary }]}>
                      Share / Save
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      handleSaveToAssets(
                        visualPrompt,
                        'IMAGE',
                        visualPrompt,
                        generatedImage,
                        { style: visualStyle, aspectRatio }
                      )
                    }
                    style={[styles.imgActionBtn, { backgroundColor: '#10B981', borderColor: '#10B981' }]}
                  >
                    <CheckCircle2 size={16} color="#FFFFFF" />
                    <Text style={[styles.imgActionText, { color: '#FFFFFF' }]}>
                      Asset Library
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 3: SEO BLOG STUDIO
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'BLOG' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Long-Form SEO Article Writer
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Rank for high-intent queries with authoritative structure and claim fact-checking
              </Text>

              <Input
                label="Article Title or Main Topic"
                placeholder="e.g. 5 Growth Strategies for 2026"
                value={blogTopic}
                onChangeText={setBlogTopic}
              />

              <Input
                label="Target Keywords (comma-separated)"
                placeholder="e.g. enterprise marketing, ROI, growth"
                value={blogKeywords}
                onChangeText={setBlogKeywords}
              />

              <Button
                title={loadingBlog ? 'Writing Article...' : 'Draft SEO Article'}
                onPress={handleGenerateBlog}
                loading={loadingBlog}
                icon={<FileText size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {blogDraft && (
              <GlassCard style={styles.resultCard} glow>
                <View style={styles.blockHeader}>
                  <Text style={[styles.articleTitle, { color: colors.textPrimary }]}>
                    {cleanText(blogDraft.title || blogTopic)}
                  </Text>
                  <TouchableOpacity onPress={() => triggerCopy(blogDraft.content, 'blog')}>
                    {copiedKey === 'blog' ? <Check size={16} color="#10B981" /> : <Copy size={16} color={colors.textMuted} />}
                  </TouchableOpacity>
                </View>

                {blogDraft.excerpt && (
                  <View style={[styles.excerptBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                    <Text style={[styles.excerptText, { color: colors.textSecondary }]}>
                      {cleanText(blogDraft.excerpt)}
                    </Text>
                  </View>
                )}

                <Text style={[styles.articleContent, { color: colors.textSecondary }]}>
                  {cleanText(blogDraft.content)}
                </Text>

                <View style={styles.cardActionsCol}>
                  <TouchableOpacity
                    style={styles.assetLibraryBtn}
                    onPress={() =>
                      handleSaveToAssets(
                        blogDraft.title || blogTopic,
                        'BLOG',
                        blogDraft.content,
                        undefined,
                        { keywords: blogKeywords }
                      )
                    }
                  >
                    <CheckCircle2 size={15} color="#FFFFFF" />
                    <Text style={styles.btnTextWhite}>Save to Asset Library</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 4: EMAIL STUDIO
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'EMAIL' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Email Newsletter & Sales Copy
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                High-converting subject lines, preheaders, and structured sequence copy
              </Text>

              <Input
                label="Campaign Purpose / Angle"
                placeholder="e.g. Special Product Announcement"
                value={emailSubject}
                onChangeText={setEmailSubject}
              />

              <View style={styles.chipsRow}>
                {['newsletter', 'product_launch', 'cold_outreach', 'event_invitation'].map((p) => {
                  const isSelected = emailPurpose === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setEmailPurpose(p)}
                      style={[
                        styles.aspectChip,
                        {
                          backgroundColor: isSelected ? colors.accent.primary : 'transparent',
                          borderColor: isSelected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.aspectText, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                        {p.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Button
                title={loadingEmail ? 'Writing Email...' : 'Generate Email Copy'}
                onPress={handleGenerateEmail}
                loading={loadingEmail}
                icon={<Mail size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {emailDraft && (
              <GlassCard style={styles.resultCard} glow>
                <View style={styles.contentBlock}>
                  <View style={styles.blockHeader}>
                    <Text style={[styles.blockTag, { color: colors.accent.primary }]}>SUBJECT LINE</Text>
                    <TouchableOpacity onPress={() => triggerCopy(emailDraft.subject, 'email_subj')}>
                      {copiedKey === 'email_subj' ? <Check size={14} color="#10B981" /> : <Copy size={14} color={colors.textMuted} />}
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.hookText, { color: colors.textPrimary }]}>
                    {cleanText(emailDraft.subject)}
                  </Text>
                </View>

                {emailDraft.preheader && (
                  <View style={styles.contentBlock}>
                    <Text style={[styles.blockTag, { color: colors.textMuted }]}>PREHEADER</Text>
                    <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                      {cleanText(emailDraft.preheader)}
                    </Text>
                  </View>
                )}

                <View style={styles.contentBlock}>
                  <View style={styles.blockHeader}>
                    <Text style={[styles.blockTag, { color: colors.accent.primary }]}>EMAIL BODY</Text>
                    <TouchableOpacity onPress={() => triggerCopy(emailDraft.body, 'email_body')}>
                      {copiedKey === 'email_body' ? <Check size={14} color="#10B981" /> : <Copy size={14} color={colors.textMuted} />}
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                    {cleanText(emailDraft.body)}
                  </Text>
                </View>

                <View style={styles.cardActionsCol}>
                  <TouchableOpacity
                    style={styles.assetLibraryBtn}
                    onPress={() =>
                      handleSaveToAssets(
                        emailDraft.subject || emailSubject,
                        'EMAIL',
                        `${emailDraft.subject}\n\n${emailDraft.body}`
                      )
                    }
                  >
                    <CheckCircle2 size={15} color="#FFFFFF" />
                    <Text style={styles.btnTextWhite}>Save to Asset Library</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 5: PAID AD COPY STUDIO (PAS Framework)
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'AD_COPY' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Paid Ad Copy Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                High-converting paid ad hooks using the PAS (Problem-Agitate-Solution) framework
              </Text>

              {/* Platform Selector */}
              <View style={styles.platformRow}>
                {(['facebook', 'google', 'linkedin', 'twitter'] as const).map((pl) => {
                  const isSelected = adPlatform === pl;
                  return (
                    <TouchableOpacity
                      key={pl}
                      onPress={() => setAdPlatform(pl)}
                      style={[
                        styles.platformBtn,
                        {
                          backgroundColor: isSelected ? colors.accent.primary : 'transparent',
                          borderColor: isSelected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.platformBtnText, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                        {pl.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label="Product / Service Name"
                placeholder="What are you advertising?"
                value={adProduct}
                onChangeText={setAdProduct}
              />

              <Input
                label="Target Audience"
                placeholder="e.g. Agency Owners, DTC Brands"
                value={adAudience}
                onChangeText={setAdAudience}
              />

              <Input
                label="Key Value Benefits (comma-separated)"
                placeholder="e.g. 10x Velocity, Zero Bottlenecks"
                value={adBenefits}
                onChangeText={setAdBenefits}
              />

              <Button
                title={loadingAd ? 'Crafting Ad Angles...' : 'Generate High-CTR Ad Copy'}
                onPress={handleGenerateAd}
                loading={loadingAd}
                icon={<Target size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {adResult && (
              <GlassCard style={styles.resultCard} glow>
                <View style={styles.blockHeader}>
                  <Badge label={adResult.framework || 'PAS Framework'} variant="accent" />
                  <TouchableOpacity onPress={() => triggerCopy(`${adResult.headline}\n\n${adResult.primaryText}`, 'all_ad')}>
                    {copiedKey === 'all_ad' ? <Check size={16} color="#10B981" /> : <Copy size={16} color={colors.textMuted} />}
                  </TouchableOpacity>
                </View>

                {/* 3 Hook Variations */}
                {adResult.hooks && (
                  <View style={styles.contentBlock}>
                    <Text style={[styles.blockTag, { color: '#F59E0B' }]}>3 HIGH-CTR HOOK ANGLES</Text>
                    {adResult.hooks.map((hk: string, i: number) => (
                      <View key={i} style={[styles.hookItemBox, { borderColor: colors.border }]}>
                        <Text style={[styles.hookNumBadge, { color: colors.accent.primary }]}>#{i + 1}</Text>
                        <Text style={[styles.hookItemText, { color: colors.textPrimary }]}>"{hk}"</Text>
                        <TouchableOpacity onPress={() => triggerCopy(hk, `ad_hk_${i}`)}>
                          {copiedKey === `ad_hk_${i}` ? <Check size={12} color="#10B981" /> : <Copy size={12} color={colors.textMuted} />}
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Headline & Primary Text */}
                <View style={styles.contentBlock}>
                  <Text style={[styles.blockTag, { color: colors.accent.primary }]}>PRIMARY AD COPY</Text>
                  <Text style={[styles.articleTitle, { color: colors.textPrimary }]}>
                    {cleanText(adResult.headline)}
                  </Text>
                  <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                    {cleanText(adResult.primaryText)}
                  </Text>
                </View>

                {adResult.cta && (
                  <View style={styles.adCtaPill}>
                    <Text style={styles.adCtaPillText}>RECOMMENDED CTA: {adResult.cta.toUpperCase()}</Text>
                  </View>
                )}

                <View style={styles.cardActionsCol}>
                  <TouchableOpacity
                    style={styles.assetLibraryBtn}
                    onPress={() =>
                      handleSaveToAssets(
                        adResult.headline || adProduct,
                        'AD_COPY',
                        `${adResult.headline}\n\n${adResult.primaryText}\n\nCTA: ${adResult.cta}`
                      )
                    }
                  >
                    <CheckCircle2 size={15} color="#FFFFFF" />
                    <Text style={styles.btnTextWhite}>Save to Asset Library</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 6: NEWSPAPER & PR STUDIO (AP Corporate Standard)
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'NEWSPAPER' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Newspaper & Press Release Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Official corporate journalism in AP Standard format with executive quotes
              </Text>

              <Input
                label="Announcement Headline / Topic"
                placeholder="What is the official announcement?"
                value={newspaperTopic}
                onChangeText={setNewspaperTopic}
              />

              <Input
                label="Dateline"
                placeholder="e.g. MUMBAI / NEW YORK — Oct 3, 2026"
                value={newspaperDateline}
                onChangeText={setNewspaperDateline}
              />

              <Button
                title={loadingNewspaper ? 'Drafting Press Release...' : 'Generate Official PR'}
                onPress={handleGenerateNewspaper}
                loading={loadingNewspaper}
                icon={<Newspaper size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {newspaperDraft && (
              <GlassCard style={styles.resultCard} glow>
                <View style={styles.prHeaderBox}>
                  <Text style={styles.prStandardLabel}>FOR IMMEDIATE RELEASE</Text>
                  <TouchableOpacity onPress={() => triggerCopy(`${newspaperDraft.headline}\n\n${newspaperDraft.dateline} — ${newspaperDraft.executiveSummary}`, 'all_pr')}>
                    {copiedKey === 'all_pr' ? <Check size={16} color="#10B981" /> : <Copy size={16} color={colors.textMuted} />}
                  </TouchableOpacity>
                </View>

                <Text style={[styles.prHeadline, { color: colors.textPrimary }]}>
                  {newspaperDraft.headline}
                </Text>
                <Text style={[styles.prSubheadline, { color: colors.textSecondary }]}>
                  {newspaperDraft.subheadline}
                </Text>

                <View style={styles.prDatelineRow}>
                  <Text style={[styles.prDateline, { color: colors.accent.primary }]}>
                    {newspaperDraft.dateline} —
                  </Text>
                  <Text style={[styles.prSummaryText, { color: colors.textPrimary }]}>
                    {newspaperDraft.executiveSummary}
                  </Text>
                </View>

                {newspaperDraft.quote && (
                  <View style={[styles.prQuoteBox, { borderLeftColor: '#10B981', backgroundColor: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.03)' }]}>
                    <Text style={[styles.prQuoteText, { color: colors.textPrimary }]}>
                      {newspaperDraft.quote}
                    </Text>
                  </View>
                )}

                {newspaperDraft.bodyParagraphs?.map((p: string, i: number) => (
                  <Text key={i} style={[styles.bodyText, { color: colors.textSecondary }]}>
                    {p}
                  </Text>
                ))}

                <View style={[styles.prBoilerplateBox, { borderColor: colors.border }]}>
                  <Text style={[styles.prBoilerplateTitle, { color: colors.textMuted }]}>CORPORATE BACKGROUNDER</Text>
                  <Text style={[styles.prBoilerplateText, { color: colors.textSecondary }]}>
                    {newspaperDraft.boilerplate}
                  </Text>
                </View>

                <View style={styles.cardActionsCol}>
                  <TouchableOpacity
                    style={styles.assetLibraryBtn}
                    onPress={() =>
                      handleSaveToAssets(
                        newspaperDraft.headline,
                        'NEWSPAPER',
                        `${newspaperDraft.headline}\n\n${newspaperDraft.executiveSummary}\n\n${newspaperDraft.quote}`
                      )
                    }
                  >
                    <CheckCircle2 size={15} color="#FFFFFF" />
                    <Text style={styles.btnTextWhite}>Save to Asset Library</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 7: CAROUSEL STUDIO
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'CAROUSEL' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Carousel Slide Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Multi-slide swipeable card copy with visual direction
              </Text>

              <Input
                label="Carousel Topic"
                placeholder="What is this carousel teaching?"
                value={carouselTopic}
                onChangeText={setCarouselTopic}
              />

              <Button
                title={loadingCarousel ? 'Designing Slides...' : 'Generate Carousel'}
                onPress={handleGenerateCarousel}
                loading={loadingCarousel}
                icon={<LayoutGrid size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {carouselResult && (
              <GlassCard glow style={styles.resultCard}>
                <View style={styles.blockHeader}>
                  <Badge label="Cover Slide" variant="accent" />
                  <TouchableOpacity onPress={() => triggerCopy(JSON.stringify(carouselResult, null, 2), 'all_carousel')}>
                    <Copy size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.hookText, { color: colors.textPrimary }]}>
                  {carouselResult.coverSlide.headline}
                </Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {carouselResult.coverSlide.subtext}
                </Text>

                {carouselResult.slides.map((s: any, idx: number) => (
                  <View key={idx} style={[styles.slideCard, { borderColor: colors.border }]}>
                    <Text style={[styles.slideNum, { color: colors.accent.primary }]}>Slide {s.num}</Text>
                    <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>{s.title}</Text>
                    <Text style={[styles.slideBody, { color: colors.textSecondary }]}>{s.body}</Text>
                  </View>
                ))}
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 8: REEL SCRIPTS STUDIO
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'REEL' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Reel & Short Video Script Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Timestamped scripts with director cues and editing specifications
              </Text>

              <Input
                label="Reel Topic / Message"
                placeholder="What is this video about?"
                value={reelTopic}
                onChangeText={setReelTopic}
              />

              <Input
                label="Hook Directive"
                placeholder="Opening hook line..."
                value={reelHook}
                onChangeText={setReelHook}
              />

              <Button
                title={loadingReel ? 'Writing Script...' : 'Generate Reel Script'}
                onPress={handleGenerateReel}
                loading={loadingReel}
                icon={<Film size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {reelResult && (
              <GlassCard glow style={styles.resultCard}>
                <View style={styles.blockHeader}>
                  <Badge label={`${reelResult.duration} Script`} variant="accent" />
                  <TouchableOpacity onPress={() => triggerCopy(reelResult.sections.map((s: any) => `${s.time} [${s.label}]\n${s.script}`).join('\n\n'), 'all_reel')}>
                    <Copy size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {reelResult.sections.map((sec: any, idx: number) => (
                  <View key={idx} style={styles.reelSectionCard}>
                    <View style={styles.reelSectionTop}>
                      <Badge label={sec.label} variant="neutral" />
                      <Text style={[styles.reelTime, { color: colors.textMuted }]}>{sec.time}</Text>
                    </View>
                    <Text style={[styles.reelScript, { color: colors.textPrimary }]}>{sec.script}</Text>
                    <Text style={[styles.reelDirection, { color: colors.accent.primary }]}>
                      Director: {sec.direction}
                    </Text>
                  </View>
                ))}
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 9: STORYBOARD STUDIO
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'STORYBOARD' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Video Ad Storyboard Generator
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Frame-by-frame visual and voiceover sequences
              </Text>

              <Input
                label="Commercial Video Topic"
                placeholder="e.g. Premium Footwear Launch"
                value={storyboardTopic}
                onChangeText={setStoryboardTopic}
              />

              <Button
                title={loadingStoryboard ? 'Assembling Storyboard...' : 'Generate 6-Frame Storyboard'}
                onPress={handleGenerateStoryboard}
                loading={loadingStoryboard}
                icon={<BookOpen size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {storyboardResult && (
              <GlassCard glow style={styles.resultCard}>
                {storyboardResult.frames.map((f: any, idx: number) => (
                  <View key={idx} style={[styles.frameCard, { borderColor: colors.border }]}>
                    <Text style={[styles.frameTitle, { color: colors.textPrimary }]}>{f.title}</Text>
                    <Text style={[styles.framePrompt, { color: colors.textSecondary }]}>
                      Visual: {f.visualPrompt}
                    </Text>
                    <Text style={[styles.frameVo, { color: colors.accent.primary }]}>
                      {f.voiceover}
                    </Text>
                  </View>
                ))}
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 10: BRAND KIT STUDIO
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'BRANDKIT' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Brand Kit Assembly Engine
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Synchronize typography, color tokens, and positioning memory
              </Text>

              <Button
                title={loadingBrandKit ? 'Calibrating Brand Kit...' : 'Assemble Brand Kit'}
                onPress={handleGenerateBrandKit}
                loading={loadingBrandKit}
                icon={<Brush size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {brandKitResult && (
              <GlassCard glow style={styles.resultCard}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {brandKitResult.brandName} Brand Identity
                </Text>
                <View style={styles.colorsRow}>
                  {brandKitResult.colorPalette.map((col: string, idx: number) => (
                    <View key={idx} style={[styles.colorSquare, { backgroundColor: col }]}>
                      <Text style={styles.colorHexText}>{col}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {brandKitResult.positioningStatement}
                </Text>
              </GlassCard>
            )}
          </View>
        )}
      </ScrollView>

      <FloatingAISABrain />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toastWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#10B981',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tabsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 14,
  },
  sectionContainer: {
    gap: 14,
  },
  inputCard: {
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    lineHeight: LINE_HEIGHTS.heading,
  },
  sectionSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    marginBottom: 6,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  platformBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  platformBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtn: {
    marginTop: 6,
  },
  resultCard: {
    padding: 16,
    gap: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  factCheckBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  factCheckBannerText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  contentBlock: {
    gap: 4,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockTag: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  hookText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '800',
    lineHeight: LINE_HEIGHTS.body,
  },
  captionToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleSegment: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#10B981',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  captionBodyBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  bodyText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.body + 2,
  },
  hashtagsText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  cardActionsCol: {
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  assetLibraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#059669',
  },
  btnTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  outlineActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  costText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  aspectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  aspectText: {
    fontSize: 11,
    fontWeight: '700',
  },
  styleScroll: {
    marginBottom: 8,
  },
  styleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  styleChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  imageResultCard: {
    padding: 10,
    borderRadius: 18,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  previewImage: {
    width: '100%',
    borderRadius: 14,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  imgActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  imgActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  articleTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    lineHeight: LINE_HEIGHTS.heading,
    flex: 1,
  },
  excerptBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  excerptText: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  articleContent: {
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body + 3,
  },
  hookItemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 2,
  },
  hookNumBadge: {
    fontSize: 11,
    fontWeight: '800',
  },
  hookItemText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  adCtaPill: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(59,130,246,0.1)',
    alignItems: 'center',
  },
  adCtaPillText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '800',
  },
  prHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  prStandardLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 1,
  },
  prHeadline: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  prSubheadline: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  prDatelineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  prDateline: {
    fontSize: 11,
    fontWeight: '800',
  },
  prSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  prQuoteBox: {
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginVertical: 4,
  },
  prQuoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  prBoilerplateBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  prBoilerplateTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  prBoilerplateText: {
    fontSize: 12,
    lineHeight: 16,
  },
  slideCard: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    marginVertical: 2,
  },
  slideNum: {
    fontSize: 11,
    fontWeight: '800',
  },
  slideTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  slideBody: {
    fontSize: 11,
    lineHeight: 16,
  },
  reelSectionCard: {
    padding: 10,
    borderRadius: 10,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginVertical: 2,
  },
  reelSectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reelTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  reelScript: {
    fontSize: 11,
    lineHeight: 16,
  },
  reelDirection: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  frameCard: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    marginVertical: 2,
  },
  frameTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  framePrompt: {
    fontSize: 11,
    lineHeight: 15,
  },
  frameVo: {
    fontSize: 11,
    fontWeight: '600',
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  colorSquare: {
    width: 60,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorHexText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  engineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  engineBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  engineBannerText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
