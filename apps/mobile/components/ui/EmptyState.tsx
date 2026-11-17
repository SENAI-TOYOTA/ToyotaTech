import { LucideIcon } from "lucide-react-native";
import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "neutral" | "success";
  style?: StyleProp<ViewStyle>;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  style,
}: EmptyStateProps) {
  const isSuccess = tone === "success";

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconBox, isSuccess && styles.iconBoxSuccess]}>
        <Icon
          size={24}
          strokeWidth={1.8}
          color={isSuccess ? colors.success : colors.textSecondary}
        />
      </View>
      <Text style={styles.title}>{t(title)}</Text>
      {description ? (
        <Text style={styles.description}>{t(description)}</Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSuccess: {
    backgroundColor: colors.successSoft,
  },
  title: {
    marginTop: spacing.md - 4,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md + 1,
    color: colors.textPrimary,
    textAlign: "center",
  },
  description: {
    marginTop: 4,
    maxWidth: 320,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
  action: {
    marginTop: spacing.md,
    width: "100%",
    maxWidth: 240,
  },
});
