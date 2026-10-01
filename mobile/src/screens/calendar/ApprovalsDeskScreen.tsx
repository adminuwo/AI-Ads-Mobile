import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { CheckCircle2, XCircle, ShieldCheck, Clock, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { approvalsApi } from '../../api/calendarApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { ApprovalQueueItem } from '../../types';

export const ApprovalsDeskScreen: React.FC = () => {
  const { colors, isDark } = useTheme();

  const [queue, setQueue] = useState<ApprovalQueueItem[]>([
    {
      id: 'app_1',
      title: 'LinkedIn Leadership: Autonomous Marketing Infrastructure',
      platform: 'LinkedIn',
      author: 'Senior Copywriter',
      status: 'PENDING',
      scheduledDate: '2026-08-10',
      factCheck: { passed: true, score: 100, status: 'VERIFIED' },
    },
    {
      id: 'app_2',
      title: 'Instagram Creative: 10x Velocity Hero Visual',
      platform: 'Instagram',
      author: 'Design Lead',
      status: 'PENDING',
      scheduledDate: '2026-08-12',
      factCheck: { passed: true, score: 95, status: 'VERIFIED' },
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const loadQueue = async () => {
    try {
      const res = await approvalsApi.getQueue();
      if (res.success && Array.isArray(res.queue) && res.queue.length > 0) {
        setQueue(res.queue);
      }
    } catch {}
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
  };

  const handleUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      Haptics.notificationAsync(
        status === 'APPROVED'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    } catch {}

    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

    try {
      await approvalsApi.updateStatus({ id, status });
    } catch {}
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader title="Approvals Desk" />

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
        <Text style={[styles.heading, { color: colors.textPrimary }]}>
          Review & Compliance Queue ({queue.filter((q) => q.status === 'PENDING').length} Pending)
        </Text>

        <View style={styles.list}>
          {queue.map((item) => {
            const isApproved = item.status === 'APPROVED';
            const isRejected = item.status === 'REJECTED';

            return (
              <GlassCard key={item.id} style={styles.card} glow={item.status === 'PENDING'}>
                <View style={styles.cardTop}>
                  <Badge label={item.platform} variant="accent" />
                  <Badge
                    label={item.status}
                    variant={isApproved ? 'success' : isRejected ? 'danger' : 'warning'}
                  />
                </View>

                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                  {item.title}
                </Text>

                {/* Fact check badge */}
                {item.factCheck && (
                  <View style={[styles.factCheckRow, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <ShieldCheck size={14} color="#10B981" />
                    <Text style={styles.factCheckText}>
                      Brand DNA Claims Check: {item.factCheck.score}% Passed
                    </Text>
                  </View>
                )}

                <View style={styles.footerRow}>
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    by {item.author} • Scheduled {item.scheduledDate}
                  </Text>
                </View>

                {/* Actions */}
                {item.status === 'PENDING' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => handleUpdate(item.id, 'REJECTED')}
                      style={[styles.rejectBtn, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}
                    >
                      <XCircle size={15} color="#EF4444" />
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdate(item.id, 'APPROVED')}
                      style={styles.approveBtn}
                    >
                      <Check size={15} color="#FFFFFF" />
                      <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </GlassCard>
            );
          })}
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
  heading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 16,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  factCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  factCheckText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  footerRow: {
    paddingTop: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  rejectText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  approveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
