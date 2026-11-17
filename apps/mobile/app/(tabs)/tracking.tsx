import { useRouter } from "expo-router";
import { ArrowLeft, Check, CloudOff } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import VehicleFallback from "@/components/ui/VehicleFallback";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/i18n";
import { fetchTrackingStatus } from "@/services/tracking";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";
import { TrackingInfo, TrackingStep } from "@/types/tracking";
import { canUseCorollaAltisImage } from "@/utils/vehicle";

const mainCarImage = require("@/assets/images/corolla-main.png");

function BackLink() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.canGoBack() ? router.back() : router.replace("/home")
      }
      accessibilityRole="button"
      accessibilityLabel={t("Go back")}
      hitSlop={8}
      style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
    >
      <ArrowLeft size={18} strokeWidth={2} color={colors.textSecondary} />
      <Text style={styles.backText}>{t("Back")}</Text>
    </Pressable>
  );
}

function VehicleSummary({ data }: { data: TrackingInfo }) {
  return (
    <Card>
      <View style={styles.vehicleMedia}>
        {canUseCorollaAltisImage(data.model) ? (
          <Image
            source={mainCarImage}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
        ) : (
          <VehicleFallback model={data.model} variant="card" />
        )}
      </View>
      <Text style={styles.vehicleModel}>{data.model}</Text>
      <Text style={styles.vehicleSpecs}>
        {[t(data.version), t(data.color)].filter(Boolean).join(" • ")}
      </Text>
      <View style={styles.specRow}>
        <Spec label="Year" value={data.year} />
        <Spec label="Engine" value={data.engine} />
      </View>
    </Card>
  );
}

function Spec({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.spec}>
      <Text style={styles.specLabel}>{t(label)}</Text>
      <Text style={styles.specValue}>{value || "-"}</Text>
    </View>
  );
}

function ProgressSummary({ steps }: { steps: TrackingStep[] }) {
  const completed = steps.filter((step) => step.status === "completed").length;
  const current = steps.find((step) => step.status === "current");
  const isDelivered = steps.length > 0 && completed === steps.length;
  const progress = steps.length
    ? (completed + (current ? 0.5 : 0)) / steps.length
    : 0;

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressEyebrow}>{t("CURRENT STAGE")}</Text>
        <Badge
          label={isDelivered ? "Delivered" : "In progress"}
          tone={isDelivered ? "success" : "primary"}
        />
      </View>
      <Text style={styles.progressTitle}>
        {isDelivered
          ? t("Your Toyota has been delivered")
          : t(current?.label ?? "Preparing your order")}
      </Text>
      <ProgressBar value={progress} tone="inverse" style={styles.progressBar} />
      <Text style={styles.progressCaption}>
        {t("{done} of {total} steps completed", {
          done: completed,
          total: steps.length,
        })}
      </Text>
    </View>
  );
}

function TimelineStep({
  step,
  isLast,
}: {
  step: TrackingStep;
  isLast: boolean;
}) {
  const isCompleted = step.status === "completed";
  const isCurrent = step.status === "current";

  return (
    <View style={styles.stepWrapper}>
      <View style={styles.indicatorColumn}>
        <View
          style={[
            styles.indicator,
            isCompleted && styles.indicatorCompleted,
            isCurrent && styles.indicatorCurrent,
          ]}
        >
          {isCompleted ? (
            <Check size={14} color={colors.white} strokeWidth={3} />
          ) : null}
          {isCurrent ? <View style={styles.innerDot} /> : null}
        </View>
        {!isLast ? (
          <View
            style={[styles.connector, isCompleted && styles.connectorDone]}
          />
        ) : null}
      </View>

      <View style={[styles.stepContent, isLast && styles.stepContentLast]}>
        <View style={styles.stepTitleRow}>
          <Text
            style={[
              styles.stepLabel,
              isCompleted && styles.stepLabelCompleted,
              isCurrent && styles.stepLabelCurrent,
            ]}
          >
            {t(step.label)}
          </Text>
          {isCurrent ? <Badge label="Now" tone="primary" /> : null}
        </View>
        <Text style={styles.stepDate}>
          {t(step.date ?? (isCompleted ? "Completed" : "Pending"))}
        </Text>
      </View>
    </View>
  );
}

