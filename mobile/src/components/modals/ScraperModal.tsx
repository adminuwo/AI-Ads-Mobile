import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Sparkles, Globe, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { workspaceApi } from '../../api/workspaceApi';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const ScraperModal: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { isScraperOpen, setIsScraperOpen, addWorkspace } = useWorkspace();

  const [url, setUrl] = useState('');
  const [brandName, setBrandName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isScraperOpen) return null;

  const handleStartScrape = async () => {
    if (!url.trim()) {
      setError('Please provide a valid website URL');
      return;
    }

    setError(null);
    setIsLoading(true);
    setCurrentStep('1. Scraping website DOM & content...');

    try {
      setTimeout(() => {
        setCurrentStep('2. Multi-agent Brand DNA extraction & tone scoring...');
      }, 3000);

      const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
      const response = await workspaceApi.analyzeBrand({
        websiteUrl: cleanUrl,
        brandName: brandName.trim() || undefined,
      });

      if (response.success) {
        setCurrentStep('3. Storing Brand DNA memory profile...');
        const profile = response.profile || response.workspace || {};

        const newWorkspaceData = {
          brandName: profile.brandName || brandName.trim() || cleanUrl.replace(/https?:\/\/(www\.)?/, '').split('.')[0],
          domainUrl: cleanUrl,
          logoUrl: profile.logoUrl || '',
          brandColors: profile.brandColors || ['#7B61FF', '#6366F1'],
          industryCategory: profile.industryCategory || 'General',
          missionStatement: profile.missionStatement || '',
          tagline: profile.tagline || '',
          brandVoiceTone: profile.brandVoiceTone || {
            formalityScore: 4,
            toneKeywords: ['Professional', 'Innovative', 'Customer-Centric'],
          },
          contentPillars: profile.contentPillars || ['Innovation', 'Product Quality', 'Customer Experience'],
          approvedClaims: profile.approvedClaims || ['High Quality', 'Verified Value'],
          restrictedClaims: profile.restrictedClaims || ['100% Guaranteed', 'Unrealistic Claims'],
        };

        await addWorkspace(newWorkspaceData);
        setIsLoading(false);
        setIsScraperOpen(false);
        setUrl('');
        setBrandName('');
      } else {
        throw new Error(response.error || 'Failed to extract Brand DNA');
      }
    } catch (err: any) {
      setError(err.message || 'Scraping timed out or encountered an error.');
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isScraperOpen}
      transparent
      animationType="slide"
      onRequestClose={() => !isLoading && setIsScraperOpen(false)}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => !isLoading && setIsScraperOpen(false)}
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
              <View style={[styles.sparkleIcon, { backgroundColor: colors.accent.tagBg }]}>
                <Sparkles size={16} color={colors.accent.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Auto Scrape Brand DNA
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Extract voice, pillars, and guidelines from any URL
                </Text>
              </View>
            </View>

            {!isLoading && (
              <TouchableOpacity
                onPress={() => setIsScraperOpen(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {error && (
              <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)' }]}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Website or Landing Page URL"
              placeholder="e.g. bata.com, nike.com, or yoursite.in"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
              leftIcon={<Globe size={18} color={colors.accent.primary} />}
              editable={!isLoading}
            />

            <Input
              label="Brand Name (Optional)"
              placeholder="e.g. Bata India, Nike"
              value={brandName}
              onChangeText={setBrandName}
              editable={!isLoading}
            />

            {isLoading && (
              <View style={[styles.loadingBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border }]}>
                <ActivityIndicator color={colors.accent.primary} size="large" />
                <Text style={[styles.loadingStepText, { color: colors.accent.primary }]}>
                  {currentStep}
                </Text>
                <Text style={[styles.loadingSubtext, { color: colors.textMuted }]}>
                  Multi-agent Vertex AI extraction in progress (~15-30s)...
                </Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <Button
                title={isLoading ? 'Analyzing Brand...' : 'Analyze & Extract Brand DNA'}
                onPress={handleStartScrape}
                loading={isLoading}
                disabled={isLoading || !url.trim()}
                icon={<Sparkles size={16} color="#FFFFFF" />}
              />
            </View>
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
  sparkleIcon: {
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  loadingBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 14,
  },
  loadingStepText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  actionButtons: {
    marginTop: 16,
    marginBottom: 20,
  },
});
