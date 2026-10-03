import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Check,
  X,
  Mail,
  Plus,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

interface TeamMember {
  id: number | string;
  name: string;
  email: string;
  role: 'AgencyAdmin' | 'SEOSpecialist' | 'Writer' | 'Compliance' | 'ClientReviewer';
  status: 'Active' | 'Pending';
}

export const TeamRbacScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace } = useWorkspace();

  const [activeRoleView, setActiveRoleView] = useState('AgencyAdmin');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'AgencyAdmin' | 'SEOSpecialist' | 'Writer' | 'Compliance' | 'ClientReviewer'>('Writer');

  const [members, setMembers] = useState<TeamMember[]>([
    { id: 1, name: 'Ritik Director', email: 'ritik@agency.com', role: 'AgencyAdmin', status: 'Active' },
    { id: 2, name: 'Sarah SEO Lead', email: 'sarah@agency.com', role: 'SEOSpecialist', status: 'Active' },
    { id: 3, name: 'Alex Copywriter', email: 'alex@agency.com', role: 'Writer', status: 'Active' },
    { id: 4, name: 'Client Marketing VP', email: 'vp@clientbrand.com', role: 'ClientReviewer', status: 'Active' },
  ]);

  const handleInviteSubmit = () => {
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: Date.now(),
      name: inviteName.trim() || inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Active',
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('Writer');
    setShowInviteModal(false);
  };

  const rbacMatrix = [
    { action: 'Manage Billing & Credits', admin: true, strategist: false, compliance: false, client: false },
    { action: 'Edit Brand DNA Memory', admin: true, strategist: true, compliance: false, client: false },
    { action: 'Create & Draft Content', admin: true, strategist: true, compliance: false, client: false },
    { action: 'Fact & Claim Review', admin: true, strategist: true, compliance: true, client: false },
    { action: 'Approve Final Assets', admin: true, strategist: true, compliance: true, client: true },
    { action: 'Manage Team Access', admin: true, strategist: false, compliance: false, client: false },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader title="Team & RBAC Matrix" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Workspace Governance Header Card */}
        <GlassCard glow style={styles.governanceCard}>
          <View style={styles.govTopRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.accent.tagBg }]}>
              <Users size={18} color={colors.accent.primary} />
            </View>
            <View style={styles.govTitleBox}>
              <Text style={[styles.govTitle, { color: colors.textPrimary }]}>
                Multi-Tenant Team Governance
              </Text>
              <Text style={[styles.govSub, { color: colors.textSecondary }]}>
                Workspace: {activeWorkspace?.brandName || 'Global Brand'}
              </Text>
            </View>
          </View>

          <Text style={[styles.govDesc, { color: colors.textSecondary }]}>
            Role-Based Access Control determines editing permissions, asset approvals, and credit authorizations across your marketing team.
          </Text>

          <View style={styles.govActionRow}>
            <Button
              title="Invite Member"
              onPress={() => setShowInviteModal(true)}
              icon={<UserPlus size={14} color="#FFFFFF" />}
              style={styles.inviteBtn}
            />
          </View>
        </GlassCard>

        {/* Role View Filter Chips */}
        <View style={styles.roleFilterSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Current Role Perspective
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleScroll}>
            {[
              { id: 'AgencyAdmin', label: 'Agency Admin' },
              { id: 'SEOSpecialist', label: 'SEO Lead' },
              { id: 'Writer', label: 'Senior Writer' },
              { id: 'Compliance', label: 'Compliance Officer' },
              { id: 'ClientReviewer', label: 'Client Reviewer' },
            ].map((r) => {
              const isSelected = activeRoleView === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setActiveRoleView(r.id)}
                  style={[
                    styles.roleChip,
                    {
                      backgroundColor: isSelected
                        ? colors.accent.primary
                        : isDark
                        ? 'rgba(255,255,255,0.05)'
                        : '#F1F5F9',
                      borderColor: isSelected ? colors.accent.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Active Team Members List */}
        <View style={styles.membersSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Workspace Members ({members.length})
            </Text>
            <Badge label="Canonical Roster" variant="accent" />
          </View>

          <View style={styles.memberList}>
            {members.map((member) => (
              <GlassCard key={member.id} style={styles.memberCard}>
                <View style={styles.memberRow}>
                  <View style={[styles.avatarCircle, { backgroundColor: colors.accent.tagBg }]}>
                    <Text style={[styles.avatarText, { color: colors.accent.primary }]}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.textPrimary }]}>
                      {member.name}
                    </Text>
                    <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>
                      {member.email}
                    </Text>
                  </View>

                  <View style={styles.memberBadges}>
                    <Badge label={member.role} variant="accent" />
                    <Badge label={member.status} variant="success" />
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        </View>

        {/* Canonical RBAC Permissions Matrix */}
        <View style={styles.matrixSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.matrixTitleGroup}>
              <ShieldCheck size={18} color="#10B981" />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                RBAC Permissions Matrix
              </Text>
            </View>
          </View>

          <GlassCard style={styles.matrixCard}>
            {rbacMatrix.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.matrixRow,
                  idx < rbacMatrix.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.matrixActionText, { color: colors.textPrimary }]}>
                  {item.action}
                </Text>

                <View style={styles.matrixPermissions}>
                  <View style={styles.permColumn}>
                    <Text style={[styles.permColTitle, { color: colors.textMuted }]}>Admin</Text>
                    {item.admin ? (
                      <Check size={14} color="#10B981" />
                    ) : (
                      <X size={14} color={colors.textMuted} />
                    )}
                  </View>

                  <View style={styles.permColumn}>
                    <Text style={[styles.permColTitle, { color: colors.textMuted }]}>Writer</Text>
                    {item.strategist ? (
                      <Check size={14} color="#10B981" />
                    ) : (
                      <X size={14} color={colors.textMuted} />
                    )}
                  </View>

                  <View style={styles.permColumn}>
                    <Text style={[styles.permColTitle, { color: colors.textMuted }]}>Audit</Text>
                    {item.compliance ? (
                      <Check size={14} color="#10B981" />
                    ) : (
                      <X size={14} color={colors.textMuted} />
                    )}
                  </View>

                  <View style={styles.permColumn}>
                    <Text style={[styles.permColTitle, { color: colors.textMuted }]}>Client</Text>
                    {item.client ? (
                      <Check size={14} color="#10B981" />
                    ) : (
                      <X size={14} color={colors.textMuted} />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </GlassCard>
        </View>
      </ScrollView>

      {/* Invite Member Modal */}
      <Modal visible={showInviteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Invite Team Member
              </Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                Full Name
              </Text>
              <TextInput
                value={inviteName}
                onChangeText={setInviteName}
                placeholder="e.g. Jane Doe"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                Email Address
              </Text>
              <TextInput
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="jane@agency.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                Assigned Role
              </Text>
              <View style={styles.rolePickerRow}>
                {[
                  { id: 'Writer', label: 'Writer' },
                  { id: 'SEOSpecialist', label: 'SEO' },
                  { id: 'Compliance', label: 'Compliance' },
                  { id: 'ClientReviewer', label: 'Client' },
                  { id: 'AgencyAdmin', label: 'Admin' },
                ].map((r) => {
                  const selected = inviteRole === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() => setInviteRole(r.id as any)}
                      style={[
                        styles.rolePickerChip,
                        {
                          backgroundColor: selected ? colors.accent.primary : 'transparent',
                          borderColor: selected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rolePickerText,
                          { color: selected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowInviteModal(false)}
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleInviteSubmit}
                style={[styles.modalSubmitBtn, { backgroundColor: colors.accent.primary }]}
              >
                <Plus size={14} color="#FFFFFF" />
                <Text style={styles.modalSubmitText}>Send Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 16,
  },
  governanceCard: {
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  govTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  govTitleBox: {
    flex: 1,
  },
  govTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  govSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  govDesc: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  govActionRow: {
    marginTop: 4,
  },
  inviteBtn: {
    paddingVertical: 10,
  },
  roleFilterSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  roleScroll: {
    flexDirection: 'row',
  },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
  },
  roleChipText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  membersSection: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  memberList: {
    gap: 8,
  },
  memberCard: {
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
  },
  memberEmail: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  memberBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  matrixSection: {
    gap: 10,
  },
  matrixTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matrixCard: {
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  matrixRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  matrixActionText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    flex: 1,
  },
  matrixPermissions: {
    flexDirection: 'row',
    gap: 10,
  },
  permColumn: {
    alignItems: 'center',
    gap: 4,
    minWidth: 34,
  },
  permColTitle: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
  },
  rolePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rolePickerChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  rolePickerText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
  },
  modalSubmitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
});
