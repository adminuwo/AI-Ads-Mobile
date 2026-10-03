import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Layers,
  PenTool,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Crown,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

const FEATURES_DATA = [
  {
    title: 'Autonomous AI Website Builder',
    tag: 'Web Synthesis',
    description: 'Transform raw brand prompts into multi-page standalone React applications with preloaded image assets and live Vite sandbox preview.',
    icon: Globe,
    color: '#0284C7',
  },
  {
    title: 'Creative Studio & 8K Visuals',
    tag: 'Vertex AI Imagen 3',
    description: 'Synthesize photorealistic product visuals, Instagram carousels, timestamped Reel scripts, and TVC video storyboards with brand logo compositing.',
    icon: Sparkles,
    color: '#8B5CF6',
  },
  {
    title: 'Brand DNA Context Memory',
    tag: 'Multi-Tenant Voice',
    description: 'Anchor every generated post, email, and campaign to your exact voice tone, approved claims, and positioning guidelines.',
    icon: Target,
    color: '#F59E0B',
  },
  {
    title: 'SEO Intelligence & Long-Form Articles',
    tag: 'Organic Velocity',
    description: 'Automate search intent clustering, competitor SERP analysis, and authoritative 2,000-word articles structured for search dominance.',
    icon: TrendingUp,
    color: '#10B981',
  },
  {
    title: 'Multi-Platform Social Copy Generator',
    tag: 'High-CTR Hooks',
    description: 'Generate calibrated hooks, short captions, long-form thoughts, and algorithmic hashtags for Instagram, LinkedIn, and Twitter.',
    icon: PenTool,
    color: '#EC4899',
  },
  {
    title: 'RBAC Team Governance & Approvals',
    tag: 'Enterprise Safety',
    description: 'Multi-tier review desk for copywriters, strategists, compliance leads, and client stakeholders to approve assets before publication.',
    icon: ShieldCheck,
    color: '#6366F1',
  },
];

const FAQ_DATA = [
  {
    q: 'How does AI Ads maintain our exact brand tone?',
    a: 'AI Ads anchors generation to your Brand DNA profile, incorporating approved claims, restricted terminology, tone adjectives, and company positioning into every model prompt.',
  },
  {
    q: 'Can generated websites be exported and hosted externally?',
    a: 'Yes. Generated websites produce clean, standalone React code with Tailwind CSS that can be downloaded, hosted on Vercel or Netlify, or connected to custom domains.',
  },
  {
    q: 'What AI models power image and visual synthesis?',
    a: 'AI Ads integrates Google Cloud Vertex AI Imagen 3 and Gemini 3.1 Flash Image, delivering commercial photorealism with brand logo auto-compositing.',
  },
  {
    q: 'Can multiple team members and clients access the workspace?',
    a: 'Yes. The Team & RBAC matrix allows assigning roles such as AgencyAdmin, SEOSpecialist, Writer, Compliance, and ClientReviewer with customizable action permissions.',
  },
];

