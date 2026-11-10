import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

import InteractivePressable from "@/components/ui/InteractivePressable";
import VehicleFallback from "@/components/ui/VehicleFallback";
import { useAuth } from "@/contexts/AuthContext";
import { useGarage } from "@/hooks/useGarage";
import { colors, fonts, spacing } from "@/theme";
import { canUseCorollaAltisImage } from "@/utils/vehicle";

const mainCarImage = require("@/assets/images/corolla-main.png");
const sideCarImage = require("@/assets/images/corolla-side.png");
const newsImage = require("@/assets/images/corolla-news.png");

const highlightCards = [
  { id: "corolla", title: "Corolla Altis", image: mainCarImage },
  { id: "yaris", title: "Yaris Cross", image: sideCarImage },
  { id: "services", title: "Toyota Services", image: newsImage },
  { id: "lifestyle", title: "Lifestyle", image: mainCarImage },
];

const toyotaTips = [
  {
    id: "tip-1",
    title: "Hybrid Economy",
    description: "Tips to maximize electric mode usage in your Corolla.",
    category: "MAINTENANCE",
  },
  {
    id: "tip-2",
    title: "Toyota Safety Sense",
    description: "Learn how pre-collision radars work.",
    category: "TECHNOLOGY",
  },
  {
    id: "tip-3",
    title: "Genuine Accessories",
    description: "Customize your Toyota with factory warranty and quality.",
    category: "STYLE",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { garage } = useGarage();
  const displayName = user?.profile?.fullName || user?.name || "User";
  const firstName = displayName.trim().split(/\s+/)[0] || "User";
  const vehicle = garage?.vehicle;
  const vehicleLabel = vehicle?.model ?? "Your Toyota";
  const shouldUseVehicleImage = canUseCorollaAltisImage(vehicle?.model);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.Text
          entering={FadeInDown.duration(600).springify()}
          style={styles.welcomeText}
        >
          Welcome, {firstName}!
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          style={styles.showcaseContainer}
        >
          {shouldUseVehicleImage ? (
            <>
              <Image
                source={mainCarImage}
                style={styles.mainImage}
                resizeMode="cover"
              />
              <View style={styles.carLabel}>
                <Text style={styles.carLabelText}>{vehicleLabel}</Text>
              </View>
            </>
          ) : (
            <VehicleFallback
              model={vehicle?.model}
              version={vehicle?.version}
              color={vehicle?.color}
              chassi={vehicle?.chassi}
              variant="hero"
            />
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(600).springify()}
          style={styles.statusButtonWrapper}
        >
          <View style={styles.statusButtonShadow} />
          <InteractivePressable
            style={styles.statusButton}
            onPress={() => router.push("/tracking")}
          >
            <Text style={styles.statusButtonText}>Check Status</Text>
            <ArrowRight size={24} strokeWidth={2.6} color={colors.white} />
          </InteractivePressable>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.sectionTitle}
        >
          Highlights for you
        </Animated.Text>
        <Animated.ScrollView
          entering={FadeInRight.delay(500).duration(600)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlightContent}
          style={styles.highlightScroll}
        >
          {highlightCards.map((card) => (
            <InteractivePressable key={card.id} style={styles.highlightCard}>
              <Image
                source={card.image}
                style={styles.highlightImage}
                resizeMode="cover"
              />
              <View style={styles.highlightLabel}>
                <Text style={styles.highlightLabelText}>{card.title}</Text>
              </View>
            </InteractivePressable>
          ))}
        </Animated.ScrollView>

        <View style={styles.newsHeaderRow}>
          <Animated.Text
            entering={FadeInDown.delay(600).duration(600)}
            style={styles.sectionTitle}
          >
            Guide and News
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <InteractivePressable style={styles.newsHeaderButton}>
              <Text style={styles.newsHeaderText}>View all</Text>
              <ArrowRight size={18} strokeWidth={1.6} color={colors.black} />
            </InteractivePressable>
          </Animated.View>
        </View>

        <View style={styles.newsList}>
          {toyotaTips.map((tip, index) => (
            <Animated.View
              key={tip.id}
              entering={FadeInDown.delay(700 + index * 100).duration(600)}
            >
              <InteractivePressable style={styles.newsCard}>
                <Text style={styles.newsMeta}>{tip.category}</Text>
                <Text style={styles.newsTitle}>{tip.title}</Text>
                <Text style={styles.newsDescription} numberOfLines={2}>
                  {tip.description}
                </Text>
              </InteractivePressable>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.delay(1000).duration(600)}
          style={styles.footer}
        >
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>Always the best for your Toyota</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg + 3,
    paddingBottom: spacing.xl,
  },
  welcomeText: {
    marginTop: spacing.xl + spacing.sm,
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.black,
  },
  showcaseContainer: {
    marginTop: spacing.sm,
    height: 300,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  carLabel: {
    position: "absolute",
    left: 15,
    bottom: 25,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  carLabelText: {
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.black,
  },
  statusButtonWrapper: {
    width: 251,
    height: 42,
    marginTop: spacing.lg - 5,
    marginLeft: 6,
  },
  statusButtonShadow: {
    position: "absolute",
    top: 4,
    left: 6,
    right: -6,
    bottom: -4,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
  },
  statusButton: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.white,
  },
  sectionTitle: {
    marginTop: spacing.xl + spacing.sm,
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.black,
  },
  highlightScroll: {
    marginTop: spacing.sm,
  },
  highlightContent: {
    gap: spacing.md,
    paddingRight: spacing.xl,
  },
  highlightCard: {
    width: 180,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  highlightImage: {
    width: "100%",
    height: "100%",
  },
  highlightLabel: {
    position: "absolute",
    left: spacing.sm,
    bottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  highlightLabelText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.black,
  },
  newsHeaderRow: {
    marginTop: spacing.xl + spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newsHeaderButton: {
    height: 28,
    borderWidth: 1,
    borderColor: colors.black,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  newsHeaderText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.black,
  },
  newsList: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  newsCard: {
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  newsMeta: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  newsTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.black,
  },
  newsDescription: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  footerDivider: {
    width: 60,
    height: 2,
    backgroundColor: colors.black,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
