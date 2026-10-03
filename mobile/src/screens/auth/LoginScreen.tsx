import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, LogIn, UserPlus, Zap, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { PanchTattvaRibbon } from '../../components/common/PanchTattvaRibbon';
import { DualOrbitLogoAnimation } from '../../components/common/DualOrbitLogoAnimation';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { login, register, uwoLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    if (mode === 'login') {
      const res = await login(email.trim(), password);
      if (!res.success) {
        setError(res.error || 'Login failed');
      }
    } else {
      const res = await register(email.trim(), password, confirmPassword);
      if (!res.success) {
        setError(res.error || 'Registration failed');
      }
    }
    setLoading(false);
  };

  const handleUwoDemoLogin = async () => {
    setError(null);
    setLoading(true);
    const demoEmail = 'admin@aiads.com';
    const res = await uwoLogin({ email: demoEmail, name: 'AI Ads Admin' });
    if (!res.success) {
      setError(res.error || 'SSO failed');
    }
    setLoading(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <PanchTattvaRibbon height={3.5} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Brand Header */}
          <View style={styles.brandHeader}>
            <DualOrbitLogoAnimation
              size={170}
              logoSize={122}
              source={require('../../../assets/ai_ads_camera_full_logo.png')}
            />

            <View style={styles.brandTitleRow}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                AI Ads
              </Text>
              <Text style={[styles.brandTM, { color: colors.goldTM }]}>
                —TM
              </Text>
            </View>
            <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
              {mode === 'login'
                ? 'Sign in to govern your brand intelligence'
                : 'Create an enterprise workspace account'}
            </Text>
          </View>

          {/* Form Card */}
          <GlassCard style={styles.formCard} glow>
            {/* Segmented Mode Switcher */}
            <View
              style={[
                styles.segmentContainer,
                {
                  backgroundColor: colors.neu.cardSecondary,
                  borderTopColor: colors.neu.borderDark,
                  borderLeftColor: colors.neu.borderDark,
                  borderBottomColor: colors.neu.borderLight,
                  borderRightColor: colors.neu.borderLight,
                  borderWidth: 1.5,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  setMode('login');
                  setError(null);
                }}
                style={[
                  styles.segmentBtn,
                  mode === 'login' && [
                    styles.segmentBtnActive,
                    {
                      backgroundColor: colors.neu.card,
                      borderTopColor: colors.neu.borderLight,
                      borderLeftColor: colors.neu.borderLight,
                      borderBottomColor: colors.neu.borderDark,
                      borderRightColor: colors.neu.borderDark,
                      borderWidth: 1.5,
                      shadowColor: isDark ? '#000000' : '#A3B1C6',
                      shadowOffset: { width: 3, height: 3 },
                      shadowOpacity: isDark ? 0.6 : 0.5,
                      shadowRadius: 5,
                      elevation: 3,
                    },
                  ],
                ]}
              >
                <LogIn
                  size={14}
                  color={mode === 'login' ? colors.accent.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    { color: mode === 'login' ? colors.accent.primary : colors.textMuted },
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMode('register');
                  setError(null);
                }}
                style={[
                  styles.segmentBtn,
                  mode === 'register' && [
                    styles.segmentBtnActive,
                    {
                      backgroundColor: colors.neu.card,
                      borderTopColor: colors.neu.borderLight,
                      borderLeftColor: colors.neu.borderLight,
                      borderBottomColor: colors.neu.borderDark,
                      borderRightColor: colors.neu.borderDark,
                      borderWidth: 1.5,
                      shadowColor: isDark ? '#000000' : '#A3B1C6',
                      shadowOffset: { width: 3, height: 3 },
                      shadowOpacity: isDark ? 0.6 : 0.5,
                      shadowRadius: 5,
                      elevation: 3,
                    },
                  ],
                ]}
              >
                <UserPlus
                  size={14}
                  color={mode === 'register' ? colors.accent.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    { color: mode === 'register' ? colors.accent.primary : colors.textMuted },
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>


            {/* Error Message */}
            {error && (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' },
                ]}
              >
                <AlertCircle size={15} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Inputs */}
            <Input
              label="Email Address"
              placeholder="e.g. name@brand.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Mail size={16} color={colors.accent.primary} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Lock size={16} color={colors.accent.primary} />}
            />

            {mode === 'register' && (
              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                leftIcon={<Lock size={16} color={colors.accent.primary} />}
              />
            )}

            {/* Submit Button */}
            <Button
              title={
                loading
                  ? 'Verifying...'
                  : mode === 'login'
                  ? 'Sign In to Workspace'
                  : 'Create Workspace Account'
              }
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitBtn}
            />

            {/* Or Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>
                OR CONTINUE WITH
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* UWO SSO Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUwoDemoLogin}
              style={[
                styles.ssoButton,
                {
                  backgroundColor: colors.neu.card,
                  borderTopColor: colors.neu.borderLight,
                  borderLeftColor: colors.neu.borderLight,
                  borderBottomColor: colors.neu.borderDark,
                  borderRightColor: colors.neu.borderDark,
                  borderWidth: 1.5,
                  shadowColor: isDark ? '#000000' : '#A3B1C6',
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: isDark ? 0.6 : 0.45,
                  shadowRadius: 5,
                  elevation: 3,
                },
              ]}
            >
              <View style={styles.ssoIconWrapper}>
                <Zap size={14} color="#000000" fill="#000000" />
              </View>
              <Text style={styles.ssoText}>Sign In with UWO Platform (SSO)</Text>
            </TouchableOpacity>
          </GlassCard>


          {/* Footer note */}
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Protected by Vertex AI & Gemini 3.5 Enterprise Security
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.hero,
    letterSpacing: -0.3,
  },
  brandTM: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    marginLeft: 4,
    marginTop: -8,
  },
  brandSubtitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.body,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  formCard: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: 20,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    flex: 1,
  },
  submitBtn: {
    marginTop: 10,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    letterSpacing: 0.8,
  },
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  ssoIconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ssoText: {
    color: '#B45309',
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
  },
  footerText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    textAlign: 'center',
    marginTop: 20,
  },
});
