import React, { useState } from 'react';
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
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { cleanText } from '../../utils/formatters';
import {
  SOCIAL_PLATFORMS,
  VISUAL_ASPECT_RATIOS,
  VISUAL_STYLES,
} from '../../config/constants';

type StudioTab = 'SOCIAL' | 'CREATIVE' | 'BLOG' | 'EMAIL';

export const StudioHomeScreen: React.FC<{ route?: any }> = ({ route }) => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace, credits, deductCredits } = useWorkspace();

  const initialTab: StudioTab = route?.params?.tab || 'SOCIAL';
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);

  // Social State
  const [socialPlatform, setSocialPlatform] = useState<string>('instagram');
  const [socialTopic, setSocialTopic] = useState('Sustainable product design that drives consumer loyalty');
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [socialResult, setSocialResult] = useState<any | null>(null);

  // Creative Visual State
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [visualStyle, setVisualStyle] = useState<string>('Photorealistic Commercial');
  const [visualPrompt, setVisualPrompt] = useState('Luxury commercial studio shot with dynamic lighting');
  const [loadingVisual, setLoadingVisual] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

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
        message: `Generated with AI Ads™ Platform: ${generatedImage}`,
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
            { id: 'BLOG', label: 'SEO Blog', icon: FileText },
            { id: 'EMAIL', label: 'Email & Ads', icon: Mail },
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
                    Powered by Imagen 3 & Gemini 3.1 Flash Image
                  </Text>
                </View>

                {/* Credit Cost Badge */}
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

        {/* ── TAB 3: SEO BLOG ── */}
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

        {/* ── TAB 4: EMAIL ── */}
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
    fontSize: 12,
    fontWeight: '800',
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '500',
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
    fontSize: 11,
    fontWeight: '800',
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
    fontSize: 11,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 11,
    fontWeight: '700',
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
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtn: {
    marginTop: 10,
  },
  resultCard: {
    padding: 16,
    gap: 14,
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hookText: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  bodyText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  hashtagsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imageResultCard: {
    padding: 12,
    borderRadius: 22,
    alignItems: 'center',
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
    fontSize: 12,
    fontWeight: '700',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  articleContent: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 22,
    marginTop: 6,
  },
});
