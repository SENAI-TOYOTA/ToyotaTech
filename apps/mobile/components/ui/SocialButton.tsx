import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

interface SocialButtonProps {
  icon: ImageSourcePropType;
  label: string;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  onPress?: () => void;
}

export default function SocialButton({
  icon,
  label,
  style,
  loading = false,
  onPress,
}: SocialButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDisabled = !onPress || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(label)}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.container,
        isHovered && styles.hovered,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textPrimary} />
      ) : (
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      )}
      <Text style={styles.label}>{t(label)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  hovered: {
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    backgroundColor: colors.grayLight,
  },
  icon: {
    width: 20,
    height: 20,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md + 1,
    color: colors.textPrimary,
  },
});
