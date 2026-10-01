import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Dna, ShieldCheck, ShieldAlert, Sparkles, Globe, Sliders } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { getBrandLogoUrl } from '../../utils/brandLogoHelper';

export const BrandDnaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace, setIsScraperOpen } = useWorkspace();

  const logoUrl = getBrandLogoUrl({
    brandName: activeWorkspace?.brandName,
    domainUrl: activeWorkspace?.domainUrl,
    logoUrl: activeWorkspace?.logoUrl,
    faviconUrl: activeWorkspace?.faviconUrl,
  });

  const formalityScore = activeWorkspace?.brandVoiceTone?.formalityScore || 4;
  const toneKeywords = activeWorkspace?.brandVoiceTone?.toneKeywords || [
    'Professional',
    'Innovative',
    'Reliable',
  ];
  const contentPillars = activeWorkspace?.contentPillars || [
    'AI Marketing Innovations',
    'Brand Governance',
    'Creative Velocity',
  ];
  const approvedClaims = activeWorkspace?.approvedClaims || [
    '10x Content Velocity',
    'Multi-Model AI Orchestration',
    'Immutable Brand DNA Memory',
  ];
  const restrictedClaims = activeWorkspace?.restrictedClaims || [
    '100% Guaranteed Sales',
    'Zero Human Oversight',
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={() => navigation.goBack()} title="Brand DNA Memory" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Card */}
        <GlassCard style={styles.brandHeroCard} glow>
          <View style={styles.brandHeroRow}>
            <View style={[styles.logoBox, { backgroundColor: '#FFFFFF' }]}>
              <Image source={{ uri: logoUrl }} style={styles.logoImg} resizeMode="contain" />
            </View>

            <View style={styles.brandHeroInfo}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                {activeWorkspace?.brandName || 'Brand DNA'}
              </Text>
              <Text style={[styles.brandDomain, { color: colors.accent.primary }]}>
                {activeWorkspace?.domainUrl || 'https://brand.com'}
              </Text>
              <Badge label={activeWorkspace?.industryCategory || 'General'} variant="accent" />
            </View>
          </View>

          {activeWorkspace?.tagline && (
            <Text style={[styles.taglineText, { color: colors.textSecondary }]}>
              "{activeWorkspace.tagline}"
            </Text>
          )}

          <Button
            title="Auto Scrape & Update Brand DNA"
            onPress={() => setIsScraperOpen(true)}
            icon={<Sparkles size={16} color="#FFFFFF" />}
            style={styles.scrapeBtn}
          />
        </GlassCard>

        {/* Voice & Tone Section */}
        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Sliders size={16} color={colors.accent.primary} />
            <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
              Voice & Tone Guidelines
            </Text>
          </View>

          <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
              Formality Score: {formalityScore}/5 (Formal & Authoritative)
            </Text>
            {/* Visual 5-step pip bar */}
            <View style={styles.pipBar}>
              {[1, 2, 3, 4, 5].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.pip,
                    {
                      backgroundColor:
                        step <= formalityScore
                          ? colors.accent.primary
                          : isDark
                          ? 'rgba(255,255,255,0.1)'
                          : '#E2E8F0',
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <Text style={[styles.chipsLabel, { color: colors.textMuted }]}>
            TONE KEYWORDS
          </Text>
          <View style={styles.chipsRow}>
            {toneKeywords.map((kw, i) => (
              <Badge key={i} label={kw} variant="accent" />
            ))}
          </View>
        </GlassCard>

        {/* Content Pillars */}
        <GlassCard style={styles.card}>
          <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
            Content Pillars
          </Text>
          <View style={styles.pillarsList}>
            {contentPillars.map((p, idx) => (
              <View key={idx} style={styles.pillarItem}>
                <View style={[styles.pillarDot, { backgroundColor: colors.accent.primary }]} />
                <Text style={[styles.pillarText, { color: colors.textPrimary }]}>
                  {p}
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Approved Claims */}
        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={16} color="#10B981" />
            <Text style={[styles.cardHeading, { color: '#10B981' }]}>
              Approved Claims
            </Text>
          </View>
          <View style={styles.claimsList}>
            {approvedClaims.map((claim, idx) => (
              <Text key={idx} style={[styles.claimText, { color: colors.textPrimary }]}>
                ✓ {claim}
              </Text>
            ))}
          </View>
        </GlassCard>

        {/* Restricted Claims */}
        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <ShieldAlert size={16} color="#EF4444" />
            <Text style={[styles.cardHeading, { color: '#EF4444' }]}>
              Restricted & Banned Claims
            </Text>
          </View>
          <View style={styles.claimsList}>
            {restrictedClaims.map((claim, idx) => (
              <Text key={idx} style={[styles.claimText, { color: '#EF4444' }]}>
                ✗ {claim}
              </Text>
            ))}
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 12,
  },
  brandHeroCard: {
    padding: 16,
    gap: 12,
  },
  brandHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: {
    width: 44,
    height: 44,
  },
  brandHeroInfo: {
    flex: 1,
    gap: 3,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  brandDomain: {
    fontSize: 12,
    fontWeight: '600',
  },
  taglineText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  scrapeBtn: {
    marginTop: 4,
  },
  card: {
    padding: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '800',
  },
  sliderRow: {
    gap: 6,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  pipBar: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  pip: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  chipsLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillarsList: {
    gap: 8,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  claimsList: {
    gap: 6,
  },
  claimText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
