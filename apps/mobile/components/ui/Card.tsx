import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, shadows, spacing } from "@/theme";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Card({
  children,
  title,
  subtitle,
  action,
  padded = true,
  style,
}: CardProps) {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {hasHeader ? (
        <View style={[styles.header, !padded && styles.headerUnpadded]}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{t(title)}</Text> : null}
            {subtitle ? (
              <Text style={styles.subtitle}>{t(subtitle)}</Text>
            ) : null}
          </View>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.card,
  },
  padded: {
    padding: spacing.lg - 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerUnpadded: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.lg - 4,
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
