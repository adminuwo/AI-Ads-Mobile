import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
} from 'react-native';
import { X, Plus, Check, Trash2, Globe } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getBrandLogoUrl } from '../../utils/brandLogoHelper';
import { Workspace } from '../../types';

export const BrandSwitcherModal: React.FC = () => {
  const { colors, isDark } = useTheme();
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    isBrandSwitcherOpen,
    setIsBrandSwitcherOpen,
    setIsScraperOpen,
    deleteWorkspace,
  } = useWorkspace();

  if (!isBrandSwitcherOpen) return null;

  const handleSelect = (id: string) => {
    setActiveWorkspaceId(id);
    setIsBrandSwitcherOpen(false);
  };

  const handleOpenScraper = () => {
    setIsBrandSwitcherOpen(false);
    setIsScraperOpen(true);
  };

  const renderItem = ({ item }: { item: Workspace }) => {
    const isSelected = item.id === activeWorkspaceId || item._id === activeWorkspaceId;
    const logoUrl = getBrandLogoUrl({
      brandName: item.brandName,
      domainUrl: item.domainUrl,
      logoUrl: item.logoUrl,
      faviconUrl: item.faviconUrl,
    });

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleSelect(item.id || item._id || '')}
        style={[
          styles.workspaceRow,
          {
            backgroundColor: isSelected
              ? colors.accent.tagBg
              : isDark
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.02)',
            borderColor: isSelected ? colors.accent.primary : colors.border,
          },
        ]}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.logoWrapper, { backgroundColor: '#FFFFFF' }]}>
            <Image
              source={{ uri: logoUrl }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.textColumn}>
            <Text
              style={[
                styles.brandName,
                { color: isSelected ? colors.accent.primary : colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {item.brandName}
            </Text>
            {item.domainUrl && (
              <Text
                style={[styles.domainText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.domainUrl.replace(/^https?:\/\//, '')}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.rowRight}>
          {isSelected && (
            <View style={[styles.checkCircle, { backgroundColor: colors.accent.primary }]}>
              <Check size={12} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}

          {workspaces.length > 1 && (
            <TouchableOpacity
              onPress={() => deleteWorkspace(item.id || item._id || '')}
              style={styles.deleteButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={15} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isBrandSwitcherOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsBrandSwitcherOpen(false)}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => setIsBrandSwitcherOpen(false)}
      >
        <Pressable
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? colors.cardBackground : '#FFFFFF', borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Switch Brand Workspace
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Select an active brand profile or scrape a new one
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsBrandSwitcherOpen(false)}
              style={styles.closeBtn}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <FlatList
            data={workspaces}
            keyExtractor={(item) => item.id || item._id || String(Math.random())}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Action: Auto Scrape */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenScraper}
              style={[styles.addBrandButton, { borderColor: colors.accent.primary }]}
            >
              <Plus size={16} color={colors.accent.primary} />
              <Text style={[styles.addBrandText, { color: colors.accent.primary }]}>
                Auto Scrape New Brand DNA
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '75%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  workspaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  logoWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  textColumn: {
    flex: 1,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '800',
  },
  domainText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  addBrandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addBrandText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
