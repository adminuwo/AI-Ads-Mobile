import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import {
  X,
  Bell,
  CheckCheck,
  Dna,
  Megaphone,
  Sparkles,
  CheckCircle2,
  Crown,
  AlertCircle,
  Clock,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { notificationApi, NotificationItem } from '../../api/notificationApi';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  onUnreadChange,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        const unread = res.notifications.filter((n) => !n.isRead).length;
        onUnreadChange?.(unread);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchNotifs();
    }
  }, [visible]);

  const handleMarkAsRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    setNotifications((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, isRead: true } : item));
      const unread = updated.filter((n) => !n.isRead).length;
      onUnreadChange?.(unread);
      return updated;
    });
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, isRead: true }));
      onUnreadChange?.(0);
      return updated;
    });
    for (const n of notifications) {
      if (!n.isRead) {
        notificationApi.markAsRead(n.id);
      }
    }
  };

  const getIconForNotification = (item: NotificationItem) => {
    const titleLower = item.title.toLowerCase();
    if (titleLower.includes('dna') || titleLower.includes('brand')) {
      return <Dna size={18} color="#8B5CF6" />;
    }
    if (titleLower.includes('campaign')) {
      return <Megaphone size={18} color="#3B82F6" />;
    }
    if (titleLower.includes('subscription') || titleLower.includes('pro')) {
      return <Crown size={18} color="#EC4899" />;
    }
    if (titleLower.includes('content') || titleLower.includes('ai')) {
      return <Sparkles size={18} color="#F59E0B" />;
    }
    if (titleLower.includes('approval')) {
      return <CheckCircle2 size={18} color="#10B981" />;
    }
    return <AlertCircle size={18} color={colors.accent.primary} />;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleMarkAsRead(item.id)}
        style={[
          styles.notifCard,
          {
            backgroundColor: !item.isRead
              ? isDark
                ? 'rgba(124, 58, 237, 0.08)'
                : '#F5F3FF'
              : isDark
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.02)',
            borderColor: !item.isRead
              ? isDark
                ? 'rgba(124, 58, 237, 0.3)'
                : '#DDD6FE'
              : colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconAndTitle}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                },
              ]}
            >
              {getIconForNotification(item)}
            </View>
            <View style={styles.titleColumn}>
              <Text
                style={[
                  styles.notifTitle,
                  { color: colors.textPrimary, fontWeight: !item.isRead ? '800' : '600' },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View style={styles.timeRow}>
                <Clock size={11} color={colors.textSecondary} />
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                  {item.time || 'Recent'}
                </Text>
              </View>
            </View>
          </View>

          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>
          {item.message}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? colors.cardBackground : '#FFFFFF',
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerLeft}>
                <View style={styles.bellIconContainer}>
                  <Bell size={20} color={colors.textPrimary} />
                  {unreadCount > 0 && <View style={styles.bellBadgeDot} />}
                </View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{unreadCount} New</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {unreadCount > 0 && (
              <View style={styles.subHeaderRow}>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Updates from campaigns, Brand DNA & AI content
                </Text>
                <TouchableOpacity
                  onPress={handleMarkAllAsRead}
                  style={styles.markAllBtn}
                  activeOpacity={0.7}
                >
                  <CheckCheck size={14} color="#7C3AED" />
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Notifications List */}
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Bell size={36} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No notifications yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Campaign alerts and Brand DNA updates will appear here.
                </Text>
              </View>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '80%',
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellIconContainer: {
    position: 'relative',
  },
  bellBadgeDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  title: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    letterSpacing: -0.2,
  },
  badgePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgePillText: {
    color: '#EF4444',
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  closeBtn: {
    padding: 4,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    flex: 1,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  markAllText: {
    color: '#7C3AED',
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  notifCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    flex: 1,
  },
  notifTitle: {
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  notifMessage: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
    textAlign: 'center',
    maxWidth: 240,
  },
});
