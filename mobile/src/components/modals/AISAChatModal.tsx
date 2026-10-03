import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, RotateCcw, Dna, PenTool, CheckCircle2, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { chatApi } from '../../api/chatApi';
import { ChatMessage } from '../../types';
import { cleanText } from '../../utils/formatters';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

const QUICK_CHIPS = [
  { id: '1', label: 'Brand DNA Summary', prompt: 'Summarize Brand DNA and voice guidelines', icon: Dna },
  { id: '2', label: 'LinkedIn Hooks', prompt: 'Generate 3 high-converting LinkedIn post hooks', icon: PenTool },
  { id: '3', label: 'Claims Audit', prompt: 'Audit our messaging against restricted claims', icon: CheckCircle2 },
  { id: '4', label: 'Ad Copy Ideas', prompt: 'Generate 3 high-CTR advertising headlines', icon: Sparkles },
];

export const AISAChatModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isAISAChatOpen, setIsAISAChatOpen, activeWorkspace } = useWorkspace();
  const { user } = useAuth();

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : insets.top;
  const topPadding = Math.max(insets.top, statusBarHeight);
  const bottomPadding = Math.max(insets.bottom, 12);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am AI Ads™ Copilot, your strategic advertising and content intelligence assistant. I am connected to ${activeWorkspace?.brandName || 'your brand'} memory.\n\nAsk me to generate high-converting ad copy, social posts, strategic briefs, or analyze campaigns.`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, loading]);

  if (!isAISAChatOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || loading) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const history = messages.slice(-8).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      content: m.text,
    }));
    history.push({ role: 'user', content: textToSend.trim() });

    try {
      const response = await chatApi.sendMessage({
        message: textToSend.trim(),
        sessionId,
        history,
        workspaceId: activeWorkspace?._id || activeWorkspace?.id,
        userEmail: user?.email,
        userName: user?.name,
        brandContext: activeWorkspace?.brandName
          ? `Brand: ${activeWorkspace.brandName}, Industry: ${activeWorkspace.industryCategory}, Mission: ${activeWorkspace.missionStatement}`
          : undefined,
      });

      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      const botReply = response.reply || response.response || 'No response received.';
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: `⚠️ Connection Error: ${err.message || 'Unable to communicate with AI model.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'reset',
        sender: 'assistant',
        text: `Chat reset. Re-anchored to ${activeWorkspace?.brandName || 'your brand'} memory. What would you like to build?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSessionId(null);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Image
              source={require('../../../assets/aisa_brain_logo_hd.png')}
              style={styles.avatarImg}
              resizeMode="contain"
            />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.accent.primary }]
              : [
                  styles.assistantBubble,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    borderColor: colors.border,
                  },
                ],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            {cleanText(item.text)}
          </Text>
          <Text
            style={[
              styles.timeText,
              { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textMuted },
            ]}
          >
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={isAISAChatOpen}
      animationType="slide"
      onRequestClose={() => setIsAISAChatOpen(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.headerBackground,
              borderBottomColor: colors.border,
              paddingTop: topPadding,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Image
              source={require('../../../assets/aisa_brain_logo_hd.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                AI Ads™ Copilot
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.accent.primary }]}>
                ● Anchored to {activeWorkspace?.brandName || 'Brand DNA'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleReset} style={styles.iconBtn}>
              <RotateCcw size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsAISAChatOpen(false)}
              style={styles.iconBtn}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action Chips */}
        <View style={[styles.chipsContainer, { borderBottomColor: colors.border }]}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={QUICK_CHIPS}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.chipsScroll}
            renderItem={({ item }) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  onPress={() => handleSend(item.prompt)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Icon size={13} color={colors.accent.primary} />
                  <Text style={[styles.chipText, { color: colors.textPrimary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={styles.typingIndicator}>
                <ActivityIndicator color={colors.accent.primary} size="small" />
                <Text style={[styles.typingText, { color: colors.textMuted }]}>
                  AI Ads™ is thinking...
                </Text>
              </View>
            ) : null
          }
        />

        {/* Input Bar */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.headerBackground,
              borderTopColor: colors.border,
              paddingBottom: bottomPadding,
            },
          ]}
        >
          <TextInput
            placeholder="Ask AI Ads Copilot anything..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? colors.inputBackground : '#F8FAFC',
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
          />

          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={loading || !inputText.trim()}
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() && !loading ? colors.accent.primary : colors.border,
              },
            ]}
          >
            <Send size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  chipsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarImg: {
    width: 26,
    height: 26,
  },
  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.body,
  },
  timeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginLeft: 36,
  },
  typingText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    maxHeight: 90,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
