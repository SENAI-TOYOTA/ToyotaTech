import { ChevronRight, LucideIcon } from "lucide-react-native";
import { ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

interface ListRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  iconTone?: "neutral" | "primary" | "success" | "warning";
  showDivider?: boolean;
}

const iconTones = {
  neutral: { background: colors.surfaceMuted, color: colors.textPrimary },
  primary: { background: colors.primarySoft, color: colors.primary },
  success: { background: colors.successSoft, color: colors.success },
  warning: { background: colors.warningSoft, color: colors.warning },
};

export default function ListRow({
  icon: Icon,
  title,
  subtitle,
  trailing,
  onPress,
  iconTone = "neutral",
  showDivider = false,
}: ListRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const tone = iconTones[iconTone];

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.row,
        showDivider && styles.divider,
        Boolean(onPress) && isHovered && styles.rowHovered,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: tone.background }]}>
        <Icon size={20} strokeWidth={1.8} color={tone.color} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={2}>
          {t(title)}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {t(subtitle)}
          </Text>
        ) : null}
      </View>
      {trailing}
      {onPress ? (
        <ChevronRight size={20} strokeWidth={1.8} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg - 4,
  },
  rowHovered: {
    backgroundColor: colors.surfaceMuted,
  },
  rowPressed: {
    backgroundColor: colors.grayLight,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md + 1,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 19,
    color: colors.textSecondary,
  },
});
