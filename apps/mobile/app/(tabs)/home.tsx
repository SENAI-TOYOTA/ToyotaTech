import { Href, useRouter } from "expo-router";
import {
  ArrowUpRight,
  CalendarCheck,
  FileText,
  LifeBuoy,
  LucideIcon,
  MapPinned,
  ShieldCheck,
  Wallet,
} from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import VehicleHero from "@/components/home/VehicleHero";
import Badge, { BadgeTone } from "@/components/ui/Badge";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useGarage } from "@/hooks/useGarage";
import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, shadows, spacing } from "@/theme";

const mainCarImage = require("@/assets/images/corolla-main.png");
const sideCarImage = require("@/assets/images/corolla-side.png");
const newsImage = require("@/assets/images/corolla-news.png");

const quickActions: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  route: Href;
}[] = [
  {
    id: "tracking",
    title: "Order status",
    description: "Follow each delivery step",
    icon: MapPinned,
    route: "/tracking",
  },
  {
    id: "financing",
    title: "Financing",
    description: "Installments and invoices",
    icon: Wallet,
    route: "/financing",
  },
  {
    id: "schedule",
    title: "Book a service",
    description: "Maintenance at a dealership",
    icon: CalendarCheck,
    route: "/schedule-service",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Paperwork and recalls",
    icon: FileText,
    route: "/vehicle-management",
  },
  {
    id: "warranty",
    title: "Warranty",
    description: "Coverage and validity",
    icon: ShieldCheck,
    route: "/warranty",
  },
  {
    id: "roadside",
    title: "Roadside 24h",
    description: "Help anywhere, anytime",
    icon: LifeBuoy,
    route: "/roadside",
  },
];

const highlightCards: {
  id: string;
  title: string;
  caption: string;
  image: ImageSourcePropType;
  route: Href;
}[] = [
  {
    id: "news",
    title: "How your Toyota is made",
    caption: "News and videos",
    image: newsImage,
    route: "/news",
  },
  {
    id: "store",
    title: "Toyota Store",
    caption: "Genuine accessories",
    image: sideCarImage,
    route: "/store",
  },
  {
    id: "rewards",
    title: "Toyota Rewards",
    caption: "Points and badges",
    image: mainCarImage,
    route: "/rewards",
  },
  {
    id: "services",
    title: "Toyota Services",
    caption: "Care for your car",
    image: newsImage,
    route: "/services",
  },
];

const toyotaTips: {
  id: string;
  title: string;
  description: string;
  category: string;
  tone: BadgeTone;
}[] = [
  {
    id: "tip-1",
    title: "Hybrid Economy",
    description: "Tips to maximize electric mode usage in your Corolla.",
    category: "Maintenance",
    tone: "success",
  },
  {
    id: "tip-2",
    title: "Toyota Safety Sense",
    description: "Learn how pre-collision radars work.",
    category: "Technology",
    tone: "info",
  },
  {
    id: "tip-3",
    title: "Genuine Accessories",
    description: "Customize your Toyota with factory warranty and quality.",
    category: "Style",
    tone: "primary",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  onPress: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(title)}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.actionCard,
        isHovered && styles.actionCardHovered,
        pressed && styles.actionCardPressed,
      ]}
    >
      <View style={styles.actionTop}>
        <View style={styles.actionIcon}>
          <Icon size={20} strokeWidth={1.9} color={colors.primary} />
        </View>
        <ArrowUpRight
          size={18}
          strokeWidth={1.8}
          color={isHovered ? colors.textPrimary : colors.textMuted}
        />
      </View>
      <Text style={styles.actionTitle}>{t(title)}</Text>
      <Text style={styles.actionDescription}>{t(description)}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const isWide = useIsWide();
  const { user } = useAuth();
  const { garage, isLoading } = useGarage();
  const displayName = user?.profile?.fullName || user?.name || "";
  const firstName = displayName.trim().split(/\s+/)[0] || t("there");

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ScreenSectionHeader
          eyebrow={t(getGreeting()).toUpperCase()}
          title={t("Welcome back, {name}", { name: firstName })}
          subtitle="Everything about your Toyota in one place."
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <VehicleHero garage={garage} isLoading={isLoading} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(160).duration(400)}
        style={styles.actionsGrid}
      >
        {quickActions.map((action) => (
          <QuickActionCard
            key={action.id}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onPress={() => router.navigate(action.route)}
          />
        ))}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(240).duration(400)}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>{t("Highlights for you")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlightContent}
          style={styles.highlightScroll}
        >
          {highlightCards.map((card) => (
            <Pressable
              key={card.id}
              accessibilityRole="link"
              onPress={() => router.push(card.route)}
              style={[styles.highlightCard, isWide && styles.highlightWide]}
            >
              <Image
                source={card.image}
                style={styles.highlightImage}
                resizeMode="cover"
              />
              <View style={styles.highlightShade} />
              <View style={styles.highlightLabel}>
                <Text style={styles.highlightCaption}>{t(card.caption)}</Text>
                <Text style={styles.highlightTitle}>{t(card.title)}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(320).duration(400)}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>{t("Guides and news")}</Text>
        <View style={styles.tipsGrid}>
          {toyotaTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <Badge label={tip.category} tone={tip.tone} />
              <Text style={styles.tipTitle}>{t(tip.title)}</Text>
              <Text style={styles.tipDescription}>{t(tip.description)}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>
          {t("Always the best for your Toyota")}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md - 4,
  },
  actionCard: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 132,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  actionCardHovered: {
    borderColor: colors.borderStrong,
    transform: [{ translateY: -2 }],
  },
  actionCardPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  actionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    marginTop: spacing.md - 2,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md + 1,
    color: colors.textPrimary,
  },
  actionDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.md - 2,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg + 2,
    color: colors.textPrimary,
  },
  highlightScroll: {
    marginHorizontal: -4,
  },
  highlightContent: {
    gap: spacing.md - 4,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  highlightCard: {
    width: 220,
    height: 150,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  highlightWide: {
    width: 262,
    height: 176,
  },
  highlightImage: {
    width: "100%",
    height: "100%",
  },
  highlightShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    backgroundColor: "rgba(16, 20, 24, 0.55)",
  },
  highlightLabel: {
    position: "absolute",
    left: spacing.md - 2,
    right: spacing.md - 2,
    bottom: spacing.md - 4,
  },
  highlightCaption: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    letterSpacing: 0.6,
    color: colors.textInverseMuted,
    textTransform: "uppercase",
  },
  highlightTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.white,
  },
  tipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md - 4,
  },
  tipCard: {
    flexGrow: 1,
    flexBasis: 260,
    padding: spacing.lg - 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  tipTitle: {
    marginTop: spacing.md - 4,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg - 2,
    color: colors.textPrimary,
  },
  tipDescription: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.sm,
    alignItems: "center",
    gap: spacing.sm,
  },
  footerDivider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
