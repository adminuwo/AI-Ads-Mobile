import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Megaphone, Plus, Calendar, Layers, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { campaignApi } from '../../api/campaignApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

export const CampaignsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace } = useWorkspace();

  const [campaigns, setCampaigns] = useState<any[]>([
    {
      id: 'cmp_1',
      campaignName: 'Q3 Enterprise Product Acceleration',
      status: 'Active',
      channels: ['LinkedIn', 'Instagram', 'Search'],
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      budget: '₹2,50,000 / $3,000',
      postsCount: 14,
    },
    {
      id: 'cmp_2',
      campaignName: 'Brand DNA Multi-Model AI Launch',
      status: 'Scheduled',
      channels: ['Instagram', 'YouTube'],
      startDate: '2026-09-01',
      endDate: '2026-09-20',
      budget: '₹1,20,000 / $1,450',
      postsCount: 8,
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCampaigns = async () => {
    try {
      const res = await campaignApi.list({
        workspaceId: activeWorkspace?._id || activeWorkspace?.id,
      });
      if (res.success && Array.isArray(res.campaigns) && res.campaigns.length > 0) {
        setCampaigns(res.campaigns);
      }
    } catch {}
  };

  useEffect(() => {
    loadCampaigns();
  }, [activeWorkspace?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCampaigns();
    setRefreshing(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader title="Campaigns" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
          />
        }
      >
        <View style={styles.topRow}>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>
            Active Campaigns ({campaigns.length})
          </Text>
        </View>

        <View style={styles.list}>
          {campaigns.map((c, idx) => (
            <GlassCard key={c.id || idx} style={styles.card} glow={c.status === 'Active'}>
              <View style={styles.cardHeader}>
                <Badge
                  label={c.status || 'Active'}
                  variant={c.status === 'Active' ? 'success' : 'info'}
                />
                <Text style={[styles.datesText, { color: colors.textMuted }]}>
                  {c.startDate ? `${c.startDate} — ${c.endDate}` : '30-Day Duration'}
                </Text>
              </View>

              <Text style={[styles.campaignTitle, { color: colors.textPrimary }]}>
                {c.campaignName}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>CHANNELS</Text>
                  <Text style={[styles.metaVal, { color: colors.textPrimary }]}>
                    {Array.isArray(c.channels) ? c.channels.join(', ') : 'Omni-Channel'}
                  </Text>
                </View>

                {c.budget && (
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>BUDGET</Text>
                    <Text style={[styles.metaVal, { color: colors.textPrimary }]}>
                      {c.budget}
                    </Text>
                  </View>
                )}
              </View>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heading: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 16,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datesText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  campaignTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  metaItem: {
    gap: 2,
    flex: 1,
  },
  metaLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    letterSpacing: 0.4,
  },
  metaVal: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
});
