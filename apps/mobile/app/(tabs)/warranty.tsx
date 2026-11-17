import { useRouter } from "expo-router";
import { CalendarCheck, ShieldCheck } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import BackLink from "@/components/ui/BackLink";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import {
  currentMileage,
  warrantyCoverages,
  warrantyStartDate,
} from "@/constants/aftersales";
import { useGarage } from "@/hooks/useGarage";
import { formatNumber, t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

function addYears(date: string, years: number) {
  const [day, month, year] = date.split("/");
  return `${day}/${month}/${Number(year) + years}`;
}

const conditions = [
  "Perform scheduled maintenance at authorized Toyota dealerships.",
  "Use genuine Toyota parts and recommended fluids.",
  "Keep your digital service history up to date.",
];

export default function WarrantyScreen() {
  const router = useRouter();
  const { garage } = useGarage();

  return (
    <Screen maxWidth={860}>
      <View style={styles.header}>
        <BackLink fallback="/services" />
        <ScreenSectionHeader
          title="Warranty"
          subtitle={t("Coverage for your {model}, valid from {date}.", {
            model: garage?.vehicle.model ?? "Toyota",
            date: warrantyStartDate,
          })}
        />
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <ShieldCheck size={28} strokeWidth={1.8} color={colors.white} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{t("Your warranty is active")}</Text>
          <Text style={styles.heroSubtitle}>
            {t("Chassis")} {garage?.vehicle.chassi ?? "-"} {"•"}{" "}
            {formatNumber(currentMileage)} km
          </Text>
        </View>
        <Badge label="Active" tone="success" />
      </View>

      <View style={styles.grid}>
        {warrantyCoverages.map((coverage) => (
          <Card key={coverage.id} style={styles.gridItem}>
            <Text style={styles.coverageYears}>
              {coverage.years}
              <Text style={styles.coverageUnit}> {t("years")}</Text>
            </Text>
            <Text style={styles.coverageTitle}>{t(coverage.title)}</Text>
            <Text style={styles.coverageText}>{t(coverage.description)}</Text>
            <ProgressBar value={0.02} tone="success" style={styles.progress} />
            <Text style={styles.coverageUntil}>
              {t("Valid until {date}", {
                date: addYears(warrantyStartDate, coverage.years),
              })}
              {coverage.mileage
                ? t(" or {km} km", { km: formatNumber(coverage.mileage) })
                : ""}
            </Text>
          </Card>
        ))}
      </View>

      <Card title="How to keep your warranty">
        {conditions.map((condition) => (
          <View key={condition} style={styles.condition}>
            <View style={styles.bullet} />
            <Text style={styles.conditionText}>{t(condition)}</Text>
          </View>
        ))}
        <Button
          title="Book scheduled maintenance"
          iconPosition="left"
          icon={
            <CalendarCheck size={18} strokeWidth={2} color={colors.white} />
          }
          onPress={() => router.push("/schedule-service")}
          style={styles.cta}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md - 4,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    color: colors.textInverseMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md - 4,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 220,
  },
  coverageYears: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl + 4,
    color: colors.textPrimary,
  },
  coverageUnit: {
    fontFamily: fonts.medium,
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  coverageTitle: {
    marginTop: spacing.xs,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg - 2,
    color: colors.textPrimary,
  },
  coverageText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  progress: {
    marginTop: spacing.md,
  },
  coverageUntil: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  condition: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md - 4,
    marginBottom: spacing.md - 4,
  },
  bullet: {
    marginTop: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  conditionText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  cta: {
    marginTop: spacing.sm,
  },
});
