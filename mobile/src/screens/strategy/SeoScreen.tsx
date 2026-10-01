import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Search, Sparkles, TrendingUp, Layers, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { seoApi } from '../../api/seoApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { KeywordCluster } from '../../types';

export const SeoScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace } = useWorkspace();

  const [seedKeyword, setSeedKeyword] = useState('enterprise marketing automation');
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState<KeywordCluster[]>([
    { keyword: 'ai advertising platform for enterprise', intent: 'Commercial', volume: '14.2K', difficulty: '42%' },
    { keyword: 'how to centralize brand dna in marketing', intent: 'Informational', volume: '8.5K', difficulty: '28%' },
    { keyword: 'best ai ad copy generator 2026', intent: 'Transactional', volume: '22.8K', difficulty: '56%' },
    { keyword: 'automated seo content brief tools', intent: 'Commercial', volume: '6.1K', difficulty: '35%' },
  ]);

  const [briefLoading, setBriefLoading] = useState<string | null>(null);
  const [generatedBrief, setGeneratedBrief] = useState<any | null>(null);

  const handleClusterKeywords = async () => {
    if (!seedKeyword.trim()) return;
    setLoading(true);
    try {
      const res = await seoApi.clusterKeywords({
        seedKeyword: seedKeyword.trim(),
        websiteUrl: activeWorkspace?.domainUrl,
        brandName: activeWorkspace?.brandName,
        industry: activeWorkspace?.industryCategory,
        count: 8,
      });

      if (res.success && Array.isArray(res.keywordClusters) && res.keywordClusters.length > 0) {
        setClusters(res.keywordClusters);
      }
    } catch (err) {
      console.warn('SEO clustering fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBrief = async (kw: string) => {
    setBriefLoading(kw);
    try {
      const res = await seoApi.generateBrief({
        targetKeyword: kw,
        brandName: activeWorkspace?.brandName,
        intent: 'Commercial Intent',
      });

      if (res.success && res.brief) {
        setGeneratedBrief(res.brief);
      }
    } catch {}
    setBriefLoading(null);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader title="SEO Intelligence" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Card */}
        <GlassCard style={styles.searchCard}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Intent Clustering & Keyword Intelligence
          </Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
            Uncover high-intent search gaps anchored to {activeWorkspace?.brandName || 'Brand DNA'}
          </Text>

          <Input
            label="Seed Keyword or Industry Topic"
            placeholder="e.g. AI marketing platform"
            value={seedKeyword}
            onChangeText={setSeedKeyword}
            leftIcon={<Search size={16} color={colors.accent.primary} />}
          />

          <Button
            title={loading ? 'Clustering Intent Queries...' : 'Run Keyword Cluster Audit'}
            onPress={handleClusterKeywords}
            loading={loading}
            icon={<Sparkles size={16} color="#FFFFFF" />}
            style={styles.actionBtn}
          />
        </GlassCard>

        {/* Clusters List */}
        <View style={styles.clustersSection}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
            Target Intent Clusters ({clusters.length})
          </Text>

          {clusters.map((c, idx) => (
            <GlassCard key={idx} style={styles.clusterCard}>
              <View style={styles.clusterTop}>
                <Text style={[styles.clusterKeyword, { color: colors.textPrimary }]}>
                  {c.keyword}
                </Text>
                <Badge
                  label={c.intent || 'Commercial'}
                  variant={c.intent === 'Informational' ? 'info' : 'accent'}
                />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>VOLUME</Text>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>{c.volume || '10K+'}</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>DIFFICULTY</Text>
                  <Text style={[styles.statValue, { color: colors.warning }]}>{c.difficulty || '35%'}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleGenerateBrief(c.keyword)}
                  disabled={briefLoading === c.keyword}
                  style={[styles.briefBtn, { borderColor: colors.accent.primary }]}
                >
                  {briefLoading === c.keyword ? (
                    <ActivityIndicator size="small" color={colors.accent.primary} />
                  ) : (
                    <>
                      <Sparkles size={12} color={colors.accent.primary} />
                      <Text style={[styles.briefBtnText, { color: colors.accent.primary }]}>
                        Create Brief
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Brief preview */}
        {generatedBrief && (
          <GlassCard style={styles.briefCard} glow>
            <Text style={[styles.briefTitle, { color: colors.accent.primary }]}>
              AI Content Brief: {generatedBrief.title || seedKeyword}
            </Text>
            <Text style={[styles.briefSub, { color: colors.textSecondary }]}>
              {generatedBrief.summary || generatedBrief.metaDescription || JSON.stringify(generatedBrief)}
            </Text>
          </GlassCard>
        )}
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
  searchCard: {
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 10,
  },
  actionBtn: {
    marginTop: 10,
  },
  clustersSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  clusterCard: {
    padding: 16,
    gap: 10,
  },
  clusterTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  clusterKeyword: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  statItem: {
    gap: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  briefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  briefBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  briefCard: {
    padding: 16,
    marginTop: 14,
    gap: 6,
  },
  briefTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  briefSub: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
});
