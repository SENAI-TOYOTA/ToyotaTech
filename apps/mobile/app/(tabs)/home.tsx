import { ArrowRight } from "lucide-react-native";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, fonts, spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

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

export default function HomeScreen() {
  const { user } = useAuth();
  const displayName = user?.profile?.fullName || user?.name || "Usuário";
  const firstName = displayName.trim().split(/\s+/)[0] || "Usuário";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.welcomeText}>Bem vindo, {firstName}!</Text>

        <View style={styles.showcaseContainer}>
          <Image source={mainCarImage} style={styles.mainImage} resizeMode="cover" />
          <Image source={sideCarImage} style={styles.sideImage} resizeMode="cover" />

          <View style={styles.carLabel}>
            <Text style={styles.carLabelText}>Seu Corolla Altis</Text>
          </View>
        </View>

        <View style={styles.statusButtonWrapper}>
          <View style={styles.statusButtonShadow} />
          <Pressable style={styles.statusButton} android_ripple={{ color: "#c70818" }}>
            <Text style={styles.statusButtonText}>Verificar Status</Text>
            <ArrowRight size={24} strokeWidth={2.6} color={colors.white} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Destaques para você</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlightContent}
          style={styles.highlightScroll}
        >
          {highlightCards.map((card) => (
            <Pressable key={card.id} style={styles.highlightCard}>
              <Image source={card.image} style={styles.highlightImage} resizeMode="cover" />
              <View style={styles.highlightLabel}>
                <Text style={styles.highlightLabelText}>{card.title}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.newsHeaderRow}>
          <Text style={styles.sectionTitle}>Guia e Novidades</Text>
          <Pressable style={styles.newsHeaderButton} android_ripple={{ color: "#f2f2f2" }}>
            <Text style={styles.newsHeaderText}>Ver tudo</Text>
            <ArrowRight size={18} strokeWidth={1.6} color={colors.black} />
          </Pressable>
        </View>

        <View style={styles.newsList}>
          {toyotaTips.map((tip) => (
            <Pressable key={tip.id} style={styles.newsCard}>
              <Text style={styles.newsMeta}>{tip.category}</Text>
              <Text style={styles.newsTitle}>{tip.title}</Text>
              <Text style={styles.newsDescription} numberOfLines={2}>
                {tip.description}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>Sempre o melhor para o seu Toyota</Text>
        </View>
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
    position: "absolute",
    width: 300,
    height: 300,
    left: 0,
    top: 0,
  },
  sideImage: {
    position: "absolute",
    width: 300,
    height: 300,
    left: 331,
    top: 0,
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
