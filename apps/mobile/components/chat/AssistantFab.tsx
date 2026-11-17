import { usePathname, useRouter } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useIsWide } from "@/components/ui/Screen";
import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, shadows, spacing } from "@/theme";

export default function AssistantFab({
  bottomOffset,
}: {
  bottomOffset: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isWide = useIsWide();
  const [isHovered, setIsHovered] = useState(false);

  if (pathname === "/assistant") {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("Open Toyota Assistant")}
      onPress={() => router.push("/assistant")}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.fab,
        { bottom: bottomOffset },
        isWide && styles.fabWide,
        (isHovered || pressed) && styles.fabActive,
      ]}
    >
      <MessageCircle size={24} strokeWidth={2} color={colors.white} />
      {isWide ? (
        <Text style={styles.label}>{t("Ask the assistant")}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: spacing.lg - 4,
    height: 56,
    minWidth: 56,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.raised,
  },
  fabWide: {
    right: spacing.xl,
    paddingHorizontal: spacing.lg - 4,
  },
  fabActive: {
    backgroundColor: colors.primaryPressed,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.white,
  },
});
