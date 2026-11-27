import ChatMascot from "@/components/ChatMascot";
import InteractivePressable from "@/components/ui/InteractivePressable";
import {
  borders,
  colors,
  fonts,
  fontSize,
  radii,
  spacing,
  touch,
} from "@/theme";
import type { ChatAction, ChatMessage } from "@/utils/chat";
import { ArrowUpRight } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface ChatBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
  onAction?: (action: ChatAction) => void;
}

const avatarSize = spacing.lg;
const typingDotSize = spacing.sm - 2;
const typingDotDelay = 150;
const typingDotDuration = 480;
const actionIconSize = fontSize.sm;

function ChatTypingDot({ index }: { index: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * typingDotDelay,
      withRepeat(withTiming(1, { duration: typingDotDuration }), -1, true)
    );

    return () => cancelAnimation(progress);
  }, [index, progress]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + progress.value * 0.75,
  }));

  return <Animated.View style={[styles.typingDot, dotStyle]} />;
}

export function ChatTypingBubble() {
  return (
    <Animated.View entering={FadeInDown.duration(200)} style={styles.row}>
      <View style={styles.avatarSlot}>
        <ChatMascot size={avatarSize} mood="typing" />
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Techy está digitando"
        accessibilityLiveRegion="polite"
        style={[styles.bubble, styles.botBubble, styles.typingBubble]}
      >
        <ChatTypingDot index={0} />
        <ChatTypingDot index={1} />
        <ChatTypingDot index={2} />
      </View>
    </Animated.View>
  );
}

export default function ChatBubble({
  message,
  showAvatar = false,
  onAction,
}: ChatBubbleProps) {
  const isUser = message.author === "user";
  const action = message.action;

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      style={[styles.row, isUser && styles.userRow]}
    >
      {isUser ? null : (
        <View style={styles.avatarSlot}>
          {showAvatar ? <ChatMascot size={avatarSize} mood="idle" /> : null}
        </View>
      )}
      <View
        style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
      >
        <Text style={[styles.text, isUser && styles.userText]}>
          {message.text}
        </Text>
        {action ? (
          <InteractivePressable
            onPress={() => onAction?.(action)}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>{action.label}</Text>
            <ArrowUpRight
              size={actionIconSize}
              strokeWidth={borders.strong}
              color={colors.primary}
            />
          </InteractivePressable>
        ) : null}
        <Text style={[styles.time, isUser && styles.userTime]}>
          {message.time}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  userRow: {
    flexDirection: "row-reverse",
  },
  avatarSlot: {
    width: avatarSize,
    height: avatarSize,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    maxWidth: "80%",
    borderWidth: borders.thin,
    borderColor: colors.black,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  botBubble: {
    backgroundColor: colors.white,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.lg + 2,
    color: colors.textPrimary,
  },
  userText: {
    color: colors.white,
  },
  time: {
    marginTop: spacing.xs,
    alignSelf: "flex-end",
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  userTime: {
    color: colors.white,
    opacity: 0.8,
  },
  actionButton: {
    minHeight: touch.minTarget,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: borders.thin,
    borderTopColor: colors.black,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  actionText: {
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.black,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    minHeight: fontSize.lg + spacing.md,
  },
  typingDot: {
    width: typingDotSize,
    height: typingDotSize,
    borderRadius: typingDotSize / 2,
    backgroundColor: colors.textSecondary,
  },
});
