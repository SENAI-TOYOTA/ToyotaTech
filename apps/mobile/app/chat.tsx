import { useRouter } from "expo-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatBubble, { ChatTypingBubble } from "@/components/ChatBubble";
import ChatComposer from "@/components/ChatComposer";
import ChatMascot from "@/components/ChatMascot";
import InteractivePressable from "@/components/ui/InteractivePressable";
import Screen from "@/components/ui/Screen";
import { useAuth } from "@/contexts/AuthContext";
import { useGarage } from "@/hooks/useGarage";
import {
  borders,
  colors,
  fontSize,
  fonts,
  layout,
  radii,
  spacing,
  touch,
} from "@/theme";
import type { ChatAction, ChatMessage, ChatSuggestion } from "@/utils/chat";
import {
  buildChatContext,
  buildChatWelcome,
  chatReplyDelay,
  formatChatTime,
  resolveChatReply,
} from "@/utils/chat";

const headerMascotSize = spacing.xxl + spacing.md;
const welcomeMascotSize = spacing.xxl + spacing.xl;
const statusDotSize = spacing.xs + 2;
const suggestionIconSize = fontSize.md;
const suggestionStagger = 70;

interface ChatSuggestionButtonProps {
  suggestion: ChatSuggestion;
  index: number;
  onPick: (prompt: string) => void;
}

function ChatSuggestionButton({
  suggestion,
  index,
  onPick,
}: ChatSuggestionButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * suggestionStagger).duration(320)}
    >
      <InteractivePressable
        onPress={() => onPick(suggestion.prompt)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        accessibilityRole="button"
        accessibilityLabel={suggestion.label}
        style={[styles.suggestion, hovered && styles.suggestionHover]}
      >
        <Text style={styles.suggestionText}>{suggestion.label}</Text>
        <ArrowUpRight
          size={suggestionIconSize}
          strokeWidth={borders.strong}
          color={colors.primary}
        />
      </InteractivePressable>
    </Animated.View>
  );
}

interface ChatWelcomeProps {
  title: string;
  subtitle: string;
  suggestions: ChatSuggestion[];
  onPick: (prompt: string) => void;
}

