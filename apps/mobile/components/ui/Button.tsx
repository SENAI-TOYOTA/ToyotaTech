import { useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "inverse";
type ButtonSize = "md" | "lg";

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

const surfaces: Record<
  ButtonVariant,
  { base: ViewStyle; hover: ViewStyle; pressed: ViewStyle; text: TextStyle }
> = {
  primary: {
    base: { backgroundColor: colors.primary, borderColor: colors.primary },
    hover: { backgroundColor: colors.primaryPressed },
    pressed: { backgroundColor: colors.primaryPressed },
    text: { color: colors.white },
  },
  secondary: {
    base: { backgroundColor: colors.ink, borderColor: colors.ink },
    hover: { backgroundColor: colors.inkSoft },
    pressed: { backgroundColor: colors.inkSoft },
    text: { color: colors.white },
  },
  outline: {
    base: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
    hover: { backgroundColor: colors.surfaceMuted },
    pressed: { backgroundColor: colors.grayLight },
    text: { color: colors.textPrimary },
  },
  ghost: {
    base: { backgroundColor: "transparent", borderColor: "transparent" },
    hover: { backgroundColor: colors.surfaceMuted },
    pressed: { backgroundColor: colors.grayLight },
    text: { color: colors.textPrimary },
  },
  danger: {
    base: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
    hover: { backgroundColor: colors.primarySoft },
    pressed: { backgroundColor: colors.primarySoft },
    text: { color: colors.primary },
  },
  inverse: {
    base: {
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      borderColor: "rgba(255, 255, 255, 0.32)",
    },
    hover: { backgroundColor: "rgba(255, 255, 255, 0.12)" },
    pressed: { backgroundColor: "rgba(255, 255, 255, 0.16)" },
    text: { color: colors.white },
  },
};

export default function Button({
  title,
  variant = "primary",
  size = "lg",
  icon,
  iconPosition = "right",
  style,
  textStyle,
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const surface = surfaces[variant];
  const isInactive = disabled || loading;
  const spinnerColor =
    variant === "primary" || variant === "secondary" || variant === "inverse"
      ? colors.white
      : colors.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(accessibilityLabel ?? title)}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.base,
        size === "lg" ? styles.sizeLg : styles.sizeMd,
        surface.base,
        isHovered && !isInactive && surface.hover,
        pressed && !isInactive && surface.pressed,
        pressed && !isInactive && styles.pressed,
        disabled && !loading && styles.disabled,
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          iconPosition === "left" && styles.contentReversed,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={spinnerColor} />
        ) : null}
        <Text
          numberOfLines={1}
          style={[
            styles.text,
            size === "lg" ? styles.textLg : styles.textMd,
            surface.text,
            disabled && !loading && styles.disabledText,
            textStyle,
          ]}
        >
          {t(title)}
        </Text>
        {icon && !loading ? <View style={styles.icon}>{icon}</View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  sizeLg: {
    minHeight: 54,
  },
  sizeMd: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    backgroundColor: colors.grayLight,
    borderColor: colors.grayLight,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minWidth: 0,
  },
  contentReversed: {
    flexDirection: "row-reverse",
  },
  text: {
    fontFamily: fonts.semiBold,
    flexShrink: 1,
    letterSpacing: 0.2,
  },
  textLg: {
    fontSize: fontSize.lg - 2,
  },
  textMd: {
    fontSize: fontSize.md,
  },
  disabledText: {
    color: colors.textMuted,
  },
  icon: {
    flexShrink: 0,
  },
});
