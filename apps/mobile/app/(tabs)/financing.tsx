import {
  ArrowRight,
  Building2,
  CalendarClock,
  Receipt,
  Wallet,
} from "lucide-react-native";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import { useGarage } from "@/hooks/useGarage";
import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";
import { GarageData, GarageFinancing } from "@/types/garage";

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
}: {
  garage: GarageData;
  financing: GarageFinancing;
}) {
  const total = Math.max(financing.totalInstallments, 0);
  const paid = Math.min(Math.max(financing.paidInstallments, 0), total);
  const remaining = total - paid;
  const progress = total ? paid / total : 0;
  const isSettled = total > 0 && remaining === 0;

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
          label={financing.status ?? (isSettled ? "Settled" : "Active")}
          tone={isSettled ? "success" : "info"}
        />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressNumbers}>
          <Text style={styles.progressValue}>
            {paid}
            <Text style={styles.progressTotal}> / {total}</Text>
          </Text>
          <Text style={styles.progressPercent}>
            {t("{percent}% paid", { percent: Math.round(progress * 100) })}
          </Text>
        </View>
        <ProgressBar
          value={progress}
          tone={isSettled ? "success" : "primary"}
          style={styles.progressBar}
        />
        <Text style={styles.progressCaption}>
          {isSettled
            ? t("All installments have been paid.")
            : t(
                remaining === 1
                  ? "{count} installment remaining"
                  : "{count} installments remaining",
                { count: remaining }
              )}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <Stat
          icon={Wallet}
          label="Installment"
          value={financing.installmentAmount}
        />
        <Stat
          icon={CalendarClock}
          label="Next due date"
          value={financing.nextDueDate}
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

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ScreenSectionHeader
          eyebrow="FINANCING"
          title="Your financing"
          subtitle="Track installments, due dates and invoices."
        />
      </Animated.View>

      {garage && financing ? (
        <Animated.View
          entering={FadeInDown.delay(80).duration(400)}
          style={[styles.columns, isWide && styles.columnsWide]}
        >
          <View style={isWide ? styles.mainColumn : undefined}>
            <FinancingOverview garage={garage} financing={financing} />
          </View>
          <View style={[styles.sideColumn, isWide && styles.sideColumnWide]}>
            <InvoiceCard available={financing.boletoAvailable} />
          </View>
        </Animated.View>
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
  columns: {
    gap: spacing.lg - 4,
  },
  columnsWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mainColumn: {
    flex: 1,
  },
  sideColumn: {
    width: "100%",
  },
  sideColumnWide: {
    width: 360,
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
