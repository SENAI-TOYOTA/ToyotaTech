import {
  BatteryWarning,
  Car,
  CircleDot,
  KeyRound,
  LucideIcon,
  Phone,
  Truck,
} from "lucide-react-native";
import { Linking, StyleSheet, Text, View } from "react-native";

import BackLink from "@/components/ui/BackLink";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import { roadsidePhone } from "@/constants/aftersales";
import { useGarage } from "@/hooks/useGarage";
import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

const coveredServices: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Truck, title: "Towing", text: "To the nearest Toyota dealership." },
  {
    icon: CircleDot,
    title: "Flat tire",
    text: "Spare tire replacement on site.",
  },
  { icon: BatteryWarning, title: "Battery", text: "Jump start and diagnosis." },
  { icon: KeyRound, title: "Locksmith", text: "Keys locked inside the car." },
  {
    icon: Car,
    title: "Taxi or rental",
    text: "Transport when repair takes long.",
  },
];

const steps = [
  "Stay in a safe place and turn on the hazard lights.",
  "Call the 24h number and inform your chassis number.",
  "Share your location and wait for the service provider.",
];

function callRoadside() {
  void Linking.openURL(`tel:${roadsidePhone.replace(/\s/g, "")}`);
}

export default function RoadsideScreen() {
  const { garage } = useGarage();

  return (
    <Screen maxWidth={860}>
      <View style={styles.header}>
        <BackLink fallback="/services" />
        <ScreenSectionHeader
          title="Roadside assistance"
          subtitle="Available 24 hours a day, 7 days a week, anywhere in Brazil."
        />
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>{t("24H TOYOTA ASSISTANCE")}</Text>
        <Text style={styles.heroPhone}>{roadsidePhone}</Text>
        <Text style={styles.heroText}>
          {t("Have your chassis number ready: {chassis}", {
            chassis: garage?.vehicle.chassi ?? "-",
          })}
        </Text>
        <Button
          title="Call now"
          iconPosition="left"
          icon={<Phone size={18} strokeWidth={2.2} color={colors.white} />}
          onPress={callRoadside}
          style={styles.heroButton}
        />
      </View>

      <Card title="What is covered">
        <View style={styles.grid}>
          {coveredServices.map(({ icon: Icon, title, text }) => (
            <View key={title} style={styles.service}>
              <View style={styles.serviceIcon}>
                <Icon size={20} strokeWidth={1.8} color={colors.primary} />
              </View>
              <Text style={styles.serviceTitle}>{t(title)}</Text>
              <Text style={styles.serviceText}>{t(text)}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card title="What to do">
        {steps.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{t(step)}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md - 4,
  },
  hero: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
  },
  heroEyebrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1.4,
    color: colors.primary,
  },
  heroPhone: {
    marginTop: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: fontSize.display,
    color: colors.white,
  },
  heroText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textInverseMuted,
  },
  heroButton: {
    marginTop: spacing.lg - 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md - 4,
  },
  service: {
    flexGrow: 1,
    flexBasis: 140,
    padding: spacing.md - 2,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTitle: {
    marginTop: spacing.sm + 2,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md + 1,
    color: colors.textPrimary,
  },
  serviceText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md - 4,
    marginBottom: spacing.md - 4,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