function ChatWelcome({
  title,
  subtitle,
  suggestions,
  onPick,
}: ChatWelcomeProps) {
  return (
    <View style={styles.welcome}>
      <Animated.View entering={FadeInDown.duration(320)}>
        <ChatMascot size={welcomeMascotSize} mood="happy" />
      </Animated.View>
      <Animated.Text
        entering={FadeInDown.delay(60).duration(320)}
        style={styles.welcomeTitle}
      >
        {title}
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(100).duration(320)}
        style={styles.welcomeSubtitle}
      >
        {subtitle}
      </Animated.Text>
      <View style={styles.suggestions}>
        {suggestions.map((suggestion, index) => (
          <ChatSuggestionButton
            key={suggestion.id}
            suggestion={suggestion}
            index={index}
            onPick={onPick}
          />
        ))}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { garage, isLoading, error } = useGarage();
  const context = buildChatContext({ user, garage, isLoading, error });
  const welcome = buildChatWelcome(context);
  const insets = useSafeAreaInsets();
  const keyboardInset = useSharedValue(0);
  const keyboardStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardInset.value,
  }));
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageCount = useRef(0);
  const contextRef = useRef(context);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [composerHeight, setComposerHeight] = useState(0);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    return () => {
      if (replyTimer.current) {
        clearTimeout(replyTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const show = Keyboard.addListener(showEvent, (event) => {
      const inset =
        Math.max(event.endCoordinates.height - insets.bottom, 0) + spacing.xs;

      setIsKeyboardOpen(true);
      keyboardInset.value =
        Platform.OS === "ios"
          ? withTiming(inset, { duration: event.duration || 250 })
          : inset;
    });

    const hide = Keyboard.addListener(hideEvent, (event) => {
      setIsKeyboardOpen(false);
      keyboardInset.value =
        Platform.OS === "ios"
          ? withTiming(0, { duration: event.duration || 200 })
          : 0;
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [insets.bottom, keyboardInset]);

  const scrollToEnd = () => {
    listRef.current?.scrollToEnd({ animated: true });
  };

  const appendMessage = (
    author: ChatMessage["author"],
    text: string,
    action?: ChatAction
  ) => {
    messageCount.current += 1;
    const message: ChatMessage = {
      id: `chat-${messageCount.current}`,
      author,
      text,
      time: formatChatTime(new Date()),
      action,
    };

    setMessages((current) => [...current, message]);
  };

  const sendMessage = (value: string) => {
    const text = value.trim();

    if (!text) {
      return;
    }

    appendMessage("user", text);
    setIsTyping(true);

    if (replyTimer.current) {
      clearTimeout(replyTimer.current);
    }

    replyTimer.current = setTimeout(() => {
      const reply = resolveChatReply(
        text,
        contextRef.current,
        messageCount.current
      );
      appendMessage("bot", reply.text, reply.action);
      setIsTyping(false);
      replyTimer.current = null;
    }, chatReplyDelay);
  };

  const handleSend = () => {
    sendMessage(draft);
    setDraft("");
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home");
  };

  const header = (
    <Animated.View entering={FadeIn.duration(240)} style={styles.header}>
      <InteractivePressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        style={styles.backButton}
      >
        <ArrowLeft
          size={fontSize.lg}
          strokeWidth={borders.strong}
          color={colors.black}
        />
      </InteractivePressable>
      <ChatMascot size={headerMascotSize} mood={isTyping ? "typing" : "idle"} />
      <View style={styles.headerIdentity}>
        <Text style={styles.headerTitle}>Techy</Text>
        <View style={styles.headerStatus}>
          <View style={styles.statusDot} />
          <Text style={styles.headerSubtitle}>
            {isTyping ? "Digitando..." : "Assistente Toyota"}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <Screen
      scroll={false}
      edges={["top", "bottom"]}
      contentStyle={styles.screenContent}
    >
      <Animated.View style={[styles.keyboardArea, keyboardStyle]}>
        {header}
        <View style={styles.body}>
          <FlatList
            ref={listRef}
            data={messages}
            style={styles.list}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ChatBubble
                message={item}
                showAvatar={
                  item.author === "bot" && messages[index - 1]?.author !== "bot"
                }
                onAction={(action) => router.push(action.href)}
              />
            )}
            ListHeaderComponent={
              messages.length === 0 ? (
                <ChatWelcome
                  title={welcome.title}
                  subtitle={welcome.subtitle}
                  suggestions={welcome.suggestions}
                  onPick={sendMessage}
                />
              ) : undefined
            }
            ListFooterComponent={isTyping ? <ChatTypingBubble /> : undefined}
            contentContainerStyle={[
              styles.messages,
              messages.length === 0 && styles.messagesEmpty,
              { paddingBottom: composerHeight + spacing.md },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
            onLayout={scrollToEnd}
          />
          <View
            style={styles.composerOverlay}
            onLayout={(event) =>
              setComposerHeight(event.nativeEvent.layout.height)
            }
          >
            <ChatComposer
              value={draft}
              canSend={draft.trim().length > 0}
              keyboardOpen={isKeyboardOpen}
              onChangeText={setDraft}
              onSend={handleSend}
            />
          </View>
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  keyboardArea: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    minWidth: touch.minTarget,
    minHeight: touch.minTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIdentity: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.black,
  },
  headerStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusDot: {
    width: statusDotSize,
    height: statusDotSize,
    borderRadius: statusDotSize / 2,
    backgroundColor: colors.primary,
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  messages: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  list: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  composerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  messagesEmpty: {
    flexGrow: 1,
  },
  welcome: {
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  welcomeTitle: {
    marginTop: spacing.sm,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.black,
  },
  welcomeSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.lg,
    color: colors.textSecondary,
  },
  suggestions: {
    width: "100%",
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  suggestion: {
    minHeight: touch.minTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: borders.thin,
    borderColor: colors.black,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
  },
  suggestionHover: {
    backgroundColor: colors.grayLight,
  },
  suggestionText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.black,
  },
});
