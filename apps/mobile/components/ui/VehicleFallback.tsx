import { CarFront } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

interface VehicleFallbackProps {
  model?: string;
  variant?: "hero" | "card";
}

export default function VehicleFallback({
  model,
  variant = "hero",
}: VehicleFallbackProps) {
  const isHero = variant === "hero";

  return (
    <View style={[styles.container, isHero ? styles.hero : styles.card]}>
      <View style={[styles.iconRing, isHero && styles.iconRingHero]}>
        <CarFront
          size={isHero ? 44 : 36}
          strokeWidth={1.4}
          color={isHero ? colors.white : colors.textSecondary}
        />
      </View>
      <Text style={[styles.model, isHero && styles.modelHero]}>
        {model ?? t("Your Toyota")}
      </Text>
      <Text style={[styles.note, isHero && styles.noteHero]}>
        {t("Illustrative image unavailable")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  hero: {
    backgroundColor: colors.inkSoft,
  },
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRingHero: {
    width: 96,
    height: 96,
    borderColor: "rgba(255, 255, 255, 0.16)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  model: {
    marginTop: spacing.md - 4,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    textAlign: "center",
  },
  modelHero: {
    color: colors.white,
  },
  note: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  noteHero: {
    color: colors.textInverseMuted,
  },
});
