import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
} from "react-native-reanimated";

import InteractivePressable from "@/components/ui/InteractivePressable";
import { useAuth } from "@/contexts/AuthContext";
import { fetchGarageCurrent } from "@/services/garage";
import { colors, fonts, spacing } from "@/theme";
import { GarageData } from "@/types/garage";
import { canUseCorollaAltisImage } from "@/utils/vehicle";

const mainCarImage = require("@/assets/images/corolla-main.png");
const sideCarImage = require("@/assets/images/corolla-side.png");
const newsImage = require("@/assets/images/corolla-news.png");

const highlightCards = [
  { id: "corolla", title: "Corolla Altis", image: mainCarImage },
  { id: "yaris", title: "Yaris Cross", image: sideCarImage },
  { id: "services", title: "Serviços Toyota", image: newsImage },
  { id: "lifestyle", title: "Lifestyle", image: mainCarImage },
];

const toyotaTips = [
  {
    id: "tip-1",
    title: "Economia Híbrida",
    description: "Dicas para maximizar o uso do modo elétrico no seu Corolla.",
    category: "MANUTENÇÃO",
  },
  {
    id: "tip-2",
    title: "Toyota Safety Sense",
    description: "Entenda como funcionam os radares de pré-colisão.",
    category: "TECNOLOGIA",
  },
  {
    id: "tip-3",
    title: "Acessórios Genuínos",
    description: "Personalize seu Toyota com garantia e qualidade de fábrica.",
    category: "ESTILO",
  },
];

function VehicleFallbackHero({ vehicle }: { vehicle?: GarageData["vehicle"] }) {
  const model = vehicle?.model ?? "Seu Toyota";
  const specs = vehicle
    ? `${vehicle.version} • ${vehicle.color}`
    : "Dados do veiculo em preparacao";

  return (
    <View style={styles.vehicleFallbackHero}>
      <Text style={styles.vehicleFallbackEyebrow}>VEICULO VINCULADO</Text>
      <Text style={styles.vehicleFallbackModel}>{model}</Text>
      <Text style={styles.vehicleFallbackSpecs}>{specs}</Text>
      {vehicle?.chassi ? (
        <Text style={styles.vehicleFallbackChassi}>
          Chassi {vehicle.chassi}
        </Text>
      ) : null}
      <Text style={styles.vehicleFallbackNote}>
        Imagem ilustrativa indisponivel
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [garage, setGarage] = useState<GarageData | null>(null);
  const displayName = user?.profile?.fullName || user?.name || "Usuário";
  const firstName = displayName.trim().split(/\s+/)[0] || "Usuário";
  const vehicle = garage?.vehicle;
  const vehicleLabel = vehicle?.model ?? "Seu Toyota";
  const shouldUseVehicleImage = canUseCorollaAltisImage(vehicle?.model);

  useEffect(() => {
    let active = true;
    const loadGarage = async () => {
      if (!token) {
        return;
      }
      try {
        const result = await fetchGarageCurrent(token);
        if (active) {
          setGarage(result.garage);
        }
      } catch (error) {
        console.error("Failed to fetch garage", error);
      }
    };

    void loadGarage();
    return () => {
      active = false;
    };
  }, [token]);

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
          Bem vindo, {firstName}!
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
            <VehicleFallbackHero vehicle={vehicle} />
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
            <Text style={styles.statusButtonText}>Verificar Status</Text>
            <ArrowRight size={24} strokeWidth={2.6} color={colors.white} />
          </InteractivePressable>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.sectionTitle}
        >
          Destaques para você
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
            Guia e Novidades
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <InteractivePressable style={styles.newsHeaderButton}>
              <Text style={styles.newsHeaderText}>Ver tudo</Text>
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
          <Text style={styles.footerText}>
            Sempre o melhor para o seu Toyota
          </Text>
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
  vehicleFallbackHero: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    padding: spacing.lg,
    justifyContent: "flex-end",
  },
  vehicleFallbackEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 1.2,
  },
  vehicleFallbackModel: {
    marginTop: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 36,
    color: colors.black,
  },
  vehicleFallbackSpecs: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.textSecondary,
  },
  vehicleFallbackChassi: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.black,
  },
  vehicleFallbackNote: {
    marginTop: spacing.lg,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.black,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
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
