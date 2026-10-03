import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import {
  X,
  User as UserIcon,
  Settings,
  Crown,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

interface ProfileMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuth();
  const { credits, activeWorkspace } = useWorkspace();
  const navigation = useNavigation<any>();


  const userName = user?.name || 'Sonali Gupta';
  const userEmail = user?.email || 'sonali@aiads.com';
  const userInitial = (userName.trim().charAt(0) || 'S').toUpperCase();
  const planName = user?.plan || activeWorkspace?.subscriptionTier || 'Agency Pro';

  const handleNavigate = (screenName: string) => {
    onClose();
    try {
      navigation.navigate(screenName);
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of AI ADS?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await logout();
          },
        },
      ]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'AI ADS Support & Help',
      'Contact our 24/7 dedicated Enterprise Support at support@aiads.com or visit docs.aiads.com for comprehensive guides.',
      [{ text: 'OK' }]
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
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Account</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* User Profile Card */}
          <View
            style={[
              styles.userCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.userRow}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarCircle, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={[styles.avatarInitial, { color: '#6D28D9' }]}>{userInitial}</Text>
                </View>
              )}

              <View style={styles.userTextCol}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {userName}
                  </Text>
                  <ShieldCheck size={16} color="#10B981" />
                </View>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {userEmail}
                </Text>

                {/* Subscription Tier Pill */}
                <View style={styles.subscriptionRow}>
                  <View style={[styles.planPill, { backgroundColor: 'rgba(124, 58, 237, 0.12)', borderColor: 'rgba(124, 58, 237, 0.25)' }]}>
                    <Crown size={12} color="#7C3AED" />
                    <Text style={styles.planPillText}>{planName}</Text>
                  </View>
                  <View style={[styles.creditPill, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <Sparkles size={11} color="#D97706" />
                    <Text style={styles.creditPillText}>{credits?.balance ?? 500} Credits</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuList}>
            {/* 1. Profile */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleNavigate('MoreMenu')}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <UserIcon size={18} color="#2563EB" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Profile</Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Account details & workspace identity</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* 2. Settings */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleNavigate('SettingsBilling')}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(100, 116, 139, 0.1)' }]}>
                <Settings size={18} color="#475569" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Settings</Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Theme, appearance & accent color</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* 3. Subscription / Agency Pro */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleNavigate('SettingsBilling')}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
                <Crown size={18} color="#7C3AED" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Subscription / Agency Pro</Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Manage plan, billing & AI credits</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* 4. Help & Support */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleHelpSupport}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <HelpCircle size={18} color="#059669" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Help & Support</Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Documentation, FAQs & enterprise assistance</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* 5. Logout */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <LogOut size={18} color="#DC2626" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={[styles.menuTitle, { color: '#DC2626', fontWeight: '800' }]}>Logout</Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Safely sign out of your account</Text>
              </View>
              <ChevronRight size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
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
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 4,
  },
  userCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userTextCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  userEmail: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  planPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  planPillText: {
    color: '#7C3AED',
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  creditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  creditPillText: {
    color: '#B45309',
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  menuList: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  menuSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 1,
  },
});
