import { Href, useRouter } from "expo-router";
import {
  ArrowRight,
  Award,
  Bot,
  CalendarCheck,
  LifeBuoy,
  LucideIcon,
  MapPin,
  PlayCircle,
  ShieldCheck,
  ShoppingBag,
  Wrench,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ListRow from "@/components/ui/ListRow";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import { currentMileage, getNextMaintenance } from "@/constants/aftersales";
import { useServiceBookings } from "@/hooks/useServiceBooking";
import { formatNumber, t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

const serviceLinks: {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  route: Href;
  tone: "primary" | "success" | "warning" | "neutral";
}[] = [
  {
    id: "maintenance",
    title: "Maintenance plan",
    subtitle: "Scheduled services, prices and history",
    icon: Wrench,
    route: "/maintenance",
    tone: "primary",
  },
  {
    id: "schedule",
    title: "Book a service",
    subtitle: "Choose dealership, date and time",
    icon: CalendarCheck,
    route: "/schedule-service",
    tone: "primary",
  },
  {
    id: "warranty",
    title: "Warranty",
    subtitle: "Coverage and validity of your Toyota",
    icon: ShieldCheck,
    route: "/warranty",
    tone: "success",
  },
  {
    id: "roadside",
    title: "Roadside assistance 24h",
    subtitle: "Towing, flat tire, battery and more",
    icon: LifeBuoy,
    route: "/roadside",
    tone: "warning",
  },
  {
    id: "dealers",
    title: "Dealerships",
    subtitle: "Find authorized Toyota service",
    icon: MapPin,
    route: "/dealers",
    tone: "neutral",
  },
  {
    id: "store",
    title: "Toyota Store",
    subtitle: "Genuine accessories and the Toyota collection",
    icon: ShoppingBag,
    route: "/store",
    tone: "primary",
  },
  {
    id: "rewards",
    title: "Points and rewards",
    subtitle: "Badges, rewards and how to earn points",
    icon: Award,
    route: "/rewards",
    tone: "success",
  },
  {
    id: "news",
    title: "News and videos",
    subtitle: "See how your Toyota is made and delivered",
    icon: PlayCircle,
    route: "/news",
    tone: "neutral",
  },
  {
    id: "assistant",
    title: "Toyota Assistant",
    subtitle: "Ask anything about your Toyota",
    icon: Bot,
    route: "/assistant",
    tone: "neutral",
  },
];

function NextServiceCard() {
  const router = useRouter();
  const bookings = useServiceBookings();
  const next = getNextMaintenance();
  const remaining = Math.max(next.mileage - currentMileage, 0);
  const booking = bookings[0];

  return (
    <View style={styles.nextCard}>
      <Text style={styles.nextEyebrow}>{t("NEXT SCHEDULED SERVICE")}</Text>
      <Text style={styles.nextTitle}>{t(next.title)}</Text>
      <Text style={styles.nextText}>
        {t("In about {km} km or {months} months", {
          km: formatNumber(remaining),
          months: next.months,
        })}
      </Text>
      <ProgressBar
        value={currentMileage / next.mileage}
        tone="inverse"
        style={styles.nextProgress}
      />
      <Text style={styles.nextCaption}>
        {t("{current} km of {total} km", {
          current: formatNumber(currentMileage),
          total: formatNumber(next.mileage),
        })}
      </Text>
      {booking ? (
        <View style={styles.bookingPill}>
          <CalendarCheck size={16} strokeWidth={2} color={colors.white} />
          <Text style={styles.bookingText}>
            {t("Booked: {date} at {time}, {dealer}", {
              date: booking.date,
              time: booking.time,
              dealer: booking.dealershipName,
            })}
          </Text>
        </View>
      ) : null}
      <Button
        title={booking ? "Book another service" : "Book this service"}
        icon={<ArrowRight size={20} strokeWidth={2.4} color={colors.white} />}
        onPress={() => router.push("/schedule-service")}
        style={styles.nextButton}
      />
    </View>
  );
}

export default function ServicesScreen() {
  const router = useRouter();
  const isWide = useIsWide();

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ScreenSectionHeader
          eyebrow="AFTER-SALES"
          title="Services"
          subtitle="Everything you need to keep your Toyota in top shape."
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(80).duration(400)}
        style={[styles.columns, isWide && styles.columnsWide]}
      >
        <View style={isWide ? styles.sideWide : undefined}>
          <NextServiceCard />
        </View>
        <View style={isWide ? styles.mainWide : undefined}>
          <Card padded={false}>
            {serviceLinks.map((link, index) => (
              <ListRow
                key={link.id}
                icon={link.icon}
                iconTone={link.tone}
                title={link.title}
                subtitle={link.subtitle}
                showDivider={index > 0}
                onPress={() => router.push(link.route)}
              />
            ))}
          </Card>
        </View>
      </Animated.View>
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
  sideWide: {
    width: 400,
  },
  mainWide: {
    flex: 1,
  },
  nextCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
  },
  nextEyebrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1.4,
    color: colors.primary,
  },
  nextTitle: {
    marginTop: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: fontSize.xl + 2,
    color: colors.white,
  },
  nextText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textInverseMuted,
  },
  nextProgress: {
    marginTop: spacing.lg - 4,
  },
  nextCaption: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textInverseMuted,
  },
  bookingPill: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  bookingText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  nextButton: {
    marginTop: spacing.lg - 4,
  },
});
