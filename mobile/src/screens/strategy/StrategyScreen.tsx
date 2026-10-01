import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Target,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { strategyApi } from '../../api/strategyApi';
import { calendarApi } from '../../api/calendarApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { StrategyCard } from '../../types';

export const StrategyScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace } = useWorkspace();

  const [loading, setLoading] = useState(false);
  const [strategyCards, setStrategyCards] = useState<StrategyCard[]>([
    {
      id: 'c1',
      phase: 'Phase 1: Foundation & Brand Awareness',
      title: 'Digital Omni-Channel Launch',
      objective: 'Establish category presence and seed Brand DNA claims across digital touchpoints',
      tactics: ['High-impact Instagram carousel series', 'LinkedIn leadership thought pieces', 'SEO intent clusters'],
      channels: ['Instagram', 'LinkedIn', 'Google Search'],
      budget: '35% Allocation (₹1,50,000 / $1,800)',
      kpis: ['1.2M Brand Impressions', '4.5% Engagement Rate', '2,400 Website Clicks'],
      timeframe: 'Days 1 — 10',
    },
    {
      id: 'c2',
      phase: 'Phase 2: Consideration & Value Proof',
      title: 'Competitive Differentiation & Social Proof',
      objective: 'Educate audience on core value propositions, customer wins, and USP validation',
      tactics: ['Direct-response video hooks', 'Email sequence nurture flows', 'Comparison guides'],
      channels: ['YouTube Ads', 'Email', 'Meta Feed'],
      budget: '40% Allocation (₹1,80,000 / $2,150)',
      kpis: ['6,500 Qualified Visits', '18% Email Open Rate', '450 Lead Opt-ins'],
      timeframe: 'Days 11 — 20',
    },
    {
      id: 'c3',
      phase: 'Phase 3: Conversion & Retention Velocity',
      title: 'High-Intent Retargeting & Special Offers',
      objective: 'Convert consideration audiences and establish repeat customer retention loops',
      tactics: ['Urgency-driven ad copy variations', 'Exclusive member discounts', 'Referral triggers'],
      channels: ['Remarketing', 'WhatsApp / SMS', 'Search Ads'],
      budget: '25% Allocation (₹1,10,000 / $1,320)',
      kpis: ['3.8x Blended ROAS', '₹320 CAC', '15% Repeat Order Rate'],
      timeframe: 'Days 21 — 30',
    },
  ]);

  const [regeneratingCardId, setRegeneratingCardId] = useState<string | null>(null);
  const [scheduledId, setScheduledId] = useState<string | null>(null);

  const handleGenerateFreshStrategy = async () => {
    setLoading(true);
    try {
      const res = await strategyApi.generateStrategy(activeWorkspace.id, {
        brandName: activeWorkspace.brandName,
        industry: activeWorkspace.industryCategory,
      });

      if (res.success && (res.strategy || res.currentStrategy)) {
        const payload = res.strategy || res.currentStrategy;
        if (Array.isArray(payload.cards)) {
          setStrategyCards(payload.cards);
        }
      }
    } catch (err) {
      console.warn('Strategy generation fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateCard = async (cardId: string) => {
    setRegeneratingCardId(cardId);
    try {
      const res = await strategyApi.regenerateCard(activeWorkspace.id, cardId);
      if (res.success && res.card) {
        setStrategyCards((prev) =>
          prev.map((c) => (c.id === cardId ? res.card! : c))
        );
      }
    } catch {}
    setRegeneratingCardId(null);
  };

  const handlePushToCalendar = async (card: StrategyCard) => {
    try {
      await calendarApi.create({
        title: `${card.phase}: ${card.title}`,
        platform: card.channels[0] || 'Multi-Channel',
        date: new Date().toISOString().split('T')[0],
        status: 'SCHEDULED',
        content: card.objective,
      });
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setScheduledId(card.id);
      setTimeout(() => setScheduledId(null), 2000);
    } catch {}
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader title="Strategy Hub" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
                30-Day Marketing Roadmap
              </Text>
              <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
                Full-funnel execution plan tailored to {activeWorkspace?.brandName || 'Brand DNA'}
              </Text>
            </View>
            <View style={[styles.iconCircle, { backgroundColor: colors.accent.tagBg }]}>
              <Target size={20} color={colors.accent.primary} />
            </View>
          </View>

          <Button
            title={loading ? 'Generating 30-Day Plan...' : 'Generate New 30-Day Strategy'}
            onPress={handleGenerateFreshStrategy}
            loading={loading}
            icon={<Sparkles size={16} color="#FFFFFF" />}
            style={styles.heroBtn}
          />
        </GlassCard>

        {/* Roadmap Cards */}
        <View style={styles.cardsList}>
          {strategyCards.map((card, idx) => (
            <GlassCard key={card.id || idx} style={styles.card} glow={idx === 0}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <Badge
                  label={card.timeframe || `Phase ${idx + 1}`}
                  variant="accent"
                />
                <TouchableOpacity
                  onPress={() => handleRegenerateCard(card.id)}
                  disabled={regeneratingCardId === card.id}
                  style={styles.refreshBtn}
                >
                  {regeneratingCardId === card.id ? (
                    <ActivityIndicator size="small" color={colors.accent.primary} />
                  ) : (
                    <RefreshCw size={14} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                {card.title}
              </Text>
              <Text style={[styles.cardObjective, { color: colors.textSecondary }]}>
                {card.objective}
              </Text>

              {/* Tactics */}
              {card.tactics && card.tactics.length > 0 && (
                <View style={styles.detailBlock}>
                  <Text style={[styles.detailLabel, { color: colors.accent.primary }]}>
                    TACTICS & DELIVERABLES
                  </Text>
                  {card.tactics.map((tactic, tIdx) => (
                    <View key={tIdx} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: colors.accent.primary }]} />
                      <Text style={[styles.bulletText, { color: colors.textPrimary }]}>
                        {tactic}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Channels & Budget Row */}
              <View style={styles.metaRow}>
                <View style={styles.metaBlock}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                    BUDGET
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                    {card.budget}
                  </Text>
                </View>

                <View style={styles.metaBlock}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                    CHANNELS
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                    {card.channels.join(', ')}
                  </Text>
                </View>
              </View>

              {/* Push to Calendar CTA */}
              <TouchableOpacity
                onPress={() => handlePushToCalendar(card)}
                style={[
                  styles.calendarBtn,
                  {
                    backgroundColor: scheduledId === card.id ? '#10B981' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                    borderColor: colors.border,
                  },
                ]}
              >
                {scheduledId === card.id ? (
                  <CheckCircle2 size={14} color="#FFFFFF" />
                ) : (
                  <Calendar size={14} color={colors.accent.primary} />
                )}
                <Text
                  style={[
                    styles.calendarBtnText,
                    { color: scheduledId === card.id ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {scheduledId === card.id ? 'Pushed to Calendar!' : 'Push Phase to Calendar'}
                </Text>
              </TouchableOpacity>
            </GlassCard>
          ))}
        </View>
      </ScrollView>

      <FloatingAISABrain />
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
  },
  heroCard: {
    padding: 18,
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtn: {
    marginTop: 14,
  },
  cardsList: {
    gap: 14,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardObjective: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  detailBlock: {
    gap: 6,
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 7,
  },
  bulletText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  metaBlock: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  calendarBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
