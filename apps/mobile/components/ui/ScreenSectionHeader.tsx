import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, spacing } from "@/theme";

interface ScreenSectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenSectionHeader({
  title,
  subtitle,
  eyebrow,
  action,
  style,
}: ScreenSectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.text}>
        {eyebrow ? <Text style={styles.eyebrow}>{t(eyebrow)}</Text> : null}
        <Text style={styles.title} accessibilityRole="header">
          {t(title)}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{t(subtitle)}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    marginBottom: spacing.xs,
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1.4,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl - 2,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.md + 1,
    lineHeight: 23,
    color: colors.textSecondary,
  },
});
