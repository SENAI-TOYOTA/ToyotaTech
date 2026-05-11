import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, fonts, fontSize, spacing } from "@/constants/theme";

interface ScreenSectionHeaderProps {
  title: string;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenSectionHeader({
  title,
  subtitle,
  style,
}: ScreenSectionHeaderProps) {
  return (
    <View style={style}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl + spacing.xs,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs - 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
