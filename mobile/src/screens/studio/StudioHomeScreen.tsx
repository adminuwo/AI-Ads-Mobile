import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
} from 'react-native';
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
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
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
  | 'CAROUSEL'
  | 'REEL'
  | 'STORYBOARD'
  | 'BRANDKIT'
  | 'BLOG'
  | 'EMAIL';

export const StudioHomeScreen: React.FC<{ route?: any }> = ({ route }) => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace, credits, deductCredits, studioTarget, setStudioTarget } = useWorkspace();

  const initialTab: StudioTab = route?.params?.tab || 'SOCIAL';
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);

  // Social State
  const [socialPlatform, setSocialPlatform] = useState<string>('instagram');
  const [socialTopic, setSocialTopic] = useState('Sustainable product design that drives consumer loyalty');
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [socialResult, setSocialResult] = useState<any | null>(null);

  // Consume incoming target from Quick Post Modal or other triggers
  useEffect(() => {
    if (studioTarget) {
      setActiveTab('SOCIAL');
      if (studioTarget.platform) {
        setSocialPlatform(studioTarget.platform.toLowerCase());
      }
      if (studioTarget.topic) {
        setSocialTopic(studioTarget.topic);
      }
      if (studioTarget.output) {
        setSocialResult(studioTarget.output);
      }
      setStudioTarget(null);
    }
  }, [studioTarget, setStudioTarget]);

  // Creative Visual State
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [visualStyle, setVisualStyle] = useState<string>('Photorealistic Commercial');
  const [visualPrompt, setVisualPrompt] = useState('Luxury commercial studio shot with dynamic lighting');
  const [loadingVisual, setLoadingVisual] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Carousel State
  const [carouselTopic, setCarouselTopic] = useState('5 Ways AI Transforms Brand Velocity in 2026');
  const [carouselSlides, setCarouselSlides] = useState(6);
  const [carouselPlatform, setCarouselPlatform] = useState('instagram');
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [carouselResult, setCarouselResult] = useState<any | null>(null);

  // Reel Script State
  const [reelTopic, setReelTopic] = useState('Why Brands Lose Customers Silently & How to Fix It');
  const [reelDuration, setReelDuration] = useState('60');
  const [reelHook, setReelHook] = useState('Most brands lose customers silently here is what they are missing');
  const [loadingReel, setLoadingReel] = useState(false);
  const [reelResult, setReelResult] = useState<any | null>(null);

  // Storyboard State
  const [storyboardTopic, setStoryboardTopic] = useState('Product Launch Campaign Premium Reveal');
  const [storyboardAdType, setStoryboardAdType] = useState('video_ad');
  const [storyboardFrames, setStoryboardFrames] = useState(6);
  const [loadingStoryboard, setLoadingStoryboard] = useState(false);
  const [storyboardResult, setStoryboardResult] = useState<any | null>(null);

  // Brand Kit State
  const [brandKitFocus, setBrandKitFocus] = useState('Complete Brand Kit');
  const [loadingBrandKit, setLoadingBrandKit] = useState(false);
  const [brandKitResult, setBrandKitResult] = useState<any | null>(null);

  // Blog State
  const [blogTopic, setBlogTopic] = useState('How AI Ads Eliminates Agency Bottlenecks');
  const [blogKeywords, setBlogKeywords] = useState('AI marketing, content velocity, brand DNA');
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [blogDraft, setBlogDraft] = useState<any | null>(null);

  // Email State
  const [emailSubject, setEmailSubject] = useState('Product Launch Newsletter');
  const [emailPurpose, setEmailPurpose] = useState('newsletter');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState<any | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const triggerCopy = async (text: string, key: string) => {
    await Clipboard.setStringAsync(text);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate Social
  const handleGenerateSocial = async () => {
    if (!socialTopic.trim()) return;
    setLoadingSocial(true);
    try {
      const res = await contentApi.generateSocialPost({
        topic: socialTopic.trim(),
        platform: socialPlatform,
        brandName: activeWorkspace?.brandName,
        industry: activeWorkspace?.industryCategory,
        brandVoiceTone: activeWorkspace?.brandVoiceTone,
        approvedClaims: activeWorkspace?.approvedClaims,
        restrictedClaims: activeWorkspace?.restrictedClaims,
      });

      if (res.success && (res.result || res.post)) {
        setSocialResult(res.result || res.post);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingSocial(false);
    }
  };

  // Generate Visual
  const handleGenerateVisual = async () => {
    if (!visualPrompt.trim()) return;
    const cost = 5;
    if (credits.balance < cost) {
      alert('Insufficient credits for image generation.');
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
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingVisual(false);
    }
  };

  // Generate Carousel
  const handleGenerateCarousel = async () => {
    if (!carouselTopic.trim()) return;
    setLoadingCarousel(true);
    await new Promise((r) => setTimeout(r, 1200));

    const brand = activeWorkspace?.brandName || 'Brand';
    const sampleCarousel = {
      topic: carouselTopic,
      platform: carouselPlatform,
      coverSlide: {
        headline: carouselTopic.toUpperCase(),
        subtext: `By ${brand} | Swipe to explore`,
      },
      slides: Array.from({ length: carouselSlides - 2 }, (_, i) => ({
        num: i + 2,
        title: `Pillar ${i + 1}: ${
          ['Content Velocity', 'Brand DNA Context', 'Multi-Channel Automation', 'Real-Time Telemetry', 'Stakeholder Approvals'][
            i % 5
          ]
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
        visualCue: `[Visual: ${
          ['Before and after split comparison', 'DNA helix context graphic', 'Multi-channel connected flow', 'KPI telemetry chart', 'Approval desk workflow'][
            i % 5
          ]
        }]`,
      })),
      ctaSlide: {
        headline: 'Ready to Scale Your Brand?',
        cta: 'Tap link in bio to start your AI campaign',
        brandTag: `@${brand.toLowerCase().replace(/\s/g, '')}`,
      },
    };

    setCarouselResult(sampleCarousel);
    setLoadingCarousel(false);
  };

  // Generate Reel Script
  const handleGenerateReel = async () => {
    if (!reelTopic.trim()) return;
    setLoadingReel(true);
    await new Promise((r) => setTimeout(r, 1200));

    const brand = activeWorkspace?.brandName || 'Brand';
    const sampleReel = {
      topic: reelTopic,
      duration: `${reelDuration}s`,
      hookLine: reelHook || `Most brands are leaving revenue on the table here is the fix`,
      sections: [
        {
          time: '0:00 - 0:05',
          label: 'HOOK',
          script: `[CLOSE-UP TO CAMERA / BOLD TEXT OVERLAY]\n"${reelHook || 'Most brands leave growth on the table here is why.'}"`,
          direction: 'Fast cut. Punchy typography zoom-in.',
        },
        {
          time: '0:05 - 0:15',
          label: 'PROBLEM',
          script: `You post daily. You spend hours writing drafts. But conversion is flat.\nWhy? Because the messaging lacks calibrated brand DNA.`,
          direction: 'B-roll of modern workspace. Steady camera push.',
        },
        {
          time: '0:15 - 0:35',
          label: 'SOLUTION',
          script: `${brand} uses AI Ads an operating system that learns your brand tone, approved claims, and audience intent.\nIt crafts social posts, visuals, websites, and emails in seconds.`,
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
      editingNotes: `Aspect Ratio: 9:16 Vertical | Music: Upbeat trending audio | Captions: Auto-burned text overlay`,
      hashtags: ['#AIMarketing', '#ContentVelocity', '#BrandStrategy', `#${brand.replace(/\s/g, '')}`],
    };

    setReelResult(sampleReel);
    setLoadingReel(false);
  };

  // Generate Storyboard
  const handleGenerateStoryboard = async () => {
    if (!storyboardTopic.trim()) return;
    setLoadingStoryboard(true);
    await new Promise((r) => setTimeout(r, 1200));

    const brand = activeWorkspace?.brandName || 'Brand';
    const sampleStoryboard = {
      topic: storyboardTopic,
      adType: storyboardAdType,
      frames: Array.from({ length: storyboardFrames }, (_, i) => ({
        frame: i + 1,
        duration: `0:${i * 3} - 0:${(i + 1) * 3}`,
        sceneDesc: [
          `OPENING: Cinematic black screen fade-in. ${brand} logo materializes with subtle particle effects.`,
          `ESTABLISHING: Wide shot of urban creative studio. Voiceover begins with authoritative tone.`,
          `PRODUCT MACRO: Slow 360 rotation of hero product with precision commercial studio lighting.`,
          `LIFESTYLE ACTION: Customer persona interacting seamlessly with product in real environment.`,
          `METRICS STRIP: Animated stats showing verified customer satisfaction and growth metrics.`,
          `CTA OUTRO: Brand lockup with headline "Scale Your Marketing Today" and QR code.`,
        ][Math.min(i, 5)],
        visualDirection: [
          'Dark gradient background. Lens flare. Brand primary color accent.',
          'Crisp 4K drone or gimbal movement. Subtle film grain.',
          'Macro lens focus pull. Dynamic shadow highlights.',
          'Warm golden hour lighting. Authentic customer reaction.',
          'Minimalist typography cards with bold numbers.',
          'Hero product still + action button animation.',
        ][Math.min(i, 5)],
        voiceover: [
          `In a market crowded with noise...`,
          `...clarity is your greatest competitive advantage.`,
          `Engineered for precision. Crafted for trust.`,
          `Join thousands who experience the difference every day.`,
          `Results you can measure. Velocity you can feel.`,
          `${brand}. Discover the next generation today.`,
        ][Math.min(i, 5)],
      })),
    };

    setStoryboardResult(sampleStoryboard);
    setLoadingStoryboard(false);
  };

  // Generate Brand Kit
  const handleGenerateBrandKit = async () => {
    setLoadingBrandKit(true);
    await new Promise((r) => setTimeout(r, 1200));

    const brand = activeWorkspace?.brandName || 'Brand';
    const sampleKit = {
      brandName: brand,
      focus: brandKitFocus,
      colors: [
        { name: 'Brand Primary', hex: '#6366F1', role: 'Main CTAs, key titles' },
        { name: 'Accent Emerald', hex: '#10B981', role: 'Success states, indicators' },
        { name: 'Deep Navy', hex: '#0F172A', role: 'Dark canvas, structural elements' },
        { name: 'Off White', hex: '#F8FAFC', role: 'Light cards, contrast text' },
      ],
      typography: {
        heading: 'Outfit Bold 700 / 800 for major headlines and display elements',
        body: 'Inter Regular 400 / Semibold 600 for interface copy and paragraphs',
        mono: 'JetBrains Mono for technical metrics and numerical counters',
      },
      voiceTone: {
        adjectives: ['Authoritative', 'Innovative', 'Performance-Driven', 'Approachable'],
        doSay: [`"${brand} delivers measurable marketing velocity."`, '"Engineered for precision and trust."'],
        dontSay: ['"Cheap and quick"', '"We try our best"'],
      },
      logoRules: [
        'Maintain minimum clear space equal to logo icon width on all sides',
        'Never skew, compress, or apply artificial drop shadows to the mark',
        'Use white mark on dark canvas and primary mark on light backgrounds',
      ],
    };

    setBrandKitResult(sampleKit);
    setLoadingBrandKit(false);
  };

  // Generate Blog
  const handleGenerateBlog = async () => {
    if (!blogTopic.trim()) return;
    setLoadingBlog(true);
    try {
      const res = await contentApi.generateBlogDraft({
        topic: blogTopic.trim(),
        keywords: blogKeywords.trim(),
        brandName: activeWorkspace?.brandName,
        industry: activeWorkspace?.industryCategory,
      });

      if (res.success && (res.draft || res.article)) {
        setBlogDraft(res.draft || res.article);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingBlog(false);
    }
  };

  // Generate Email
  const handleGenerateEmail = async () => {
    if (!emailSubject.trim()) return;
    setLoadingEmail(true);
    try {
      const res = await contentApi.generateEmailCopy({
        purpose: emailPurpose,
        recipient: 'Customers',
        context: emailSubject.trim(),
        brandName: activeWorkspace?.brandName,
      });

      if (res.success && res.email) {
        setEmailDraft(res.email);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingEmail(false);
    }
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
      <BrandHeader title="Creation Studio" />

      {/* Segmented Top Tabs */}
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
            { id: 'CAROUSEL', label: 'Carousels', icon: LayoutGrid },
            { id: 'REEL', label: 'Reel Scripts', icon: Film },
            { id: 'STORYBOARD', label: 'Storyboard', icon: BookOpen },
            { id: 'BRANDKIT', label: 'Brand Kit', icon: Brush },
            { id: 'BLOG', label: 'SEO Blog', icon: FileText },
            { id: 'EMAIL', label: 'Email Copy', icon: Mail },
          ].map((tabItem) => {
            const isSelected = activeTab === tabItem.id;
            const Icon = tabItem.icon;
            return (
              <TouchableOpacity
                key={tabItem.id}
                onPress={() => setActiveTab(tabItem.id as StudioTab)}
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── TAB 1: SOCIAL ── */}
        {activeTab === 'SOCIAL' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Multi-Platform Social Generator
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Generates high-CTR hooks and brand-aligned captions
              </Text>

              {/* Platform selector */}
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
                {socialResult.hook && (
                  <View style={styles.contentBlock}>
                    <View style={styles.blockHeader}>
                      <Text style={[styles.blockTag, { color: colors.accent.primary }]}>HOOK</Text>
                      <TouchableOpacity onPress={() => triggerCopy(socialResult.hook, 'hook')}>
                        {copiedKey === 'hook' ? <Check size={14} color="#10B981" /> : <Copy size={14} color={colors.textMuted} />}
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.hookText, { color: colors.textPrimary }]}>
                      {cleanText(socialResult.hook)}
                    </Text>
                  </View>
                )}

                {(socialResult.shortCaption || socialResult.caption) && (
                  <View style={styles.contentBlock}>
                    <View style={styles.blockHeader}>
                      <Text style={[styles.blockTag, { color: colors.accent.primary }]}>CAPTION</Text>
                      <TouchableOpacity onPress={() => triggerCopy(socialResult.shortCaption || socialResult.caption, 'caption')}>
                        {copiedKey === 'caption' ? <Check size={14} color="#10B981" /> : <Copy size={14} color={colors.textMuted} />}
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                      {cleanText(socialResult.shortCaption || socialResult.caption)}
                    </Text>
                  </View>
                )}

                {socialResult.hashtags && socialResult.hashtags.length > 0 && (
                  <View style={styles.contentBlock}>
                    <Text style={[styles.blockTag, { color: colors.accent.primary }]}>HASHTAGS</Text>
                    <Text style={[styles.hashtagsText, { color: colors.accent.secondary }]}>
                      {socialResult.hashtags.map((h: string) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
                    </Text>
                  </View>
                )}

                {socialResult.cta && (
                  <View style={styles.contentBlock}>
                    <View style={styles.blockHeader}>
                      <Text style={[styles.blockTag, { color: colors.accent.primary }]}>CALL TO ACTION</Text>
                      <TouchableOpacity onPress={() => triggerCopy(socialResult.cta, 'cta')}>
                        {copiedKey === 'cta' ? <Check size={14} color="#10B981" /> : <Copy size={14} color={colors.textMuted} />}
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.bodyText, { color: colors.textPrimary, fontWeight: '600' }]}>
                      {cleanText(socialResult.cta)}
                    </Text>
                  </View>
                )}
              </GlassCard>
            )}
          </View>
        )}

        {/* ── TAB 2: CREATIVE (AI VISUALS) ── */}
        {activeTab === 'CREATIVE' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <View style={styles.cardHeaderRow}>
                <View>
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

              {/* Aspect Ratio chips */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Aspect Ratio
              </Text>
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
                      <Text
                        style={[
                          styles.aspectText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {ar.id}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Visual Style Selector */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Visual Style Preset
              </Text>
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
                          backgroundColor: isSelected
                            ? colors.accent.tagBg
                            : isDark
                            ? 'rgba(255,255,255,0.04)'
                            : '#F1F5F9',
                          borderColor: isSelected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.styleChipText,
                          { color: isSelected ? colors.accent.primary : colors.textPrimary },
                        ]}
                      >
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
                    onPress={handleGenerateVisual}
                    style={[styles.imgActionBtn, { borderColor: colors.border }]}
                  >
                    <RefreshCw size={16} color={colors.accent.primary} />
                    <Text style={[styles.imgActionText, { color: colors.accent.primary }]}>
                      Regenerate
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ── TAB 3: CAROUSEL STUDIO ── */}
        {activeTab === 'CAROUSEL' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Carousel Slide Brief Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Multi-slide narrative briefs with visual direction for each frame
              </Text>

              <Input
                label="Carousel Topic / Concept"
                placeholder="e.g. 5 Growth Frameworks for 2026"
                value={carouselTopic}
                onChangeText={setCarouselTopic}
              />

              <View style={styles.platformRow}>
                {['instagram', 'linkedin', 'facebook'].map((p) => {
                  const selected = carouselPlatform === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setCarouselPlatform(p)}
                      style={[
                        styles.platformBtn,
                        {
                          backgroundColor: selected ? colors.accent.primary : 'transparent',
                          borderColor: selected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.platformBtnText,
                          { color: selected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Button
                title={loadingCarousel ? 'Synthesizing Slides...' : 'Generate Carousel Brief'}
                onPress={handleGenerateCarousel}
                loading={loadingCarousel}
                icon={<LayoutGrid size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {carouselResult && (
              <GlassCard glow style={styles.resultCard}>
                {/* Cover */}
                <View style={styles.slideCardCover}>
                  <Badge label="Slide 1 - Cover" variant="accent" />
                  <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>
                    {carouselResult.coverSlide.headline}
                  </Text>
                  <Text style={[styles.slideBody, { color: colors.textSecondary }]}>
                    {carouselResult.coverSlide.subtext}
                  </Text>
                </View>

                {/* Slides List */}
                {carouselResult.slides.map((s: any) => (
                  <View key={s.num} style={styles.slideCard}>
                    <View style={styles.blockHeader}>
                      <Badge label={`Slide ${s.num}`} variant="neutral" />
                      <TouchableOpacity onPress={() => triggerCopy(`${s.title}\n${s.body}`, `slide_${s.num}`)}>
                        {copiedKey === `slide_${s.num}` ? (
                          <Check size={14} color="#10B981" />
                        ) : (
                          <Copy size={14} color={colors.textMuted} />
                        )}
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>{s.title}</Text>
                    <Text style={[styles.slideBody, { color: colors.textSecondary }]}>{s.body}</Text>
                    <Text style={[styles.slideCue, { color: colors.accent.primary }]}>{s.visualCue}</Text>
                  </View>
                ))}

                {/* CTA */}
                <View style={styles.slideCardCta}>
                  <Badge label="Final Slide - CTA" variant="success" />
                  <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>
                    {carouselResult.ctaSlide.headline}
                  </Text>
                  <Text style={[styles.slideBody, { color: colors.textSecondary }]}>
                    {carouselResult.ctaSlide.cta}
                  </Text>
                  <Text style={[styles.slideCue, { color: colors.textMuted }]}>
                    {carouselResult.ctaSlide.brandTag}
                  </Text>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ── TAB 4: REEL SCRIPTS STUDIO ── */}
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

              <View style={styles.chipsRow}>
                {['15', '30', '60', '90'].map((sec) => {
                  const selected = reelDuration === sec;
                  return (
                    <TouchableOpacity
                      key={sec}
                      onPress={() => setReelDuration(sec)}
                      style={[
                        styles.aspectChip,
                        {
                          backgroundColor: selected ? colors.accent.primary : 'transparent',
                          borderColor: selected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.aspectText,
                          { color: selected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {sec}s
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Button
                title={loadingReel ? 'Writing Timestamped Script...' : 'Generate Reel Script'}
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
                      <Text style={[styles.reelTime, { color: colors.textMuted }]}>
                        {sec.time}
                      </Text>
                    </View>
                    <Text style={[styles.reelScript, { color: colors.textPrimary }]}>
                      {sec.script}
                    </Text>
                    <Text style={[styles.reelDirection, { color: colors.accent.primary }]}>
                      Director: {sec.direction}
                    </Text>
                  </View>
                ))}

                <View style={styles.contentBlock}>
                  <Text style={[styles.blockTag, { color: colors.accent.primary }]}>
                    EDITING & PRODUCTION NOTES
                  </Text>
                  <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                    {reelResult.editingNotes}
                  </Text>
                </View>

                <View style={styles.contentBlock}>
                  <Text style={[styles.blockTag, { color: colors.accent.primary }]}>HASHTAGS</Text>
                  <Text style={[styles.hashtagsText, { color: colors.accent.secondary }]}>
                    {reelResult.hashtags.join(' ')}
                  </Text>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ── TAB 5: STORYBOARD STUDIO ── */}
        {activeTab === 'STORYBOARD' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Video Storyboard Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Frame-by-frame TV commercial and social ad shot lists
              </Text>

              <Input
                label="Ad / Commercial Concept"
                placeholder="Describe the campaign narrative..."
                value={storyboardTopic}
                onChangeText={setStoryboardTopic}
              />

              <Button
                title={loadingStoryboard ? 'Assembling Frames...' : 'Generate Storyboard'}
                onPress={handleGenerateStoryboard}
                loading={loadingStoryboard}
                icon={<BookOpen size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {storyboardResult && (
              <GlassCard glow style={styles.resultCard}>
                <Badge label="Shot List & Voiceover" variant="accent" />
                {storyboardResult.frames.map((f: any) => (
                  <View key={f.frame} style={styles.storyboardFrameCard}>
                    <View style={styles.frameTop}>
                      <Badge label={`Frame ${f.frame}`} variant="neutral" />
                      <Text style={[styles.reelTime, { color: colors.textMuted }]}>
                        {f.duration}
                      </Text>
                    </View>
                    <Text style={[styles.storyboardScene, { color: colors.textPrimary }]}>
                      {f.sceneDesc}
                    </Text>
                    <Text style={[styles.storyboardDir, { color: colors.textSecondary }]}>
                      Visual Direction: {f.visualDirection}
                    </Text>
                    <Text style={[styles.storyboardVo, { color: colors.accent.primary }]}>
                      Voiceover: "{f.voiceover}"
                    </Text>
                  </View>
                ))}
              </GlassCard>
            )}
          </View>
        )}

        {/* ── TAB 6: BRAND KIT STUDIO ── */}
        {activeTab === 'BRANDKIT' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Brand Visual Kit Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Complete identity system: color palettes, typography tokens, and voice rules
              </Text>

              <View style={styles.chipsRow}>
                {['Complete Brand Kit', 'Color Palette', 'Voice Guidelines', 'Logo Rules'].map((f) => {
                  const selected = brandKitFocus === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setBrandKitFocus(f)}
                      style={[
                        styles.aspectChip,
                        {
                          backgroundColor: selected ? colors.accent.primary : 'transparent',
                          borderColor: selected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.aspectText,
                          { color: selected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {f}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Button
                title={loadingBrandKit ? 'Synthesizing Brand Tokens...' : 'Generate Brand Kit'}
                onPress={handleGenerateBrandKit}
                loading={loadingBrandKit}
                icon={<Brush size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {brandKitResult && (
              <GlassCard glow style={styles.resultCard}>
                <Badge label={`${brandKitResult.brandName} Design Tokens`} variant="accent" />

                {/* Colors */}
                <View style={styles.contentBlock}>
                  <Text style={[styles.blockTag, { color: colors.accent.primary }]}>COLOR PALETTE</Text>
                  <View style={styles.colorPaletteGrid}>
                    {brandKitResult.colors.map((c: any, i: number) => (
                      <View key={i} style={styles.colorItem}>
                        <View style={[styles.colorSquare, { backgroundColor: c.hex }]} />
                        <Text style={[styles.colorName, { color: colors.textPrimary }]}>{c.name}</Text>
                        <Text style={[styles.colorHex, { color: colors.textMuted }]}>{c.hex}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Typography */}
                <View style={styles.contentBlock}>
                  <Text style={[styles.blockTag, { color: colors.accent.primary }]}>TYPOGRAPHY GUIDELINES</Text>
                  <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                    Display: {brandKitResult.typography.heading}
                  </Text>
                  <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                    Body: {brandKitResult.typography.body}
                  </Text>
                  <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                    Mono: {brandKitResult.typography.mono}
                  </Text>
                </View>

                {/* Voice & Tone */}
                <View style={styles.contentBlock}>
                  <Text style={[styles.blockTag, { color: colors.accent.primary }]}>VOICE & TONE</Text>
                  <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                    Key Tone Adjectives: {brandKitResult.voiceTone.adjectives.join(', ')}
                  </Text>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ── TAB 7: SEO BLOG ── */}
        {activeTab === 'BLOG' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Long-Form SEO Article Writer
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Rank for high-intent queries with authoritative structure
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
                <Text style={[styles.articleContent, { color: colors.textSecondary }]}>
                  {cleanText(blogDraft.content)}
                </Text>
              </GlassCard>
            )}
          </View>
        )}

        {/* ── TAB 8: EMAIL ── */}
        {activeTab === 'EMAIL' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Email Newsletter & Sales Copy
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                High-converting subject lines and nurture sequence copy
              </Text>

              <Input
                label="Campaign Purpose / Angle"
                placeholder="e.g. Special Product Announcement"
                value={emailSubject}
                onChangeText={setEmailSubject}
              />

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
                  <Text style={[styles.blockTag, { color: colors.accent.primary }]}>SUBJECT LINE</Text>
                  <Text style={[styles.hookText, { color: colors.textPrimary }]}>
                    {cleanText(emailDraft.subject)}
                  </Text>
                </View>

                <View style={styles.contentBlock}>
                  <Text style={[styles.blockTag, { color: colors.accent.primary }]}>EMAIL BODY</Text>
                  <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                    {cleanText(emailDraft.body)}
                  </Text>
                </View>
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
  tabsBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tabsScroll: {
    paddingHorizontal: 16,
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
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  sectionContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 2,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  costText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    color: '#F59E0B',
  },
  platformRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  platformBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  platformBtnText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  inputLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    marginVertical: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  aspectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  aspectText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  styleScroll: {
    marginBottom: 10,
  },
  styleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  styleChipText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  actionBtn: {
    marginTop: 10,
  },
  resultCard: {
    padding: 16,
    gap: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
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
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    letterSpacing: 0.5,
  },
  hookText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  bodyText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.body,
  },
  hashtagsText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  imageResultCard: {
    padding: 12,
    borderRadius: 22,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
  },
  previewImage: {
    width: '100%',
    borderRadius: 16,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    width: '100%',
  },
  imgActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  imgActionText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  articleTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    flex: 1,
  },
  articleContent: {
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
  },
  slideCardCover: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    gap: 6,
  },
  slideCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.15)',
    gap: 6,
  },
  slideCardCta: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    gap: 6,
  },
  slideTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  slideBody: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  slideCue: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  reelSectionCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.15)',
    gap: 6,
  },
  reelSectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reelTime: {
    fontSize: 10,
    fontWeight: '700',
  },
  reelScript: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  reelDirection: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  storyboardFrameCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.15)',
    gap: 6,
  },
  frameTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyboardScene: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
  },
  storyboardDir: {
    fontSize: FONT_SIZES.caption,
    fontStyle: 'italic',
  },
  storyboardVo: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
  },
  colorPaletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  colorItem: {
    alignItems: 'center',
    gap: 2,
    minWidth: 70,
  },
  colorSquare: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  colorName: {
    fontSize: 10,
    fontWeight: '700',
  },
  colorHex: {
    fontSize: 9,
  },
});
