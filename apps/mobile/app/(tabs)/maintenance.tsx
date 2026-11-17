import { useRouter } from "expo-router";
import {
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Circle,
  History,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import BackLink from "@/components/ui/BackLink";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ListRow from "@/components/ui/ListRow";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import {
  currentMileage,
  getNextMaintenance,
  maintenancePlan,
  serviceHistory,
} from "@/constants/aftersales";
import { cancelBooking, useServiceBookings } from "@/hooks/useServiceBooking";
import { formatNumber, t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

function BookingsCard() {
  const router = useRouter();
  const bookings = useServiceBookings();

  return (
    <Card
      title="Your appointments"
      subtitle="Services booked at Toyota dealerships."
      padded={false}
    >
      {bookings.length ? (
        bookings.map((booking, index) => (
          <View
            key={booking.id}
            style={[styles.booking, index > 0 && styles.divider]}
          >
            <ListRow
              icon={CalendarCheck}
              iconTone="success"
              title={t("{date} at {time}", {
                date: booking.date,
                time: booking.time,
              })}
              subtitle={`${t(booking.serviceType)} \u2022 ${booking.dealershipName}`}
              trailing={<Badge label="Confirmed" tone="success" />}
            />
            <Button
              title="Cancel appointment"
              variant="ghost"
              size="md"
              onPress={() => cancelBooking(booking.id)}
              style={styles.cancel}
            />
          </View>
        ))
      ) : (
        <View style={styles.emptyBooking}>
          <Text style={styles.emptyText}>
            {t("You have no upcoming appointments.")}
          </Text>
          <Button
            title="Book a service"
            size="md"
            iconPosition="left"
            icon={
              <CalendarPlus size={18} strokeWidth={2} color={colors.white} />
            }
            onPress={() => router.push("/schedule-service")}
          />
        </View>
      )}
    </Card>
  );
}

function PlanCard() {
  const next = getNextMaintenance();

  return (
    <Card
      title="Scheduled maintenance plan"
      subtitle={t("Current mileage: {km} km", {
        km: formatNumber(currentMileage),
      })}
    >
      {maintenancePlan.map((item, index) => {
        const isNext = item.id === next.id;
        const isDone = item.mileage <= currentMileage;
        const Icon = isDone ? CheckCircle2 : Circle;
        return (
          <View
            key={item.id}
            style={[styles.planItem, index > 0 && styles.divider]}
          >
            <Icon
              size={20}
              strokeWidth={2}
              color={
                isDone
                  ? colors.success
                  : isNext
                    ? colors.primary
                    : colors.textMuted
              }
            />
            <View style={styles.planText}>
              <View style={styles.planTitleRow}>
                <Text style={styles.planTitle}>{t(item.title)}</Text>
                {isNext ? <Badge label="Next" tone="primary" /> : null}
              </View>
              <Text style={styles.planMeta}>
                {t("{km} km or {months} months", {
                  km: formatNumber(item.mileage),
                  months: item.months,
                })}{" "}
                {"•"} {item.estimatedPrice}
              </Text>
              <Text style={styles.planItems}>
                {item.items.map((entry) => t(entry)).join(", ")}
              </Text>
            </View>
          </View>
        );
      })}
    </Card>
  );
}

function HistoryCard() {
  return (
    <Card title="Service history" padded={false}>
      {serviceHistory.map((record, index) => (
        <ListRow
          key={record.id}
          icon={History}
          title={record.title}
          subtitle={`${record.date} • ${record.mileage} km • ${record.dealership}`}
          trailing={<Text style={styles.total}>{t(record.total)}</Text>}
          showDivider={index > 0}
        />
      ))}
    </Card>
  );
}

export default function MaintenanceScreen() {
  const isWide = useIsWide();

  return (
    <Screen>
      <View style={styles.header}>
        <BackLink fallback="/services" />
        <ScreenSectionHeader
          title="Maintenance"
          subtitle="Keep your warranty valid with Toyota scheduled services."
        />
      </View>
      <View style={[styles.columns, isWide && styles.columnsWide]}>
        <View style={[styles.column, isWide && styles.columnWide]}>
          <BookingsCard />
          <HistoryCard />
        </View>
        <View style={[styles.column, isWide && styles.columnWide]}>
          <PlanCard />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md - 4,
  },
  columns: {
    gap: spacing.lg - 4,
  },
  columnsWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  column: {
    gap: spacing.lg - 4,
  },
  columnWide: {
    flex: 1,
  },
  booking: {
    paddingBottom: spacing.sm,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancel: {
    alignSelf: "flex-start",
    width: "auto",
    marginLeft: spacing.xl + spacing.lg,
  },
  emptyBooking: {
    padding: spacing.lg - 4,
    paddingTop: 0,
    gap: spacing.md - 4,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  planItem: {
    flexDirection: "row",
    gap: spacing.md - 4,
    paddingVertical: spacing.md - 4,
  },
  planText: {
    flex: 1,
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  planTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md + 1,
    color: colors.textPrimary,
  },
  planMeta: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  planItems: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 19,
    color: colors.textMuted,
  },
  total: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    borderRadius: radius.sm,
  },
});
