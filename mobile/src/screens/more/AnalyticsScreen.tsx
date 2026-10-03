import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TrendingUp, ShieldCheck, Zap, Layers, BarChart3 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

export const AnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  const metrics = [
    { label: 'Content Velocity Index', value: '94.2/100', change: '+24%', color: '#10B981', icon: TrendingUp },
    { label: 'Brand DNA Fact-Check Rate', value: '98.5%', change: '+12%', color: '#0284C7', icon: ShieldCheck },
    { label: 'Multi-Model Generation Yield', value: '420 Posts', change: '+38%', color: '#8B5CF6', icon: Zap },
    { label: 'Average ROAS Multiplier', value: '3.8x', change: '+0.6x', color: '#F59E0B', icon: BarChart3 },
  ];

  const platformShare = [
    { platform: 'Instagram', pct: 45, color: '#E1306C' },
    { platform: 'LinkedIn', pct: 30, color: '#0A66C2' },
    { platform: 'Google Search & SEO', pct: 15, color: '#10B981' },
    { platform: 'Email Newsletters', pct: 10, color: '#F59E0B' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={() => navigation.goBack()} title="Platform Analytics" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Metric Cards Grid */}
        <View style={styles.grid}>
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <GlassCard key={idx} style={styles.kpiCard} glow={idx === 0} accentColor={m.color}>
                <View style={styles.kpiTop}>
                  <View style={[styles.iconWrap, { backgroundColor: `${m.color}15` }]}>
                    <Icon size={16} color={m.color} />
                  </View>
                  <Text style={[styles.changeText, { color: m.color }]}>{m.change}</Text>
                </View>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{m.value}</Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{m.label}</Text>
              </GlassCard>
            );
          })}
        </View>

        {/* Platform Share */}
        <GlassCard style={styles.platformCard} accentColor="#3B82F6">
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Omni-Channel Content Distribution
          </Text>

          {/* Segmented bar */}
          <View style={styles.barContainer}>
            {platformShare.map((p, idx) => (
              <View
                key={idx}
                style={[styles.barSegment, { flex: p.pct, backgroundColor: p.color }]}
              />
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            {platformShare.map((p, idx) => (
              <View key={idx} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: p.color }]} />
                <Text style={[styles.legendLabel, { color: colors.textPrimary }]}>
                  {p.platform}
                </Text>
                <Text style={[styles.legendPct, { color: colors.textSecondary }]}>
                  {p.pct}%
                </Text>
              </View>
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
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  grid: {
    gap: 12,
  },
  kpiCard: {
    padding: 16,
    gap: 6,
    borderLeftWidth: 4,
  },
  kpiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  kpiValue: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.hero,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  kpiLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  platformCard: {
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  barContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 2,
    marginVertical: 4,
  },
  barSegment: {
    height: '100%',
  },
  legendContainer: {
    gap: 8,
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    flex: 1,
  },
  legendPct: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
});
