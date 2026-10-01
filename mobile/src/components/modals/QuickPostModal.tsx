import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Zap, Copy, Check, Calendar } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { contentApi } from '../../api/contentApi';
import { calendarApi } from '../../api/calendarApi';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { SOCIAL_PLATFORMS } from '../../config/constants';
import { cleanText } from '../../utils/formatters';

export const QuickPostModal: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { isQuickPostOpen, setIsQuickPostOpen, activeWorkspace } = useWorkspace();

  const [platform, setPlatform] = useState<string>('linkedin');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  if (!isQuickPostOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setCopied(false);
    setScheduled(false);

    try {
      const res = await contentApi.generateSocialPost({
        topic: topic.trim(),
        platform,
        brandName: activeWorkspace?.brandName,
        industry: activeWorkspace?.industryCategory,
        brandVoiceTone: activeWorkspace?.brandVoiceTone,
      });

      if (res.success && (res.result || res.post)) {
        setResult(res.result || res.post);
      }
    } catch (err: any) {
      console.warn('Quick post generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const textToCopy = [
      result.hook,
      result.shortCaption || result.caption,
      (result.hashtags || []).map((h: string) => (h.startsWith('#') ? h : `#${h}`)).join(' '),
    ]
      .filter(Boolean)
      .join('\n\n');

    await Clipboard.setStringAsync(textToCopy);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSchedule = async () => {
    if (!result) return;
    try {
      await calendarApi.create({
        title: result.hook || topic,
        platform,
        date: new Date().toISOString().split('T')[0],
        status: 'SCHEDULED',
        content: result.shortCaption || result.caption,
      });
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setScheduled(true);
      setTimeout(() => setScheduled(false), 2000);
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
        style={styles.backdrop}
        onPress={() => setIsQuickPostOpen(false)}
      >
        <Pressable
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? colors.cardBackground : '#FFFFFF', borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.zapIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Zap size={18} color="#F59E0B" fill="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Quick Post Generator
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Anchored to {activeWorkspace?.brandName || 'Brand DNA'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsQuickPostOpen(false)}
              style={styles.closeBtn}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Platform Selector */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Target Platform
            </Text>
            <View style={styles.platformRow}>
              {SOCIAL_PLATFORMS.map((p) => {
                const isSelected = platform === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setPlatform(p.id)}
                    style={[
                      styles.platformChip,
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
                    <Text
                      style={[
                        styles.platformText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Topic Input */}
            <Input
              label="Post Topic or Angle"
              placeholder="e.g. 3 reasons to upgrade marketing automation"
              value={topic}
              onChangeText={setTopic}
            />

            <Button
              title={isLoading ? 'Generating High-Impact Copy...' : 'Generate Post'}
              onPress={handleGenerate}
              loading={isLoading}
              disabled={isLoading || !topic.trim()}
              icon={<Zap size={16} color="#FFFFFF" fill="#FFFFFF" />}
              style={styles.genBtn}
            />

            {/* Generated Output */}
            {result && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Hook */}
                {result.hook && (
                  <View style={styles.resultBlock}>
                    <Text style={[styles.blockLabel, { color: colors.accent.primary }]}>
                      HOOK
                    </Text>
                    <Text style={[styles.hookText, { color: colors.textPrimary }]}>
                      {cleanText(result.hook)}
                    </Text>
                  </View>
                )}

                {/* Caption */}
                {(result.shortCaption || result.caption) && (
                  <View style={styles.resultBlock}>
                    <Text style={[styles.blockLabel, { color: colors.accent.primary }]}>
                      CAPTION
                    </Text>
                    <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                      {cleanText(result.shortCaption || result.caption)}
                    </Text>
                  </View>
                )}

                {/* Hashtags */}
                {result.hashtags && result.hashtags.length > 0 && (
                  <View style={styles.resultBlock}>
                    <Text style={[styles.blockLabel, { color: colors.accent.primary }]}>
                      HASHTAGS
                    </Text>
                    <Text style={[styles.hashtagText, { color: colors.accent.secondary }]}>
                      {result.hashtags
                        .map((h: string) => (h.startsWith('#') ? h : `#${h}`))
                        .join(' ')}
                    </Text>
                  </View>
                )}

                {/* Action buttons */}
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    onPress={handleCopy}
                    style={[styles.actionBtn, { borderColor: colors.border }]}
                  >
                    {copied ? (
                      <Check size={16} color="#10B981" />
                    ) : (
                      <Copy size={16} color={colors.textPrimary} />
                    )}
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: copied ? '#10B981' : colors.textPrimary },
                      ]}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSchedule}
                    style={[styles.actionBtn, { borderColor: colors.border }]}
                  >
                    {scheduled ? (
                      <Check size={16} color="#10B981" />
                    ) : (
                      <Calendar size={16} color={colors.accent.primary} />
                    )}
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: scheduled ? '#10B981' : colors.accent.primary },
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '85%',
    paddingBottom: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  zapIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  platformChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '700',
  },
  genBtn: {
    marginVertical: 10,
  },
  resultCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
    gap: 12,
  },
  resultBlock: {
    gap: 4,
  },
  blockLabel: {
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
    lineHeight: 19,
  },
  hashtagText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
