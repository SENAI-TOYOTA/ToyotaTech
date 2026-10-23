import { useRouter } from "expo-router";
import { ArrowRight, FileText } from "lucide-react-native";
import { Image, StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import { useIsWide } from "@/components/ui/Screen";
import VehicleFallback from "@/components/ui/VehicleFallback";
import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, shadows, spacing } from "@/theme";
import { GarageData } from "@/types/garage";
import { canUseCorollaAltisImage } from "@/utils/vehicle";

const mainCarImage = require("@/assets/images/corolla-main.png");

interface VehicleHeroProps {
  garage: GarageData | null;
  isLoading: boolean;
}

function joinParts(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" • ");
}

function HeroSkeleton({ isWide }: { isWide: boolean }) {
  return (
    <View style={[styles.card, isWide && styles.cardWide]}>
      <View style={[styles.info, isWide && styles.infoWide]}>
        <View style={[styles.skeleton, styles.skeletonShort]} />
        <View style={[styles.skeleton, styles.skeletonTitle]} />
        <View style={[styles.skeleton, styles.skeletonLine]} />
        <View style={[styles.skeleton, styles.skeletonButton]} />
      </View>
      <View style={[styles.media, isWide && styles.mediaWide]} />
    </View>
  );
}

export default function VehicleHero({ garage, isLoading }: VehicleHeroProps) {
  const router = useRouter();
  const isWide = useIsWide();

  if (isLoading && !garage) {
    return <HeroSkeleton isWide={isWide} />;
  }

  const vehicle = garage?.vehicle;
  const model = vehicle?.model ?? t("Your Toyota");
  const specs = joinParts([t(vehicle?.version), t(vehicle?.color)]);
  const details = joinParts([vehicle?.year, vehicle?.engine]);
  const showImage = canUseCorollaAltisImage(vehicle?.model);

  return (
    <View style={[styles.card, isWide && styles.cardWide]}>
      <View style={[styles.media, isWide && styles.mediaWide]}>
        {showImage ? (
          <Image
            source={mainCarImage}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={model}
          />
        ) : (
          <VehicleFallback model={vehicle?.model} variant="hero" />
        )}
      </View>

      <View style={[styles.info, isWide && styles.infoWide]}>
        <Text style={styles.eyebrow}>{t("YOUR VEHICLE")}</Text>
        <Text style={styles.model}>{model}</Text>
        {specs ? <Text style={styles.specs}>{specs}</Text> : null}

        <MetaGrid garage={garage} details={details} />

        {!garage ? (
          <Text style={styles.placeholder}>
            {t(
              "Your purchase is being linked to your account. Vehicle details will appear here soon."
            )}
          </Text>
        ) : null}

        <View style={[styles.actions, isWide && styles.actionsWide]}>
          <Button
            title="Track order"
            icon={
              <ArrowRight size={20} strokeWidth={2.4} color={colors.white} />
            }
            onPress={() => router.push("/tracking")}
            style={isWide ? styles.actionWide : undefined}
          />
          <Button
            title="Documents"
            variant="inverse"
            iconPosition="left"
            icon={<FileText size={18} strokeWidth={2} color={colors.white} />}
            onPress={() => router.navigate("/vehicle-management")}
            style={isWide ? styles.actionWide : undefined}
          />
        </View>
      </View>
    </View>
  );
}

function MetaGrid({
  garage,
  details,
}: {
  garage: GarageData | null;
  details: string;
}) {
  const items = [
    { label: "Model year", value: details },
    { label: "Chassis", value: garage?.vehicle?.chassi },
    { label: "Order status", value: garage?.order?.status, highlight: true },
    { label: "Dealership", value: garage?.order?.dealership },
  ].filter((item) => Boolean(item.value));

  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.metaGrid}>
      {items.map((item) => (
        <Meta
          key={item.label}
          label={item.label}
          value={item.value ?? ""}
          highlight={item.highlight}
        />
      ))}
    </View>
  );
}

function Meta({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{t(label)}</Text>
      <View style={styles.metaValueRow}>
        {highlight ? <View style={styles.metaDot} /> : null}
        <Text style={styles.metaValue} numberOfLines={1}>
          {t(value)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.raised,
  },
  cardWide: {
    flexDirection: "row-reverse",
    minHeight: 380,
  },
  media: {
    height: 220,
    backgroundColor: colors.inkSoft,
  },
  mediaWide: {
    flex: 1.15,
    height: "auto",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    padding: spacing.lg,
  },
  infoWide: {
    flex: 1,
    padding: spacing.xl + 8,
    justifyContent: "center",
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1.6,
    color: colors.primary,
  },
  model: {
    marginTop: spacing.xs,
    fontFamily: fonts.bold,
    fontSize: fontSize.display - 4,
    lineHeight: 40,
    color: colors.white,
  },
  specs: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.md + 1,
    color: colors.textInverseMuted,
  },
  metaGrid: {
    marginTop: spacing.lg - 4,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.md - 2,
    columnGap: spacing.lg,
  },
  meta: {
    minWidth: 130,
    flexGrow: 1,
    flexBasis: "40%",
  },
  metaLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    letterSpacing: 0.6,
    color: "rgba(255, 255, 255, 0.55)",
    textTransform: "uppercase",
  },
  metaValueRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#35C46F",
  },
  metaValue: {
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  placeholder: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    lineHeight: 21,
    color: colors.textInverseMuted,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm + 2,
  },
  actionsWide: {
    flexDirection: "row",
  },
  actionWide: {
    width: "auto",
    flex: 1,
  },
  skeleton: {
    borderRadius: radius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  skeletonShort: {
    width: 96,
    height: 12,
  },
  skeletonTitle: {
    marginTop: spacing.md - 4,
    width: "70%",
    height: 34,
  },
  skeletonLine: {
    marginTop: spacing.sm,
    width: "50%",
    height: 16,
  },
  skeletonButton: {
    marginTop: spacing.xl,
    width: "100%",
    height: 54,
    borderRadius: radius.md,
  },
});
