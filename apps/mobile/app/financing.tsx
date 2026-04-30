import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Bell, CarFront, CircleDollarSign, User } from "lucide-react-native";

import Logo from "@/components/Logo";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

export default function FinancingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <Logo size={36} />

          <Text style={styles.title}>Financiamento</Text>
          <Text style={styles.subtitle}>Acompanhe o seu financiamento</Text>

          <View style={styles.financeCard}>
            <Text style={styles.carTitle}>Corolla Altis 2026</Text>

            <View style={styles.installmentRow}>
              <Text style={styles.installmentLabel}>Parcelas pagas:</Text>
              <View style={styles.installmentBadgeShadow} />
              <View style={styles.installmentBadge}>
                <Text style={styles.installmentText}>30 / 60</Text>
              </View>
            </View>

            <Text style={styles.bankInfo}>
              Instituição financeira:{" "}
              <Text style={styles.bankName}>Banco Toyota do Brasil S.A</Text>
            </Text>
          </View>

          <View style={styles.invoiceCard}>
            <Text style={styles.invoiceTitle}>2° Via do boleto</Text>
            <Text style={styles.invoiceDescription}>
              Baixe seus boletos e carnês com facilidade
            </Text>

            <View style={styles.invoiceButtonWrapper}>
              <View style={styles.invoiceButtonShadow} />
              <Pressable style={styles.invoiceButton} android_ripple={{ color: "#c70818" }}>
                <Text style={styles.invoiceButtonText}>Acessar boleto</Text>
                <ArrowRight size={28} strokeWidth={2.4} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <View style={styles.navigationBar}>
          <CircleDollarSign size={22} strokeWidth={1.8} color={colors.black} />
          <CarFront size={22} strokeWidth={1.8} color={colors.black} />
          <Bell size={22} strokeWidth={1.8} color={colors.black} />
          <User size={22} strokeWidth={1.8} color={colors.black} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.grayLight,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: spacing.md + spacing.xs,
    paddingHorizontal: spacing.lg + 3,
    paddingBottom: spacing.xxl + spacing.xxl,
  },
  title: {
    marginTop: spacing.xxl + spacing.lg + spacing.md,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl + spacing.xs,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs - 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: "#5C5C5C",
  },
  financeCard: {
    marginTop: spacing.xl + spacing.md - 1,
    borderWidth: 1,
    borderColor: colors.black,
    minHeight: 160,
    paddingHorizontal: spacing.sm + 5,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md - 2,
  },
  carTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl + spacing.xs,
    color: colors.textPrimary,
  },
  installmentRow: {
    marginTop: spacing.md - 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  installmentLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  installmentBadgeShadow: {
    position: "absolute",
    left: 129,
    top: 4,
    width: 100,
    height: 39,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: "transparent",
  },
  installmentBadge: {
    marginLeft: spacing.xl,
    width: 100,
    height: 39,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  installmentText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  bankInfo: {
    marginTop: spacing.md + 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  bankName: {
    color: colors.primary,
  },
  invoiceCard: {
    marginTop: spacing.xl + spacing.xs + 1,
    borderWidth: 1,
    borderColor: colors.black,
    minHeight: 142,
    paddingHorizontal: spacing.sm + 5,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm + 4,
  },
  invoiceTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl + spacing.xs,
    color: colors.textPrimary,
  },
  invoiceDescription: {
    marginTop: spacing.xs - 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: "#5C5C5C",
  },
  invoiceButtonWrapper: {
    width: 219,
    height: 40,
    marginTop: spacing.md - 1,
    marginLeft: 1,
  },
  invoiceButtonShadow: {
    position: "absolute",
    top: 4,
    left: 6,
    right: -6,
    bottom: -4,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: "transparent",
  },
  invoiceButton: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  invoiceButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  navigationBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: spacing.xxl + 2,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
});
