import { useRouter } from "expo-router";
import { CalendarCheck, Check } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import BackLink from "@/components/ui/BackLink";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import FormMessage from "@/components/ui/FormMessage";
import Screen from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import TextInput from "@/components/ui/TextInput";
import {
  dealerships,
  formatShortDate,
  getUpcomingServiceDates,
  serviceTimes,
  serviceTypes,
} from "@/constants/aftersales";
import { addBooking, ServiceBooking } from "@/hooks/useServiceBooking";
import { t } from "@/i18n";
import { colors, fonts, fontSize, spacing } from "@/theme";

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <Text style={styles.stepTitle}>{t(title)}</Text>
      </View>
      <View style={styles.chips}>{children}</View>
    </Card>
  );
}

function Confirmation({
  booking,
  onNew,
}: {
  booking: ServiceBooking;
  onNew: () => void;
}) {
  const router = useRouter();

  return (
    <Screen maxWidth={560}>
      <Card>
        <EmptyState
          icon={CalendarCheck}
          tone="success"
          title="Your service is booked!"
          description={t(
            "{service} at {dealer} on {date} at {time}. The dealership will contact you to confirm.",
            {
              service: t(booking.serviceType),
              dealer: booking.dealershipName,
              date: booking.date,
              time: booking.time,
            }
          )}
          action={
            <View style={styles.confirmActions}>
              <Button
                title="See my appointments"
                size="md"
                onPress={() => router.replace("/maintenance")}
              />
              <Button
                title="Book another"
                variant="ghost"
                size="md"
                onPress={onNew}
              />
            </View>
          }
        />
      </Card>
    </Screen>
  );
}

export default function ScheduleServiceScreen() {
  const dates = useMemo(() => getUpcomingServiceDates(10), []);
  const [dealershipId, setDealershipId] = useState(dealerships[0].id);
  const [serviceType, setServiceType] = useState(serviceTypes[0]);
  const [dateIndex, setDateIndex] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ServiceBooking | null>(null);

  const handleConfirm = () => {
    if (dateIndex === null || !time) {
      setError("Choose a date and a time to continue.");
      return;
    }
    const dealership =
      dealerships.find((item) => item.id === dealershipId) ?? dealerships[0];
    const date = dates[dateIndex];
    const booking = addBooking({
      dealershipId: dealership.id,
      dealershipName: dealership.name,
      serviceType,
      date: `${formatShortDate(date).label}/${date.getFullYear()}`,
      time,
      notes: notes.trim() || undefined,
    });
    setError(null);
    setConfirmed(booking);
  };

  if (confirmed) {
    return (
      <Confirmation
        booking={confirmed}
        onNew={() => {
          setConfirmed(null);
          setDateIndex(null);
          setTime(null);
          setNotes("");
        }}
      />
    );
  }

  return (
    <Screen maxWidth={760}>
      <View style={styles.header}>
        <BackLink fallback="/services" />
        <ScreenSectionHeader
          title="Book a service"
          subtitle="Pick a dealership, the service and a time that suits you."
        />
      </View>

      <Step number={1} title="Dealership">
        {dealerships.map((item) => (
          <Chip
            key={item.id}
            label={item.name}
            selected={item.id === dealershipId}
            onPress={() => setDealershipId(item.id)}
          />
        ))}
      </Step>

      <Step number={2} title="Type of service">
        {serviceTypes.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={item === serviceType}
            onPress={() => setServiceType(item)}
          />
        ))}
      </Step>

      <Step number={3} title="Date and time">
        {dates.map((date, index) => {
          const formatted = formatShortDate(date);
          return (
            <Chip
              key={date.toISOString()}
              caption={formatted.weekday}
              label={formatted.label}
              selected={index === dateIndex}
              onPress={() => setDateIndex(index)}
            />
          );
        })}
        <View style={styles.timeBreak} />
        {serviceTimes.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={item === time}
            onPress={() => setTime(item)}
          />
        ))}
      </Step>

      <Card>
        <TextInput
          label="Notes for the technician (optional)"
          placeholder="Example: noise when braking"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Card>

      <FormMessage message={error} />

      <Button
        title="Confirm booking"
        iconPosition="left"
        icon={<Check size={20} strokeWidth={2.4} color={colors.white} />}
        onPress={handleConfirm}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md - 4,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  stepTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg - 2,
    color: colors.textPrimary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeBreak: {
    width: "100%",
    height: spacing.xs,
  },
  confirmActions: {
    gap: spacing.sm,
  },
});
