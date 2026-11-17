import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "info";

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}

const tones: Record<BadgeTone, { background: string; text: string }> = {
  neutral: { background: colors.surfaceMuted, text: colors.textSecondary },
  primary: { background: colors.primarySoft, text: colors.primary },
  success: { background: colors.successSoft, text: colors.success },
  warning: { background: colors.warningSoft, text: colors.warning },
  info: { background: colors.infoSoft, text: colors.info },
};

export default function Badge({ label, tone = "neutral", style }: BadgeProps) {
  const palette = tones[tone];

  return (
    <View
      style={[styles.badge, { backgroundColor: palette.background }, style]}
    >
      <View style={[styles.dot, { backgroundColor: palette.text }]} />
      <Text style={[styles.text, { color: palette.text }]} numberOfLines={1}>
        {t(label)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs + 1,
    letterSpacing: 0.3,
  },
});
