import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ArrowLeft, Sparkles, Coins } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { PanchTattvaRibbon } from './PanchTattvaRibbon';
import { getBrandLogoUrl } from '../../utils/brandLogoHelper';

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
  const { activeWorkspace, setIsBrandSwitcherOpen, credits } = useWorkspace();
  const { user } = useAuth();

  const logoUrl = getBrandLogoUrl({
    brandName: activeWorkspace?.brandName,
    domainUrl: activeWorkspace?.domainUrl,
    logoUrl: activeWorkspace?.logoUrl,
    faviconUrl: activeWorkspace?.faviconUrl,
  });

  const planName = user?.plan || activeWorkspace?.subscriptionTier || 'Agency Pro';

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.headerBackground, paddingTop: insets.top }]}>
      <PanchTattvaRibbon height={3} />

      <View style={[styles.container, { borderBottomColor: colors.border }]}>
        {/* Left Side: Back button or Brand Switcher */}
        <View style={styles.leftContainer}>
          {showBack && onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          )}

          {title ? (
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <TouchableOpacity
              onPress={() => setIsBrandSwitcherOpen(true)}
              style={[
                styles.brandPill,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.logoContainer, { backgroundColor: '#FFFFFF' }]}>
                <Image
                  source={{ uri: logoUrl }}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={[styles.brandNameText, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {activeWorkspace?.brandName || 'Brand DNA'}
              </Text>
              <ChevronDown size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Right Side: Credit balance & Plan Badge */}
        <View style={styles.rightContainer}>
          {/* Credit balance chip */}
          <View
            style={[
              styles.creditChip,
              {
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.1)',
                borderColor: 'rgba(245, 158, 11, 0.25)',
              },
            ]}
          >
            <Coins size={12} color="#F59E0B" />
            <Text style={styles.creditText}>{credits.balance}</Text>
          </View>

          {/* Plan badge */}
          <View
            style={[
              styles.planBadge,
              {
                backgroundColor: colors.accent.tagBg,
                borderColor: colors.accent.primary,
              },
            ]}
          >
            <Sparkles size={11} color={colors.accent.primary} />
            <Text
              style={[styles.planText, { color: colors.accent.tagText }]}
              numberOfLines={1}
            >
              {planName}
            </Text>
          </View>
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
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 200,
  },
  logoContainer: {
    width: 22,
    height: 22,
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 18,
    height: 18,
  },
  brandNameText: {
    fontSize: 13,
    fontWeight: '800',
    maxWidth: 130,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creditChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  creditText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 0.8,
  },
  planText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