export default function TrackingScreen() {
  const router = useRouter();
  const isWide = useIsWide();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<TrackingInfo | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchTrackingStatus(token);
      setTrackingData(data);
    } catch (error) {
      console.warn("Failed to fetch tracking data", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!trackingData) {
    return (
      <Screen maxWidth={560}>
        <BackLink />
        <Card>
          <EmptyState
            icon={CloudOff}
            title="We could not load your order status"
            description="Check your connection and try again in a moment."
            action={
              <View style={styles.errorActions}>
                <Button title="Try again" size="md" onPress={loadData} />
                <Button
                  title="Back to home"
                  variant="ghost"
                  size="md"
                  onPress={() => router.replace("/home")}
                />
              </View>
            }
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headerBlock}>
        <BackLink />
        <ScreenSectionHeader
          title="Order status"
          subtitle="Follow your Toyota from the factory to your garage."
        />
      </View>

      <View style={[styles.columns, isWide && styles.columnsWide]}>
        <View style={[styles.sideColumn, isWide && styles.sideColumnWide]}>
          <VehicleSummary data={trackingData} />
        </View>
        <View style={[styles.mainColumn, isWide && styles.mainColumnWide]}>
          <ProgressSummary steps={trackingData.steps} />
          <Card title="Timeline">
            {trackingData.steps.map((step, index) => (
              <TimelineStep
                key={step.id}
                step={step}
                isLast={index === trackingData.steps.length - 1}
              />
            ))}
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  headerBlock: {
    gap: spacing.md - 4,
  },
  backLink: {
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
  backText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  errorActions: {
    gap: spacing.sm,
  },
  columns: {
    gap: spacing.lg - 4,
  },
  columnsWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  sideColumn: {
    width: "100%",
  },
  sideColumnWide: {
    width: 380,
  },
  mainColumn: {
    gap: spacing.lg - 4,
  },
  mainColumnWide: {
    flex: 1,
  },
  vehicleMedia: {
    height: 180,
    marginHorizontal: -(spacing.lg - 4),
    marginTop: -(spacing.lg - 4),
    marginBottom: spacing.md,
    backgroundColor: colors.ink,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
  },
  vehicleModel: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  vehicleSpecs: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  specRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  spec: {
    flex: 1,
    padding: spacing.md - 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  specLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    letterSpacing: 0.6,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  specValue: {
    marginTop: 2,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  progressCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  progressEyebrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1.4,
    color: "rgba(255, 255, 255, 0.6)",
  },
  progressTitle: {
    marginTop: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: fontSize.xl + 2,
    lineHeight: 30,
    color: colors.white,
  },
  progressBar: {
    marginTop: spacing.lg - 4,
  },
  progressCaption: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textInverseMuted,
  },
  stepWrapper: {
    flexDirection: "row",
  },
  indicatorColumn: {
    alignItems: "center",
    width: 28,
  },
  indicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  indicatorCurrent: {
    borderColor: colors.primary,
    boxShadow: "0px 0px 0px 4px rgba(235, 10, 30, 0.14)",
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: colors.grayLight,
    marginVertical: 4,
  },
  connectorDone: {
    backgroundColor: colors.success,
  },
  stepContent: {
    flex: 1,
    paddingLeft: spacing.md - 2,
    paddingBottom: spacing.lg,
  },
  stepContentLast: {
    paddingBottom: 0,
  },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    minHeight: 26,
  },
  stepLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md + 1,
    color: colors.textMuted,
  },
  stepLabelCompleted: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  stepLabelCurrent: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  stepDate: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
