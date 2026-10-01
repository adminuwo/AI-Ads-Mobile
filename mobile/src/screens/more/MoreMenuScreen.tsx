import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Dna,
  FolderKanban,
  TrendingUp,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Crown,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';

export const MoreMenuScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuth();
  const { activeWorkspace } = useWorkspace();

  const menuItems = [
    {
      id: 'BrandDna',
      title: 'Brand DNA Profile & Guidelines',
      sub: 'Voice tone, claims & positioning memory',
      icon: Dna,
      color: '#F59E0B',
      onPress: () => navigation.navigate('BrandDna'),
    },
    {
      id: 'AssetLibrary',
      title: 'Asset Library',
      sub: 'Saved images, generated visuals & media',
      icon: FolderKanban,
      color: '#10B981',
      onPress: () => navigation.navigate('AssetLibrary'),
    },
    {
      id: 'Analytics',
      title: 'Analytics & Telemetry',
      sub: 'Content velocity & KPI performance',
      icon: TrendingUp,
      color: '#0284C7',
      onPress: () => navigation.navigate('Analytics'),
    },
    {
      id: 'SettingsBilling',
      title: 'Settings, Themes & Billing',
      sub: 'Appearance, accent palette & subscription',
      icon: Settings,
      color: '#8B5CF6',
      onPress: () => navigation.navigate('SettingsBilling'),
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader title="More & Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <GlassCard style={styles.profileCard} glow>
          <View style={styles.profileRow}>
            <View style={[styles.avatarBox, { backgroundColor: colors.accent.tagBg }]}>
              <Text style={[styles.avatarInitial, { color: colors.accent.primary }]}>
                {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileText}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {user?.name || 'Enterprise Admin'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
              <View style={styles.badgesRow}>
                <Badge label={user?.plan || 'Agency Pro'} variant="accent" />
                <Badge label="Active Account" variant="success" />
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Menu Navigation Items */}
        <View style={styles.menuList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={item.onPress}
                style={[
                  styles.menuRow,
                  {
                    backgroundColor: isDark ? colors.cardBackground : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                    <Icon size={18} color={item.color} />
                  </View>
                  <View style={styles.menuTextCol}>
                    <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                      {item.sub}
                    </Text>
                  </View>
                </View>

                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={logout}
          style={[
            styles.logoutBtn,
            {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2',
              borderColor: 'rgba(239, 68, 68, 0.3)',
            },
          ]}
        >
          <LogOut size={16} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out of AI Ads</Text>
        </TouchableOpacity>
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
  },
  profileCard: {
    padding: 16,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '900',
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  menuList: {
    gap: 10,
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  menuSub: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
});
