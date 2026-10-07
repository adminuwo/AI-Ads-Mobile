import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ArrowLeft, Bell, Plus } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { ZivaBrandIcon } from './ZivaBrandIcon';
import { getBrandLogoUrl } from '../../utils/brandLogoHelper';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

interface BrandHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  showBack = false,
  onBack,
  title,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const {
    workspaces,
    activeWorkspace,
    setIsBrandSwitcherOpen,
    setIsNotificationOpen,
    setIsProfileMenuOpen,
    setIsAllModulesOpen,
    unreadCount,
  } = useWorkspace();
  const { user } = useAuth();

  const hasBrand = Boolean(
    workspaces &&
    workspaces.length > 0 &&
    activeWorkspace &&
    activeWorkspace.brandName &&
    activeWorkspace.brandName.trim().length > 0 &&
    activeWorkspace.brandName.trim().toLowerCase() !== 'no brand'
  );

  const brandName = hasBrand ? (activeWorkspace.brandName || '').trim() : 'No Brand';
  const isZiva = hasBrand && brandName.toUpperCase() === 'ZIVA';

  const logoUrl = hasBrand
    ? getBrandLogoUrl({
        brandName: activeWorkspace?.brandName,
        domainUrl: activeWorkspace?.domainUrl,
        logoUrl: activeWorkspace?.logoUrl,
        faviconUrl: activeWorkspace?.faviconUrl,
      })
    : '';

  const userName = user?.name || 'Sonali Gupta';
  const userInitial = (userName.trim().charAt(0) || 'S').toUpperCase();

  // Android status bar safe clearance
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : insets.top;
  const topPadding = Math.max(insets.top, statusBarHeight);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.headerBackground, paddingTop: topPadding }]}>
      <View style={[styles.container, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
        {/* Left Side: Back button, Hamburger Menu, and Brand Switcher / Title */}
        <View style={styles.leftContainer}>
          {showBack && onBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={[
                styles.backButton,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : null}


          {title ? (
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            /* Brand Selector Capsule Pill */
            <TouchableOpacity
              onPress={() => setIsBrandSwitcherOpen(true)}
              style={[
                styles.brandPill,
                {
                  backgroundColor: isDark ? colors.neu.card : '#FFFFFF',
                  borderTopColor: colors.neu.borderLight,
                  borderLeftColor: colors.neu.borderLight,
                  borderBottomColor: colors.neu.borderDark,
                  borderRightColor: colors.neu.borderDark,
                  shadowColor: isDark ? '#000000' : '#A3B1C6',
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.logoWrapper}>
                {!hasBrand ? (
                  <View
                    style={[
                      styles.emptyLogoCircle,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      },
                    ]}
                  >
                    <Plus size={12} color={isDark ? '#94A3B8' : '#64748B'} strokeWidth={2.4} />
                  </View>
                ) : isZiva || !activeWorkspace?.logoUrl ? (
                  <ZivaBrandIcon size={20} />
                ) : (
                  <Image
                    source={{ uri: logoUrl }}
                    style={styles.brandLogo}
                    resizeMode="contain"
                  />
                )}
              </View>

              <Text
                style={[
                  styles.brandNameText,
                  { color: hasBrand ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#94A3B8' : '#64748B') },
                ]}
                numberOfLines={1}
              >
                {brandName}
              </Text>

              <ChevronDown
                size={15}
                color={isDark ? '#94A3B8' : '#64748B'}
                strokeWidth={2.4}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Right Side: Notification Bell & User Profile Avatar */}
        <View style={styles.rightContainer}>
          {/* Notification Bell */}
          <TouchableOpacity
            onPress={() => setIsNotificationOpen(true)}
            style={[
              styles.bellButton,
              {
                backgroundColor: isDark ? colors.neu.card : '#FFFFFF',
                borderTopColor: colors.neu.borderLight,
                borderLeftColor: colors.neu.borderLight,
                borderBottomColor: colors.neu.borderDark,
                borderRightColor: colors.neu.borderDark,
                shadowColor: isDark ? '#000000' : '#A3B1C6',
              },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Bell size={18} color={isDark ? '#F8FAFC' : '#0F172A'} strokeWidth={1.9} />
            <View
              style={[
                styles.bellBadgeDot,
                { borderColor: isDark ? colors.cardBackground : '#FFFFFF' },
              ]}
            />
          </TouchableOpacity>

          {/* User Profile Avatar */}
          <TouchableOpacity
            onPress={() => setIsProfileMenuOpen(true)}
            style={[
              styles.avatarButton,
              {
                backgroundColor: isDark ? colors.neu.card : '#FFFFFF',
                borderTopColor: colors.neu.borderLight,
                borderLeftColor: colors.neu.borderLight,
                borderBottomColor: colors.neu.borderDark,
                borderRightColor: colors.neu.borderDark,
                shadowColor: isDark ? '#000000' : '#A3B1C6',
              },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.75}
          >
            {user?.avatar && typeof user.avatar === 'string' && user.avatar.startsWith('http') ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <Image
                source={require('../../../assets/header_avatar_exact.png')}
                style={styles.avatarImg}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    zIndex: 40,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    letterSpacing: -0.2,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1.5,
    maxWidth: 220,
    flexShrink: 1,
    elevation: 3,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLogoCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 20,
    height: 20,
  },
  brandNameText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
    letterSpacing: 0.3,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  bellBadgeDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  hamburgerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },

  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#6D28D9',
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
