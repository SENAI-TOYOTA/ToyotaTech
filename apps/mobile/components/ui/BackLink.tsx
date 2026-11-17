import { Href, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, StyleSheet, Text } from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

export default function BackLink({
  fallback = "/home",
  label = "Back",
}: {
  fallback?: Href;
  label?: string;
}) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.canGoBack() ? router.back() : router.replace(fallback)
      }
      accessibilityRole="button"
      accessibilityLabel={t(label)}
      hitSlop={8}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <ArrowLeft size={18} strokeWidth={2} color={colors.textSecondary} />
      <Text style={styles.text}>{t(label)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingRight: spacing.sm,
    borderRadius: radius.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
