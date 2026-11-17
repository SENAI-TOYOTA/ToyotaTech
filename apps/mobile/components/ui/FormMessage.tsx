import { AlertCircle, CheckCircle2, Info } from "lucide-react-native";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

type MessageTone = "error" | "success" | "info";

interface FormMessageProps {
  message?: string | null;
  tone?: MessageTone;
  style?: StyleProp<ViewStyle>;
}

const palette = {
  error: { background: colors.primarySoft, color: colors.primary },
  success: { background: colors.successSoft, color: colors.success },
  info: { background: colors.infoSoft, color: colors.info },
};

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export default function FormMessage({
  message,
  tone = "error",
  style,
}: FormMessageProps) {
  if (!message) {
    return null;
  }

  const Icon = icons[tone];
  const colorSet = palette[tone];

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        { backgroundColor: colorSet.background },
        style,
      ]}
    >
      <Icon size={18} strokeWidth={2} color={colorSet.color} />
      <Text style={[styles.text, { color: colorSet.color }]}>{t(message)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.sm + 2,
  },
  text: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
});
