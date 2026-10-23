import { useRouter } from "expo-router";
import { Bot, SendHorizontal } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useGarage } from "@/hooks/useGarage";
import { useServiceBookings } from "@/hooks/useServiceBooking";
import { t } from "@/i18n";
import {
  AssistantReply,
  getAssistantReply,
  getWelcomeMessage,
  suggestedQuestions,
} from "@/services/assistant";
import { colors, fonts, fontSize, layout, radius, spacing } from "@/theme";

interface ChatMessage extends AssistantReply {
  id: string;
  author: "user" | "bot";
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const router = useRouter();
  const isUser = message.author === "user";

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser ? (
        <View style={styles.botAvatar}>
          <Bot size={16} strokeWidth={2} color={colors.white} />
        </View>
      ) : null}
      <View style={styles.bubbleColumn}>
        <View
          style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
        >
          <Text style={[styles.bubbleText, isUser && styles.userText]}>
            {message.author === "user" ? message.text : t(message.text)}
          </Text>
        </View>
        {message.actions?.length ? (
          <View style={styles.actions}>
            {message.actions.map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                onPress={() => router.push(action.route)}
                style={({ pressed }) => [
                  styles.actionChip,
                  pressed && styles.actionChipPressed,
                ]}
              >
                <Text style={styles.actionText}>{t(action.label)}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={styles.row}>
      <View style={styles.botAvatar}>
        <Bot size={16} strokeWidth={2} color={colors.white} />
      </View>
      <View style={[styles.bubble, styles.botBubble, styles.typing]}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

export default function AssistantScreen() {
  const { user } = useAuth();
  const { garage } = useGarage();
  const bookings = useServiceBookings();
  const displayName = user?.profile?.fullName || user?.name || "";
  const firstName = displayName.trim().split(/\s+/)[0] || t("there");
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "welcome", author: "bot", ...getWelcomeMessage(firstName) },
  ]);

  useEffect(() => {
    const timeout = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      50
    );
    return () => clearTimeout(timeout);
  }, [messages, isTyping]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || isTyping) {
      return;
    }
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      author: "user",
      text,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply = getAssistantReply(text, { firstName, garage, bookings });
      setMessages((current) => [
        ...current,
        { id: `b-${Date.now()}`, author: "bot", ...reply },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.titleBar}>
        <View style={styles.titleInner}>
          <View style={styles.titleAvatar}>
            <Bot size={22} strokeWidth={2} color={colors.white} />
          </View>
          <View>
            <Text style={styles.title}>{t("Toyota Assistant")}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{t("Online now")}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.thread}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping ? <TypingIndicator /> : null}
        </View>
      </ScrollView>

      <View style={styles.composerBar}>
        <View style={styles.composerInner}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestions}
            keyboardShouldPersistTaps="handled"
          >
            {suggestedQuestions.map((question) => (
              <Pressable
                key={question}
                onPress={() => send(t(question))}
                style={({ pressed }) => [
                  styles.suggestion,
                  pressed && styles.actionChipPressed,
                ]}
              >
                <Text style={styles.suggestionText}>{t(question)}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder={t("Type your question...")}
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("Send message")}
              onPress={() => send(input)}
              disabled={!input.trim() || isTyping}
              style={[
                styles.sendButton,
                (!input.trim() || isTyping) && styles.sendDisabled,
              ]}
            >
              <SendHorizontal size={20} strokeWidth={2} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleBar: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleInner: {
    width: "100%",
    maxWidth: 820,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md - 4,
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.md - 4,
  },
  titleAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  onlineText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  thread: {
    width: "100%",
    maxWidth: 820,
    paddingHorizontal: layout.gutter,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleColumn: {
    maxWidth: "80%",
    gap: spacing.sm,
  },
  bubble: {
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  botBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  userText: {
    color: colors.white,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionChip: {
    paddingHorizontal: spacing.md - 4,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  actionChipPressed: {
    backgroundColor: colors.primarySoft,
  },
  actionText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  typing: {
    flexDirection: "row",
    gap: 4,
    paddingVertical: spacing.md - 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  composerBar: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  composerInner: {
    width: "100%",
    maxWidth: 820,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm + 2,
  },
  suggestions: {
    gap: spacing.sm,
    paddingHorizontal: layout.gutter,
  },
  suggestion: {
    paddingHorizontal: spacing.md - 4,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: layout.gutter,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    backgroundColor: colors.borderStrong,
  },
});