export const ProductShowcaseScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader title="Product Showcase" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Luxury Hero Banner */}
        <GlassCard glow style={styles.heroCard}>
          <Badge label="Enterprise AI Operating System" variant="accent" />
          <Text style={[styles.heroHeading, { color: colors.textPrimary }]}>
            The Operating System for Autonomous Marketing
          </Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            Consolidate your brand DNA, website builder, image studio, SEO intelligence, and social campaigns into one unified platform.
          </Text>

          <View style={styles.heroActionRow}>
            <Button
              title="Launch Creation Studio"
              onPress={() => navigation.navigate('Studio')}
              icon={<Sparkles size={14} color="#FFFFFF" />}
              style={styles.heroBtn}
            />
          </View>
        </GlassCard>

        {/* Trust Strip */}
        <View style={styles.trustStrip}>
          <Award size={16} color={colors.accent.primary} />
          <Text style={[styles.trustText, { color: colors.textSecondary }]}>
            Trusted by over 10,000+ brands and marketing leaders worldwide
          </Text>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Core Platform Capabilities
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Everything required to scale multi-channel content without agency bottlenecks
          </Text>

          <View style={styles.featureGrid}>
            {FEATURES_DATA.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <GlassCard key={idx} accentColor={feat.color} style={styles.featureCard}>
                  <View style={styles.featureTopRow}>
                    <View style={[styles.iconBox, { backgroundColor: `${feat.color}15` }]}>
                      <Icon size={18} color={feat.color} />
                    </View>
                    <Badge label={feat.tag} variant="neutral" />
                  </View>

                  <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
                    {feat.title}
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                    {feat.description}
                  </Text>
                </GlassCard>
              );
            })}
          </View>
        </View>

        {/* Pricing Tiers Section */}
        <View style={styles.pricingSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Predictable Scalable Pricing
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Transparent plans designed for growing agencies and enterprise marketing teams
          </Text>

          <View style={styles.pricingCards}>
            {/* Starter */}
            <GlassCard accentColor="#64748B" style={styles.pricingCard}>
              <Text style={[styles.planName, { color: colors.textPrimary }]}>Starter</Text>
              <Text style={[styles.planPrice, { color: colors.accent.primary }]}>Free</Text>
              <Text style={[styles.planSub, { color: colors.textMuted }]}>1,000 AI Credits included</Text>

              <View style={styles.planFeatureList}>
                {['Single Workspace', 'Basic Social Copy', 'Community Support'].map((item, i) => (
                  <View key={i} style={styles.planFeatureRow}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.planFeatureText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            {/* Agency Pro */}
            <GlassCard glow accentColor={colors.accent.primary} style={styles.pricingCard}>
              <View style={styles.popularRow}>

                <Text style={[styles.planName, { color: colors.textPrimary }]}>Agency Pro</Text>
                <Badge label="Most Popular" variant="accent" />
              </View>
              <Text style={[styles.planPrice, { color: colors.accent.primary }]}>$99 / mo</Text>
              <Text style={[styles.planSub, { color: colors.textMuted }]}>10,000 AI Credits included</Text>

              <View style={styles.planFeatureList}>
                {[
                  '5 Team Member Seats',
                  'AI Website Builder',
                  'Vertex AI 8K Visuals',
                  'Brand DNA Context Memory',
                  'Approvals & Compliance Desk',
                ].map((item, i) => (
                  <View key={i} style={styles.planFeatureRow}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.planFeatureText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            {/* Enterprise Elite */}
            <GlassCard accentColor="#F59E0B" style={styles.pricingCard}>
              <View style={styles.popularRow}>
                <Text style={[styles.planName, { color: colors.textPrimary }]}>Enterprise Elite</Text>
                <Crown size={16} color="#F59E0B" />
              </View>
              <Text style={[styles.planPrice, { color: colors.accent.primary }]}>$499 / mo</Text>
              <Text style={[styles.planSub, { color: colors.textMuted }]}>50,000 AI Credits included</Text>

              <View style={styles.planFeatureList}>
                {[
                  'Unlimited Team Seats',
                  'Dedicated API Endpoint',
                  'Custom Domain White-labeling',
                  'Priority Model Fine-Tuning',
                  'Dedicated Account Manager',
                ].map((item, i) => (
                  <View key={i} style={styles.planFeatureRow}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={[styles.planFeatureText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </View>
        </View>

        {/* Frequently Asked Questions */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Frequently Asked Questions
          </Text>

          <View style={styles.faqList}>
            {FAQ_DATA.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <GlassCard key={idx} style={styles.faqCard}>
                  <TouchableOpacity
                    onPress={() => toggleFaq(idx)}
                    style={styles.faqQuestionRow}
                  >
                    <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>
                      {item.q}
                    </Text>
                    {isOpen ? (
                      <ChevronUp size={16} color={colors.textSecondary} />
                    ) : (
                      <ChevronDown size={16} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>

                  {isOpen && (
                    <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                      {item.a}
                    </Text>
                  )}
                </GlassCard>
              );
            })}
          </View>
        </View>

        {/* Bottom CTA Card */}
        <GlassCard glow style={styles.bottomCtaCard}>
          <Text style={[styles.bottomCtaTitle, { color: colors.textPrimary }]}>
            Ready to accelerate your marketing velocity?
          </Text>
          <Text style={[styles.bottomCtaSub, { color: colors.textSecondary }]}>
            Set up your Brand DNA profile in under two minutes and launch your first AI campaign.
          </Text>
          <Button
            title="Configure Brand DNA"
            onPress={() => navigation.navigate('More', { screen: 'BrandDna' })}
            icon={<ArrowRight size={14} color="#FFFFFF" />}
            style={{ marginTop: 6 }}
          />
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
    paddingBottom: 110,
    gap: 16,
  },
  heroCard: {
    padding: 18,
    gap: 10,
  },
  heroHeading: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.hero,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: FONT_SIZES.body,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.body,
  },
  heroActionRow: {
    marginTop: 4,
  },
  heroBtn: {
    paddingVertical: 10,
  },
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  trustText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    flex: 1,
  },
  featuresSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  sectionSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
    marginBottom: 4,
  },
  featureGrid: {
    gap: 10,
  },
  featureCard: {
    padding: 14,
    gap: 8,
  },
  featureTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  featureDesc: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  pricingSection: {
    gap: 10,
  },
  pricingCards: {
    gap: 12,
  },
  pricingCard: {
    padding: 16,
    gap: 6,
  },
  popularRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  planPrice: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  planSub: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  planFeatureList: {
    gap: 6,
    marginTop: 8,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planFeatureText: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  faqSection: {
    gap: 10,
  },
  faqList: {
    gap: 8,
  },
  faqCard: {
    padding: 14,
    gap: 8,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  faqQuestion: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
    flex: 1,
  },
  faqAnswer: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.15)',
    paddingTop: 8,
  },
  bottomCtaCard: {
    padding: 18,
    gap: 8,
    marginVertical: 10,
  },
  bottomCtaTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  bottomCtaSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
});
