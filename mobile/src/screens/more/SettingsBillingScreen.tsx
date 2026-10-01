import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  Palette,
  Sun,
  Moon,
  Crown,
  Server,
  Check,
  RefreshCw,
  Sliders,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  AccentColorKey,
  ACCENT_PALETTES,
} from '../../config/theme';
import {
  getApiBaseUrl,
  setCustomApiUrl,
  resetApiUrl,
  DEFAULT_API_URL,
} from '../../config/env';

export const SettingsBillingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, mode, setMode, accentKey, setAccentColor, isDark } = useTheme();
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();

  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [editingUrl, setEditingUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getApiBaseUrl().then((url) => {
      setCurrentApiUrl(url);
      setEditingUrl(url);
    });
  }, []);

  const handleSaveApiUrl = async () => {
    if (!editingUrl.trim()) return;
    await setCustomApiUrl(editingUrl.trim());
    setCurrentApiUrl(editingUrl.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetApiUrl = async () => {
    await resetApiUrl();
    const def = await getApiBaseUrl();
    setCurrentApiUrl(def);
    setEditingUrl(def);
  };

  const accentOptions: Array<{ key: AccentColorKey; label: string; color: string }> = [
    { key: 'purple', label: 'Purple (Default)', color: ACCENT_PALETTES.purple.primary },
    { key: 'indigo', label: 'Indigo', color: ACCENT_PALETTES.indigo.primary },
    { key: 'blue', label: 'Blue', color: ACCENT_PALETTES.blue.primary },
    { key: 'emerald', label: 'Emerald', color: ACCENT_PALETTES.emerald.primary },
    { key: 'amber', label: 'Amber', color: ACCENT_PALETTES.amber.primary },
    { key: 'rose', label: 'Rose', color: ACCENT_PALETTES.rose.primary },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={() => navigation.goBack()} title="Settings & Billing" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Appearance & Dark Mode */}
        <GlassCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Theme & Appearance
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                High-contrast OLED black aesthetic
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={(val) => setMode(val ? 'dark' : 'light')}
              trackColor={{ false: '#CBD5E1', true: colors.accent.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Accent Color Palette */}
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            ACCENT COLOR SYSTEM
          </Text>
          <View style={styles.accentsGrid}>
            {accentOptions.map((acc) => {
              const isSelected = accentKey === acc.key;
              return (
                <TouchableOpacity
                  key={acc.key}
                  onPress={() => setAccentColor(acc.key)}
                  style={[
                    styles.accentChip,
                    {
                      borderColor: isSelected ? acc.color : colors.border,
                      backgroundColor: isSelected ? `${acc.color}20` : 'transparent',
                    },
                  ]}
                >
                  <View style={[styles.colorDot, { backgroundColor: acc.color }]} />
                  <Text
                    style={[
                      styles.accentChipText,
                      { color: isSelected ? acc.color : colors.textPrimary },
                    ]}
                  >
                    {acc.label}
                  </Text>
                  {isSelected && <Check size={13} color={acc.color} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Subscription Plan & Billing */}
        <GlassCard style={styles.card} glow>
          <View style={styles.planHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Subscription & Plan
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                50% Profit Margin Balanced Workload Model
              </Text>
            </View>
            <View style={[styles.crownBox, { backgroundColor: colors.accent.tagBg }]}>
              <Crown size={20} color={colors.accent.primary} />
            </View>
          </View>

          <View style={styles.planTierCard}>
            <View style={styles.tierTop}>
              <Text style={[styles.tierName, { color: colors.accent.primary }]}>
                {user?.plan || activeWorkspace?.subscriptionTier || 'Agency Pro Plan'}
              </Text>
              <Badge label="Active" variant="success" />
            </View>
            <Text style={[styles.tierPrice, { color: colors.textPrimary }]}>
              ₹2,399 / mo <Text style={styles.tierPriceSub}>($29.99 / mo)</Text>
            </Text>

            <View style={styles.tierFeatureList}>
              <Text style={[styles.tierFeature, { color: colors.textSecondary }]}>
                ✓ 420 AI Ad Images & Banners
              </Text>
              <Text style={[styles.tierFeature, { color: colors.textSecondary }]}>
                ✓ 800 Social Posts & Blog Articles
              </Text>
              <Text style={[styles.tierFeature, { color: colors.textSecondary }]}>
                ✓ 1,500 AISA Copilot Messages
              </Text>
              <Text style={[styles.tierFeature, { color: colors.textSecondary }]}>
                ✓ 100 SEO Keyword Clusters & Briefs
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Backend API Connection Config */}
        <GlassCard style={styles.card}>
          <View style={styles.planHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                API Server Configuration
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                Configure target backend host for Android
              </Text>
            </View>
            <Server size={18} color={colors.accent.primary} />
          </View>

          <Input
            label="Backend Base URL"
            value={editingUrl}
            onChangeText={setEditingUrl}
            autoCapitalize="none"
            placeholder="http://10.0.2.2:5000/api"
          />

          <View style={styles.apiPresetsRow}>
            <TouchableOpacity
              onPress={() => setEditingUrl('https://ai-ads-743928421487.asia-south1.run.app/api')}
              style={[styles.presetChip, { borderColor: colors.accent.primary, backgroundColor: `${colors.accent.primary}15` }]}
            >
              <Text style={[styles.presetText, { color: colors.accent.primary, fontWeight: '700' }]}>
                ⭐ Cloud Run Live (asia-south1)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setEditingUrl('http://192.168.29.16:5000/api')}
              style={[styles.presetChip, { borderColor: colors.border }]}
            >
              <Text style={[styles.presetText, { color: colors.textSecondary }]}>
                Local Wi-Fi (192.168.29.16)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.apiActions}>
            <Button
              title={savedSuccess ? 'API Saved!' : 'Save Target API'}
              onPress={handleSaveApiUrl}
              style={{ flex: 1 }}
              size="sm"
            />
            <Button
              title="Reset"
              onPress={handleResetApiUrl}
              variant="outline"
              size="sm"
            />
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
  card: {
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingTextCol: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  accentsGrid: {
    gap: 8,
  },
  accentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  accentChipText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  crownBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTierCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  tierTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierName: {
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tierPrice: {
    fontSize: 22,
    fontWeight: '900',
  },
  tierPriceSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tierFeatureList: {
    gap: 4,
    marginTop: 4,
  },
  tierFeature: {
    fontSize: 12,
    fontWeight: '500',
  },
  apiPresetsRow: {
    gap: 6,
    marginVertical: 4,
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  apiActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
});
