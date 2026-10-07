import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Share,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Send,
  Eye,
  Calendar,
  ArrowLeft,
  Share2,
  ChevronDown,
  Wand2,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { contentApi } from '../../api/contentApi';
import { calendarApi } from '../../api/calendarApi';
import { cleanText } from '../../utils/formatters';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface GeneratedPostOutput {
  platform: string;
  hook?: string;
  caption?: string;
  shortCaption?: string;
  longCaption?: string;
  hashtags?: string[];
  cta?: string;
  imageUrl?: string;
  imagePrompt?: string;
  topic?: string;
}

const VOICE_TONES = [
  'Authoritative & Professional',
  'Conversational & Friendly',
  'Thought Leadership / Founder Voice',
  'Educational & Direct',
];

const PLATFORMS = ['LinkedIn', 'X/Twitter', 'Instagram', 'Facebook'];

export const QuickPostModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const {
    isQuickPostOpen,
    setIsQuickPostOpen,
    activeWorkspace,
    setStudioTarget,
  } = useWorkspace();

  const [platform, setPlatform] = useState<string>('LinkedIn');
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<string>('Authoritative & Professional');
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<GeneratedPostOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageLinkCopied, setImageLinkCopied] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleTopicFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 70, animated: true });
    }, 120);
  };

  if (!isQuickPostOpen) return null;

  const brandName = activeWorkspace?.brandName || 'Brand';

  const handleOpenInStudio = () => {
    const platformLower = (platform || 'LinkedIn').toLowerCase();
    const socialMap: Record<string, string> = {
      'x/twitter': 'twitter',
      twitter: 'twitter',
      linkedin: 'linkedin',
      instagram: 'instagram',
      facebook: 'facebook',
    };
    const matchedPlatform = socialMap[platformLower] || platformLower;

    if (setStudioTarget) {
      setStudioTarget({
        platform: matchedPlatform,
        topic: topic || 'Quick Social Post',
        tone: tone,
        postType: 'educational',
        output: output,
        imageUrl: output?.imageUrl,
        imagePrompt: output?.imagePrompt,
        autoGenerate: !output,
        hook: output?.hook,
        caption: output?.caption || output?.shortCaption,
        hashtags: output?.hashtags,
        cta: output?.cta,
      });
    }

    setIsQuickPostOpen(false);

    try {
      navigation.navigate('Main', { screen: 'Studio' });
    } catch {
      try {
        navigation.navigate('Studio');
      } catch {}
    }
  };

  const handleGenerate = async () => {
    if (loading || !topic.trim()) return;
    setLoading(true);
    setCopied(false);
    setScheduled(false);

    try {
      const res = await contentApi.generateSocialPost({
        topic: topic.trim(),
        platform: platform.toLowerCase(),
        tone,
        brandName: activeWorkspace?.brandName,
        workspaceId: activeWorkspace?.id,
        industry: activeWorkspace?.industryCategory,
        brandVoiceTone: activeWorkspace?.brandVoiceTone,
      });

      if (res && res.success && (res.data || res.result || res.post)) {
        const postData = res.data || res.result || res.post;
        setOutput({
          platform,
          topic: topic.trim(),
          hook: postData.hook,
          caption: postData.caption || postData.shortCaption,
          shortCaption: postData.shortCaption,
          longCaption: postData.longCaption,
          hashtags: Array.isArray(postData.hashtags) ? postData.hashtags : [],
          cta: postData.cta,
          imageUrl: postData.imageUrl,
          imagePrompt: postData.imagePrompt,
        });
      } else {
        throw new Error(res?.error || 'Generation returned empty data');
      }
    } catch (e) {
      // Offline fallback aligned to active brand DNA
      const safeBrand = (activeWorkspace?.brandName || 'Brand').trim();
      setOutput({
        platform,
        topic: topic.trim(),
        hook: `How ${safeBrand} scaled content operations without losing brand voice.`,
        caption: `Managing multi-channel marketing required 10 separate tools—until now.\n\nUnified Brand DNA + instant repurposing solves production bottlenecks.`,
        shortCaption: `Managing multi-channel marketing required 10 separate tools—until now. Unified Brand DNA + instant repurposing solves production bottlenecks.`,
        hashtags: [`#${safeBrand.replace(/\s+/g, '')}`, '#ContentStrategy', '#MarketingOps'],
        cta: 'Book your strategy demo at link in bio!',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    const text = [
      output.hook,
      output.caption || output.shortCaption,
      (output.hashtags || []).map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '),
      output.cta,
    ]
      .filter(Boolean)
      .join('\n\n');

    await Clipboard.setStringAsync(text);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePushToCalendar = async () => {
    if (!output) return;
    try {
      const platformLower = (platform || 'LinkedIn').toLowerCase();
      const socialMap: Record<string, string> = {
        'x/twitter': 'twitter',
        twitter: 'twitter',
        linkedin: 'linkedin',
        instagram: 'instagram',
        facebook: 'facebook',
      };
      const matchedPlatform = socialMap[platformLower] || platformLower;

      await calendarApi.create({
        title: output.hook || topic,
        platform: matchedPlatform,
        date: new Date().toISOString().split('T')[0],
        status: 'SCHEDULED',
        content: output.caption || output.shortCaption,
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setScheduled(true);
      setTimeout(() => setScheduled(false), 2500);
    } catch {}
  };

  const handleCopyImageLink = async () => {
    if (!output?.imageUrl) return;
    await Clipboard.setStringAsync(output.imageUrl);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setImageLinkCopied(true);
    setTimeout(() => setImageLinkCopied(false), 2000);
  };

  const handleShareVisual = async () => {
    if (!output?.imageUrl) return;
    try {
      await Share.share({
        title: output.topic || output.hook || 'AI Generated Visual',
        url: output.imageUrl,
        message: `Visual preview for ${brandName}: ${output.imageUrl}`,
      });
    } catch {}
  };

  return (
    <Modal
      visible={isQuickPostOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsQuickPostOpen(false)}
    >
      <Pressable
        style={[
          styles.backdrop,
          keyboardHeight > 0 && { paddingBottom: keyboardHeight },
        ]}
        onPress={() => {
          Keyboard.dismiss();
          setIsQuickPostOpen(false);
        }}
      >
        <Pressable
          style={[
            styles.modalSheet,
            {
              backgroundColor: isDark ? colors.cardBackground : '#FFFFFF',
              borderColor: colors.border,
              paddingBottom: keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 20),
              maxHeight: keyboardHeight > 0
                ? Dimensions.get('window').height - keyboardHeight - Math.max(insets.top, 24) - 10
                : '90%',
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header with Matching Form Icon */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#2563EB', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerIconBox}
              >
                <Wand2 size={20} color="#FFFFFF" strokeWidth={2.2} />
              </LinearGradient>

              <View style={styles.headerTitles}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Create a Social Post
                </Text>
                <Text style={[styles.subtitle, { color: colors.accent.primary }]}>
                  Turn your ideas into on-brand content with AI.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsQuickPostOpen(false)}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Options Form */}
            <View style={styles.formContainer}>
              {/* Target Platform */}
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                  Target Platform
                </Text>
                <View style={styles.platformRow}>
                  {PLATFORMS.map((p) => {
                    const isSelected = platform === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        activeOpacity={0.8}
                        onPress={() => setPlatform(p)}
                        style={[
                          styles.platformChip,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? 'rgba(99, 102, 241, 0.22)'
                                : 'rgba(99, 102, 241, 0.12)'
                              : isDark
                              ? 'rgba(255,255,255,0.04)'
                              : '#F8FAFC',
                            borderColor: isSelected
                              ? colors.accent.primary
                              : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.platformChipText,
                            {
                              color: isSelected
                                ? colors.accent.primary
                                : colors.textPrimary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Post Topic / Focus */}
              <View style={styles.formField}>
                <Input
                  label="Post Topic / Focus"
                  placeholder="e.g. 5 Reasons to Automate SEO Topic Clustering in 2026"
                  value={topic}
                  onChangeText={setTopic}
                  onFocus={handleTopicFocus}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Voice Tone Selector */}
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                  Voice Tone
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
                  style={[
                    styles.toneSelectorTrigger,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                      borderColor: isToneDropdownOpen ? colors.accent.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.toneSelectorValue, { color: colors.textPrimary }]}>
                    {tone}
                  </Text>
                  <ChevronDown
                    size={16}
                    color={colors.textSecondary}
                    style={{
                      transform: [{ rotate: isToneDropdownOpen ? '180deg' : '0deg' }],
                    }}
                  />
                </TouchableOpacity>

                {/* Tone Options Accordion */}
                {isToneDropdownOpen && (
                  <View
                    style={[
                      styles.toneOptionsList,
                      {
                        backgroundColor: isDark ? colors.cardSecondary : '#FFFFFF',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {VOICE_TONES.map((t) => {
                      const isSelected = tone === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          onPress={() => {
                            setTone(t);
                            setIsToneDropdownOpen(false);
                          }}
                          style={[
                            styles.toneOptionItem,
                            isSelected && {
                              backgroundColor: isDark
                                ? 'rgba(99, 102, 241, 0.15)'
                                : 'rgba(99, 102, 241, 0.08)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.toneOptionText,
                              {
                                color: isSelected
                                  ? colors.accent.primary
                                  : colors.textPrimary,
                                fontWeight: isSelected ? '700' : '400',
                              },
                            ]}
                          >
                            {t}
                          </Text>
                          {isSelected && <Check size={14} color={colors.accent.primary} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Generate Button */}
              <Button
                title={loading ? 'Synthesizing Social Post...' : 'Generate Quick Post'}
                onPress={handleGenerate}
                loading={loading}
                disabled={loading || !topic.trim()}
                icon={<Sparkles size={16} color="#FFFFFF" />}
                style={styles.generateBtn}
              />
            </View>

            {/* Output Preview */}
            {output && (
              <View
                style={[
                  styles.outputCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Output Card Header */}
                <View style={styles.outputHeader}>
                  <View style={styles.platformBadge}>
                    <Text style={[styles.platformBadgeText, { color: colors.textSecondary }]}>
                      {output.platform} Draft Preview
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={copyToClipboard}
                    style={styles.copyActionBtn}
                    activeOpacity={0.7}
                  >
                    {copied ? (
                      <Check size={14} color="#10B981" />
                    ) : (
                      <Copy size={14} color={colors.accent.primary} />
                    )}
                    <Text
                      style={[
                        styles.copyActionText,
                        { color: copied ? '#10B981' : colors.accent.primary },
                      ]}
                    >
                      {copied ? 'Copied!' : 'Copy Post'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* AI Generated Visual Card (if available) */}
                {output.imageUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setShowFullImage(true)}
                    style={[
                      styles.visualPreviewContainer,
                      { borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border },
                    ]}
                  >
                    <Image
                      source={{ uri: output.imageUrl }}
                      style={styles.visualImage}
                      resizeMode="cover"
                    />

                    {/* Overlay Ribbon */}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.85)']}
                      style={styles.visualGradient}
                    >
                      <View style={styles.visualMetaRow}>
                        <Text style={styles.visualMetaText} numberOfLines={1}>
                          AI Generated Visual (Gemini 3.1 Flash Image)
                        </Text>
                        <View style={styles.visualExpandBtn}>
                          <Eye size={12} color="#34D399" />
                          <Text style={styles.visualExpandText}>Tap to Expand</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : null}

                {/* Hook */}
                {output.hook ? (
                  <View style={styles.outputBlock}>
                    <Text style={[styles.blockTag, { color: colors.accent.primary }]}>
                      HOOK
                    </Text>
                    <Text style={[styles.hookText, { color: colors.accent.primary }]}>
                      {cleanText(output.hook)}
                    </Text>
                  </View>
                ) : null}

                {/* Caption */}
                {output.caption || output.shortCaption ? (
                  <View style={styles.outputBlock}>
                    <Text style={[styles.blockTag, { color: colors.accent.primary }]}>
                      CAPTION
                    </Text>
                    <Text style={[styles.captionText, { color: colors.textPrimary }]}>
                      {cleanText(output.caption || output.shortCaption || '')}
                    </Text>
                  </View>
                ) : null}

                {/* Hashtags */}
                {output.hashtags && output.hashtags.length > 0 ? (
                  <View style={styles.outputBlock}>
                    <Text style={[styles.blockTag, { color: colors.accent.primary }]}>
                      HASHTAGS
                    </Text>
                    <Text style={[styles.hashtagsText, { color: colors.accent.secondary }]}>
                      {output.hashtags
                        .map((h) => (h.startsWith('#') ? h : `#${h}`))
                        .join(' ')}
                    </Text>
                  </View>
                ) : null}

                {/* Call To Action */}
                {output.cta ? (
                  <View style={styles.outputBlock}>
                    <Text style={[styles.blockTag, { color: colors.accent.primary }]}>
                      CALL TO ACTION
                    </Text>
                    <Text style={[styles.ctaText, { color: colors.textPrimary }]}>
                      {cleanText(output.cta)}
                    </Text>
                  </View>
                ) : null}

                {/* Action Buttons: Open in Studio & Push to Calendar */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    onPress={handleOpenInStudio}
                    activeOpacity={0.85}
                    style={[
                      styles.openStudioBtn,
                      {
                        backgroundColor: isDark
                          ? 'rgba(99, 102, 241, 0.18)'
                          : 'rgba(99, 102, 241, 0.1)',
                        borderColor: colors.accent.primary,
                      },
                    ]}
                  >
                    <Send size={15} color={colors.accent.primary} />
                    <Text
                      style={[
                        styles.openStudioBtnText,
                        { color: colors.accent.primary },
                      ]}
                    >
                      Open in Full Content Studio
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handlePushToCalendar}
                    activeOpacity={0.85}
                    style={[
                      styles.calendarBtn,
                      {
                        backgroundColor: scheduled
                          ? isDark
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(16, 185, 129, 0.1)'
                          : isDark
                          ? 'rgba(255,255,255,0.05)'
                          : '#FFFFFF',
                        borderColor: scheduled ? '#10B981' : colors.border,
                      },
                    ]}
                  >
                    {scheduled ? (
                      <Check size={15} color="#10B981" />
                    ) : (
                      <Calendar size={15} color={colors.textSecondary} />
                    )}
                    <Text
                      style={[
                        styles.calendarBtnText,
                        { color: scheduled ? '#10B981' : colors.textPrimary },
                      ]}
                    >
                      {scheduled ? 'Scheduled!' : 'Push to Calendar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>

      {/* Full Resolution Image Preview Modal */}
      {showFullImage && output?.imageUrl ? (
        <Modal
          visible={showFullImage}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFullImage(false)}
        >
          <View style={styles.fullImageBackdrop}>
            {/* Top Bar */}
            <View
              style={[
                styles.fullImageHeader,
                { paddingTop: Math.max(insets.top, 20) },
              ]}
            >
              <TouchableOpacity
                onPress={() => setShowFullImage(false)}
                style={styles.fullImageNavBtn}
              >
                <ArrowLeft size={18} color="#FFFFFF" />
                <Text style={styles.fullImageNavText}>Back</Text>
              </TouchableOpacity>

              <View style={styles.fullImageTitleContainer}>
                <Text style={styles.fullImageTitle} numberOfLines={1}>
                  {output.topic || output.hook || 'AI Generated Visual'}
                </Text>
                <Text style={styles.fullImageSubtitle}>
                  Full Resolution Preview
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowFullImage(false)}
                style={styles.fullImageCloseBtn}
              >
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Center Image */}
            <View style={styles.fullImageCenter}>
              <Image
                source={{ uri: output.imageUrl }}
                style={styles.fullImageDisplay}
                resizeMode="contain"
              />
            </View>

            {/* Bottom Actions Bar */}
            <View
              style={[
                styles.fullImageBottomBar,
                { paddingBottom: Math.max(insets.bottom, 25) },
              ]}
            >
              <TouchableOpacity
                onPress={handleCopyImageLink}
                style={styles.fullImageActionBtn}
              >
                {imageLinkCopied ? (
                  <Check size={16} color="#34D399" />
                ) : (
                  <Copy size={16} color="#FFFFFF" />
                )}
                <Text style={styles.fullImageActionText}>
                  {imageLinkCopied ? 'Link Copied!' : 'Copy Image Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShareVisual}
                style={[styles.fullImageActionBtn, styles.fullImageShareBtn]}
              >
                <Share2 size={16} color="#FFFFFF" />
                <Text style={styles.fullImageActionText}>Share Visual</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    maxHeight: '90%',
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  formContainer: {
    gap: 14,
  },
  formField: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  platformChip: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformChipText: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  toneSelectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  toneSelectorValue: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  toneOptionsList: {
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 6,
    overflow: 'hidden',
  },
  toneOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  toneOptionText: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  generateBtn: {
    marginTop: 4,
    marginBottom: 6,
  },
  outputCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginTop: 12,
    marginBottom: 24,
    gap: 14,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  platformBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  platformBadgeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  copyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  copyActionText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  visualPreviewContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  visualImage: {
    width: '100%',
    height: '100%',
  },
  visualGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  visualMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  visualMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
    flex: 1,
  },
  visualExpandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  visualExpandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
  },
  outputBlock: {
    gap: 4,
  },
  blockTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    lineHeight: 14,
  },
  hookText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  captionText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.body + 4,
  },
  hashtagsText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption + 4,
  },
  ctaText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
  },
  actionButtonsRow: {
    gap: 10,
    paddingTop: 8,
  },
  openStudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  openStudioBtnText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  calendarBtnText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  // Full Image Modal
  fullImageBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'space-between',
  },
  fullImageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    zIndex: 10,
  },
  fullImageNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  fullImageNavText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullImageTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  fullImageTitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullImageSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fullImageCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImageCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  fullImageDisplay: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  fullImageBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  fullImageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  fullImageShareBtn: {
    backgroundColor: '#6366F1',
  },
  fullImageActionText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
