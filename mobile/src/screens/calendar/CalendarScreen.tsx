import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Calendar as CalendarIcon, Filter, Clock, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { calendarApi } from '../../api/calendarApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { CalendarEntry } from '../../types';
import { formatDate } from '../../utils/formatters';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

export const CalendarScreen: React.FC = () => {
  const { colors, isDark } = useTheme();

  const [entries, setEntries] = useState<CalendarEntry[]>([
    {
      id: 'cal_1',
      title: 'SEO Pillar Launch: Content Velocity with Vertex AI',
      date: '2026-08-05',
      platform: 'Blog',
      status: 'SCHEDULED',
      owner: 'SEO Lead',
    },
    {
      id: 'cal_2',
      title: 'Instagram Carousel: 3 Pillars of Brand DNA',
      date: '2026-08-06',
      platform: 'Instagram',
      status: 'APPROVED',
      owner: 'Creative Director',
    },
    {
      id: 'cal_3',
      title: 'LinkedIn Leadership: The Future of Autonomous Advertising',
      date: '2026-08-07',
      platform: 'LinkedIn',
      status: 'SCHEDULED',
      owner: 'Senior Copywriter',
    },
  ]);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    try {
      const res = await calendarApi.list();
      if (res.success && Array.isArray(res.entries) && res.entries.length > 0) {
        setEntries(res.entries);
      }
    } catch {}
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const filtered = selectedFilter === 'ALL'
    ? entries
    : entries.filter((e) => e.platform.toUpperCase() === selectedFilter);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader title="Content Calendar" />

      {/* Filter Tabs */}
      <View
        style={[
          styles.filtersBar,
          { backgroundColor: colors.headerBackground, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {['ALL', 'INSTAGRAM', 'LINKEDIN', 'BLOG'].map((f) => {
            const isSelected = selectedFilter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setSelectedFilter(f)}
                style={[
                  styles.filterChip,
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
                    styles.filterText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

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
        <View style={styles.list}>
          {filtered.map((item, idx) => (
            <GlassCard key={item.id || idx} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Badge
                  label={item.platform}
                  variant="accent"
                />
                <Badge
                  label={item.status}
                  variant={item.status === 'APPROVED' ? 'success' : 'warning'}
                />
              </View>

              <Text style={[styles.entryTitle, { color: colors.textPrimary }]}>
                {item.title}
              </Text>

              <View style={styles.entryFooter}>
                <View style={styles.dateRow}>
                  <Clock size={13} color={colors.textMuted} />
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    {formatDate(item.date)}
                  </Text>
                </View>

                {item.owner && (
                  <Text style={[styles.ownerText, { color: colors.textMuted }]}>
                    by {item.owner}
                  </Text>
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
  filtersBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  list: {
    gap: 12,
  },
  entryCard: {
    padding: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  ownerText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
});
