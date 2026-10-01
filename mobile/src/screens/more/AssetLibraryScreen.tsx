import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { FolderKanban, Share2, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 44) / 2;

export const AssetLibraryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  const [assets, setAssets] = useState<any[]>([
    {
      id: 'ast_1',
      title: 'Holographic Neural Brain',
      url: require('../../../assets/aisa_brain_logo_hd.png'),
      isLocal: true,
      tag: 'Brand Asset',
    },
    {
      id: 'ast_2',
      title: 'AI Ads Official Emblem',
      url: require('../../../assets/logo_icon_only.png'),
      isLocal: true,
      tag: 'Logo Vector',
    },
    {
      id: 'ast_3',
      title: '3D Studio Commercial Render',
      url: require('../../../assets/ai_ads_logo_3d.png'),
      isLocal: true,
      tag: 'Commercial Ad',
    },
    {
      id: 'ast_4',
      title: 'Orchestrator Architecture',
      url: require('../../../assets/aisa_orchestrator_logo.png'),
      isLocal: true,
      tag: 'Diagram',
    },
  ]);

  const handleShare = async (title: string) => {
    try {
      await Share.share({
        title: `AI Ads Media Asset: ${title}`,
        message: `Generated with AI Ads™ Platform: ${title}`,
      });
    } catch {}
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <GlassCard style={styles.assetCard}>
        <View style={styles.imageContainer}>
          <Image
            source={item.url}
            style={styles.assetImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.assetInfo}>
          <Text style={[styles.assetTag, { color: colors.accent.primary }]}>
            {item.tag}
          </Text>
          <Text style={[styles.assetTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.title}
          </Text>

          <TouchableOpacity
            onPress={() => handleShare(item.title)}
            style={[styles.shareBtn, { borderColor: colors.border }]}
          >
            <Share2 size={13} color={colors.textSecondary} />
            <Text style={[styles.shareText, { color: colors.textSecondary }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={() => navigation.goBack()} title="Asset Library" />

      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  assetCard: {
    width: COLUMN_WIDTH,
    padding: 10,
    borderRadius: 18,
    gap: 8,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  assetImage: {
    width: '90%',
    height: '90%',
  },
  assetInfo: {
    gap: 4,
  },
  assetTag: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  assetTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  shareText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
