import {
  ArrowRight,
  Building2,
  CalendarClock,
  Minus,
  Plus,
  Receipt,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Wallet,
} from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { resolveCarColor } from "@/components/3d/CorollaModel";
import VehicleCanvas from "@/components/3d/VehicleCanvas";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import { useGarage } from "@/hooks/useGarage";
import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, shadows, spacing } from "@/theme";
import { GarageData, GarageFinancing } from "@/types/garage";

const TOTAL_VEHICLE_VALUE = 168900;
const MONTHLY_DISCOUNT_RATE = 0.011;
const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function parseCurrencyBRL(raw: string | undefined, fallback: number): number {
  if (!raw) {
    return fallback;
  }
  const digits = raw.replace(/[^\d,]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatCurrencyBRL(value: number): string {
  const rounded = Math.round(value);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${formatted},00`;
}

function formatPayoffDate(
  nextDueDate: string | undefined,
  remainingMonths: number
): string {
  if (remainingMonths <= 0) {
    return t("Immediate payoff");
  }
  let baseMonth = 5;
  let baseYear = 2026;
  if (nextDueDate) {
    const parts = nextDueDate.split("/");
    if (parts.length === 3) {
      const m = Number.parseInt(parts[1], 10);
      const y = Number.parseInt(parts[2], 10);
      if (Number.isFinite(m) && m >= 1 && m <= 12) {
        baseMonth = m - 1;
      }
      if (Number.isFinite(y) && y > 2000) {
        baseYear = y;
      }
    }
  }
  const totalMonths = baseMonth + remainingMonths - 1;
  const targetYear = baseYear + Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12;
  return `${MONTH_NAMES[targetMonth]}/${targetYear}`;
}

interface SimulationMetrics {
  totalInstallments: number;
  basePaidInstallments: number;
  baseRemainingInstallments: number;
  installmentValue: number;
  baseOutstandingBalance: number;
  maxExtraAmortization: number;
  effectivePaidInstallments: number;
  remainingInstallments: number;
  remainingBalance: number;
  percentPaid: number;
  estimatedSavings: number;
  payoffDateLabel: string;
  isSimulated: boolean;
}

function computeSimulationMetrics(
  financing: GarageFinancing,
  extraAmortization: number,
  advancedInstallments: number
): SimulationMetrics {
  const totalInstallments = Math.max(financing.totalInstallments, 1);
  const basePaidInstallments = Math.min(
    Math.max(financing.paidInstallments, 0),
    totalInstallments
  );
  const baseRemainingInstallments = Math.max(
    totalInstallments - basePaidInstallments,
    0
  );
  const installmentValue = parseCurrencyBRL(financing.installmentAmount, 2450);
  const baseOutstandingBalance = baseRemainingInstallments * installmentValue;

  const clampedAdvanced = Math.min(
    Math.max(advancedInstallments, 0),
    baseRemainingInstallments
  );
  const balanceAfterInstallments = Math.max(
    0,
    (baseRemainingInstallments - clampedAdvanced) * installmentValue
  );
  const maxExtraAmortization = baseOutstandingBalance;
  const effectiveExtra = Math.min(
    Math.max(extraAmortization, 0),
    balanceAfterInstallments
  );

  const installmentsFromExtra =
    installmentValue > 0 ? effectiveExtra / installmentValue : 0;
  const additionalPaid = Math.min(
    baseRemainingInstallments,
    clampedAdvanced + installmentsFromExtra
  );
  const effectivePaidInstallments = Math.min(
    totalInstallments,
    basePaidInstallments + additionalPaid
  );
  const remainingInstallments = Math.max(
    0,
    Math.ceil(totalInstallments - effectivePaidInstallments - 0.001)
  );
  const remainingBalance = Math.max(
    0,
    baseOutstandingBalance - clampedAdvanced * installmentValue - effectiveExtra
  );

  const rawPercent = (effectivePaidInstallments / totalInstallments) * 100;
  const percentPaid = Math.min(100, Math.round(rawPercent * 10) / 10);

  let savingsFromInstallments = 0;
  for (let i = 0; i < clampedAdvanced; i += 1) {
    const monthsAnticipated = baseRemainingInstallments - i;
    const discountFactor =
      1 - 1 / Math.pow(1 + MONTHLY_DISCOUNT_RATE, monthsAnticipated);
    savingsFromInstallments += installmentValue * discountFactor;
  }

  const avgRemainingMonths = Math.max(
    1,
    (baseRemainingInstallments - clampedAdvanced) * 0.55
  );
  const extraDiscountFactor =
    1 - 1 / Math.pow(1 + MONTHLY_DISCOUNT_RATE, avgRemainingMonths);
  const savingsFromExtra = effectiveExtra * extraDiscountFactor;
  const estimatedSavings = Math.round(
    savingsFromInstallments + savingsFromExtra
  );

  return {
    totalInstallments,
    basePaidInstallments,
    baseRemainingInstallments,
    installmentValue,
    baseOutstandingBalance,
    maxExtraAmortization,
    effectivePaidInstallments,
    remainingInstallments,
    remainingBalance,
    percentPaid,
    estimatedSavings,
    payoffDateLabel: formatPayoffDate(
      financing.nextDueDate,
      remainingInstallments
    ),
    isSimulated: extraAmortization > 0 || advancedInstallments > 0,
  };
}

function ConquestStageCard({
  garage,
  metrics,
}: {
  garage: GarageData;
  metrics: SimulationMetrics;
}) {
  const isWide = useIsWide();
  const formattedPercent =
    metrics.percentPaid % 1 === 0
      ? metrics.percentPaid.toFixed(0)
      : metrics.percentPaid.toFixed(1);

  return (
    <View style={styles.stageCard}>
      <View style={[styles.stageHeader, isWide && styles.stageHeaderWide]}>
        <View style={styles.stageHeaderInfo}>
          <Text style={styles.stageEyebrow}>{t("VEHICLE CONQUEST")}</Text>
          <Text style={styles.stageTitle}>
            {garage.vehicle.model} {garage.vehicle.year}
          </Text>
          <Text style={styles.stageSubtitle}>
            {t(
              "Simulate extra amortization or installment prepayment and watch your Corolla 3D fill up in real time."
            )}
          </Text>
        </View>

        <View style={styles.percentHighlightBox}>
          <Text style={styles.percentHighlightNumber}>{formattedPercent}%</Text>
          <Text style={styles.percentHighlightLabel}>{t("paid off")}</Text>
        </View>
      </View>

      <View style={styles.canvasWrapper}>
        <VehicleCanvas
          sideProfileOnly
          progress={metrics.percentPaid}
          color={garage.vehicle.color}
          height={isWide ? 290 : 240}
          style={styles.stageCanvas}
        />
      </View>

      <View style={styles.stageFooter}>
        <ProgressBar
          value={metrics.percentPaid / 100}
          tone={metrics.percentPaid >= 100 ? "success" : "primary"}
          style={styles.stageProgressBar}
        />

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                styles.legendDotSolid,
                { backgroundColor: resolveCarColor(garage.vehicle.color) },
              ]}
            />
            <Text style={styles.legendText}>
              {t("Solid paint: Paid off ({color})", {
                color: t(garage.vehicle.color) || t("Pearl White"),
              })}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotWire]} />
            <Text style={styles.legendText}>
              {t("Wireframe: Remaining balance")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function AmortizationSlider({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (nextValue: number) => void;
}) {
  const trackWidthRef = useRef(1);

  const panResponder = useMemo(() => {
    const updateFromPosition = (locationX: number) => {
      const width = Math.max(trackWidthRef.current, 1);
      const ratio = Math.max(0, Math.min(1, locationX / width));
      const raw = ratio * max;
      if (ratio >= 0.985) {
        onChange(max);
        return;
      }
      const stepped = Math.round(raw / 1000) * 1000;
      onChange(Math.max(0, Math.min(max, stepped)));
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateFromPosition(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        updateFromPosition(evt.nativeEvent.locationX);
      },
    });
  }, [max, onChange]);

  const handleLayout = (event: LayoutChangeEvent) => {
    trackWidthRef.current = Math.max(event.nativeEvent.layout.width, 1);
  };

  const fillRatio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  return (
    <View style={styles.sliderContainer}>
      <View
        onLayout={handleLayout}
        style={styles.sliderTouchArea}
        {...panResponder.panHandlers}
      >
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${fillRatio * 100}%` }]} />
        </View>
        <View
          style={[
            styles.sliderThumb,
            { left: `${Math.min(97, Math.max(0, fillRatio * 100))}%` },
          ]}
        />
      </View>

      <View style={styles.sliderQuickRow}>
        {[0, 5000, 15000, 30000, max].map((preset, index) => {
          const isMax = index === 4;
          const label = isMax
            ? "100%"
            : preset === 0
              ? "R$ 0"
              : `+R$ ${preset / 1000}k`;
          const isActive = Math.abs(value - preset) < 500;
          return (
            <Pressable
              key={`${preset}-${index}`}
              onPress={() => onChange(preset)}
              style={[styles.presetChip, isActive && styles.presetChipActive]}
            >
              <Text
                style={[
                  styles.presetChipText,
                  isActive && styles.presetChipTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SimulatorCard({
  metrics,
  extraAmortization,
  advancedInstallments,
  onChangeExtra,
  onChangeInstallments,
  onReset,
}: {
  metrics: SimulationMetrics;
  extraAmortization: number;
  advancedInstallments: number;
  onChangeExtra: (val: number) => void;
  onChangeInstallments: (val: number) => void;
  onReset: () => void;
}) {
  const maxInstallments = metrics.baseRemainingInstallments;

  return (
    <Card>
      <View style={styles.simHeader}>
        <View style={styles.simHeaderLeft}>
          <View style={styles.simIconBadge}>
            <Sparkles size={20} strokeWidth={2} color={colors.primary} />
          </View>
          <View style={styles.simTitleWrap}>
            <Text style={styles.simTitle}>
              {t("Prepayment and Down Payment Simulator")}
            </Text>
            <Text style={styles.simSubtitle}>{t("Step: R$ 1.000")}</Text>
          </View>
        </View>
        <Badge
          label={
            metrics.isSimulated ? "Simulation active" : "Original contract"
          }
          tone={metrics.isSimulated ? "primary" : "neutral"}
        />
      </View>

      <View style={styles.controlSection}>
        <View style={styles.controlLabelRow}>
          <Text style={styles.controlLabel}>
            {t("Extra down payment (Amortization)")}
          </Text>
          <Text style={styles.controlValueHighlight}>
            {formatCurrencyBRL(extraAmortization)}
          </Text>
        </View>

        <AmortizationSlider
          value={extraAmortization}
          max={metrics.maxExtraAmortization}
          onChange={onChangeExtra}
        />

        <View style={styles.stepperInlineRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onChangeExtra(Math.max(0, extraAmortization - 1000))}
            disabled={extraAmortization <= 0}
            style={[
              styles.smallStepBtn,
              extraAmortization <= 0 && styles.stepBtnDisabled,
            ]}
          >
            <Minus size={15} color={colors.textPrimary} />
            <Text style={styles.smallStepBtnText}>R$ 1.000</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              onChangeExtra(
                Math.min(metrics.maxExtraAmortization, extraAmortization + 1000)
              )
            }
            disabled={extraAmortization >= metrics.maxExtraAmortization}
            style={[
              styles.smallStepBtn,
              extraAmortization >= metrics.maxExtraAmortization &&
                styles.stepBtnDisabled,
            ]}
          >
            <Plus size={15} color={colors.textPrimary} />
            <Text style={styles.smallStepBtnText}>R$ 1.000</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.controlSection}>
        <View style={styles.controlLabelRow}>
          <View>
            <Text style={styles.controlLabel}>
              {t("Installment prepayment")}
            </Text>
            <Text style={styles.controlHint}>
              {t("Advance from 0 to {max} remaining installments", {
                max: maxInstallments,
              })}
            </Text>
          </View>
          <Text style={styles.controlValueHighlight}>
            {advancedInstallments === 1
              ? t("1 installment")
              : t("{count} installments", { count: advancedInstallments })}
          </Text>
        </View>

        <View style={styles.counterRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              onChangeInstallments(Math.max(0, advancedInstallments - 1))
            }
            disabled={advancedInstallments <= 0}
            style={[
              styles.counterBtn,
              advancedInstallments <= 0 && styles.stepBtnDisabled,
            ]}
          >
            <Minus size={20} strokeWidth={2.2} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.counterCenter}>
            <Text style={styles.counterNumber}>+{advancedInstallments}</Text>
            <Text style={styles.counterCaption}>
              {formatCurrencyBRL(
                advancedInstallments * metrics.installmentValue
              )}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              onChangeInstallments(
                Math.min(maxInstallments, advancedInstallments + 1)
              )
            }
            disabled={advancedInstallments >= maxInstallments}
            style={[
              styles.counterBtn,
              styles.counterBtnPrimary,
              advancedInstallments >= maxInstallments && styles.stepBtnDisabled,
            ]}
          >
            <Plus size={20} strokeWidth={2.2} color={colors.white} />
          </Pressable>
        </View>
      </View>

      <View style={styles.resultsGrid}>
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>{t("Remaining installments")}</Text>
          <Text style={styles.resultValue}>
            {t("{paid} of {total}", {
              paid: metrics.remainingInstallments,
              total: metrics.totalInstallments,
            })}
          </Text>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>{t("Estimated payoff date")}</Text>
          <Text style={styles.resultValue}>{metrics.payoffDateLabel}</Text>
        </View>
      </View>

      <View style={styles.savingsBanner}>
        <View style={styles.savingsIconWrap}>
          <TrendingDown size={20} strokeWidth={2.2} color="#15803D" />
        </View>
        <View style={styles.savingsTextWrap}>
          <Text style={styles.savingsLabel}>
            {t("Estimated interest savings")}
          </Text>
          <Text style={styles.savingsValue}>
            {formatCurrencyBRL(metrics.estimatedSavings)}
          </Text>
          <Text style={styles.savingsHint}>
            {t("Proportional discount of 1.1% p.m. on prepaid balance")}
          </Text>
        </View>
      </View>

      {metrics.isSimulated ? (
        <Button
          title="Reset simulation"
          variant="secondary"
          iconPosition="left"
          icon={
            <RotateCcw size={17} strokeWidth={2} color={colors.textPrimary} />
          }
          onPress={onReset}
          style={styles.resetButton}
        />
      ) : null}
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Icon size={18} strokeWidth={1.9} color={colors.textPrimary} />
      </View>
      <Text style={styles.statLabel}>{t(label)}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function FinancingOverview({
  garage,
  financing,
  metrics,
}: {
  garage: GarageData;
  financing: GarageFinancing;
  metrics: SimulationMetrics;
}) {
  const isSettled = metrics.remainingInstallments === 0;
  const effectivePaidCount = Math.round(metrics.effectivePaidInstallments);

  return (
    <Card>
      <View style={styles.overviewHeader}>
        <View style={styles.overviewTitle}>
          <Text style={styles.eyebrow}>{t("FINANCED VEHICLE")}</Text>
          <Text style={styles.vehicleTitle}>
            {garage.vehicle.model} {garage.vehicle.year}
          </Text>
        </View>
        <Badge
          label={isSettled ? "Settled" : (financing.status ?? "Active")}
          tone={isSettled ? "success" : "info"}
        />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressNumbers}>
          <Text style={styles.progressValue}>
            {effectivePaidCount}
            <Text style={styles.progressTotal}>
              {" "}
              / {metrics.totalInstallments}
            </Text>
          </Text>
          <Text style={styles.progressPercent}>
            {t("{percent}% paid", {
              percent: Math.round(metrics.percentPaid),
            })}
          </Text>
        </View>
        <ProgressBar
          value={metrics.percentPaid / 100}
          tone={isSettled ? "success" : "primary"}
          style={styles.progressBar}
        />
        <Text style={styles.progressCaption}>
          {isSettled
            ? t("All installments have been paid.")
            : t(
                metrics.remainingInstallments === 1
                  ? "{count} installment remaining"
                  : "{count} installments remaining",
                { count: metrics.remainingInstallments }
              )}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <Stat
          icon={Wallet}
          label="Total vehicle value"
          value={formatCurrencyBRL(TOTAL_VEHICLE_VALUE)}
        />
        <Stat
          icon={Wallet}
          label="Outstanding balance"
          value={formatCurrencyBRL(metrics.remainingBalance)}
        />
        <Stat
          icon={Wallet}
          label="Installment"
          value={financing.installmentAmount}
        />
        <Stat
          icon={CalendarClock}
          label="Next due date"
          value={isSettled ? t("Settled") : financing.nextDueDate}
        />
        <Stat icon={Building2} label="Institution" value={financing.bank} />
      </View>

      {financing.contractNumber ? (
        <Text style={styles.contract}>
          {t("Contract")}{" "}
          <Text style={styles.contractValue}>{financing.contractNumber}</Text>
        </Text>
      ) : null}
    </Card>
  );
}

function InvoiceCard({ available }: { available: boolean }) {
  return (
    <Card style={styles.invoiceCard}>
      <View style={styles.invoiceIcon}>
        <Receipt size={22} strokeWidth={1.8} color={colors.primary} />
      </View>
      <Text style={styles.invoiceTitle}>{t("Second copy of invoice")}</Text>
      <Text style={styles.invoiceText}>
        {available
          ? t("Download your invoices easily whenever you need them.")
          : t(
              "No invoice is available right now. We will let you know when the next one is ready."
            )}
      </Text>
      <Badge
        label={available ? "Invoice available" : "Nothing to pay now"}
        tone={available ? "success" : "neutral"}
        style={styles.invoiceBadge}
      />
      <Button
        title="Access invoice"
        icon={<ArrowRight size={20} strokeWidth={2.4} color={colors.white} />}
        disabled={!available}
        style={styles.invoiceButton}
      />
    </Card>
  );
}

export default function FinancingScreen() {
  const isWide = useIsWide();
  const { garage, isLoading, error } = useGarage();
  const financing = garage?.financing;

  const [extraAmortization, setExtraAmortization] = useState(0);
  const [advancedInstallments, setAdvancedInstallments] = useState(0);

  const metrics = useMemo(() => {
    if (!financing) {
      return null;
    }
    return computeSimulationMetrics(
      financing,
      extraAmortization,
      advancedInstallments
    );
  }, [financing, extraAmortization, advancedInstallments]);

  const handleReset = () => {
    setExtraAmortization(0);
    setAdvancedInstallments(0);
  };

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ScreenSectionHeader
          eyebrow="FINANCING"
          title="Your financing"
          subtitle="Track installments, due dates and invoices."
        />
      </Animated.View>

      {garage && financing && metrics ? (
        <>
          <Animated.View entering={FadeInDown.delay(60).duration(400)}>
            <ConquestStageCard garage={garage} metrics={metrics} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(120).duration(400)}
            style={[styles.columns, isWide && styles.columnsWide]}
          >
            <View style={isWide ? styles.mainColumn : styles.fullWidth}>
              <SimulatorCard
                metrics={metrics}
                extraAmortization={extraAmortization}
                advancedInstallments={advancedInstallments}
                onChangeExtra={setExtraAmortization}
                onChangeInstallments={setAdvancedInstallments}
                onReset={handleReset}
              />
            </View>

            <View style={[styles.sideColumn, isWide && styles.sideColumnWide]}>
              <FinancingOverview
                garage={garage}
                financing={financing}
                metrics={metrics}
              />
              <InvoiceCard available={financing.boletoAvailable} />
            </View>
          </Animated.View>
        </>
      ) : (
        <Card>
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>
                {t("Loading financing...")}
              </Text>
            </View>
          ) : (
            <EmptyState
              icon={Wallet}
              title={error ? "Unable to load financing" : "No financing linked"}
              description={
                error
                  ? "Please try again in a few moments."
                  : "When a financing contract is linked to your purchase, it will appear here."
              }
            />
          )}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stageCard: {
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: "hidden",
    ...shadows.raised,
  },
  stageHeader: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stageHeaderWide: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stageHeaderInfo: {
    flex: 1,
  },
  stageEyebrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1.6,
    color: colors.primary,
    textTransform: "uppercase",
  },
  stageTitle: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: fontSize.display - 6,
    color: colors.white,
  },
  stageSubtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    lineHeight: 20,
    color: colors.textInverseMuted,
  },
  percentHighlightBox: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(235, 10, 30, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(235, 10, 30, 0.45)",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
  },
  percentHighlightNumber: {
    fontFamily: fonts.bold,
    fontSize: fontSize.display,
    lineHeight: 42,
    color: colors.white,
  },
  percentHighlightLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.primary,
  },
  canvasWrapper: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.inkSoft,
  },
  stageCanvas: {
    borderRadius: radius.lg,
  },
  stageFooter: {
    marginTop: spacing.md,
    gap: spacing.sm + 2,
  },
  stageProgressBar: {
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDotSolid: {
    backgroundColor: "#F4F5F7",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
  },
  legendDotWire: {
    backgroundColor: "#9CA3AF",
    borderWidth: 1,
    borderColor: colors.white,
  },
  legendText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs + 1,
    color: colors.textInverseMuted,
  },
  columns: {
    gap: spacing.lg - 4,
  },
  columnsWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mainColumn: {
    flex: 1.15,
  },
  fullWidth: {
    width: "100%",
  },
  sideColumn: {
    width: "100%",
    gap: spacing.lg - 4,
  },
  sideColumnWide: {
    flex: 0.95,
  },
  simHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  simHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    flex: 1,
  },
  simIconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  simTitleWrap: {
    flex: 1,
  },
  simTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  simSubtitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  controlSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm + 2,
  },
  controlLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  controlLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  controlHint: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  controlValueHighlight: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  sliderContainer: {
    gap: spacing.sm,
  },
  sliderTouchArea: {
    height: 36,
    justifyContent: "center",
    position: "relative",
  },
  sliderTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  sliderThumb: {
    position: "absolute",
    width: 22,
    height: 22,
    marginLeft: -11,
    borderRadius: 11,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.card,
  },
  sliderQuickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs + 2,
  },
  presetChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  presetChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  presetChipText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  presetChipTextActive: {
    color: colors.primary,
  },
  stepperInlineRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  smallStepBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  smallStepBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs + 1,
    color: colors.textPrimary,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.sm + 2,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  counterCenter: {
    alignItems: "center",
    flex: 1,
  },
  counterNumber: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl + 2,
    color: colors.textPrimary,
  },
  counterCaption: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  resultsGrid: {
    marginTop: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
  },
  resultBox: {
    flex: 1,
    minWidth: 140,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  resultLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultValue: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  savingsBanner: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: "rgba(21, 128, 61, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(21, 128, 61, 0.25)",
  },
  savingsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(21, 128, 61, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  savingsTextWrap: {
    flex: 1,
  },
  savingsLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#15803D",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  savingsValue: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: "#15803D",
  },
  savingsHint: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  resetButton: {
    marginTop: spacing.md,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  overviewTitle: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1.4,
    color: colors.textMuted,
  },
  vehicleTitle: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  progressBlock: {
    marginTop: spacing.lg,
  },
  progressNumbers: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  progressValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.display + 4,
    lineHeight: 46,
    color: colors.textPrimary,
  },
  progressTotal: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xl,
    color: colors.textMuted,
  },
  progressPercent: {
    marginBottom: 6,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  progressBar: {
    marginTop: spacing.sm,
    height: 10,
  },
  progressCaption: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    color: colors.textSecondary,
  },
  statsGrid: {
    marginTop: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
  },
  stat: {
    flexGrow: 1,
    flexBasis: 120,
    padding: spacing.md - 2,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    marginTop: spacing.sm + 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    letterSpacing: 0.6,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  statValue: {
    marginTop: 2,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg - 2,
    color: colors.textPrimary,
  },
  contract: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  contractValue: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  invoiceCard: {
    gap: 0,
  },
  invoiceIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  invoiceTitle: {
    marginTop: spacing.md - 2,
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  invoiceText: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  invoiceBadge: {
    marginTop: spacing.md - 4,
  },
  invoiceButton: {
    marginTop: spacing.lg - 4,
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm + 2,
    paddingVertical: spacing.lg,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
