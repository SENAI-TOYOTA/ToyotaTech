import { colors, fonts, spacing } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

interface VehicleFallbackProps {
  model?: string;
  version?: string;
  color?: string;
  chassi?: string;
  variant?: "hero" | "card";
}

export default function VehicleFallback({
  model,
  version,
  color,
  chassi,
  variant = "hero",
}: VehicleFallbackProps) {
  const displayModel = model ?? "Seu Toyota";
  const specs =
    version && color
      ? `${version} • ${color}`
      : (version ?? color ?? "Dados do veiculo em preparacao");

  return (
    <View style={variant === "hero" ? styles.hero : styles.card}>
      <Text style={styles.eyebrow}>VEICULO VINCULADO</Text>
      <Text style={variant === "hero" ? styles.modelHero : styles.modelCard}>
        {displayModel}
      </Text>
      <Text style={variant === "hero" ? styles.specsHero : styles.specsCard}>
        {specs}
      </Text>
      {variant === "hero" && chassi ? (
        <Text style={styles.chassi}>Chassi {chassi}</Text>
      ) : null}
      <Text style={variant === "hero" ? styles.noteHero : styles.noteCard}>
        Imagem ilustrativa indisponivel
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    padding: spacing.lg,
    justifyContent: "flex-end",
  },
  card: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    padding: spacing.md,
    justifyContent: "center",
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 1,
  },
  modelHero: {
    marginTop: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 36,
    color: colors.black,
  },
  modelCard: {
    marginTop: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 30,
    color: colors.black,
  },
  specsHero: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.textSecondary,
  },
  specsCard: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
  },
  chassi: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.black,
  },
  noteHero: {
    marginTop: spacing.lg,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.black,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  noteCard: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
